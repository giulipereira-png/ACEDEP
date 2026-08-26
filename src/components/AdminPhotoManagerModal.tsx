import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Upload, 
  Check, 
  AlertCircle, 
  Database, 
  Sparkles, 
  Image as ImageIcon, 
  RotateCcw, 
  X, 
  KeyRound, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { usePhotos, DEFAULT_PHOTOS } from '../context/PhotosContext';

export const AdminPhotoManagerModal: React.FC = () => {
  const {
    adminModalOpen,
    closeAdminModal,
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    photos,
    savePhotoToDatabase,
    resetPhotoToDefault,
    isFirebaseConnected
  } = usePhotos();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('about_team');
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});
  const [successState, setSuccessState] = useState<Record<string, string>>({});
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [previewOverride, setPreviewOverride] = useState<Record<string, string>>({});

  if (!adminModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(false);
    const success = await loginAdmin(pinInput);
    if (!success) {
      setPinError(true);
    } else {
      setPinInput('');
    }
  };

  const handleFileChange = (photoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleDrop = (photoId: string, e: React.DragEvent) => {
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

  const handleSaveToFirestore = async (photoId: string) => {
    const imageToSave = previewOverride[photoId] || customUrlInput.trim();
    if (!imageToSave) return;

    setUploadingState((prev) => ({ ...prev, [photoId]: true }));
    const success = await savePhotoToDatabase(photoId, imageToSave, DEFAULT_PHOTOS[photoId]?.title);
    setUploadingState((prev) => ({ ...prev, [photoId]: false }));

    if (success) {
      setSuccessState((prev) => ({ ...prev, [photoId]: 'Salvo com sucesso no Firestore!' }));
      setPreviewOverride((prev) => {
        const copy = { ...prev };
        delete copy[photoId];
        return copy;
      });
      setCustomUrlInput('');
      setTimeout(() => {
        setSuccessState((prev) => ({ ...prev, [photoId]: '' }));
      }, 4000);
    }
  };

  const handleReset = async (photoId: string) => {
    if (window.confirm('Tem certeza que deseja restaurar a foto padrão desta seção?')) {
      setUploadingState((prev) => ({ ...prev, [photoId]: true }));
      await resetPhotoToDefault(photoId);
      setPreviewOverride((prev) => {
        const copy = { ...prev };
        delete copy[photoId];
        return copy;
      });
      setUploadingState((prev) => ({ ...prev, [photoId]: false }));
      setSuccessState((prev) => ({ ...prev, [photoId]: 'Restaurada para o padrão!' }));
      setTimeout(() => {
        setSuccessState((prev) => ({ ...prev, [photoId]: '' }));
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#060e1c] border border-[#1e3a5f] rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f]/80 bg-[#0a192f]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                Painel Administrativo da ACEDEP
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40">
                  Banco Firestore
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gestão restrita de fotos oficiais e conteúdo do site
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
              onClick={closeAdminModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!isAdminAuthenticated ? (
            /* PIN Login Form */
            <div className="max-w-md mx-auto py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4af37]/10 border-2 border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-serif mb-2">
                Acesso Restrito à Coordenação
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Insira a senha de administrador da ACEDEP para gerenciar e salvar as fotos permanentemente no banco de dados.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError(false);
                      }}
                      placeholder="Digite a senha (ex: acedep1990)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-[#1e3a5f] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                      autoFocus
                    />
                  </div>
                  {pinError && (
                    <p className="text-xs text-red-400 mt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Senha incorreta. Tente novamente ou use a senha padrão.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-bold text-sm hover:brightness-110 transition-all shadow-lg cursor-pointer"
                >
                  Entrar no Painel de Fotos
                </button>

                <p className="text-[11px] text-slate-500 pt-2">
                  🔒 Senha padrão inicial: <code className="text-[#f3e5ab] font-mono px-1 py-0.5 rounded bg-white/5">acedep1990</code>
                </p>
              </form>
            </div>
          ) : (
            /* Admin Management Interface */
            <div className="space-y-6">
              
              {/* Firestore Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0a192f] border border-[#1e3a5f]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-slate-200">
                    Banco de Dados Firebase Firestore Conectado
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">Sincronização em tempo real ativa</span>
                </div>
                <div className="text-[11px] text-[#f3e5ab] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Sessão Autenticada como Administrador</span>
                </div>
              </div>

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
                        setCustomUrlInput('');
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
                        Envie uma foto do seu computador/celular. Ao salvar, ela será persistida no <strong>Firebase Firestore</strong> e ficará visível para todos os visitantes do site permanentemente.
                      </p>

                      {/* Dropzone & File Input */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(selectedPhotoId, e)}
                        className="p-6 rounded-xl border-2 border-dashed border-[#1e3a5f] hover:border-[#d4af37] bg-black/40 text-center transition-colors mb-4"
                      >
                        <Upload className="w-8 h-8 mx-auto text-[#d4af37] mb-2" />
                        <p className="text-xs font-semibold text-white mb-1">
                          Arraste e solte a nova foto aqui
                        </p>
                        <p className="text-[11px] text-slate-400 mb-3">
                          ou clique no botão abaixo para escolher do seu dispositivo
                        </p>

                        <input
                          type="file"
                          id={`file-input-${selectedPhotoId}`}
                          accept="image/*"
                          onChange={(e) => handleFileChange(selectedPhotoId, e)}
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
                          value={customUrlInput}
                          onChange={(e) => {
                            setCustomUrlInput(e.target.value);
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
                    {successState[selectedPhotoId] && (
                      <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{successState[selectedPhotoId]}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1e3a5f]">
                      <button
                        onClick={() => handleReset(selectedPhotoId)}
                        disabled={uploadingState[selectedPhotoId]}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar Padrão</span>
                      </button>

                      <button
                        onClick={() => handleSaveToFirestore(selectedPhotoId)}
                        disabled={
                          uploadingState[selectedPhotoId] ||
                          (!previewOverride[selectedPhotoId] && !customUrlInput.trim())
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
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#030712] border-t border-[#1e3a5f] text-center text-[11px] text-slate-500">
          Associação Cultural Especial Paradesportiva Paulista • Sistema de Banco de Dados Oficial Firebase Firestore
        </div>
      </div>
    </div>
  );
};
