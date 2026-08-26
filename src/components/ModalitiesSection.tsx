import React, { useState } from 'react';
import { 
  Trophy, 
  Waves, 
  CheckCircle2, 
  CalendarCheck,
  Info,
  Sparkles,
  Camera,
  Upload,
  RotateCcw,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { MODALITIES_DATA } from '../data/mockData';

interface ModalitiesSectionProps {
  onOpenEnrollModal: () => void;
}

export const ModalitiesSection: React.FC<ModalitiesSectionProps> = ({ onOpenEnrollModal }) => {
  const defaultFallbackIniciacao = '/IMG_2382.jpeg';
  const defaultFallbackAltoRendimento = '/IMG_5625.jpeg';

  const candidatePaths: Record<string, string[]> = {
    'natacao-iniciacao': [
      '/IMG_2382.jpeg',
      '/IMG_2382.jpg',
      '/iniciacao_esportiva.jpeg',
      '/iniciacao_esportiva.jpg',
      '/0da59e05-4b65-4a97-9061-2262ac3b9b52.jpeg',
      '/olimpiadas_especiais.jpeg',
      '/olimpiadas_especiais.jpg',
      '/iniciacao.jpg',
      '/iniciacao.jpeg',
    ],
    'natacao-alto-rendimento': [
      '/IMG_5625.jpeg',
      '/IMG_5625.jpg',
      '/alto_rendimento.jpeg',
      '/alto_rendimento.jpg',
      '/classicu 2026-03-29 190631741E59229A5C.jpeg',
      '/campeonato_brasileiro.jpeg',
      '/campeonato_brasileiro.jpg',
      '/IMG_0795.jpg',
    ],
  };

  const [images, setImages] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    MODALITIES_DATA.forEach((m) => {
      try {
        const saved = localStorage.getItem(`acedep_modality_${m.id}`);
        if (saved) {
          initial[m.id] = saved;
        } else {
          initial[m.id] = m.image;
        }
      } catch {
        initial[m.id] = m.image;
      }
    });
    return initial;
  });

  const [draggingCard, setDraggingCard] = useState<string | null>(null);
  const [successCard, setSuccessCard] = useState<string | null>(null);
  const [urlCard, setUrlCard] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');

  const processAndSetImage = (modalityId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedUrl = canvas.toDataURL('image/jpeg', 0.88);
          setImages((prev) => ({ ...prev, [modalityId]: optimizedUrl }));
          try {
            localStorage.setItem(`acedep_modality_${modalityId}`, optimizedUrl);
          } catch {}
        } else {
          setImages((prev) => ({ ...prev, [modalityId]: rawDataUrl }));
        }
        setSuccessCard(modalityId);
        setTimeout(() => setSuccessCard(null), 3000);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (modalityId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetImage(modalityId, file);
    }
  };

  const handleDrop = (modalityId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingCard(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processAndSetImage(modalityId, file);
    }
  };

  const handleReset = (modalityId: string) => {
    const original = MODALITIES_DATA.find((m) => m.id === modalityId)?.image || defaultFallbackAltoRendimento;
    setImages((prev) => ({ ...prev, [modalityId]: original }));
    try {
      localStorage.removeItem(`acedep_modality_${modalityId}`);
    } catch {}
  };

  const handleApplyUrl = (modalityId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setImages((prev) => ({ ...prev, [modalityId]: inputUrl.trim() }));
      try {
        localStorage.setItem(`acedep_modality_${modalityId}`, inputUrl.trim());
      } catch {}
      setUrlCard(null);
      setInputUrl('');
    }
  };

  return (
    <section id="modalidades" className="py-20 bg-[#0a192f] text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
            <span className="h-[2px] w-6 bg-[#d4af37]" />
            Nossos Programas de Treino
            <span className="h-[2px] w-6 bg-[#d4af37]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Natação para Deficientes Intelectuais
          </h2>
          <p className="mt-4 text-base text-slate-300 font-light leading-relaxed">
            Atendemos exclusivamente pessoas com <strong className="text-white font-semibold">Deficiência Intelectual</strong> (Autismo, DI e Síndrome de Down), com idade a partir de <strong className="text-[#f3e5ab] font-semibold">12 anos</strong> e que já possuam <strong className="text-white font-semibold">experiência prévia básica na natação</strong>.
          </p>
        </div>

        {/* Clean Criteria & Categories Badge Banner */}
        <div className="mb-10 max-w-4xl mx-auto p-4 rounded-xl bg-[#0f2744]/70 border border-[#d4af37]/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-lg bg-[#d4af37]/20 text-[#d4af37] shrink-0 border border-[#d4af37]/30">
              <Info className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-slate-200">
              <strong className="text-white font-semibold block">Requisitos de Entrada:</strong>
              Mínimo de 12 anos e experiência prévia básica (saber flutuar e se locomover na água).
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-[#f3e5ab] bg-[#060e1c] px-3 py-1.5 rounded-md border border-[#d4af37]/30">
              Iniciação Esportiva
            </span>
            <span className="text-[11px] font-bold text-white bg-[#060e1c] px-3 py-1.5 rounded-md border border-[#d4af37]/30">
              Alto Rendimento (S14 e S21)
            </span>
          </div>
        </div>

        {/* 2 Modality Cards (Iniciação Esportiva & Alto Rendimento) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {MODALITIES_DATA.map((modality) => {
            const currentImg = images[modality.id] || modality.image;
            const isDraggingThis = draggingCard === modality.id;
            const isSuccess = successCard === modality.id;
            const isUrlOpen = urlCard === modality.id;

            return (
              <div
                key={modality.id}
                className="flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#0f2744] to-[#060e1c] border border-[#1e3a5f] overflow-hidden shadow-xl hover:border-[#d4af37]/60 transition-all duration-300 group"
              >
                <div>
                  {/* Modality Image banner */}
                  <div 
                    className={`relative h-64 overflow-hidden ${
                      isDraggingThis ? 'ring-4 ring-[#d4af37]' : ''
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDraggingCard(modality.id);
                    }}
                    onDragLeave={() => setDraggingCard(null)}
                    onDrop={(e) => handleDrop(modality.id, e)}
                  >
                    <img
                      src={currentImg}
                      alt={modality.title}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        modality.id === 'natacao-alto-rendimento' ? 'object-[center_20%]' : 'object-center'
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const candidates = candidatePaths[modality.id] || [];
                        const currentSrc = target.getAttribute('src') || '';
                        
                        // Find current index in candidates
                        const currentIndex = candidates.findIndex((c) => currentSrc.endsWith(c));
                        if (currentIndex !== -1 && currentIndex + 1 < candidates.length) {
                          target.src = candidates[currentIndex + 1];
                          return;
                        }

                        // Fallback in case none of the local candidates were found
                        if (modality.id === 'natacao-alto-rendimento') {
                          target.src = defaultFallbackAltoRendimento;
                        } else if (modality.id === 'natacao-iniciacao') {
                          target.src = defaultFallbackIniciacao;
                        }
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f2744] via-black/30 to-transparent pointer-events-none" />
                    
                    {/* Drag overlay */}
                    {isDraggingThis && (
                      <div className="absolute inset-0 bg-[#060e1c]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-30 border-2 border-dashed border-[#d4af37]">
                        <Upload className="w-10 h-10 text-[#d4af37] animate-bounce mb-2" />
                        <p className="text-xs font-bold text-white">Solte a imagem aqui para atualizar</p>
                      </div>
                    )}

                    {/* Category Pill */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded bg-[#060e1c]/85 border border-[#d4af37]/50 backdrop-blur-md z-10 pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">
                        {modality.category}
                      </span>
                    </div>

                    {/* Change photo controls */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(modality.id, e)}
                        accept="image/*"
                        className="sr-only"
                        id={`upload-modal-${modality.id}`}
                      />
                      <label
                        htmlFor={`upload-modal-${modality.id}`}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#060e1c]/85 hover:bg-[#d4af37] text-slate-100 hover:text-[#060e1c] border border-white/20 hover:border-[#d4af37] backdrop-blur-md text-[11px] font-semibold transition-all shadow cursor-pointer select-none active:scale-95"
                        title="Alterar foto da modalidade"
                      >
                        {isSuccess ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Atualizado!</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-3 h-3" />
                            <span>Foto</span>
                          </>
                        )}
                      </label>

                      <button
                        onClick={() => setUrlCard(isUrlOpen ? null : modality.id)}
                        className="p-1 rounded-md bg-[#060e1c]/85 hover:bg-white/20 text-slate-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
                        title="Inserir link da foto"
                      >
                        <LinkIcon className="w-3 h-3" />
                      </button>

                      {currentImg !== modality.image && (
                        <button
                          onClick={() => handleReset(modality.id)}
                          className="p-1 rounded-md bg-[#060e1c]/85 hover:bg-red-500/80 text-slate-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
                          title="Restaurar foto padrão"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* URL Input Popover */}
                    {isUrlOpen && (
                      <form
                        onSubmit={(e) => handleApplyUrl(modality.id, e)}
                        className="absolute top-12 right-3 left-3 z-30 p-2 rounded-lg bg-[#060e1c]/95 border border-[#d4af37] shadow-xl flex gap-1.5"
                      >
                        <input
                          type="url"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          placeholder="Link da imagem..."
                          className="flex-1 px-2.5 py-1 text-xs rounded bg-black/50 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-[#d4af37]"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded bg-[#d4af37] text-[#060e1c] text-xs font-bold hover:bg-[#b8952b] transition-colors cursor-pointer"
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={() => setUrlCard(null)}
                          className="px-2 py-1 rounded bg-white/10 text-slate-300 text-xs hover:bg-white/20 transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </form>
                    )}

                    <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none">
                      <div className="flex items-center gap-2 text-white font-bold text-lg drop-shadow">
                        <Waves className="w-5 h-5 text-[#d4af37]" />
                        <span>{modality.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {modality.description}
                    </p>

                    {/* Target Audience tag */}
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-300">
                      <strong className="text-white block mb-0.5 font-semibold">Público-Alvo:</strong>
                      {modality.targetAudience}
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider block">
                        Diferenciais do Treinamento:
                      </span>
                      {modality.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="p-6 pt-0">
                  <button
                    onClick={onOpenEnrollModal}
                    className="w-full py-3 px-4 rounded-lg bg-white/5 hover:bg-[#d4af37] text-slate-200 hover:text-[#060e1c] font-bold text-xs uppercase tracking-wider transition-all duration-200 border border-white/10 hover:border-[#d4af37] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Agendar Avaliação Aquática</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Note about Pool Usage and Schedule */}
        <div className="mt-12 max-w-3xl mx-auto p-4 rounded-xl bg-[#060e1c]/80 border border-[#1e3a5f] text-center text-xs text-slate-300 space-y-1">
          <p>
            <strong className="text-white">Local & Horários de Treino:</strong> Todas as aulas ocorrem no Centro Paralímpico Brasileiro.
          </p>
          <p className="text-[#f3e5ab] font-medium">
            Segunda, quarta e sexta: 18:00 às 19:30 • Terça e quinta: 15:00 às 16:30
          </p>
        </div>

      </div>
    </section>
  );
};

