import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Newspaper, 
  UserCheck, 
  Timer, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  RefreshCw,
  Waves,
  Mail,
  Camera,
  Upload,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  Send,
  Sparkles,
  KeyRound,
  Search,
  Edit3,
  Check,
  Smartphone,
  Calendar,
  Eye,
  Lock,
  LogOut,
  ShieldCheck,
  Images,
  Database,
  RotateCcw,
  Heart
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { usePhotos, DEFAULT_PHOTOS, GalleryPhotoItem } from '../context/PhotosContext';
import { NewsCategory, AthleteRecord, EmailNotificationLog, CommunityCheer } from '../types';
import { AttendanceManagerTab } from './admin/AttendanceManagerTab';
import { AdminUsersManagerTab } from './admin/AdminUsersManagerTab';

// Curated high quality avatars for paralympic swimming athletes
const AVATAR_PRESETS = [
  { id: 'p1', name: 'Atleta Masculino (Gorro Azul)', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=400&q=80' },
  { id: 'p2', name: 'Atleta Feminina (Óculos de Natação)', url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=400&q=80' },
  { id: 'p3', name: 'Nadador Podium / Vitória', url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=400&q=80' },
  { id: 'p4', name: 'Nadadora Paralímpica Piscina', url: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=400&q=80' },
  { id: 'p5', name: 'Jovem Promessa S14', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'p6', name: 'Atleta Competição', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
];

export const AdminCoachPortalModal: React.FC = () => {
  const { 
    coachManagerModalOpen, 
    setCoachManagerModalOpen, 
    newsPosts,
    addNewsPost,
    deleteNewsPost,
    cheers,
    addCheer,
    updateCheer,
    deleteCheer,
    athletes,
    saveAthleteRecord,
    deleteAthleteRecord,
    addSwimmingMetric,
    addCoachNote,
    emailLogs,
    sendEmailNotification,
    getAllParentEmails
  } = useCommunity();

  const {
    isAdminAuthenticated,
    currentAdminProfile,
    loginAdmin,
    logoutAdmin,
    adminModalOpen,
    closeAdminModal,
    openAdminModal,
    photos,
    galleryPhotos,
    savePhotoToDatabase,
    resetPhotoToDefault,
    addGalleryPhoto,
    deleteGalleryPhoto,
    updateAdminPin
  } = usePhotos();

  const isSuperAdmin = currentAdminProfile?.email === 'giuli.pereira@gmail.com' || currentAdminProfile?.role === 'Super Admin';
  const isProfessor = currentAdminProfile?.role === 'Professor' || currentAdminProfile?.role === 'Treinador' || currentAdminProfile?.role === 'Técnico de Natação' || (currentAdminProfile && !isSuperAdmin);

  const [activeTab, setActiveTab] = useState<'atletas' | 'presenca' | 'administradores' | 'fotos' | 'galeria' | 'noticias' | 'tempos' | 'recados' | 'mural_familia' | 'emails' | 'seguranca'>('atletas');

  // PIN Login Form State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Search & filter in athletes list
  const [athleteSearchTerm, setAthleteSearchTerm] = useState('');
  const [editingAthlete, setEditingAthlete] = useState<AthleteRecord | null>(null);

  // Form News State
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState<NewsCategory>('Resultados & Provas');
  const [newsCoverUrl, setNewsCoverUrl] = useState('');
  const [newsAuthor, setNewsAuthor] = useState('Comissão Técnica ACEDEP');
  const [newsNotifyEmail, setNewsNotifyEmail] = useState(true);
  const [isSavingNews, setIsSavingNews] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState('');

  // Form Athlete State (Enhanced for easy creation)
  const [athleteName, setAthleteName] = useState('');
  const [athletePhoto, setAthletePhoto] = useState(AVATAR_PRESETS[0].url);
  const [athleteBirth, setAthleteBirth] = useState('');
  const [athleteGuardian, setAthleteGuardian] = useState('');
  const [athleteEmail, setAthleteEmail] = useState('');
  const [athletePhone, setAthletePhone] = useState('');
  const [athleteAccessCode, setAthleteAccessCode] = useState('');
  const [athletePool, setAthletePool] = useState('Piscina Olímpica 50m - Centro Paralímpico Brasileiro');
  const [athleteDays, setAthleteDays] = useState('Segunda, Quarta, Sexta');
  const [athleteTime, setAthleteTime] = useState('14:00 às 15:30');
  const [athleteLane, setAthleteLane] = useState('Raia 3 - Rendimento S14');
  const [athleteCoach, setAthleteCoach] = useState('Prof. Leonardo Ramos');
  const [athleteNotifyOnCreate, setAthleteNotifyOnCreate] = useState(true);
  const [isSavingAthlete, setIsSavingAthlete] = useState(false);
  const [athleteSuccess, setAthleteSuccess] = useState('');
  const [copiedAccessCard, setCopiedAccessCard] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Swimming Metric State
  const [selectedAthleteIdForTime, setSelectedAthleteIdForTime] = useState(athletes[0]?.id || '');
  const [metricEvent, setMetricEvent] = useState('50m Livre');
  const [metricTime, setMetricTime] = useState('00:29.50');
  const [metricEvolution, setMetricEvolution] = useState('-0.50s (Novo RP)');
  const [metricStage, setMetricStage] = useState('Circuito Nacional Paralímpico');
  const [metricLaneType, setMetricLaneType] = useState<'25m' | '50m'>('50m');
  const [timeNotifyEmail, setTimeNotifyEmail] = useState(true);
  const [isSavingTime, setIsSavingTime] = useState(false);
  const [timeSuccess, setTimeSuccess] = useState('');

  // Form Coach Note State
  const [selectedAthleteIdForNote, setSelectedAthleteIdForNote] = useState(athletes[0]?.id || '');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteCoachName, setNoteCoachName] = useState('Prof. Leonardo Ramos');
  const [noteNotifyEmail, setNoteNotifyEmail] = useState(true);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');

  // Email Broadcast Center State
  const [broadcastType, setBroadcastType] = useState<'boletim_geral' | 'noticia' | 'recado_treinador'>('boletim_geral');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSender, setBroadcastSender] = useState('Coordenação Geral ACEDEP');
  const [broadcastRecipientMode, setBroadcastRecipientMode] = useState<'all' | 'specific'>('all');
  const [broadcastSpecificAthleteId, setBroadcastSpecificAthleteId] = useState(athletes[0]?.id || '');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Photo & Gallery Manager States
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('about_team');
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [successPhotoState, setSuccessPhotoState] = useState<Record<string, string>>({});
  const [customPhotoUrlInput, setCustomPhotoUrlInput] = useState('');
  const [previewOverride, setPreviewOverride] = useState<Record<string, string>>({});
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);

  // Gallery Photo form state
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState('Equipe Oficial');
  const [newGalDate, setNewGalDate] = useState('');
  const [newGalUrl, setNewGalUrl] = useState('');
  const [newGalPreview, setNewGalPreview] = useState('');
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [gallerySuccess, setGallerySuccess] = useState('');
  const [galleryError, setGalleryError] = useState('');
  const [confirmDeleteGalleryId, setConfirmDeleteGalleryId] = useState<string | null>(null);
  const [isDeletingGalleryId, setIsDeletingGalleryId] = useState<string | null>(null);

  // Security / PIN management
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinFormError, setPinFormError] = useState('');

  // Community Cheers Management State
  const [cheerSearchTerm, setCheerSearchTerm] = useState('');
  const [editingCheer, setEditingCheer] = useState<CommunityCheer | null>(null);
  const [editCheerAuthor, setEditCheerAuthor] = useState('');
  const [editCheerRelation, setEditCheerRelation] = useState('');
  const [editCheerMsg, setEditCheerMsg] = useState('');
  const [isSavingCheer, setIsSavingCheer] = useState(false);
  const [confirmDeleteCheerId, setConfirmDeleteCheerId] = useState<string | null>(null);
  const [isDeletingCheerId, setIsDeletingCheerId] = useState<string | null>(null);
  const [cheerAdminSuccess, setCheerAdminSuccess] = useState('');
  const [cheerAdminError, setCheerAdminError] = useState('');
  const [newAdminCheerAuthor, setNewAdminCheerAuthor] = useState('');
  const [newAdminCheerRelation, setNewAdminCheerRelation] = useState('Coordenação / Técnico');
  const [newAdminCheerMsg, setNewAdminCheerMsg] = useState('');
  const [isAddingAdminCheer, setIsAddingAdminCheer] = useState(false);
  const [addCheerSuccess, setAddCheerSuccess] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(false);
    setIsLoggingIn(true);
    const success = await loginAdmin(pinInput);
    setIsLoggingIn(false);
    if (!success) {
      setPinError(true);
    } else {
      setPinInput('');
    }
  };

  const handleCloseModal = () => {
    setCoachManagerModalOpen(false);
    closeAdminModal();
  };

  // Photo Handlers
  const handlePhotoFileChange = (photoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPreviewOverride((prev) => ({ ...prev, [photoId]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoDrop = (photoId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setPreviewOverride((prev) => ({ ...prev, [photoId]: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhotoToFirestore = async (photoId: string) => {
    const imageToSave = previewOverride[photoId] || customPhotoUrlInput.trim();
    if (!imageToSave) return;

    setUploadingState((prev) => ({ ...prev, [photoId]: true }));
    const success = await savePhotoToDatabase(photoId, imageToSave, DEFAULT_PHOTOS[photoId]?.title);
    setUploadingState((prev) => ({ ...prev, [photoId]: false }));

    if (success) {
      setSuccessPhotoState((prev) => ({ ...prev, [photoId]: 'Salvo com sucesso no Firestore!' }));
      setPreviewOverride((prev) => {
        const copy = { ...prev };
        delete copy[photoId];
        return copy;
      });
      setCustomPhotoUrlInput('');
      setTimeout(() => {
        setSuccessPhotoState((prev) => ({ ...prev, [photoId]: '' }));
      }, 4000);
    }
  };

  const handleResetPhotoExecute = async (photoId: string) => {
    setUploadingState((prev) => ({ ...prev, [photoId]: true }));
    setConfirmResetId(null);
    await resetPhotoToDefault(photoId);
    setPreviewOverride((prev) => {
      const copy = { ...prev };
      delete copy[photoId];
      return copy;
    });
    setUploadingState((prev) => ({ ...prev, [photoId]: false }));
    setSuccessPhotoState((prev) => ({ ...prev, [photoId]: 'Restaurada para o padrão!' }));
    setTimeout(() => {
      setSuccessPhotoState((prev) => ({ ...prev, [photoId]: '' }));
    }, 4000);
  };

  // Gallery handlers
  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setNewGalPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddGalleryPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGalleryError('');
    const finalUrl = newGalPreview || newGalUrl.trim();
    if (!finalUrl) {
      setGalleryError('Por favor, selecione uma foto ou informe o link da imagem.');
      setTimeout(() => setGalleryError(''), 5000);
      return;
    }

    setIsSavingGallery(true);
    const success = await addGalleryPhoto({
      title: newGalTitle.trim() || 'Foto ACEDEP',
      category: newGalCategory,
      url: finalUrl,
      date: newGalDate.trim() || undefined
    });
    setIsSavingGallery(false);

    if (success) {
      setGallerySuccess('Foto adicionada à galeria com sucesso!');
      setNewGalTitle('');
      setNewGalDate('');
      setNewGalUrl('');
      setNewGalPreview('');
      setTimeout(() => setGallerySuccess(''), 4000);
    } else {
      setGalleryError('Erro ao gravar foto na galeria. Tente novamente.');
      setTimeout(() => setGalleryError(''), 5000);
    }
  };

  const executeDeleteGalleryPhoto = async (photo: GalleryPhotoItem) => {
    setIsDeletingGalleryId(photo.id);
    await deleteGalleryPhoto(photo.id);
    setIsDeletingGalleryId(null);
    setConfirmDeleteGalleryId(null);
  };

  // PIN change handler
  const handleUpdatePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinFormError('');
    setPinSuccess('');

    if (newPinInput.length < 4) {
      setPinFormError('A nova senha deve ter no mínimo 4 dígitos.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinFormError('As senhas digitadas não coincidem.');
      return;
    }

    setIsSavingPin(true);
    const success = await updateAdminPin(newPinInput);
    setIsSavingPin(false);

    if (success) {
      setPinSuccess('Senha de administrador atualizada com sucesso!');
      setNewPinInput('');
      setConfirmPinInput('');
      setTimeout(() => setPinSuccess(''), 5000);
    } else {
      setPinFormError('Falha ao atualizar senha. Verifique a conexão.');
    }
  };

  // Cheer Management Handlers
  const handleStartEditCheer = (cheer: CommunityCheer) => {
    setEditingCheer(cheer);
    setEditCheerAuthor(cheer.authorName);
    setEditCheerRelation(cheer.relationship || '');
    setEditCheerMsg(cheer.message);
    setCheerAdminSuccess('');
    setCheerAdminError('');
  };

  const handleSaveEditCheer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCheer) return;
    if (!editCheerAuthor.trim() || !editCheerMsg.trim()) {
      setCheerAdminError('Preencha o nome do autor e o texto da mensagem.');
      return;
    }
    setIsSavingCheer(true);
    const success = await updateCheer(editingCheer.id, {
      authorName: editCheerAuthor,
      relationship: editCheerRelation,
      message: editCheerMsg,
    });
    setIsSavingCheer(false);
    if (success) {
      setCheerAdminSuccess('Recado atualizado com sucesso no mural!');
      setEditingCheer(null);
      setTimeout(() => setCheerAdminSuccess(''), 4000);
    } else {
      setCheerAdminError('Falha ao atualizar recado.');
    }
  };

  const handleDeleteCheerExecute = async (cheerId: string) => {
    setIsDeletingCheerId(cheerId);
    await deleteCheer(cheerId);
    setIsDeletingCheerId(null);
    setConfirmDeleteCheerId(null);
    setCheerAdminSuccess('Recado excluído com sucesso do mural!');
    setTimeout(() => setCheerAdminSuccess(''), 4000);
  };

  const handleAdminAddCheerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminCheerAuthor.trim() || !newAdminCheerMsg.trim()) return;
    setIsAddingAdminCheer(true);
    const success = await addCheer({
      authorName: newAdminCheerAuthor,
      relationship: newAdminCheerRelation || 'Coordenação ACEDEP',
      message: newAdminCheerMsg,
    });
    setIsAddingAdminCheer(false);
    if (success) {
      setAddCheerSuccess('Recado publicado com sucesso no mural!');
      setNewAdminCheerAuthor('');
      setNewAdminCheerRelation('Coordenação / Técnico');
      setNewAdminCheerMsg('');
      setTimeout(() => setAddCheerSuccess(''), 4000);
    }
  };

  const isOpen = coachManagerModalOpen || adminModalOpen;
  if (!isOpen) return null;

  // Auto generate a simple and clean access code
  const handleAutoGenerateAccessCode = () => {
    const cleanFirstName = athleteName.trim().split(' ')[0]?.toLowerCase() || 'atleta';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setAthleteAccessCode(`${cleanFirstName}${randomSuffix}`);
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (under 3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert('Por favor, escolha uma imagem com tamanho menor que 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAthletePhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy access credentials
  const handleCopyAccessCredentials = (athlete: { name: string; guardianName: string; guardianEmail: string; accessCode: string }) => {
    const text = `🏊‍♂️ *ACEDEP NATAÇÃO PARALÍMPICA - DADOS DE ACESSO AO PORTAL DO ATLETA* 🏊‍♂️\n\n` +
      `Olá ${athlete.guardianName}!\n` +
      `Seguem os dados para acompanhar o desenvolvimento e treinos de *${athlete.name}*:\n\n` +
      `🔗 *Site:* https://acedep.org.br\n` +
      `👤 *Identificador:* ${athlete.guardianEmail || athlete.name}\n` +
      `🔑 *Senha de Acesso:* ${athlete.accessCode}\n\n` +
      `No portal você acompanha horários de treinos no CPB, cronometragens (RP), atestados e recados da comissão técnica!`;

    navigator.clipboard.writeText(text);
    setCopiedAccessCard(athlete.accessCode);
    setTimeout(() => setCopiedAccessCard(null), 3500);
  };

  // Handle Publish News
  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    setIsSavingNews(true);
    const success = await addNewsPost(
      {
        title: newsTitle.trim(),
        summary: newsSummary.trim() || newsTitle.trim(),
        content: newsContent.trim(),
        category: newsCategory,
        coverUrl: newsCoverUrl.trim() || 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1000&q=80',
        date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
        author: newsAuthor.trim(),
        authorRole: 'Comissão Técnica ACEDEP',
        tags: ['Natação Paralímpica', 'S14', 'ACEDEP'],
      },
      newsNotifyEmail
    );
    setIsSavingNews(false);

    if (success) {
      setNewsSuccess(`Notícia publicada com sucesso! ${newsNotifyEmail ? '📧 Notificação enviada por e-mail aos pais.' : ''}`);
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      setNewsCoverUrl('');
      setTimeout(() => setNewsSuccess(''), 5000);
    }
  };

  // Handle Create Athlete
  const handleAddAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteName.trim() || !athleteGuardian.trim() || !athleteAccessCode.trim()) return;

    setIsSavingAthlete(true);
    const newAthleteId = `atleta-${Date.now()}`;
    const newAthlete: AthleteRecord = {
      id: newAthleteId,
      name: athleteName.trim(),
      photoUrl: athletePhoto.trim() || AVATAR_PRESETS[0].url,
      birthDate: athleteBirth.trim() || '15/05/2009',
      paralympicClass: 'S14 / SB14 / SM14 - Deficiência Intelectual',
      clubRegistration: `ACEDEP-2026-${Math.floor(100 + Math.random() * 900)}`,
      cbdiRegistration: 'CBDI-SP-Homologado',
      guardianName: athleteGuardian.trim(),
      guardianEmail: athleteEmail.trim(),
      guardianPhone: athletePhone.trim(),
      accessCode: athleteAccessCode.trim(),
      trainingSchedule: {
        pool: athletePool,
        days: athleteDays.split(',').map((s) => s.trim()),
        time: athleteTime,
        lane: athleteLane,
        coachName: athleteCoach,
      },
      attendanceRate: 100,
      recentAttendance: [
        { date: new Date().toLocaleDateString('pt-BR'), status: 'presente', note: 'Treino inicial de acolhimento e ambientação' }
      ],
      swimmingMetrics: [],
      medicalDocuments: [
        {
          id: `doc-${Date.now()}-1`,
          name: 'Atestado Cardiológico e Dermatológico para Piscina',
          status: 'Válido',
          expiryDate: '10/12/2026',
          notes: 'Apto para atividades físicas aquáticas no Centro Paralímpico.',
        },
      ],
      coachNotes: [
        {
          id: `note-${Date.now()}-1`,
          date: new Date().toLocaleDateString('pt-BR'),
          title: 'Boas-vindas à ACEDEP Natação Paralímpica',
          text: `Olá ${athleteGuardian}! Seja muito bem-vindo(a) à nossa equipe. Os treinos de ${athleteName} ocorrem na ${athletePool} (${athleteDays}, ${athleteTime}). Qualquer dúvida estamos à total disposição.`,
          coachName: athleteCoach,
          importance: 'destaque',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const success = await saveAthleteRecord(newAthlete);

    // Optionally send immediate welcome email with login details
    if (success && athleteNotifyOnCreate && athleteEmail.trim()) {
      await sendEmailNotification({
        type: 'credenciais',
        title: `Boas-vindas à ACEDEP: Login e Acesso Liberado para ${newAthlete.name}`,
        recipientSummary: `${newAthlete.guardianName} (${newAthlete.guardianEmail})`,
        recipientEmails: [newAthlete.guardianEmail],
        senderName: 'Coordenação ACEDEP',
        contentPreview: `Login: ${newAthlete.guardianEmail} | Senha de Acesso: ${newAthlete.accessCode} | Atleta: ${newAthlete.name}`,
        status: 'enviado',
      });
    }

    setIsSavingAthlete(false);

    if (success) {
      setAthleteSuccess(`Atleta ${athleteName} cadastrado com sucesso com login "${athleteAccessCode}"!`);
      setAthleteName('');
      setAthleteGuardian('');
      setAthleteEmail('');
      setAthletePhone('');
      setAthleteAccessCode('');
      setAthleteBirth('');
      setTimeout(() => setAthleteSuccess(''), 6000);
    }
  };

  // Handle Save Edited Athlete
  const handleSaveEditedAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;

    await saveAthleteRecord(editingAthlete);
    setEditingAthlete(null);
  };

  // Handle Add Swimming Metric
  const handleAddTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteIdForTime || !metricTime.trim()) return;

    setIsSavingTime(true);
    const success = await addSwimmingMetric(
      selectedAthleteIdForTime, 
      {
        event: metricEvent,
        bestTime: metricTime.trim(),
        evolution: metricEvolution.trim(),
        dateRecorded: new Date().toLocaleDateString('pt-BR'),
        stageName: metricStage.trim(),
        laneType: metricLaneType,
      },
      timeNotifyEmail
    );
    setIsSavingTime(false);

    if (success) {
      setTimeSuccess(`Tempo lançado com sucesso na ficha do atleta! ${timeNotifyEmail ? '📧 Responsável notificado por e-mail.' : ''}`);
      setMetricTime('');
      setMetricEvolution('');
      setTimeout(() => setTimeSuccess(''), 5000);
    }
  };

  // Handle Add Coach Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthleteIdForNote || !noteText.trim()) return;

    setIsSavingNote(true);
    const success = await addCoachNote(
      selectedAthleteIdForNote, 
      {
        title: noteTitle.trim() || 'Orientação Técnica da Piscina',
        text: noteText.trim(),
        coachName: noteCoachName.trim(),
        date: new Date().toLocaleDateString('pt-BR'),
        importance: 'destaque',
      },
      noteNotifyEmail
    );
    setIsSavingNote(false);

    if (success) {
      setNoteSuccess(`Recado enviado ao responsável do atleta! ${noteNotifyEmail ? '📧 Notificação enviada por e-mail.' : ''}`);
      setNoteTitle('');
      setNoteText('');
      setTimeout(() => setNoteSuccess(''), 5000);
    }
  };

  // Handle Manual Email Broadcast Dispatch
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastBody.trim()) return;

    setIsSendingBroadcast(true);

    let recipients: string[] = [];
    let summary = '';

    if (broadcastRecipientMode === 'all') {
      recipients = getAllParentEmails();
      summary = `Todos os Pais e Responsáveis (${recipients.length} e-mails cadastrados)`;
    } else {
      const target = athletes.find((a) => a.id === broadcastSpecificAthleteId);
      if (target && target.guardianEmail) {
        recipients = [target.guardianEmail];
        summary = `${target.guardianName} (${target.guardianEmail}) - Atleta: ${target.name}`;
      } else {
        recipients = ['pais@acedep.org.br'];
        summary = 'Responsável selecionado';
      }
    }

    await sendEmailNotification({
      type: broadcastType,
      title: broadcastSubject.trim(),
      recipientSummary: summary,
      recipientEmails: recipients,
      senderName: broadcastSender.trim(),
      contentPreview: broadcastBody.trim().substring(0, 180),
      status: 'enviado',
    });

    setIsSendingBroadcast(false);
    setBroadcastSuccess(`Informativo gravado e disparado com sucesso para ${summary}!`);
    setBroadcastSubject('');
    setBroadcastBody('');
    setTimeout(() => setBroadcastSuccess(''), 6000);
  };

  // Open default mail client with all parent emails in BCC
  const handleOpenMailClient = (subject?: string, body?: string) => {
    const parentEmails = getAllParentEmails().join(',');
    const encodedSubject = encodeURIComponent(subject || 'Informativo ACEDEP Natação Paralímpica');
    const encodedBody = encodeURIComponent(body || 'Prezados pais e responsáveis,\n\nSegue atualização importante sobre as atividades e treinos da ACEDEP:\n\nAtenciosamente,\nCoordenação ACEDEP');
    window.location.href = `mailto:contato@acedep.org.br?bcc=${parentEmails}&subject=${encodedSubject}&body=${encodedBody}`;
  };

  // Filtered athletes list
  const filteredAthletes = athletes.filter((a) => 
    a.name.toLowerCase().includes(athleteSearchTerm.toLowerCase()) ||
    a.guardianName.toLowerCase().includes(athleteSearchTerm.toLowerCase()) ||
    (a.guardianEmail || '').toLowerCase().includes(athleteSearchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[94vh] bg-[#0c1f38] border border-[#1e3a5f] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f] bg-[#071326]/95">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              {isAdminAuthenticated ? <Waves className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <span>
                  {isAdminAuthenticated 
                    ? isProfessor 
                      ? `Painel do(a) Professor(a) • ${currentAdminProfile?.name || 'Comissão Técnica'}`
                      : 'Painel da Coordenação Geral & Administração' 
                    : 'Acesso Restrito • Equipe Técnica & Coordenação'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isProfessor 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40'
                }`}>
                  {isAdminAuthenticated ? (isProfessor ? 'Perfil Professor' : 'Gestão Geral ACEDEP') : 'Autenticação'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isAdminAuthenticated 
                  ? isProfessor 
                    ? 'Chamada em treinos e campeonatos, cadastro de atletas, tempos RP, agenda e recados.'
                    : 'Gestão geral: atletas, lista de presença, professores, fotos, notícias, comunicados e segurança.' 
                  : 'Digite seu PIN ou senha cadastrada para acessar as ferramentas da ACEDEP.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={logoutAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                title="Encerrar sessão de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
            <button
              onClick={handleCloseModal}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAdminAuthenticated ? (
          /* =========================================================================
             LOGIN FORM - PIN RESTRICTION GUARD
             ========================================================================= */
          <div className="p-8 sm:p-12 overflow-y-auto flex-1 flex items-center justify-center">
            <div className="max-w-md w-full mx-auto text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#d4af37]/15 border-2 border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-xl">
                <Lock className="w-8 h-8" />
              </div>
              
              <div>
                <h4 className="text-xl font-bold text-white font-serif mb-2">
                  Painel Administrativo da ACEDEP
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Insira a senha de coordenador/administrador para acessar o cadastro de atletas, tempos de treinos, disparo de comunicados aos pais e notícias.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Senha de Administrador / Treinador
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError(false);
                      }}
                      placeholder="Digite a senha de administrador..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                      autoFocus
                    />
                  </div>
                  {pinError && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Senha incorreta. Verifique com a coordenação da ACEDEP.</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn || !pinInput.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? 'Verificando...' : 'Acessar Painel da Coordenação'}
                </button>
              </form>

              <div className="pt-2 text-[11px] text-slate-400 border-t border-white/5">
                <span>Dúvidas ou suporte? Contate a secretaria: </span>
                <strong className="text-slate-300">giuli.pereira@gmail.com</strong>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs Bar */}
            <div className="px-4 sm:px-6 pt-3 pb-2 bg-[#0a192f] border-b border-[#1e3a5f]/60">
              <div className="flex flex-wrap gap-1.5 p-1 bg-black/40 rounded-xl border border-[#1e3a5f]">
                
                {/* 1. Atletas (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('atletas')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'atletas'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Atletas ({athletes.length})</span>
                </button>

                {/* 2. Lista de Presença (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('presenca')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'presenca'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Lista de Presença</span>
                </button>

                {/* 3. Tempos RP (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('tempos')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'tempos'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Tempos RP</span>
                </button>

                {/* 4. Agenda, Campeonatos & Recados Técnicos (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('recados')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'recados'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Agenda & Recados</span>
                </button>

                {/* 5. Mural da Família (Professor & Admin) */}
                <button
                  onClick={() => setActiveTab('mural_familia')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'mural_familia'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Mural da Família ({cheers.length})</span>
                </button>

                {/* Super Admin ONLY Tabs */}
                {!isProfessor && (
                  <>
                    <button
                      onClick={() => setActiveTab('administradores')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'administradores'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Professores & Acessos</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('fotos')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'fotos'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Fotos do Site</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('galeria')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'galeria'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Images className="w-3.5 h-3.5" />
                      <span>Galeria ({galleryPhotos.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('noticias')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'noticias'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>Notícias ({newsPosts.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('emails')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'emails'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>E-mails aos Pais</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('seguranca')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'seguranca'
                          ? 'bg-[#d4af37] text-[#060e1c] shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Senha Mestre</span>
                    </button>
                  </>
                )}
              </div>
            </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-6">
          
          {/* =========================================================================
              TAB: LISTA DE PRESENÇA (TREINOS & CAMPEONATOS)
             ========================================================================= */}
          {activeTab === 'presenca' && <AttendanceManagerTab />}

          {/* =========================================================================
              TAB: GESTÃO SEGURA DE ADMINISTRADORES
             ========================================================================= */}
          {activeTab === 'administradores' && <AdminUsersManagerTab />}

          {/* =========================================================================
              TAB 1: GESTÃO & CADASTRO DE ATLETAS (FÁCIL + FOTO + LOGIN)
             ========================================================================= */}
          {activeTab === 'atletas' && (
            <div className="space-y-8">
              
              {/* Add Athlete Form */}
              <form onSubmit={handleAddAthlete} className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#d4af37]" />
                      <span>Cadastrar Novo Atleta & Criar Login Imediato</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adicione a foto de perfil, os dados do responsável e gere a senha de acesso ao portal com 1 clique.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#d4af37]/10 text-[#f3e5ab] text-[11px] font-semibold border border-[#d4af37]/30">
                    Deficiência Intelectual • S14
                  </span>
                </div>

                {/* 1. Profile Photo Selection Section */}
                <div className="p-4 rounded-xl bg-black/40 border border-[#1e3a5f] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                      <Camera className="w-4 h-4" />
                      <span>1. Foto de Perfil do Atleta</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Escolha uma foto ou use os modelos abaixo</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Live Avatar Preview */}
                    <div className="relative group">
                      <img 
                        src={athletePhoto} 
                        alt="Preview" 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#d4af37] shadow-md shadow-black/50"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-2 -right-2 p-1 bg-[#d4af37] text-[#060e1c] rounded-full shadow">
                        <Sparkles className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Upload / Custom URL Actions */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#d4af37] text-white hover:text-[#060e1c] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Enviar Foto do Dispositivo / Celular</span>
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <span className="text-[11px] text-slate-500">ou selecione um avatar rápido:</span>
                      </div>

                      {/* Presets Carousel */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {AVATAR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setAthletePhoto(preset.url)}
                            title={preset.name}
                            className={`p-0.5 rounded-xl border-2 transition-all cursor-pointer shrink-0 ${
                              athletePhoto === preset.url
                                ? 'border-[#d4af37] scale-105 shadow'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img 
                              src={preset.url} 
                              alt={preset.name} 
                              className="w-9 h-9 rounded-lg object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Personal & Guardian Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Nome Completo do Atleta *</label>
                    <input
                      type="text"
                      required
                      value={athleteName}
                      onChange={(e) => {
                        setAthleteName(e.target.value);
                        if (!athleteAccessCode) {
                          const cleanFirstName = e.target.value.trim().split(' ')[0]?.toLowerCase() || 'atleta';
                          setAthleteAccessCode(`${cleanFirstName}2026`);
                        }
                      }}
                      placeholder="Ex: Matheus Vinícius de Oliveira"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Data Nasc. / Idade</label>
                    <input
                      type="text"
                      value={athleteBirth}
                      onChange={(e) => setAthleteBirth(e.target.value)}
                      placeholder="Ex: 12/04/2008 (17 anos)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Pai / Mãe / Responsável *</label>
                    <input
                      type="text"
                      required
                      value={athleteGuardian}
                      onChange={(e) => setAthleteGuardian(e.target.value)}
                      placeholder="Ex: Patrícia de Oliveira"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail do Responsável (para notificações) *</label>
                    <input
                      type="email"
                      required
                      value={athleteEmail}
                      onChange={(e) => setAthleteEmail(e.target.value)}
                      placeholder="patricia.oliveira@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp / Telefone</label>
                    <input
                      type="text"
                      value={athletePhone}
                      onChange={(e) => setAthletePhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Access PIN Code Generator */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#d4af37]">Senha de Acesso do Login *</label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateAccessCode}
                        className="text-[10px] text-[#f3e5ab] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Gerar Código Fácil</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={athleteAccessCode}
                        onChange={(e) => setAthleteAccessCode(e.target.value)}
                        placeholder="Ex: matheus2026"
                        className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-xl bg-black/50 border border-[#d4af37]/60 text-[#f3e5ab] placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                      />
                      <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#d4af37]" />
                    </div>
                  </div>
                </div>

                {/* 3. Training presets (CPB) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-black/30 border border-white/5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Polo & Piscina</span>
                    <span className="text-slate-200 font-medium">{athletePool}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Horário de Treino</span>
                    <span className="text-slate-200 font-medium">{athleteDays} ({athleteTime})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Treinador Responsável</span>
                    <span className="text-[#f3e5ab] font-medium">{athleteCoach}</span>
                  </div>
                </div>

                {/* Email Welcome Option */}
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    id="notifyWelcome"
                    checked={athleteNotifyOnCreate}
                    onChange={(e) => setAthleteNotifyOnCreate(e.target.checked)}
                    className="rounded border-[#1e3a5f] text-[#d4af37] focus:ring-[#d4af37]"
                  />
                  <label htmlFor="notifyWelcome" className="cursor-pointer">
                    📧 Enviar automaticamente e-mail de boas-vindas com dados de login ao responsável
                  </label>
                </div>

                {athleteSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{athleteSuccess}</span>
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSavingAthlete}
                  className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isSavingAthlete ? 'Cadastrando...' : 'Salvar Atleta & Ativar Login'}</span>
                </button>
              </form>

              {/* Athletes Directory with Live Management */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Atletas & Logins Ativos ({athletes.length})</span>
                    </h5>
                    <p className="text-xs text-slate-400">
                      Consulte a lista, copie o cartão de acesso para WhatsApp ou edite a foto de cada atleta.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={athleteSearchTerm}
                      onChange={(e) => setAthleteSearchTerm(e.target.value)}
                      placeholder="Buscar por atleta ou responsável..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {filteredAthletes.length === 0 ? (
                  <div className="p-8 text-center bg-black/30 rounded-2xl border border-white/5 text-xs text-slate-400">
                    Nenhum atleta encontrado para a busca.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAthletes.map((athlete) => (
                      <div
                        key={athlete.id}
                        className="p-4 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-3 relative group hover:border-[#d4af37]/50 transition-all shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <img 
                            src={athlete.photoUrl || AVATAR_PRESETS[0].url} 
                            alt={athlete.name} 
                            className="w-14 h-14 rounded-xl object-cover border border-[#d4af37]/60 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h6 className="font-bold text-white text-sm truncate">{athlete.name}</h6>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setEditingAthlete(athlete)}
                                  className="p-1 text-slate-400 hover:text-[#d4af37] transition-colors cursor-pointer"
                                  title="Editar atleta e foto"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Tem certeza que deseja excluir o cadastro de ${athlete.name}?`)) {
                                      deleteAthleteRecord(athlete.id);
                                    }
                                  }}
                                  className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                  title="Remover atleta"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-300 truncate">
                              Resp: <span className="text-white font-medium">{athlete.guardianName}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              E-mail: {athlete.guardianEmail || 'Não informado'}
                            </p>
                          </div>
                        </div>

                        {/* Login Credential Box */}
                        <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">SENHA DO PORTAL:</span>
                            <span className="font-mono text-[#f3e5ab] font-bold">{athlete.accessCode}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyAccessCredentials(athlete)}
                              className="px-2.5 py-1 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#f3e5ab] hover:text-[#060e1c] text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Copiar dados para WhatsApp/E-mail"
                            >
                              {copiedAccessCard === athlete.accessCode ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar Acesso</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Quick Metrics summary */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                          <span>{athlete.swimmingMetrics?.length || 0} marcas (RP) registradas</span>
                          <span className="text-[#d4af37] font-semibold">{athlete.trainingSchedule?.lane || 'Raia S14'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB 2: DISPARADOR DE E-MAILS AOS PAIS & HISTÓRICO
             ========================================================================= */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              
              {/* Broadcast Composer */}
              <form onSubmit={handleSendBroadcast} className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#d4af37]" />
                      <span>Disparador de Atividades & Comunicados por E-mail</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Envie instantaneamente informativos para que pais e responsáveis não percam nenhuma atualização da página.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenMailClient()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-white/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Gmail / Outlook com CCO</span>
                  </button>
                </div>

                {/* Templates Quick Bar */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modelos Rápidos de Mensagem:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastSubject('Informativo ACEDEP: Horários de Treinos no Centro Paralímpico Brasileiro');
                        setBroadcastBody('Prezados pais e responsáveis,\n\nInformamos que os treinos desta semana ocorrerão normalmente na piscina olímpica do CPB. Pedimos pontualidade de 15 minutos antes da entrada na água.\n\nAtenciosamente,\nComissão Técnica ACEDEP');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-[#d4af37]/20 hover:text-[#f3e5ab] text-slate-300 text-[11px] border border-white/5 transition-colors cursor-pointer"
                    >
                      🏊 Horários de Treino
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastSubject('Nova Notícia no Mural: Resultados Oficiais e Conquistas S14');
                        setBroadcastBody('Prezados pais e familiares,\n\nAcabamos de publicar na página inicial da ACEDEP as fotos e resultados da última competição de natação paralímpica. Nossos atletas tiveram uma participação exemplar!\n\nConfiram os detalhes no site: https://acedep.org.br\n\nAbraços,\nEquipe ACEDEP');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-[#d4af37]/20 hover:text-[#f3e5ab] text-slate-300 text-[11px] border border-white/5 transition-colors cursor-pointer"
                    >
                      🏆 Nova Notícia no Mural
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastSubject('Lembrete Importante: Renovação de Atestados Médicos para a Piscina');
                        setBroadcastBody('Prezados responsáveis,\n\nLembramos a todos da necessidade de manter os atestados cardiológicos e dermatológicos atualizados junto à coordenação técnica para acesso às raias.\n\nQualquer dúvida estamos à disposição.\nCoordenação ACEDEP');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-[#d4af37]/20 hover:text-[#f3e5ab] text-slate-300 text-[11px] border border-white/5 transition-colors cursor-pointer"
                    >
                      📋 Atestados Médicos
                    </button>
                  </div>
                </div>

                {/* Recipient Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Destinatários do E-mail *</label>
                    <select
                      value={broadcastRecipientMode}
                      onChange={(e) => setBroadcastRecipientMode(e.target.value as 'all' | 'specific')}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="all">Todos os Pais e Responsáveis Cadastrados ({getAllParentEmails().length} e-mails)</option>
                      <option value="specific">Responsável de um atleta específico</option>
                    </select>
                  </div>

                  {broadcastRecipientMode === 'specific' && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Selecione o Atleta / Responsável *</label>
                      <select
                        value={broadcastSpecificAthleteId}
                        onChange={(e) => setBroadcastSpecificAthleteId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        {athletes.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} (Resp: {a.guardianName} - {a.guardianEmail})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Assunto do E-mail *</label>
                  <input
                    type="text"
                    required
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="Ex: Informativo ACEDEP: Convocação para o Circuito Paulista"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Mensagem do E-mail aos Responsáveis *</label>
                  <textarea
                    required
                    rows={5}
                    value={broadcastBody}
                    onChange={(e) => setBroadcastBody(e.target.value)}
                    placeholder="Escreva a mensagem detalhada para os pais..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-y"
                  />
                </div>

                {broadcastSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{broadcastSuccess}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSendingBroadcast}
                    className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSendingBroadcast ? 'Disparando...' : 'Disparar Notificação por E-mail'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMailClient(broadcastSubject, broadcastBody)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all cursor-pointer border border-white/10 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Enviar via Meu Programa de E-mail</span>
                  </button>
                </div>
              </form>

              {/* Email Activity History Log */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Histórico de Atualizações Enviadas por E-mail ({emailLogs.length})</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sincronizado em Tempo Real
                  </span>
                </h5>

                <div className="space-y-2">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-black/40 border border-[#1e3a5f] space-y-1.5 text-xs hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs">{log.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono text-[10px] border border-emerald-500/20">
                          {log.status === 'enviado' ? '✓ Enviado' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] line-clamp-2">{log.contentPreview}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-white/5">
                        <span>Destinatários: <strong className="text-slate-300">{log.recipientSummary}</strong></span>
                        <span>{log.sentAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              TAB 3: NOTÍCIAS NO MURAL
             ========================================================================= */}
          {activeTab === 'noticias' && (
            <div className="space-y-6">
              <form onSubmit={handleAddNews} className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  Publicar Nova Notícia no Mural da ACEDEP
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Título da Notícia *</label>
                    <input
                      type="text"
                      required
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="Ex: ACEDEP conquista ouro nos 100m livre S14"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Categoria *</label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value as NewsCategory)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Resultados & Provas">Resultados & Provas</option>
                      <option value="Comunicados Oficiais">Comunicados Oficiais</option>
                      <option value="Treinos & Calendário">Treinos & Calendário</option>
                      <option value="Eventos & Festivais">Eventos & Festivais</option>
                      <option value="Histórias de Superação">Histórias de Superação</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Resumo Rápido (Subtítulo)</label>
                  <input
                    type="text"
                    value={newsSummary}
                    onChange={(e) => setNewsSummary(e.target.value)}
                    placeholder="Breve frase descritiva para o card"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">URL da Imagem de Capa</label>
                  <input
                    type="url"
                    value={newsCoverUrl}
                    onChange={(e) => setNewsCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Conteúdo Completo *</label>
                  <textarea
                    required
                    rows={5}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Escreva os detalhes da notícia, resultados, datas ou comunicados..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-y"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    id="notifyNewsEmail"
                    checked={newsNotifyEmail}
                    onChange={(e) => setNewsNotifyEmail(e.target.checked)}
                    className="rounded border-[#1e3a5f] text-[#d4af37] focus:ring-[#d4af37]"
                  />
                  <label htmlFor="notifyNewsEmail" className="cursor-pointer">
                    📧 Enviar aviso desta notícia por e-mail automaticamente a todos os pais e responsáveis
                  </label>
                </div>

                {newsSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{newsSuccess}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSavingNews}
                  className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingNews ? 'Publicando...' : 'Salvar e Publicar Notícia'}
                </button>
              </form>

              {/* Existing News List */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Notícias Publicadas ({newsPosts.length})
                </h5>
                <div className="space-y-2">
                  {newsPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-3.5 rounded-xl bg-black/40 border border-[#1e3a5f] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{post.title}</p>
                        <p className="text-[10px] text-slate-400">{post.category} • {post.date}</p>
                      </div>
                      <button
                        onClick={() => deleteNewsPost(post.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="Excluir notícia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: LANÇAR TEMPOS & RECORDES (RP)
             ========================================================================= */}
          {activeTab === 'tempos' && (
            <form onSubmit={handleAddTime} className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4 max-w-xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#d4af37]" />
                Lançar Nova Marca / Cronometragem de Natação
              </h4>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Selecione o Nadador *</label>
                <select
                  value={selectedAthleteIdForTime}
                  onChange={(e) => setSelectedAthleteIdForTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} - Classe S14</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Prova Aquática *</label>
                  <select
                    value={metricEvent}
                    onChange={(e) => setMetricEvent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="50m Livre">50m Livre</option>
                    <option value="100m Livre">100m Livre</option>
                    <option value="200m Livre">200m Livre</option>
                    <option value="50m Costas">50m Costas</option>
                    <option value="100m Costas">100m Costas</option>
                    <option value="50m Peito">50m Peito</option>
                    <option value="100m Peito">100m Peito</option>
                    <option value="50m Borboleta">50m Borboleta</option>
                    <option value="200m Medley">200m Medley</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Tempo Cronometrado *</label>
                  <input
                    type="text"
                    required
                    value={metricTime}
                    onChange={(e) => setMetricTime(e.target.value)}
                    placeholder="Ex: 00:29.40"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Evolução / Marca</label>
                  <input
                    type="text"
                    value={metricEvolution}
                    onChange={(e) => setMetricEvolution(e.target.value)}
                    placeholder="Ex: -0.40s (Novo RP)"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Competição / Etapa</label>
                  <input
                    type="text"
                    value={metricStage}
                    onChange={(e) => setMetricStage(e.target.value)}
                    placeholder="Ex: Circuito Paralímpico SP"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  id="notifyTimeEmail"
                  checked={timeNotifyEmail}
                  onChange={(e) => setTimeNotifyEmail(e.target.checked)}
                  className="rounded border-[#1e3a5f] text-[#d4af37] focus:ring-[#d4af37]"
                />
                <label htmlFor="notifyTimeEmail" className="cursor-pointer">
                  📧 Enviar e-mail imediato ao responsável comemorando a nova marca
                </label>
              </div>

              {timeSuccess && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{timeSuccess}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isSavingTime}
                className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingTime ? 'Gravando...' : 'Salvar Novo Tempo (RP)'}
              </button>
            </form>
          )}

          {/* =========================================================================
              TAB 5: RECADOS AO RESPONSÁVEL
             ========================================================================= */}
          {activeTab === 'recados' && (
            <form onSubmit={handleAddNote} className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4 max-w-xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#d4af37]" />
                Enviar Feedback / Orientação Privada ao Responsável
              </h4>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Selecione o Nadador *</label>
                <select
                  value={selectedAthleteIdForNote}
                  onChange={(e) => setSelectedAthleteIdForNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Responsável: {a.guardianName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Título do Recado</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Ex: Excelente evolução na respiração bilateral"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Mensagem / Observação do Treinador *</label>
                <textarea
                  required
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Escreva a orientação para o pai/mãe sobre o treino aquático, atestados ou comportamento..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  id="notifyNoteEmail"
                  checked={noteNotifyEmail}
                  onChange={(e) => setNoteNotifyEmail(e.target.checked)}
                  className="rounded border-[#1e3a5f] text-[#d4af37] focus:ring-[#d4af37]"
                />
                <label htmlFor="notifyNoteEmail" className="cursor-pointer">
                  📧 Enviar cópia deste recado por e-mail diretamente ao responsável
                </label>
              </div>

              {noteSuccess && (
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{noteSuccess}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isSavingNote}
                className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingNote ? 'Enviando...' : 'Enviar Recado ao Responsável'}
              </button>
            </form>
          )}

          {/* =========================================================================
              TAB: FOTOS DAS SEÇÕES DO SITE (FIREBASE FIRESTORE)
             ========================================================================= */}
          {activeTab === 'fotos' && (
            <div className="space-y-6">
              {/* Section Selector Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#1e3a5f] pb-3">
                {Object.keys(DEFAULT_PHOTOS).map((photoKey) => {
                  const meta = DEFAULT_PHOTOS[photoKey];
                  const isSelected = selectedPhotoId === photoKey;
                  return (
                    <button
                      key={photoKey}
                      onClick={() => {
                        setSelectedPhotoId(photoKey);
                        setCustomPhotoUrlInput('');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#d4af37] text-[#060e1c] shadow-lg'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{meta.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Section Editor Card */}
              {selectedPhotoId && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#0a192f]/60 p-5 rounded-2xl border border-[#1e3a5f]">
                  
                  {/* Left Column: Live Preview */}
                  <div className="md:col-span-5 space-y-2">
                    <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Visualização Atual</span>
                      {previewOverride[selectedPhotoId] && (
                        <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                          Prévia não salva
                        </span>
                      )}
                    </label>

                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/60 border border-[#1e3a5f] group shadow-inner">
                      <img
                        src={previewOverride[selectedPhotoId] || photos[selectedPhotoId] || DEFAULT_PHOTOS[selectedPhotoId]?.defaultUrl}
                        alt="Prévia da foto"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm text-[11px] text-slate-300">
                        <span className="font-bold text-[#f3e5ab] block">
                          {DEFAULT_PHOTOS[selectedPhotoId]?.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Seção: {DEFAULT_PHOTOS[selectedPhotoId]?.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Upload & Actions */}
                  <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        Atualizar Foto desta Seção
                      </h4>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        Envie a foto do seu dispositivo. Ao salvar, ela será atualizada no <strong>Firebase Firestore</strong> instantaneamente para todos os visitantes.
                      </p>

                      {/* Dropzone & File Input */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handlePhotoDrop(selectedPhotoId, e)}
                        className="p-6 rounded-xl border-2 border-dashed border-[#1e3a5f] hover:border-[#d4af37] bg-black/40 text-center transition-colors mb-4"
                      >
                        <Upload className="w-8 h-8 mx-auto text-[#d4af37] mb-2" />
                        <p className="text-xs font-semibold text-white mb-1">
                          Arraste e solte a nova foto aqui
                        </p>
                        <p className="text-[11px] text-slate-400 mb-3">
                          ou clique no botão abaixo para escolher
                        </p>

                        <input
                          type="file"
                          id={`file-input-${selectedPhotoId}`}
                          accept="image/*"
                          onChange={(e) => handlePhotoFileChange(selectedPhotoId, e)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`file-input-${selectedPhotoId}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-[#d4af37] text-white hover:text-[#060e1c] text-xs font-bold transition-all border border-white/20 hover:border-[#d4af37] cursor-pointer shadow"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Selecionar Imagem...</span>
                        </label>
                      </div>

                      {/* Optional URL input */}
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 block font-medium">
                          Ou digite o link direto de uma imagem (URL):
                        </label>
                        <input
                          type="url"
                          value={customPhotoUrlInput}
                          onChange={(e) => {
                            setCustomPhotoUrlInput(e.target.value);
                            if (e.target.value) {
                              setPreviewOverride((prev) => ({ ...prev, [selectedPhotoId]: e.target.value }));
                            }
                          }}
                          placeholder="https://exemplo.com/minha-foto.jpg"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    {/* Feedback Messages */}
                    {successPhotoState[selectedPhotoId] && (
                      <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{successPhotoState[selectedPhotoId]}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1e3a5f]">
                      {confirmResetId === selectedPhotoId ? (
                        <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/50 px-3 py-1.5 rounded-xl">
                          <span className="text-[11px] text-amber-200 font-semibold">Restaurar original?</span>
                          <button
                            type="button"
                            onClick={() => handleResetPhotoExecute(selectedPhotoId)}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[#060e1c] font-bold text-xs cursor-pointer transition-colors"
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmResetId(null)}
                            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs cursor-pointer transition-colors"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmResetId(selectedPhotoId)}
                          disabled={uploadingState[selectedPhotoId]}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restaurar Padrão</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSavePhotoToFirestore(selectedPhotoId)}
                        disabled={
                          uploadingState[selectedPhotoId] ||
                          (!previewOverride[selectedPhotoId] && !customPhotoUrlInput.trim())
                        }
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {uploadingState[selectedPhotoId] ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Gravando no Banco...</span>
                          </>
                        ) : (
                          <>
                            <Database className="w-3.5 h-3.5" />
                            <span>Salvar no Banco de Dados</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB: GALERIA DE FOTOS DA ACEDEP
             ========================================================================= */}
          {activeTab === 'galeria' && (
            <div className="space-y-6">
              {/* Add New Gallery Photo Card */}
              <form 
                onSubmit={handleAddGalleryPhotoSubmit}
                className="p-5 rounded-2xl bg-[#0a192f]/80 border border-[#1e3a5f] space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#d4af37]" />
                    Adicionar Nova Foto na Galeria
                  </h4>
                  <span className="text-[11px] text-slate-400">Salvo diretamente no Firestore</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Photo inputs */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Título / Descrição da Foto *
                        </label>
                        <input
                          type="text"
                          required
                          value={newGalTitle}
                          onChange={(e) => setNewGalTitle(e.target.value)}
                          placeholder="Ex: Treino da equipe nas piscinas"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Categoria *
                        </label>
                        <select
                          value={newGalCategory}
                          onChange={(e) => setNewGalCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-[#060e1c] border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Equipe Oficial">Equipe Oficial</option>
                          <option value="Iniciação Esportiva">Iniciação Esportiva</option>
                          <option value="Alto Rendimento">Alto Rendimento</option>
                          <option value="Competições">Competições</option>
                          <option value="Treinamento">Treinamento</option>
                          <option value="Comunidade ACEDEP">Comunidade ACEDEP</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Data / Evento (opcional)
                        </label>
                        <input
                          type="text"
                          value={newGalDate}
                          onChange={(e) => setNewGalDate(e.target.value)}
                          placeholder="Ex: Campeonato Paulista 2026"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Ou Link da Imagem (URL)
                        </label>
                        <input
                          type="url"
                          value={newGalUrl}
                          onChange={(e) => setNewGalUrl(e.target.value)}
                          placeholder="https://exemplo.com/foto.jpg"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    {/* File Upload Selector */}
                    <div>
                      <input
                        type="file"
                        id="gallery-file-upload-coach"
                        accept="image/*"
                        onChange={handleGalleryFileChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="gallery-file-upload-coach"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#d4af37] text-slate-300 hover:text-[#060e1c] text-xs font-semibold transition-all border border-white/10 hover:border-[#d4af37] cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Carregar foto do seu dispositivo</span>
                      </label>
                    </div>
                  </div>

                  {/* Photo preview box */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-black/40 border border-[#1e3a5f]">
                    {newGalPreview || newGalUrl ? (
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[#d4af37]/40">
                        <img
                          src={newGalPreview || newGalUrl}
                          alt="Prévia"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px]">Nenhuma foto selecionada</span>
                      </div>
                    )}
                  </div>
                </div>

                {galleryError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{galleryError}</span>
                  </div>
                )}

                {gallerySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{gallerySuccess}</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingGallery || (!newGalPreview && !newGalUrl.trim())}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow cursor-pointer disabled:opacity-40"
                  >
                    {isSavingGallery ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Salvando na Galeria...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar à Galeria</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* List of existing gallery photos with delete option */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Fotos Atuais na Galeria ({galleryPhotos.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Clique no ícone de lixeira para remover</span>
                </h4>

                {galleryPhotos.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0a192f]/40 border border-dashed border-[#1e3a5f] text-center text-slate-400">
                    <Images className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-300">Nenhuma foto na galeria no momento.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Adicione novas fotos usando o formulário acima.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {galleryPhotos.map((photo) => {
                      const isConfirming = confirmDeleteGalleryId === photo.id;
                      const isDeleting = isDeletingGalleryId === photo.id;

                      return (
                        <div
                          key={photo.id}
                          className="relative rounded-xl overflow-hidden bg-[#0a192f] border border-white/10 p-2.5 flex gap-3 items-center group transition-all hover:border-[#1e3a5f]"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                            <img
                              src={photo.url}
                              alt={photo.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#d4af37]/20 text-[#f3e5ab] font-semibold">
                              {photo.category}
                            </span>
                            <h5 className="text-xs font-bold text-white truncate mt-1">
                              {photo.title}
                            </h5>
                            {photo.date && (
                              <p className="text-[10px] text-slate-400 truncate">
                                {photo.date}
                              </p>
                            )}
                          </div>

                          {isConfirming ? (
                            <div className="flex flex-col gap-1 shrink-0 bg-red-950/90 border border-red-500/60 p-1.5 rounded-lg z-10">
                              <span className="text-[9px] text-red-200 font-bold text-center">Excluir?</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => executeDeleteGalleryPhoto(photo)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors shadow"
                                >
                                  {isDeleting ? '...' : 'Sim'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteGalleryId(null)}
                                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded text-[10px] font-semibold cursor-pointer transition-colors"
                                >
                                  Não
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteGalleryId(photo.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 transition-colors cursor-pointer shrink-0"
                              title="Remover foto da galeria"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: MURAL DA FAMÍLIA & COMUNIDADE (MODERAÇÃO DE RECADOS)
             ========================================================================= */}
          {activeTab === 'mural_familia' && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a192f]/80 border border-[#1e3a5f]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Gerenciar Mural de Recados da Família & Comunidade
                    </h4>
                    <p className="text-xs text-slate-300">
                      Edite textos, corrija informações ou exclua mensagens publicadas no mural de torcida.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#f3e5ab] text-xs font-bold whitespace-nowrap">
                    Total: {cheers.length} {cheers.length === 1 ? 'recado' : 'recados'}
                  </span>
                </div>
              </div>

              {/* Feedback messages */}
              {cheerAdminSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{cheerAdminSuccess}</span>
                </div>
              )}

              {cheerAdminError && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{cheerAdminError}</span>
                </div>
              )}

              {/* Add New Official Cheer Form */}
              <div className="p-5 rounded-2xl bg-[#0c1f38] border border-[#1e3a5f] space-y-4">
                <div className="flex items-center gap-2 border-b border-[#1e3a5f]/60 pb-3">
                  <Plus className="w-4 h-4 text-[#d4af37]" />
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                    Publicar Novo Recado Oficial da Coordenação / Comissão
                  </h5>
                </div>

                <form onSubmit={handleAdminAddCheerSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
                  <div className="md:col-span-4">
                    <label className="text-slate-300 block mb-1 font-semibold">Nome do Autor / Emissor *</label>
                    <input
                      type="text"
                      required
                      value={newAdminCheerAuthor}
                      onChange={(e) => setNewAdminCheerAuthor(e.target.value)}
                      placeholder="Ex: Prof. Leonardo Ramos / Coordenação"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="text-slate-300 block mb-1 font-semibold">Vínculo / Cargo</label>
                    <input
                      type="text"
                      value={newAdminCheerRelation}
                      onChange={(e) => setNewAdminCheerRelation(e.target.value)}
                      placeholder="Ex: Coordenação Técnica ACEDEP"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="md:col-span-4 flex items-end">
                    <button
                      type="submit"
                      disabled={isAddingAdminCheer || !newAdminCheerAuthor.trim() || !newAdminCheerMsg.trim()}
                      className="w-full py-2 px-4 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      {isAddingAdminCheer ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Publicando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Publicar no Mural</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="md:col-span-12">
                    <label className="text-slate-300 block mb-1 font-semibold">Mensagem de Incentivo aos Nadadores *</label>
                    <textarea
                      required
                      rows={2}
                      value={newAdminCheerMsg}
                      onChange={(e) => setNewAdminCheerMsg(e.target.value)}
                      placeholder="Escreva a mensagem que aparecerá no mural da comunidade..."
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-none"
                    />
                  </div>

                  {addCheerSuccess && (
                    <div className="md:col-span-12 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{addCheerSuccess}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Search & List of existing cheers */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#d4af37]" />
                    <span>Recados Publicados ({cheers.length})</span>
                  </h4>

                  {/* Search input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={cheerSearchTerm}
                      onChange={(e) => setCheerSearchTerm(e.target.value)}
                      placeholder="Buscar por autor, texto ou vínculo..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {cheers.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#0a192f]/40 border border-dashed border-[#1e3a5f] text-center text-slate-400">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-300">Nenhum recado no mural ainda.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Publique o primeiro recado usando o formulário acima.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cheers
                      .filter((c) => {
                        if (!cheerSearchTerm.trim()) return true;
                        const term = cheerSearchTerm.toLowerCase();
                        return (
                          c.authorName.toLowerCase().includes(term) ||
                          c.message.toLowerCase().includes(term) ||
                          (c.relationship || '').toLowerCase().includes(term)
                        );
                      })
                      .map((cheer) => {
                        const isConfirmingDelete = confirmDeleteCheerId === cheer.id;
                        const isDeleting = isDeletingCheerId === cheer.id;

                        return (
                          <div
                            key={cheer.id}
                            className="p-4 rounded-2xl bg-[#0c1f38] border border-[#1e3a5f] hover:border-[#d4af37]/40 transition-all flex flex-col justify-between space-y-3 shadow-md group"
                          >
                            <div className="space-y-2.5">
                              {/* Author and metadata */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#060e1c] text-xs font-bold shrink-0 shadow"
                                    style={{ backgroundColor: cheer.avatarColor || '#d4af37' }}
                                  >
                                    {cheer.authorName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{cheer.authorName}</p>
                                    <p className="text-[10px] text-[#d4af37] truncate font-medium">{cheer.relationship || 'Comunidade ACEDEP'}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="flex items-center gap-1 text-[10px] text-rose-300 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                                    <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                                    <span>{cheer.likes || 0}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Message text */}
                              <div className="p-3 rounded-xl bg-black/30 border border-[#1e3a5f]/40">
                                <p className="text-xs text-slate-200 leading-relaxed italic">
                                  "{cheer.message}"
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons: Edit and Delete */}
                            <div className="pt-2 border-t border-[#1e3a5f]/40 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-400">
                                {cheer.createdAt ? new Date(cheer.createdAt).toLocaleDateString('pt-BR') : 'Publicado'}
                              </span>

                              {isConfirmingDelete ? (
                                <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-500/60 px-2 py-1 rounded-xl">
                                  <span className="text-[10px] text-red-200 font-bold">Excluir?</span>
                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => handleDeleteCheerExecute(cheer.id)}
                                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors shadow"
                                  >
                                    {isDeleting ? '...' : 'Sim, excluir'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteCheerId(null)}
                                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded text-[10px] font-semibold cursor-pointer transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditCheer(cheer)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#d4af37]/20 text-slate-300 hover:text-[#f3e5ab] border border-white/10 hover:border-[#d4af37]/40 text-xs font-semibold transition-all cursor-pointer"
                                    title="Editar recado"
                                  >
                                    <Edit3 className="w-3 h-3 text-[#d4af37]" />
                                    <span>Editar</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteCheerId(cheer.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 text-xs font-semibold transition-all cursor-pointer"
                                    title="Excluir recado permanentemente"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Excluir</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB: SEGURANÇA E ALTERAÇÃO DE SENHA DO ADMIN
             ========================================================================= */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <form 
                onSubmit={handleUpdatePinSubmit}
                className="p-6 rounded-2xl bg-[#0a192f]/80 border border-[#1e3a5f] space-y-4 max-w-lg"
              >
                <div className="flex items-center gap-3 border-b border-[#1e3a5f] pb-3">
                  <div className="p-2 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Alterar Senha do Administrador
                    </h4>
                    <p className="text-xs text-slate-400">
                      Defina uma senha pessoal e exclusiva para gerenciar todo o painel ACEDEP.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Nova Senha *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPinInput}
                      onChange={(e) => {
                        setNewPinInput(e.target.value);
                        setPinFormError('');
                      }}
                      placeholder="Mínimo de 4 caracteres"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Confirmar Nova Senha *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPinInput}
                      onChange={(e) => {
                        setConfirmPinInput(e.target.value);
                        setPinFormError('');
                      }}
                      placeholder="Repita a nova senha"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {pinFormError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{pinFormError}</span>
                  </div>
                )}

                {pinSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pinSuccess}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingPin || !newPinInput.trim() || !confirmPinInput.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow cursor-pointer disabled:opacity-40"
                  >
                    {isSavingPin ? 'Atualizando Senha...' : 'Atualizar Senha de Administrador'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
        </>
        )}

        {/* Modal for Editing Athlete */}
        {editingAthlete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0c1f38] border border-[#d4af37]/60 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-white text-sm font-serif">Editar Perfil de {editingAthlete.name}</h5>
                <button 
                  onClick={() => setEditingAthlete(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedAthlete} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={editingAthlete.name}
                    onChange={(e) => setEditingAthlete({ ...editingAthlete, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">URL da Foto de Perfil</label>
                  <input
                    type="text"
                    value={editingAthlete.photoUrl || ''}
                    onChange={(e) => setEditingAthlete({ ...editingAthlete, photoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Responsável</label>
                  <input
                    type="text"
                    required
                    value={editingAthlete.guardianName}
                    onChange={(e) => setEditingAthlete({ ...editingAthlete, guardianName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">E-mail do Responsável</label>
                  <input
                    type="email"
                    required
                    value={editingAthlete.guardianEmail}
                    onChange={(e) => setEditingAthlete({ ...editingAthlete, guardianEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-[#d4af37] block mb-1 font-bold">Senha de Acesso (PIN)</label>
                  <input
                    type="text"
                    required
                    value={editingAthlete.accessCode}
                    onChange={(e) => setEditingAthlete({ ...editingAthlete, accessCode: e.target.value })}
                    className="w-full px-3 py-2 font-mono font-bold rounded-lg bg-black/50 border border-[#d4af37]/60 text-[#f3e5ab] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingAthlete(null)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-[#060e1c] font-bold hover:bg-[#b8952b] cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Editing Community Cheer */}
        {editingCheer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#0c1f38] border border-[#d4af37]/60 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e3a5f] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-white text-sm font-serif">Editar Recado do Mural da Família</h5>
                </div>
                <button 
                  onClick={() => setEditingCheer(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditCheer} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Nome do Autor *</label>
                  <input
                    type="text"
                    required
                    value={editCheerAuthor}
                    onChange={(e) => setEditCheerAuthor(e.target.value)}
                    placeholder="Ex: Mariana Silva"
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Vínculo com a ACEDEP / Atleta</label>
                  <input
                    type="text"
                    value={editCheerRelation}
                    onChange={(e) => setEditCheerRelation(e.target.value)}
                    placeholder="Ex: Mãe do atleta Lucas (S14), Padrinho, Amigo..."
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mensagem de Incentivo *</label>
                  <textarea
                    required
                    rows={4}
                    value={editCheerMsg}
                    onChange={(e) => setEditCheerMsg(e.target.value)}
                    placeholder="Texto do recado..."
                    className="w-full px-3 py-2.5 rounded-lg bg-black/50 border border-[#1e3a5f] text-white focus:outline-none focus:border-[#d4af37] resize-none"
                  />
                </div>

                {cheerAdminError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{cheerAdminError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e3a5f]/60">
                  <button
                    type="button"
                    onClick={() => setEditingCheer(null)}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCheer}
                    className="px-5 py-2 rounded-lg bg-[#d4af37] text-[#060e1c] font-bold hover:bg-[#b8952b] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingCheer ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Salvar Alterações</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
