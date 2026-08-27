export interface NavItem {
  label: string;
  href: string;
}

export interface ImpactStat {
  id: string;
  number: string;
  label: string;
  description: string;
  iconName: string;
}

export interface Nucleo {
  id: string;
  name: string;
  fullName: string;
  type: string;
  address: string;
  neighborhood: string;
  city: string;
  description: string;
  highlights: string[];
  modalities: string[];
  schedule: string;
  badge: string;
  image: string;
  mapUrl: string;
}

export interface Modality {
  id: string;
  title: string;
  category: string;
  description: string;
  targetAudience: string;
  benefits: string[];
  features: string[];
  image: string;
}

export interface TeamMember {
  name: string;
  role: string;
  credentials: string;
  experience: string;
  image: string;
}

export interface AthleteStory {
  name: string;
  modality: string;
  category: string;
  achievement: string;
  quote: string;
  image: string;
}

export type NewsCategory = 
  | 'Resultados & Provas' 
  | 'Comunicados Oficiais' 
  | 'Treinos & Calendário' 
  | 'Eventos & Festivais' 
  | 'Histórias de Superação';

export interface NewsPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  coverUrl: string;
  date: string;
  author: string;
  authorRole?: string;
  pinned?: boolean;
  likesCount: number;
  tags: string[];
  createdAt: string;
}

export interface CommunityCheer {
  id: string;
  authorName: string;
  relationship: string;
  message: string;
  avatarColor: string;
  likes: number;
  createdAt: string;
}

export interface SwimmingMetric {
  id: string;
  event: string; // ex: "50m Livre", "100m Livre", "50m Costas", "100m Peito", "50m Borboleta", "200m Medley"
  bestTime: string; // ex: "00:31.40"
  previousTime?: string; // ex: "00:32.15"
  evolution?: string; // ex: "-0.75s"
  dateRecorded: string;
  stageName: string;
  laneType: '25m' | '50m';
}

export interface MedicalDocument {
  id: string;
  name: string;
  status: 'Válido' | 'A vencer' | 'Pendente';
  expiryDate: string;
  notes?: string;
}

export interface CoachNote {
  id: string;
  date: string;
  title: string;
  text: string;
  coachName: string;
  importance: 'normal' | 'alta' | 'destaque';
}

export interface TrainingAttendanceDay {
  date: string;
  status: 'presente' | 'falta_justificada' | 'falta' | 'treino_extra';
  note?: string;
}

export interface AthleteRecord {
  id: string;
  name: string;
  photoUrl: string;
  birthDate: string;
  paralympicClass: string; // ex: "S14 / SB14 / SM14 - Deficiência Intelectual"
  clubRegistration: string;
  cbdiRegistration?: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  accessCode: string; // Senha ou PIN de acesso individual do responsável
  trainingSchedule: {
    pool: string;
    days: string[];
    time: string;
    lane: string;
    coachName: string;
  };
  attendanceRate: number; // Porcentagem de presença (ex: 94)
  recentAttendance: TrainingAttendanceDay[];
  swimmingMetrics: SwimmingMetric[];
  medicalDocuments: MedicalDocument[];
  coachNotes: CoachNote[];
  createdAt: string;
}

export interface EmailNotificationLog {
  id: string;
  type: 'noticia' | 'tempo_rp' | 'recado_treinador' | 'credenciais' | 'boletim_geral';
  title: string;
  recipientSummary: string; // e.g. "Todos os 35 Pais/Responsáveis" or "Carlos Silva (gabriel@...)"
  recipientEmails: string[];
  sentAt: string;
  senderName: string;
  contentPreview: string;
  status: 'enviado' | 'pendente';
}
