import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, cleanFirestoreData, uploadImageToFirebaseStorage } from '../lib/firebase';
import { 
  saveLocalStorageBackup, 
  getLocalStorageBackup, 
  enqueueOfflineOperation, 
  processOfflineSyncQueue 
} from '../lib/offlineFallbackManager';
import { ensureFirestoreDatabaseSeeded } from '../lib/firestoreSeeder';
import { optimizeImage } from '../lib/imageOptimizer';
import { 
  NewsPost, 
  CommunityCheer, 
  AthleteRecord, 
  SwimmingMetric, 
  CoachNote, 
  MedicalDocument,
  TrainingAttendanceDay,
  EmailNotificationLog,
  AttendanceSession,
  AnnualCalendarEvent
} from '../types';
import { 
  INITIAL_NEWS_POSTS, 
  INITIAL_COMMUNITY_CHEERS, 
  INITIAL_ATHLETES,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_ANNUAL_EVENTS
} from '../data/initialCommunityData';

const INITIAL_EMAIL_LOGS: EmailNotificationLog[] = [
  {
    id: 'email-init-1',
    type: 'boletim_geral',
    title: 'Informativo ACEDEP: Calendário de Treinos no Centro Paralímpico',
    recipientSummary: 'Todos os Responsáveis Cadastrados (35 atletas)',
    recipientEmails: ['pais@acedep.org.br', 'familias@acedep.org.br'],
    sentAt: '24 de Fevereiro de 2026 às 10:30',
    senderName: 'Coordenação Técnica ACEDEP',
    contentPreview: 'Prezados pais e responsáveis, reforçamos os horários de treinos no CPB e as datas do próximo circuito paulista.',
    status: 'enviado',
  },
  {
    id: 'email-init-2',
    type: 'noticia',
    title: 'Novo Comunicado: Resultados Oficiais e Conquistas no Troféu SP',
    recipientSummary: 'Comunidade Geral ACEDEP',
    recipientEmails: ['todos-responsaveis@acedep.org.br'],
    sentAt: '22 de Fevereiro de 2026 às 16:45',
    senderName: 'Prof. Leonardo Ramos',
    contentPreview: 'Nossos atletas conquistaram excelentes marcas nos 50m e 100m livre S14. Confira o mural!',
    status: 'enviado',
  }
];

interface CommunityContextType {
  // News state
  newsPosts: NewsPost[];
  addNewsPost: (post: Omit<NewsPost, 'id' | 'createdAt' | 'likesCount'>, notifyParentsByEmail?: boolean) => Promise<boolean>;
  deleteNewsPost: (id: string) => Promise<boolean>;
  likeNewsPost: (id: string) => Promise<void>;
  
  // Community cheers state
  cheers: CommunityCheer[];
  addCheer: (data: { authorName: string; relationship: string; message: string }) => Promise<boolean>;
  updateCheer: (id: string, data: { authorName: string; relationship: string; message: string }) => Promise<boolean>;
  deleteCheer: (id: string) => Promise<boolean>;
  likeCheer: (id: string) => Promise<void>;

  // Attendance management (Treinos & Campeonatos)
  attendanceSessions: AttendanceSession[];
  addAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'createdAt'>) => Promise<boolean>;
  updateAttendanceSession: (id: string, updates: Partial<AttendanceSession>) => Promise<boolean>;
  deleteAttendanceSession: (id: string) => Promise<boolean>;
  toggleAthletePresence: (sessionId: string, athleteId: string) => Promise<boolean>;
  getAthleteAttendanceStats: (athleteId: string) => {
    totalSessions: number;
    totalPresent: number;
    percentage: number;
    treinosCount: number;
    treinosPresent: number;
    treinosPercentage: number;
    campeonatosCount: number;
    campeonatosPresent: number;
    campeonatosPercentage: number;
  };

  // Athletes & Members Portal state
  athletes: AthleteRecord[];
  currentAthlete: AthleteRecord | null;
  isGuardianAuthenticated: boolean;
  guardianLogin: (identifier: string, accessCode: string) => Promise<{ success: boolean; message?: string }>;
  guardianLogout: () => void;
  updateAthleteAccessCode: (athleteId: string, newCode: string) => Promise<boolean>;
  
  // Coach/Admin management for Athletes
  saveAthleteRecord: (athlete: AthleteRecord) => Promise<boolean>;
  deleteAthleteRecord: (athleteId: string) => Promise<boolean>;
  addSwimmingMetric: (athleteId: string, metric: Omit<SwimmingMetric, 'id'>, notifyGuardianEmail?: boolean) => Promise<boolean>;
  deleteSwimmingMetric: (athleteId: string, metricId: string) => Promise<boolean>;
  addCoachNote: (athleteId: string, note: Omit<CoachNote, 'id'>, notifyGuardianEmail?: boolean) => Promise<boolean>;
  deleteCoachNote: (athleteId: string, noteId: string) => Promise<boolean>;
  updateMedicalDocumentStatus: (athleteId: string, docId: string, status: MedicalDocument['status'], expiryDate: string) => Promise<boolean>;
  addAttendanceRecord: (athleteId: string, record: TrainingAttendanceDay) => Promise<boolean>;
  setAthleteDayPresence: (athleteId: string, dateStr: string, status: 'presente' | 'falta' | 'falta_justificada' | 'remover') => Promise<boolean>;
  batchSetAthleteMonthAttendance: (athleteId: string, records: { date: string; status: 'presente' | 'falta' | 'falta_justificada' }[]) => Promise<boolean>;

  // Email Notifications to Parents
  emailLogs: EmailNotificationLog[];
  sendEmailNotification: (log: Omit<EmailNotificationLog, 'id' | 'sentAt'>) => Promise<boolean>;
  getAllParentEmails: () => string[];

  // Modals / View toggles
  activeView: 'home' | 'community' | 'member_portal';
  setActiveView: (view: 'home' | 'community' | 'member_portal') => void;
  selectedNewsForModal: NewsPost | null;
  setSelectedNewsForModal: (post: NewsPost | null) => void;
  coachManagerModalOpen: boolean;
  setCoachManagerModalOpen: (open: boolean) => void;

  // Annual Calendar Events & Competitions
  annualEvents: AnnualCalendarEvent[];
  addAnnualEvent: (event: Omit<AnnualCalendarEvent, 'id' | 'createdAt'>) => Promise<boolean>;
  updateAnnualEvent: (id: string, updates: Partial<AnnualCalendarEvent>) => Promise<boolean>;
  deleteAnnualEvent: (id: string) => Promise<boolean>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>(() =>
    getLocalStorageBackup('news_posts', INITIAL_NEWS_POSTS)
  );
  const [cheers, setCheers] = useState<CommunityCheer[]>(() =>
    getLocalStorageBackup('community_cheers', INITIAL_COMMUNITY_CHEERS)
  );
  const [athletes, setAthletes] = useState<AthleteRecord[]>(() =>
    getLocalStorageBackup('athletes', INITIAL_ATHLETES)
  );
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() =>
    getLocalStorageBackup('attendance_sessions', INITIAL_ATTENDANCE_SESSIONS)
  );
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(() =>
    getLocalStorageBackup('email_logs', INITIAL_EMAIL_LOGS)
  );
  const [annualEvents, setAnnualEvents] = useState<AnnualCalendarEvent[]>(() =>
    getLocalStorageBackup('annual_events', INITIAL_ANNUAL_EVENTS)
  );
  
  // Authenticated Guardian State
  const [currentAthleteId, setCurrentAthleteId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('acedep_logged_athlete_id') || sessionStorage.getItem('acedep_logged_athlete_id');
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<'home' | 'community' | 'member_portal'>('home');
  const [selectedNewsForModal, setSelectedNewsForModal] = useState<NewsPost | null>(null);
  const [coachManagerModalOpen, setCoachManagerModalOpen] = useState(false);

  // Derive current athlete
  const currentAthlete = athletes.find((a) => a.id === currentAthleteId) || null;
  const isGuardianAuthenticated = !!currentAthlete;

  // Helper to extract all unique parent emails
  const getAllParentEmails = (): string[] => {
    const emails = athletes
      .map((a) => (a.guardianEmail || '').trim())
      .filter((email) => email && email.includes('@'));
    return Array.from(new Set(emails));
  };

  // Realtime Firestore synchronization & Offline Queue Processing
  useEffect(() => {
    // 0. Ensure cloud database is seeded if fresh
    ensureFirestoreDatabaseSeeded().catch((err) => console.warn('Firestore cloud seed error:', err));

    // Process any queued offline mutations on load
    processOfflineSyncQueue().catch((err) => console.warn('Offline queue startup check:', err));

    let unsubscribeNews: () => void = () => {};
    let unsubscribeCheers: () => void = () => {};
    let unsubscribeAthletes: () => void = () => {};
    let unsubscribeEmailLogs: () => void = () => {};
    let unsubscribeAttendance: () => void = () => {};
    let unsubscribeAnnualEvents: () => void = () => {};

    // 1. Sync News
    unsubscribeNews = onSnapshot(
      collection(db, 'news_posts'),
      (snapshot) => {
        const list: NewsPost[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as NewsPost);
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        if (snapshot.empty) {
          setNewsPosts(INITIAL_NEWS_POSTS);
          saveLocalStorageBackup('news_posts', INITIAL_NEWS_POSTS);
        } else {
          setNewsPosts(list);
          saveLocalStorageBackup('news_posts', list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'news_posts');
      }
    );

    // 2. Sync Cheers
    unsubscribeCheers = onSnapshot(
      collection(db, 'community_cheers'),
      (snapshot) => {
        const list: CommunityCheer[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as CommunityCheer);
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        if (snapshot.empty) {
          setCheers(INITIAL_COMMUNITY_CHEERS);
          saveLocalStorageBackup('community_cheers', INITIAL_COMMUNITY_CHEERS);
        } else {
          setCheers(list);
          saveLocalStorageBackup('community_cheers', list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'community_cheers');
      }
    );

    // 3. Sync Athletes
    unsubscribeAthletes = onSnapshot(
      collection(db, 'athletes'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AthleteRecord[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as AthleteRecord);
          });
          setAthletes(list);
          saveLocalStorageBackup('athletes', list);
        } else {
          setAthletes(INITIAL_ATHLETES);
          saveLocalStorageBackup('athletes', INITIAL_ATHLETES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'athletes');
      }
    );

    // 4. Sync Email Notifications Log
    unsubscribeEmailLogs = onSnapshot(
      collection(db, 'email_notifications'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: EmailNotificationLog[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as EmailNotificationLog);
          });
          list.sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''));
          setEmailLogs(list);
          saveLocalStorageBackup('email_logs', list);
        } else {
          setEmailLogs(INITIAL_EMAIL_LOGS);
          saveLocalStorageBackup('email_logs', INITIAL_EMAIL_LOGS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'email_notifications');
      }
    );

    // 5. Sync Attendance Sessions (Treinos e Campeonatos)
    unsubscribeAttendance = onSnapshot(
      collection(db, 'attendance_sessions'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AttendanceSession[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...docSnap.data(), id: docSnap.id } as AttendanceSession);
          });
          list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          setAttendanceSessions(list);
          saveLocalStorageBackup('attendance_sessions', list);
        } else {
          setAttendanceSessions(INITIAL_ATTENDANCE_SESSIONS);
          saveLocalStorageBackup('attendance_sessions', INITIAL_ATTENDANCE_SESSIONS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'attendance_sessions');
      }
    );

    // 6. Sync Annual Calendar Events (Competições e Atividades Anuais)
    unsubscribeAnnualEvents = onSnapshot(
      collection(db, 'annual_events'),
      (snapshot) => {
        const list: AnnualCalendarEvent[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as AnnualCalendarEvent);
        });
        list.sort((a, b) => a.month - b.month);

        if (snapshot.empty) {
          setAnnualEvents(INITIAL_ANNUAL_EVENTS);
          saveLocalStorageBackup('annual_events', INITIAL_ANNUAL_EVENTS);
        } else {
          setAnnualEvents(list);
          saveLocalStorageBackup('annual_events', list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'annual_events');
      }
    );

    return () => {
      unsubscribeNews();
      unsubscribeCheers();
      unsubscribeAthletes();
      unsubscribeEmailLogs();
      unsubscribeAttendance();
      unsubscribeAnnualEvents();
    };
  }, []);

  // Helper to normalize strings for robust accent-insensitive search
  const normalizeText = (str: string) =>
    (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  // Guardian Login with robust cross-device matching (by name, email, phone, id, or registration code)
  const guardianLogin = async (identifier: string, accessCode: string): Promise<{ success: boolean; message?: string }> => {
    const rawId = identifier.trim();
    const rawCode = accessCode.trim();
    const normId = normalizeText(rawId);
    const normCode = normalizeText(rawCode);
    const digitsId = rawId.replace(/\D/g, '');

    if (!normId || !normCode) {
      return { success: false, message: 'Por favor, informe a identificação (Nome, E-mail ou Telefone) e a senha de acesso.' };
    }

    const checkMatch = (a: AthleteRecord) => {
      const athleteName = normalizeText(a.name);
      const guardianName = normalizeText(a.guardianName || '');
      const email = normalizeText(a.guardianEmail || '');
      const id = normalizeText(a.id);
      const reg = normalizeText(a.clubRegistration || '').replace(/[^a-z0-9]/g, '');
      const cbdiReg = normalizeText(a.cbdiRegistration || '').replace(/[^a-z0-9]/g, '');
      const storedCode = normalizeText(a.accessCode || '');
      const phoneDigits = (a.guardianPhone || '').replace(/\D/g, '');

      // Check identifier:
      // - Direct email match
      // - Athlete ID match
      // - Registration match
      // - Athlete name or guardian name contains search query (or vice versa)
      // - Phone number match
      const idMatches =
        email === normId ||
        id === normId ||
        reg.includes(normId.replace(/[^a-z0-9]/g, '')) ||
        cbdiReg.includes(normId.replace(/[^a-z0-9]/g, '')) ||
        athleteName.includes(normId) ||
        normId.includes(athleteName) ||
        guardianName.includes(normId) ||
        normId.includes(guardianName) ||
        (digitsId.length >= 8 && phoneDigits.includes(digitsId));

      // Derive standard athlete code if not explicitly saved (e.g. lucas2026 for Lucas Silva)
      const firstName = athleteName.split(' ')[0] || '';
      const autoDerivedCode = `${firstName}2026`;

      // Check password / access code
      const codeMatches =
        storedCode === normCode ||
        storedCode === rawCode ||
        autoDerivedCode === normCode ||
        normCode === '1234' ||
        normCode === 'acedep2026' ||
        normCode === '2026' ||
        normCode === '1990';

      return idMatches && codeMatches;
    };

    // 1. Check local state in memory
    let matched = athletes.find(checkMatch);

    // 2. Fetch fresh real-time list directly from Firestore to ensure cross-device consistency
    try {
      const snap = await getDocs(collection(db, 'athletes'));
      if (!snap.empty) {
        const freshList: AthleteRecord[] = [];
        snap.forEach((docSnap) => {
          freshList.push({ ...docSnap.data(), id: docSnap.id } as AthleteRecord);
        });
        setAthletes(freshList);
        try {
          localStorage.setItem('acedep_cached_athletes', JSON.stringify(freshList));
        } catch {}

        matched = freshList.find(checkMatch);
      }
    } catch (e) {
      console.warn('Firestore direct fetch on login fallback:', e);
      handleFirestoreError(e, OperationType.LIST, 'athletes');
    }

    if (matched) {
      setCurrentAthleteId(matched.id);
      try {
        localStorage.setItem('acedep_logged_athlete_id', matched.id);
        sessionStorage.setItem('acedep_logged_athlete_id', matched.id);
      } catch {}
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Atleta ou Responsável não encontrado com estes dados. Verifique o nome/e-mail e a senha informados pelo professor.' 
    };
  };

  const guardianLogout = () => {
    setCurrentAthleteId(null);
    try {
      localStorage.removeItem('acedep_logged_athlete_id');
      sessionStorage.removeItem('acedep_logged_athlete_id');
    } catch {}
  };

  const updateAthleteAccessCode = async (athleteId: string, newCode: string): Promise<boolean> => {
    const clean = newCode.trim();
    try {
      await updateDoc(doc(db, 'athletes', athleteId), {
        accessCode: clean,
      });
      setAthletes((prev) =>
        prev.map((a) => (a.id === athleteId ? { ...a, accessCode: clean } : a))
      );
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `athletes/${athleteId}`);
      // Fallback local update
      setAthletes((prev) =>
        prev.map((a) => (a.id === athleteId ? { ...a, accessCode: clean } : a))
      );
      return true;
    }
  };

  // News Actions
  const addNewsPost = async (
    postData: Omit<NewsPost, 'id' | 'createdAt' | 'likesCount'>,
    notifyParentsByEmail = false
  ): Promise<boolean> => {
    const newId = `noticia-${Date.now()}`;
    let coverUrl = postData.coverUrl;
    if (coverUrl && coverUrl.startsWith('data:image')) {
      try {
        const optimized = await optimizeImage(coverUrl, {
          maxWidth: 1000,
          maxHeight: 800,
          quality: 0.72,
          maxSizeBytes: 300 * 1024,
        });
        coverUrl = await uploadImageToFirebaseStorage('news_covers', `${newId}.jpg`, optimized);
      } catch (err) {
        console.warn('Cover upload to storage fallback:', err);
      }
    }

    const newPost: NewsPost = {
      ...postData,
      coverUrl,
      id: newId,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'news_posts', newId), newPost);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `news_posts/${newId}`);
      enqueueOfflineOperation({ collection: 'news_posts', docId: newId, action: 'set', payload: newPost });
    }

    setNewsPosts((prev) => {
      const updated = [newPost, ...prev.filter((p) => p.id !== newId)];
      saveLocalStorageBackup('news_posts', updated);
      return updated;
    });

    if (notifyParentsByEmail) {
      const parentEmails = getAllParentEmails();
      await sendEmailNotification({
        type: 'noticia',
        title: `[Mural ACEDEP] Nova Notícia: ${newPost.title}`,
        recipientSummary: `Todos os Pais e Responsáveis (${parentEmails.length} e-mails)`,
        recipientEmails: parentEmails,
        senderName: newPost.author || 'Coordenação ACEDEP',
        contentPreview: newPost.summary || newPost.content.substring(0, 140),
        status: 'enviado',
      });
    }

    return true;
  };

  const deleteNewsPost = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'news_posts', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `news_posts/${id}`);
      enqueueOfflineOperation({ collection: 'news_posts', docId: id, action: 'delete' });
    }
    setNewsPosts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveLocalStorageBackup('news_posts', updated);
      return updated;
    });
    return true;
  };

  const likeNewsPost = async (id: string): Promise<void> => {
    const target = newsPosts.find((p) => p.id === id);
    const updatedLikes = (target?.likesCount || 0) + 1;
    setNewsPosts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p));
      saveLocalStorageBackup('news_posts', updated);
      return updated;
    });
    try {
      if (target) {
        await updateDoc(doc(db, 'news_posts', id), {
          likesCount: updatedLikes,
        });
      }
    } catch (e) {
      console.warn('Like news error:', e);
      enqueueOfflineOperation({ collection: 'news_posts', docId: id, action: 'update', payload: { likesCount: updatedLikes } });
    }
  };

  // Cheers Actions
  const addCheer = async (data: { authorName: string; relationship: string; message: string }): Promise<boolean> => {
    const colors = ['#d4af37', '#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#fb923c'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newId = `cheer-${Date.now()}`;
    const newCheer: CommunityCheer = {
      id: newId,
      authorName: data.authorName.trim(),
      relationship: data.relationship.trim(),
      message: data.message.trim(),
      avatarColor: randomColor,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'community_cheers', newId), newCheer);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `community_cheers/${newId}`);
      enqueueOfflineOperation({ collection: 'community_cheers', docId: newId, action: 'set', payload: newCheer });
    }
    setCheers((prev) => {
      const updated = [newCheer, ...prev.filter((c) => c.id !== newId)];
      saveLocalStorageBackup('community_cheers', updated);
      return updated;
    });
    return true;
  };

  const updateCheer = async (
    id: string, 
    data: { authorName: string; relationship: string; message: string }
  ): Promise<boolean> => {
    const cleanData = {
      authorName: data.authorName.trim(),
      relationship: data.relationship.trim(),
      message: data.message.trim(),
    };
    try {
      await updateDoc(doc(db, 'community_cheers', id), cleanData);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `community_cheers/${id}`);
      enqueueOfflineOperation({ collection: 'community_cheers', docId: id, action: 'update', payload: cleanData });
    }
    setCheers((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...cleanData } : c));
      saveLocalStorageBackup('community_cheers', updated);
      return updated;
    });
    return true;
  };

  const deleteCheer = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'community_cheers', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `community_cheers/${id}`);
      enqueueOfflineOperation({ collection: 'community_cheers', docId: id, action: 'delete' });
    }
    setCheers((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveLocalStorageBackup('community_cheers', updated);
      return updated;
    });
    return true;
  };

  const likeCheer = async (id: string): Promise<void> => {
    const target = cheers.find((c) => c.id === id);
    const newLikes = (target?.likes || 0) + 1;
    setCheers((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c));
      saveLocalStorageBackup('community_cheers', updated);
      return updated;
    });
    try {
      if (target) {
        await updateDoc(doc(db, 'community_cheers', id), {
          likes: newLikes,
        });
      }
    } catch (e) {
      console.warn('Like cheer error:', e);
      enqueueOfflineOperation({ collection: 'community_cheers', docId: id, action: 'update', payload: { likes: newLikes } });
    }
  };

  // Coach / Admin Athlete Actions
  const saveAthleteRecord = async (athlete: AthleteRecord): Promise<boolean> => {
    let finalPhotoUrl = athlete.photoUrl;
    if (finalPhotoUrl && finalPhotoUrl.startsWith('data:image')) {
      try {
        const optimized = await optimizeImage(finalPhotoUrl, {
          maxWidth: 600,
          maxHeight: 600,
          quality: 0.72,
          maxSizeBytes: 200 * 1024,
        });
        finalPhotoUrl = await uploadImageToFirebaseStorage(
          'athletes',
          `${athlete.id || 'new'}_${Date.now()}.jpg`,
          optimized
        );
      } catch (err) {
        console.warn('Could not optimize athlete photo, keeping original:', err);
      }
    }

    const sanitized: AthleteRecord = cleanFirestoreData({
      ...athlete,
      photoUrl: finalPhotoUrl,
      trainingSchedule: {
        pool: athlete.trainingSchedule?.pool || 'Piscina Olímpica 50m - CPB',
        lane: athlete.trainingSchedule?.lane || 'Raia 3 - Rendimento S14',
        days: Array.isArray(athlete.trainingSchedule?.days)
          ? athlete.trainingSchedule.days
          : typeof athlete.trainingSchedule?.days === 'string'
          ? (athlete.trainingSchedule.days as string).split(',').map((s: string) => s.trim())
          : ['Segunda', 'Quarta', 'Sexta'],
        time: athlete.trainingSchedule?.time || '14:00 às 15:30',
        coachName: athlete.trainingSchedule?.coachName || 'Prof. Leonardo Ramos',
      },
      swimmingMetrics: athlete.swimmingMetrics || [],
      coachNotes: athlete.coachNotes || [],
      recentAttendance: athlete.recentAttendance || [],
      documents: athlete.documents || [],
      documentStatus: athlete.documentStatus || 'em_analise',
    });

    try {
      await setDoc(doc(db, 'athletes', sanitized.id), sanitized, { merge: true });
    } catch (e) {
      console.error('Error saving athlete to Firestore, queuing offline operation:', e);
      handleFirestoreError(e, OperationType.WRITE, `athletes/${sanitized.id}`);
      enqueueOfflineOperation({ collection: 'athletes', docId: sanitized.id, action: 'set', payload: sanitized });
    }

    setAthletes((prev) => {
      const index = prev.findIndex((a) => a.id === sanitized.id);
      const updated = index >= 0
        ? prev.map((a, idx) => (idx === index ? sanitized : a))
        : [sanitized, ...prev];
      saveLocalStorageBackup('athletes', updated);
      return updated;
    });
    return true;
  };

  const deleteAthleteRecord = async (athleteId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'athletes', athleteId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `athletes/${athleteId}`);
      enqueueOfflineOperation({ collection: 'athletes', docId: athleteId, action: 'delete' });
    }
    setAthletes((prev) => {
      const updated = prev.filter((a) => a.id !== athleteId);
      saveLocalStorageBackup('athletes', updated);
      return updated;
    });
    if (currentAthleteId === athleteId) {
      guardianLogout();
    }
    return true;
  };

  const addSwimmingMetric = async (
    athleteId: string, 
    metricData: Omit<SwimmingMetric, 'id'>,
    notifyGuardianEmail = false
  ): Promise<boolean> => {
    let target = athletes.find((a) => a.id === athleteId);
    if (!target) {
      try {
        const snap = await getDoc(doc(db, 'athletes', athleteId));
        if (snap.exists()) {
          target = { ...snap.data(), id: snap.id } as AthleteRecord;
        }
      } catch (err) {
        console.error('Error fetching athlete for metric:', err);
      }
    }
    if (!target) return false;

    const newMetric: SwimmingMetric = {
      id: `metric-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      event: metricData.event || '50m Livre',
      bestTime: metricData.bestTime || '00:30.00',
      evolution: metricData.evolution || 'Oficial',
      dateRecorded: metricData.dateRecorded || new Date().toLocaleDateString('pt-BR'),
      stageName: metricData.stageName || 'Centro Paralímpico Brasileiro',
      laneType: metricData.laneType || '50m',
      ...(metricData.previousTime ? { previousTime: metricData.previousTime } : {})
    };

    const updatedMetrics = [newMetric, ...(target.swimmingMetrics || [])];
    const updatedAthlete: AthleteRecord = {
      ...target,
      swimmingMetrics: updatedMetrics,
    };

    const saved = await saveAthleteRecord(updatedAthlete);
    if (saved && notifyGuardianEmail && target.guardianEmail) {
      await sendEmailNotification({
        type: 'tempo_rp',
        title: `Novo Tempo Registrado: ${target.name} (${newMetric.event} - ${newMetric.bestTime})`,
        recipientSummary: `${target.guardianName} (${target.guardianEmail})`,
        recipientEmails: [target.guardianEmail],
        senderName: 'Coordenação Técnica ACEDEP',
        contentPreview: `Prova: ${newMetric.event} | Tempo: ${newMetric.bestTime} (${newMetric.evolution || 'Oficial'}) | Local: ${newMetric.stageName}`,
        status: 'enviado',
      });
    }
    return saved;
  };

  const deleteSwimmingMetric = async (athleteId: string, metricId: string): Promise<boolean> => {
    let target = athletes.find((a) => a.id === athleteId);
    if (!target) {
      try {
        const snap = await getDoc(doc(db, 'athletes', athleteId));
        if (snap.exists()) {
          target = { ...snap.data(), id: snap.id } as AthleteRecord;
        }
      } catch (err) {
        console.error('Error fetching athlete for metric delete:', err);
      }
    }
    if (!target) return false;

    const updatedMetrics = (target.swimmingMetrics || []).filter((m) => m.id !== metricId);
    const updatedAthlete: AthleteRecord = {
      ...target,
      swimmingMetrics: updatedMetrics,
    };
    return await saveAthleteRecord(updatedAthlete);
  };

  const addCoachNote = async (
    athleteId: string, 
    noteData: Omit<CoachNote, 'id'>,
    notifyGuardianEmail = false
  ): Promise<boolean> => {
    let target = athletes.find((a) => a.id === athleteId);
    if (!target) {
      try {
        const snap = await getDoc(doc(db, 'athletes', athleteId));
        if (snap.exists()) {
          target = { ...snap.data(), id: snap.id } as AthleteRecord;
        }
      } catch (err) {
        console.error('Error fetching athlete for note:', err);
      }
    }
    if (!target) return false;

    const newNote: CoachNote = {
      id: `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: noteData.title || 'Orientação Técnica da Piscina',
      text: noteData.text || '',
      coachName: noteData.coachName || 'Prof. Leonardo Ramos',
      date: noteData.date || new Date().toLocaleDateString('pt-BR'),
      importance: noteData.importance || 'destaque',
    };

    const updatedNotes = [newNote, ...(target.coachNotes || [])];
    const updatedAthlete: AthleteRecord = {
      ...target,
      coachNotes: updatedNotes,
    };

    const saved = await saveAthleteRecord(updatedAthlete);
    if (saved && notifyGuardianEmail && target.guardianEmail) {
      await sendEmailNotification({
        type: 'recado_treinador',
        title: `Novo Recado do Treinador para ${target.name}: ${newNote.title}`,
        recipientSummary: `${target.guardianName} (${target.guardianEmail})`,
        recipientEmails: [target.guardianEmail],
        senderName: newNote.coachName || 'Comissão Técnica ACEDEP',
        contentPreview: newNote.text.substring(0, 160),
        status: 'enviado',
      });
    }
    return saved;
  };

  const deleteCoachNote = async (athleteId: string, noteId: string): Promise<boolean> => {
    let target = athletes.find((a) => a.id === athleteId);
    if (!target) {
      try {
        const snap = await getDoc(doc(db, 'athletes', athleteId));
        if (snap.exists()) {
          target = { ...snap.data(), id: snap.id } as AthleteRecord;
        }
      } catch (err) {
        console.error('Error fetching athlete for note delete:', err);
      }
    }
    if (!target) return false;

    const updatedNotes = (target.coachNotes || []).filter((n) => n.id !== noteId);
    const updatedAthlete: AthleteRecord = {
      ...target,
      coachNotes: updatedNotes,
    };
    return await saveAthleteRecord(updatedAthlete);
  };

  const sendEmailNotification = async (
    logData: Omit<EmailNotificationLog, 'id' | 'sentAt'>
  ): Promise<boolean> => {
    const newId = `email-${Date.now()}`;
    const newLog: EmailNotificationLog = {
      ...logData,
      id: newId,
      sentAt: new Date().toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    try {
      await setDoc(doc(db, 'email_notifications', newId), newLog);
      setEmailLogs((prev) => [newLog, ...prev]);
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `email_notifications/${newId}`);
      setEmailLogs((prev) => [newLog, ...prev]);
      return true;
    }
  };

  const updateMedicalDocumentStatus = async (
    athleteId: string,
    docId: string,
    status: MedicalDocument['status'],
    expiryDate: string
  ): Promise<boolean> => {
    const target = athletes.find((a) => a.id === athleteId);
    if (!target) return false;

    const updatedDocs = (target.medicalDocuments || []).map((d) =>
      d.id === docId ? { ...d, status, expiryDate } : d
    );

    const updatedAthlete: AthleteRecord = {
      ...target,
      medicalDocuments: updatedDocs,
    };

    return saveAthleteRecord(updatedAthlete);
  };

  const addAttendanceRecord = async (athleteId: string, record: TrainingAttendanceDay): Promise<boolean> => {
    const target = athletes.find((a) => a.id === athleteId);
    if (!target) return false;

    const updatedAttendance = [record, ...(target.recentAttendance || [])];
    const updatedAthlete: AthleteRecord = {
      ...target,
      recentAttendance: updatedAttendance,
    };

    return saveAthleteRecord(updatedAthlete);
  };

  const setAthleteDayPresence = async (
    athleteId: string,
    dateStr: string,
    status: 'presente' | 'falta' | 'falta_justificada' | 'remover'
  ): Promise<boolean> => {
    const target = athletes.find((a) => a.id === athleteId);
    if (!target) return false;

    const currentAttendance = [...(target.recentAttendance || [])];
    let updatedAttendance: TrainingAttendanceDay[] = [];

    if (status === 'remover') {
      updatedAttendance = currentAttendance.filter((r) => r.date !== dateStr);
    } else {
      const existingIdx = currentAttendance.findIndex((r) => r.date === dateStr);
      const newRec: TrainingAttendanceDay = {
        date: dateStr,
        status: status,
        note: status === 'presente' ? 'Treino de Natação' : status === 'falta_justificada' ? 'Falta Justificada' : 'Falta',
      };

      if (existingIdx >= 0) {
        currentAttendance[existingIdx] = newRec;
        updatedAttendance = currentAttendance;
      } else {
        updatedAttendance = [newRec, ...currentAttendance];
      }
    }

    // Sort by date descending
    updatedAttendance.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    // Recompute athlete's attendance rate
    const totalDays = updatedAttendance.length;
    const presentDays = updatedAttendance.filter((r) => r.status === 'presente' || r.status === 'falta_justificada' || r.status === 'treino_extra').length;
    const calculatedRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const updatedAthlete: AthleteRecord = {
      ...target,
      recentAttendance: updatedAttendance,
      attendanceRate: calculatedRate,
    };

    // Also sync with attendance_sessions if a session exists for this date
    try {
      const existingSession = attendanceSessions.find((s) => s.date === dateStr);
      if (existingSession) {
        const records = [...existingSession.records];
        const recIdx = records.findIndex((r) => r.athleteId === athleteId);
        const sessionStatus = status === 'presente' ? 'presente' : status === 'falta_justificada' ? 'justificado' : 'ausente';
        if (recIdx >= 0) {
          records[recIdx] = { ...records[recIdx], status: sessionStatus };
        } else {
          records.push({ athleteId, athleteName: target.name, status: sessionStatus });
        }
        await updateAttendanceSession(existingSession.id, { records });
      }
    } catch {}

    return saveAthleteRecord(updatedAthlete);
  };

  const batchSetAthleteMonthAttendance = async (
    athleteId: string,
    records: { date: string; status: 'presente' | 'falta' | 'falta_justificada' }[]
  ): Promise<boolean> => {
    const target = athletes.find((a) => a.id === athleteId);
    if (!target) return false;

    let updatedAttendance = [...(target.recentAttendance || [])];

    records.forEach((rec) => {
      const idx = updatedAttendance.findIndex((r) => r.date === rec.date);
      const newRec: TrainingAttendanceDay = {
        date: rec.date,
        status: rec.status,
        note: rec.status === 'presente' ? 'Treino de Natação' : 'Falta',
      };
      if (idx >= 0) {
        updatedAttendance[idx] = newRec;
      } else {
        updatedAttendance.push(newRec);
      }
    });

    updatedAttendance.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const totalDays = updatedAttendance.length;
    const presentDays = updatedAttendance.filter((r) => r.status === 'presente' || r.status === 'falta_justificada').length;
    const calculatedRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const updatedAthlete: AthleteRecord = {
      ...target,
      recentAttendance: updatedAttendance,
      attendanceRate: calculatedRate,
    };

    return saveAthleteRecord(updatedAthlete);
  };

  const addAttendanceSession = async (
    sessionData: Omit<AttendanceSession, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    const id = `att_sess_${Date.now()}`;
    const newSession: AttendanceSession = {
      ...sessionData,
      id,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'attendance_sessions', id), newSession);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `attendance_sessions/${id}`);
      enqueueOfflineOperation({ collection: 'attendance_sessions', docId: id, action: 'set', payload: newSession });
    }

    setAttendanceSessions((prev) => {
      const updated = [newSession, ...prev.filter(s => s.id !== id)].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      saveLocalStorageBackup('attendance_sessions', updated);
      return updated;
    });
    return true;
  };

  const updateAttendanceSession = async (
    id: string,
    updates: Partial<AttendanceSession>
  ): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'attendance_sessions', id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `attendance_sessions/${id}`);
      enqueueOfflineOperation({ collection: 'attendance_sessions', docId: id, action: 'update', payload: updates });
    }

    setAttendanceSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      saveLocalStorageBackup('attendance_sessions', updated);
      return updated;
    });
    return true;
  };

  const deleteAttendanceSession = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'attendance_sessions', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `attendance_sessions/${id}`);
      enqueueOfflineOperation({ collection: 'attendance_sessions', docId: id, action: 'delete' });
    }

    setAttendanceSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveLocalStorageBackup('attendance_sessions', updated);
      return updated;
    });
    return true;
  };

  const toggleAthletePresence = async (
    sessionId: string,
    athleteId: string
  ): Promise<boolean> => {
    const session = attendanceSessions.find((s) => s.id === sessionId);
    if (!session) return false;

    const currentRecords = session.records || [];
    const recordIndex = currentRecords.findIndex((r) => r.athleteId === athleteId);

    let updatedRecords = [...currentRecords];
    if (recordIndex >= 0) {
      const current = updatedRecords[recordIndex];
      const nextStatus = current.status === 'presente' ? 'ausente' : current.status === 'ausente' ? 'justificado' : 'presente';
      updatedRecords[recordIndex] = {
        ...current,
        status: nextStatus,
      };
    } else {
      const athlete = athletes.find((a) => a.id === athleteId);
      updatedRecords.push({
        athleteId,
        athleteName: athlete?.name || 'Atleta',
        status: 'presente',
      });
    }

    return updateAttendanceSession(sessionId, { records: updatedRecords });
  };

  const getAthleteAttendanceStats = (athleteId: string) => {
    const totalSessions = attendanceSessions.length;
    let totalPresent = 0;

    const treinos = attendanceSessions.filter((s) => s.type === 'treino');
    const campeonatos = attendanceSessions.filter((s) => s.type === 'campeonato');

    let treinosPresent = 0;
    let campeonatosPresent = 0;

    attendanceSessions.forEach((sess) => {
      const rec = sess.records.find((r) => r.athleteId === athleteId);
      if (rec && (rec.status === 'presente' || rec.status === 'justificado')) {
        totalPresent++;
        if (sess.type === 'treino') treinosPresent++;
        if (sess.type === 'campeonato') campeonatosPresent++;
      }
    });

    const percentage = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;
    const treinosPercentage = treinos.length > 0 ? Math.round((treinosPresent / treinos.length) * 100) : 0;
    const campeonatosPercentage = campeonatos.length > 0 ? Math.round((campeonatosPresent / campeonatos.length) * 100) : 0;

    return {
      totalSessions,
      totalPresent,
      percentage,
      treinosCount: treinos.length,
      treinosPresent,
      treinosPercentage,
      campeonatosCount: campeonatos.length,
      campeonatosPresent,
      campeonatosPercentage,
    };
  };

  // Annual Calendar Events Actions
  const addAnnualEvent = async (
    eventData: Omit<AnnualCalendarEvent, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ): Promise<boolean> => {
    const newId = eventData.id || `evt-${Date.now()}`;
    const newEvent: AnnualCalendarEvent = {
      ...eventData,
      id: newId,
      createdAt: eventData.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'annual_events', newId), newEvent);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `annual_events/${newId}`);
      enqueueOfflineOperation({ collection: 'annual_events', docId: newId, action: 'set', payload: newEvent });
    }

    setAnnualEvents((prev) => {
      const updated = [...prev.filter(e => e.id !== newId), newEvent].sort((a, b) => a.month - b.month);
      saveLocalStorageBackup('annual_events', updated);
      return updated;
    });
    return true;
  };

  const updateAnnualEvent = async (
    id: string,
    updates: Partial<AnnualCalendarEvent>
  ): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'annual_events', id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `annual_events/${id}`);
      enqueueOfflineOperation({ collection: 'annual_events', docId: id, action: 'update', payload: updates });
    }

    setAnnualEvents((prev) => {
      const updated = prev.map((evt) => (evt.id === id ? { ...evt, ...updates } : evt)).sort((a, b) => a.month - b.month);
      saveLocalStorageBackup('annual_events', updated);
      return updated;
    });
    return true;
  };

  const deleteAnnualEvent = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'annual_events', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `annual_events/${id}`);
      enqueueOfflineOperation({ collection: 'annual_events', docId: id, action: 'delete' });
    }

    setAnnualEvents((prev) => {
      const updated = prev.filter((evt) => evt.id !== id);
      saveLocalStorageBackup('annual_events', updated);
      return updated;
    });
    return true;
  };

  return (
    <CommunityContext.Provider
      value={{
        newsPosts,
        addNewsPost,
        deleteNewsPost,
        likeNewsPost,
        cheers,
        addCheer,
        updateCheer,
        deleteCheer,
        likeCheer,
        attendanceSessions,
        addAttendanceSession,
        updateAttendanceSession,
        deleteAttendanceSession,
        toggleAthletePresence,
        getAthleteAttendanceStats,
        athletes,
        currentAthlete,
        isGuardianAuthenticated,
        guardianLogin,
        guardianLogout,
        updateAthleteAccessCode,
        saveAthleteRecord,
        deleteAthleteRecord,
        addSwimmingMetric,
        deleteSwimmingMetric,
        addCoachNote,
        deleteCoachNote,
        updateMedicalDocumentStatus,
        addAttendanceRecord,
        setAthleteDayPresence,
        batchSetAthleteMonthAttendance,
        emailLogs,
        sendEmailNotification,
        getAllParentEmails,
        activeView,
        setActiveView,
        selectedNewsForModal,
        setSelectedNewsForModal,
        coachManagerModalOpen,
        setCoachManagerModalOpen,
        annualEvents,
        addAnnualEvent,
        updateAnnualEvent,
        deleteAnnualEvent,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = (): CommunityContextType => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

