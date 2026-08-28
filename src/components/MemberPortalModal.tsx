import React, { useState, useRef } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Calendar, 
  Timer, 
  FileText, 
  MessageSquare, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Waves, 
  Award, 
  TrendingUp, 
  Clock, 
  MapPin, 
  KeyRound,
  Sparkles,
  RefreshCw,
  Camera,
  Upload,
  Mail,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { AthleteDocumentsTab } from './AthleteDocumentsTab';

const AVATAR_PRESETS = [
  { id: 'p1', name: 'Atleta Masculino', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=400&q=80' },
  { id: 'p2', name: 'Atleta Feminina', url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=400&q=80' },
  { id: 'p3', name: 'Nadador Podium / Ouro', url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?auto=format&fit=crop&w=400&q=80' },
  { id: 'p4', name: 'Nadadora Paralímpica', url: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=400&q=80' },
  { id: 'p5', name: 'Jovem Promessa S14', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
];

interface MemberPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberPortalModal: React.FC<MemberPortalModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentAthlete, 
    athletes,
    isGuardianAuthenticated, 
    guardianLogin, 
    guardianLogout,
    updateAthleteAccessCode,
    saveAthleteRecord,
    emailLogs,
    setCoachManagerModalOpen
  } = useCommunity();

  // Login form state
  const [identifierInput, setIdentifierInput] = useState('');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Dashboard Tab
  const [activeTab, setActiveTab] = useState<'treinos' | 'tempos' | 'documentos' | 'mensagens' | 'emails' | 'senha'>('treinos');

  // Change PIN state
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  // Edit photo state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState('');
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const res = await guardianLogin(identifierInput, accessCodeInput);
    setIsLoggingIn(false);

    if (!res.success) {
      setLoginError(res.message || 'Dados de acesso incorretos.');
    } else {
      setIdentifierInput('');
      setAccessCodeInput('');
    }
  };

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess('');

    if (!currentAthlete) return;

    if (newPin.trim().length < 4) {
      setPinChangeError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (newPin.trim() !== confirmNewPin.trim()) {
      setPinChangeError('A confirmação não confere com a nova senha digitada.');
      return;
    }

    setIsUpdatingPin(true);
    const success = await updateAthleteAccessCode(currentAthlete.id, newPin.trim());
    setIsUpdatingPin(false);

    if (success) {
      setPinChangeSuccess('Sua nova senha de acesso foi atualizada com sucesso!');
      setNewPin('');
      setConfirmNewPin('');
      setTimeout(() => setPinChangeSuccess(''), 5000);
    } else {
      setPinChangeError('Não foi possível atualizar a senha. Tente novamente.');
    }
  };

  const handleSavePhoto = async () => {
    if (!currentAthlete || !selectedPhotoUrl) return;
    setIsSavingPhoto(true);
    await saveAthleteRecord({
      ...currentAthlete,
      photoUrl: selectedPhotoUrl,
    });
    setIsSavingPhoto(false);
    setPhotoModalOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedPhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter logs relevant to this athlete or general broadcast
  const athleteLogs = emailLogs.filter((log) => {
    if (!currentAthlete) return false;
    const matchEmail = log.recipientEmails.some((e) => e.toLowerCase() === (currentAthlete.guardianEmail || '').toLowerCase());
    const matchName = log.recipientSummary.toLowerCase().includes(currentAthlete.name.toLowerCase()) || log.recipientSummary.includes('Todos os Pais');
    return matchEmail || matchName || log.type === 'boletim_geral' || log.type === 'noticia';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c1f38] border border-[#1e3a5f] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f] bg-[#071326]/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <span>Portal do Responsável & Atleta</span>
                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] text-[10px] font-mono font-bold">
                  Natação Paralímpica S14
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isGuardianAuthenticated 
                  ? `Atleta: ${currentAthlete?.name} • Responsável: ${currentAthlete?.guardianName}`
                  : 'Área restrita e individual para acompanhamento do atleta da ACEDEP'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isGuardianAuthenticated && (
              <button
                onClick={guardianLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                title="Sair da Conta do Responsável"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          
          {!isGuardianAuthenticated ? (
            /* LOGIN SCREEN */
            <div className="max-w-md mx-auto space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-lg">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-white font-serif">
                  Acesso Individual do Responsável
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Digite o e-mail cadastrado ou nome do atleta e a senha de acesso individual.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    E-mail do Responsável ou Nome do Atleta
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={identifierInput}
                      onChange={(e) => {
                        setIdentifierInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Ex: mariana.pereira@exemplo.com ou Lucas"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Senha de Acesso do Responsável
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={accessCodeInput}
                      onChange={(e) => {
                        setAccessCodeInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Digite sua senha individual"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {loginError && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 justify-center">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validando Acesso...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Entrar no Portal do Filho(a)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* LOGGED IN DASHBOARD */
            <div className="space-y-6">
              
              {/* ATHLETE IDENTITY HEADER CARD */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0a192f] via-[#0e2442] to-[#0a192f] border border-[#1e3a5f] shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
                
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-lg bg-black/40">
                    <img
                      src={currentAthlete.photoUrl || AVATAR_PRESETS[0].url}
                      alt={currentAthlete.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPhotoUrl(currentAthlete.photoUrl || AVATAR_PRESETS[0].url);
                      setPhotoModalOpen(true);
                    }}
                    className="absolute -bottom-2 -right-2 px-2 py-1 rounded-lg bg-[#d4af37] text-[#060e1c] text-[10px] font-bold shadow-md hover:bg-[#b8952b] transition-all flex items-center gap-1 cursor-pointer"
                    title="Alterar Foto de Perfil"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Foto</span>
                  </button>
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#d4af37]" />
                      {currentAthlete.paralympicClass}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                      Atleta Ativo • ACEDEP
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white font-serif">
                    {currentAthlete.name}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Matrícula Clube</span>
                      <span className="font-mono text-slate-200 font-bold">{currentAthlete.clubRegistration}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Registro CBDI/CPB</span>
                      <span className="font-mono text-slate-200 font-bold">{currentAthlete.cbdiRegistration || 'Homologado'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Idade / Nasc.</span>
                      <span className="text-slate-200 font-bold">{currentAthlete.birthDate}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Presença Treinos</span>
                      <span className="text-emerald-400 font-bold">{currentAthlete.attendanceRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NAVIGATION TABS */}
              <div className="flex flex-wrap sm:flex-nowrap gap-1.5 p-1.5 bg-black/40 rounded-2xl border border-[#1e3a5f]">
                <button
                  onClick={() => setActiveTab('treinos')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'treinos'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Treinos</span>
                </button>

                <button
                  onClick={() => setActiveTab('tempos')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'tempos'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  <span>Tempos (RP)</span>
                </button>

                <button
                  onClick={() => setActiveTab('documentos')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'documentos'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Documentos & Laudos</span>
                </button>

                <button
                  onClick={() => setActiveTab('mensagens')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'mensagens'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Recados</span>
                </button>

                <button
                  onClick={() => setActiveTab('emails')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'emails'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>E-mails Recebidos</span>
                </button>

                <button
                  onClick={() => setActiveTab('senha')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'senha'
                      ? 'bg-[#d4af37] text-[#060e1c] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span className="hidden sm:inline">Senha</span>
                </button>
              </div>

              {/* TAB 1: TREINOS & PRESENÇA */}
              {activeTab === 'treinos' && (
                <div className="space-y-6">
                  {/* Schedule Card */}
                  <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                    <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Grade Oficial de Treinos Aquáticos
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                        <span className="text-xs text-slate-400 block">Local dos Treinos</span>
                        <p className="text-sm font-bold text-white">
                          {currentAthlete.trainingSchedule?.pool || 'Piscina Olímpica 50m - CPB'}
                        </p>
                        <p className="text-xs text-[#f3e5ab]">
                          {currentAthlete.trainingSchedule?.lane || 'Raia 3 - Rendimento S14'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                        <span className="text-xs text-slate-400 block">Dias & Horários</span>
                        <p className="text-sm font-bold text-white">
                          {Array.isArray(currentAthlete.trainingSchedule?.days)
                            ? currentAthlete.trainingSchedule.days.join(', ')
                            : (currentAthlete.trainingSchedule?.days || 'Segunda, Quarta, Sexta')}
                        </p>
                        <p className="text-xs text-cyan-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {currentAthlete.trainingSchedule?.time || '14:00 às 15:30'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-between text-xs text-[#f3e5ab]">
                      <span className="font-semibold">
                        Treinador Responsável: {currentAthlete.trainingSchedule?.coachName || 'Prof. Leonardo Ramos'}
                      </span>
                      <span className="text-slate-400">Padrão de Alto Rendimento Paralímpico</span>
                    </div>
                  </div>

                  {/* Attendance Log */}
                  <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Histórico Recente de Presença nas Piscinas
                      </h4>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {currentAthlete.attendanceRate}% de Assiduidade
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {currentAthlete.recentAttendance.map((att, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-400 font-semibold">{att.date}</span>
                            <span className="text-slate-200 font-medium">{att.note}</span>
                          </div>
                          <div>
                            {att.status === 'presente' || att.status === 'treino_extra' ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] uppercase">
                                Presente
                              </span>
                            ) : att.status === 'falta_justificada' ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px] uppercase">
                                Justificado
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold text-[10px] uppercase">
                                Falta
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EVOLUÇÃO & TEMPOS (RP) */}
              {activeTab === 'tempos' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Recordes Pessoais (RP) & Tempos Oficiais
                        </h4>
                        <p className="text-xs text-slate-400 pt-1">
                          Cronometragens oficiais nas provas de natação paralímpica para atletas da classe S14.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {currentAthlete.swimmingMetrics.map((metric) => (
                        <div
                          key={metric.id}
                          className="p-5 rounded-2xl bg-black/40 border border-[#1e3a5f] hover:border-[#d4af37]/40 transition-all space-y-3 shadow"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{metric.event}</span>
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                              Piscina {metric.laneType}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-3">
                            <span className="text-2xl sm:text-3xl font-mono font-bold text-[#d4af37]">
                              {metric.bestTime}
                            </span>
                            {metric.evolution && (
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                {metric.evolution}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                            <span>{metric.stageName}</span>
                            <span>{metric.dateRecorded}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ATESTADOS, LAUDOS, RG & EXAMES MÉDICOS (UPLOAD & DOWNLOAD) */}
              {activeTab === 'documentos' && (
                <AthleteDocumentsTab 
                  athlete={currentAthlete} 
                  isStaff={false} 
                  uploaderName={currentAthlete.guardianName} 
                />
              )}

              {/* TAB 4: RECADOS DA COMISSÃO TÉCNICA */}
              {activeTab === 'mensagens' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                    <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Orientações & Mensagens da Comissão Técnica
                    </h4>
                    <p className="text-xs text-slate-300">
                      Recados e feedbacks personalizados enviados diretamente pelos técnicos para o responsável de {currentAthlete.name}.
                    </p>

                    <div className="space-y-4 pt-2">
                      {currentAthlete.coachNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-5 rounded-2xl bg-black/40 border border-[#1e3a5f] space-y-2.5"
                        >
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-xs font-bold text-white">{note.title}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{note.date}</span>
                          </div>

                          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                            {note.text}
                          </p>

                          <div className="pt-1 flex items-center justify-between text-[11px] text-[#f3e5ab]">
                            <span>Enviado por: {note.coachName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: E-MAILS RECEBIDOS & INFORMATIVOS */}
              {activeTab === 'emails' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Informativos & Atualizações Enviadas para Seu E-mail
                        </h4>
                        <p className="text-xs text-slate-300 pt-1">
                          Todas as notificações, novidades do site e recados disparados pela coordenação da ACEDEP para <strong className="text-white">{currentAthlete.guardianEmail}</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {athleteLogs.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 bg-black/30 rounded-xl">
                          Nenhum comunicado recente no histórico.
                        </div>
                      ) : (
                        athleteLogs.map((log) => (
                          <div
                            key={log.id}
                            className="p-4 rounded-xl bg-black/40 border border-[#1e3a5f] space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-white text-xs">{log.title}</span>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                {log.sentAt}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{log.contentPreview}</p>
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
                              <span>Remetente: {log.senderName}</span>
                              <span className="text-emerald-400">✓ Entregue</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: MINHA SENHA */}
              {activeTab === 'senha' && (
                <div className="space-y-6">
                  <form onSubmit={handleChangePinSubmit} className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4 max-w-lg">
                    <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      Alterar Senha do Responsável
                    </h4>
                    <p className="text-xs text-slate-300">
                      Personalize sua senha de acesso para que apenas você consulte as informações do seu filho(a).
                    </p>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Nova Senha *</label>
                        <input
                          type="password"
                          required
                          value={newPin}
                          onChange={(e) => {
                            setNewPin(e.target.value);
                            setPinChangeError('');
                          }}
                          placeholder="Mínimo 4 caracteres"
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Confirmar Nova Senha *</label>
                        <input
                          type="password"
                          required
                          value={confirmNewPin}
                          onChange={(e) => {
                            setConfirmNewPin(e.target.value);
                            setPinChangeError('');
                          }}
                          placeholder="Repita a nova senha"
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/50 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    {pinChangeError && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{pinChangeError}</span>
                      </p>
                    )}

                    {pinChangeSuccess && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{pinChangeSuccess}</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isUpdatingPin}
                      className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingPin ? 'Salvando...' : 'Salvar Nova Senha'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Edit Photo Submodal */}
        {photoModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0c1f38] border border-[#d4af37]/60 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-white text-sm font-serif flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#d4af37]" />
                  <span>Escolher Foto de Perfil do Atleta</span>
                </h5>
                <button 
                  onClick={() => setPhotoModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-4 py-2">
                <img 
                  src={selectedPhotoUrl || AVATAR_PRESETS[0].url} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#d4af37] shadow"
                  referrerPolicy="no-referrer"
                />

                <div className="w-full space-y-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-[#d4af37] text-white hover:text-[#060e1c] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/10"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Carregar Foto do Celular / Computador</span>
                  </button>
                  <input
                    type="file"
                    ref={photoInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="w-full space-y-1.5">
                  <span className="text-[11px] text-slate-400 block font-medium">Ou selecione um avatar:</span>
                  <div className="flex items-center justify-center gap-2">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPhotoUrl(preset.url)}
                        className={`p-0.5 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedPhotoUrl === preset.url ? 'border-[#d4af37] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-10 h-10 rounded-lg object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-medium text-xs hover:bg-white/20 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={isSavingPhoto}
                  className="px-4 py-1.5 rounded-lg bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#b8952b] cursor-pointer"
                >
                  {isSavingPhoto ? 'Salvando...' : 'Confirmar Foto'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
