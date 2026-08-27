import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  NewsPost, 
  CommunityCheer, 
  AthleteRecord, 
  SwimmingMetric, 
  CoachNote, 
  MedicalDocument,
  TrainingAttendanceDay,
  EmailNotificationLog 
} from '../types';
import { 
  INITIAL_NEWS_POSTS, 
  INITIAL_COMMUNITY_CHEERS, 
  INITIAL_ATHLETES 
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
  likeCheer: (id: string) => Promise<void>;

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
  addCoachNote: (athleteId: string, note: Omit<CoachNote, 'id'>, notifyGuardianEmail?: boolean) => Promise<boolean>;
  updateMedicalDocumentStatus: (athleteId: string, docId: string, status: MedicalDocument['status'], expiryDate: string) => Promise<boolean>;
  addAttendanceRecord: (athleteId: string, record: TrainingAttendanceDay) => Promise<boolean>;

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
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>(INITIAL_NEWS_POSTS);
  const [cheers, setCheers] = useState<CommunityCheer[]>(INITIAL_COMMUNITY_CHEERS);
  const [athletes, setAthletes] = useState<AthleteRecord[]>(INITIAL_ATHLETES);
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(INITIAL_EMAIL_LOGS);
  
  // Authenticated Guardian State
  const [currentAthleteId, setCurrentAthleteId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('acedep_logged_athlete_id');
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

  // Realtime Firestore synchronization and auto-seeding
  useEffect(() => {
    let unsubscribeNews: () => void = () => {};
    let unsubscribeCheers: () => void = () => {};
    let unsubscribeAthletes: () => void = () => {};
    let unsubscribeEmailLogs: () => void = () => {};

    const setupFirestore = async () => {
      // 1. Sync News
      const newsInitDoc = doc(db, 'settings', 'news_init');
      getDoc(newsInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const post of INITIAL_NEWS_POSTS) {
                await setDoc(doc(db, 'news_posts', post.id), post);
              }
              await setDoc(newsInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'news_posts_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/news_init');
        });

      unsubscribeNews = onSnapshot(
        collection(db, 'news_posts'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: NewsPost[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as NewsPost);
            });
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setNewsPosts(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'news_posts');
        }
      );

      // 2. Sync Cheers
      const cheersInitDoc = doc(db, 'settings', 'cheers_init');
      getDoc(cheersInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const cheer of INITIAL_COMMUNITY_CHEERS) {
                await setDoc(doc(db, 'community_cheers', cheer.id), cheer);
              }
              await setDoc(cheersInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'community_cheers_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/cheers_init');
        });

      unsubscribeCheers = onSnapshot(
        collection(db, 'community_cheers'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: CommunityCheer[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as CommunityCheer);
            });
            list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
            setCheers(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'community_cheers');
        }
      );

      // 3. Sync Athletes
      const athletesInitDoc = doc(db, 'settings', 'athletes_init');
      getDoc(athletesInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const athlete of INITIAL_ATHLETES) {
                await setDoc(doc(db, 'athletes', athlete.id), athlete);
              }
              await setDoc(athletesInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'athletes_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/athletes_init');
        });

      unsubscribeAthletes = onSnapshot(
        collection(db, 'athletes'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AthleteRecord[] = [];
            snapshot.forEach((docSnap) => {
              list.push({ ...docSnap.data(), id: docSnap.id } as AthleteRecord);
            });
            setAthletes(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'athletes');
        }
      );

      // 4. Sync Email Notifications Log
      const emailLogsInitDoc = doc(db, 'settings', 'email_logs_init');
      getDoc(emailLogsInitDoc)
        .then(async (snap) => {
          if (!snap.exists()) {
            try {
              for (const logItem of INITIAL_EMAIL_LOGS) {
                await setDoc(doc(db, 'email_notifications', logItem.id), logItem);
              }
              await setDoc(emailLogsInitDoc, { initialized: true, seededAt: new Date().toISOString() });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, 'email_logs_seed');
            }
          }
        })
        .catch((e) => {
          handleFirestoreError(e, OperationType.GET, 'settings/email_logs_init');
        });

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
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'email_notifications');
        }
      );
    };

    setupFirestore();

    return () => {
      unsubscribeNews();
      unsubscribeCheers();
      unsubscribeAthletes();
      unsubscribeEmailLogs();
    };
  }, []);

  // Guardian Login
  const guardianLogin = async (identifier: string, accessCode: string): Promise<{ success: boolean; message?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanCode = accessCode.trim();

    if (!cleanId || !cleanCode) {
      return { success: false, message: 'Por favor, informe a identificação e a senha de acesso.' };
    }

    // Match against athletes in state or check Firestore
    const matched = athletes.find((a) => {
      const emailMatch = (a.guardianEmail || '').trim().toLowerCase() === cleanId;
      const idMatch = a.id.toLowerCase() === cleanId;
      const regMatch = (a.clubRegistration || '').toLowerCase().replace(/[^a-z0-9]/g, '') === cleanId.replace(/[^a-z0-9]/g, '');
      const nameMatch = a.name.toLowerCase().includes(cleanId);
      
      const codeMatch = a.accessCode === cleanCode;
      return (emailMatch || idMatch || regMatch || nameMatch) && codeMatch;
    });

    if (matched) {
      setCurrentAthleteId(matched.id);
      try {
        sessionStorage.setItem('acedep_logged_athlete_id', matched.id);
      } catch {}
      return { success: true };
    }

    return { success: false, message: 'Dados de acesso não encontrados ou senha incorreta.' };
  };

  const guardianLogout = () => {
    setCurrentAthleteId(null);
    try {
      sessionStorage.removeItem('acedep_logged_athlete_id');
    } catch {}
  };

  const updateAthleteAccessCode = async (athleteId: string, newCode: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, 'athletes', athleteId), {
        accessCode: newCode.trim(),
      });
      setAthletes((prev) =>
        prev.map((a) => (a.id === athleteId ? { ...a, accessCode: newCode.trim() } : a))
      );
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `athletes/${athleteId}`);
      // Fallback local update
      setAthletes((prev) =>
        prev.map((a) => (a.id === athleteId ? { ...a, accessCode: newCode.trim() } : a))
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
    const newPost: NewsPost = {
      ...postData,
      id: newId,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'news_posts', newId), newPost);
      setNewsPosts((prev) => [newPost, ...prev]);

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
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `news_posts/${newId}`);
      setNewsPosts((prev) => [newPost, ...prev]);
      return true;
    }
  };

  const deleteNewsPost = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'news_posts', id));
      setNewsPosts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `news_posts/${id}`);
      setNewsPosts((prev) => prev.filter((p) => p.id !== id));
      return true;
    }
  };

  const likeNewsPost = async (id: string): Promise<void> => {
    setNewsPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p))
    );
    try {
      const target = newsPosts.find((p) => p.id === id);
      if (target) {
        await updateDoc(doc(db, 'news_posts', id), {
          likesCount: (target.likesCount || 0) + 1,
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `news_posts/${id}`);
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
      setCheers((prev) => [newCheer, ...prev]);
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `community_cheers/${newId}`);
      setCheers((prev) => [newCheer, ...prev]);
      return true;
    }
  };

  const likeCheer = async (id: string): Promise<void> => {
    setCheers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: (c.likes || 0) + 1 } : c))
    );
    try {
      const target = cheers.find((c) => c.id === id);
      if (target) {
        await updateDoc(doc(db, 'community_cheers', id), {
          likes: (target.likes || 0) + 1,
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `community_cheers/${id}`);
    }
  };

  // Coach / Admin Athlete Actions
  const saveAthleteRecord = async (athlete: AthleteRecord): Promise<boolean> => {
    try {
      await setDoc(doc(db, 'athletes', athlete.id), athlete, { merge: true });
      setAthletes((prev) => {
        const index = prev.findIndex((a) => a.id === athlete.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = athlete;
          return updated;
        }
        return [athlete, ...prev];
      });
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `athletes/${athlete.id}`);
      setAthletes((prev) => {
        const index = prev.findIndex((a) => a.id === athlete.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = athlete;
          return updated;
        }
        return [athlete, ...prev];
      });
      return true;
    }
  };

  const deleteAthleteRecord = async (athleteId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, 'athletes', athleteId));
      setAthletes((prev) => prev.filter((a) => a.id !== athleteId));
      if (currentAthleteId === athleteId) {
        guardianLogout();
      }
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `athletes/${athleteId}`);
      setAthletes((prev) => prev.filter((a) => a.id !== athleteId));
      if (currentAthleteId === athleteId) {
        guardianLogout();
      }
      return true;
    }
  };

  const addSwimmingMetric = async (
    athleteId: string, 
    metricData: Omit<SwimmingMetric, 'id'>,
    notifyGuardianEmail = false
  ): Promise<boolean> => {
    const target = athletes.find((a) => a.id === athleteId);
    if (!target) return false;

    const newMetric: SwimmingMetric = {
      ...metricData,
      id: `metric-${Date.now()}`,
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

  const addCoachNote = async (
    athleteId: string, 
    noteData: Omit<CoachNote, 'id'>,
    notifyGuardianEmail = false
  ): Promise<boolean> => {
    const target = athletes.find((a) => a.id === athleteId);
    if (!target) return false;

    const newNote: CoachNote = {
      ...noteData,
      id: `note-${Date.now()}`,
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

  return (
    <CommunityContext.Provider
      value={{
        newsPosts,
        addNewsPost,
        deleteNewsPost,
        likeNewsPost,
        cheers,
        addCheer,
        likeCheer,
        athletes,
        currentAthlete,
        isGuardianAuthenticated,
        guardianLogin,
        guardianLogout,
        updateAthleteAccessCode,
        saveAthleteRecord,
        deleteAthleteRecord,
        addSwimmingMetric,
        addCoachNote,
        updateMedicalDocumentStatus,
        addAttendanceRecord,
        emailLogs,
        sendEmailNotification,
        getAllParentEmails,
        activeView,
        setActiveView,
        selectedNewsForModal,
        setSelectedNewsForModal,
        coachManagerModalOpen,
        setCoachManagerModalOpen,
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

