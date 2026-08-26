import React, { useState, useRef } from 'react';
import { 
  Target, 
  Eye, 
  Heart, 
  Award, 
  CheckCircle2, 
  Waves,
  Upload,
  Camera,
  RotateCcw,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { Logo } from './Logo';

export const AboutSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'missao' | 'visao' | 'valores'>('missao');
  
  const fallbackPhoto = '/IMG_4378.jpeg';
  
  const [imageSrc, setImageSrc] = useState<string>(() => {
    try {
      return localStorage.getItem('acedep_about_photo') || fallbackPhoto;
    } catch {
      return fallbackPhoto;
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const processAndSetImage = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        setIsUploading(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Optimize size to max 1400px for instant rendering and safe storage
        const maxDim = 1400;
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
          setImageSrc(optimizedUrl);
          try {
            localStorage.setItem('acedep_about_photo', optimizedUrl);
          } catch (err) {
            console.warn('Storage quota', err);
          }
        } else {
          setImageSrc(rawDataUrl);
        }
        setIsUploading(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      };
      img.onerror = () => {
        setIsUploading(false);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processAndSetImage(file);
    }
  };

  const handleResetImage = () => {
    setImageSrc(fallbackPhoto);
    try {
      localStorage.removeItem('acedep_about_photo');
    } catch {}
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setImageSrc(customUrl.trim());
      try {
        localStorage.setItem('acedep_about_photo', customUrl.trim());
      } catch {}
      setShowUrlInput(false);
      setCustomUrl('');
    }
  };

  const pillars = {
    missao: {
      title: 'Nossa Missão',
      icon: <Target className="w-5 h-5 text-[#d4af37]" />,
      text: 'Promover a inclusão dando visibilidade às pessoas com deficiência através do paradesporto, articulando ações sociais e culturais pela qualidade de vida.',
      points: [
        'Inclusão e acolhimento através do esporte',
        'Visibilidade e destaque para nossos atletas',
        'Ações sociais e culturais para melhorar a qualidade de vida',
      ],
    },
    visao: {
      title: 'Nossa Visão',
      icon: <Eye className="w-5 h-5 text-[#d4af37]" />,
      text: 'Ser uma associação de referência, e estar presente em competições Nacionais e Internacionais para pessoas com Deficiência.',
      points: [
        'Referência na natação para pessoas com deficiência',
        'Presença em competições em todo o Brasil e no exterior',
        'Treinos de qualidade e desenvolvimento de cada atleta',
      ],
    },
    valores: {
      title: 'Nossos Valores',
      icon: <Heart className="w-5 h-5 text-[#d4af37]" />,
      text: 'Visibilidade, transparência, respeito e defesa do direito das pessoas com deficiência.',
      points: [
        'Dar visibilidade ao talento e esforço de cada atleta',
        'Transparência e honestidade em tudo o que fazemos',
        'Respeito e carinho por cada atleta e sua família',
        'Defesa firme dos direitos das pessoas com deficiência',
      ],
    },
  };

  return (
    <section id="sobre" className="py-20 bg-[#0a192f] text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Tag */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
            <span className="h-[2px] w-6 bg-[#d4af37]" />
            Quem Somos
            <span className="h-[2px] w-6 bg-[#d4af37]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Transformando Vidas Através da Natação Adaptada
          </h2>
          <p className="mt-4 text-base text-slate-300 font-light leading-relaxed">
            Uma instituição sem fins lucrativos que acolhe, desenvolve a autonomia e potencializa o talento de nadadores com deficiência intelectual dentro e fora das piscinas.
          </p>
        </div>

        {/* 2-Column High-Impact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Storytelling */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-[#1e3a5f] shadow-2xl bg-[#060e1c]">
              
              {/* Main Photo container */}
              <div 
                className={`relative h-[380px] sm:h-[440px] overflow-hidden group transition-all duration-300 ${
                  isDragging ? 'ring-4 ring-[#d4af37] ring-offset-4 ring-offset-[#060e1c]' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <img
                  src={imageSrc}
                  alt="Equipe ACEDEP de Natação Paradesportiva"
                  className="w-full h-full object-cover object-top sm:object-center group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const candidates = [
                      '/IMG_4378.jpeg',
                      '/IMG_4378.jpg',
                      '/equipe_acedep.jpeg',
                      '/equipe_acedep.jpg',
                      'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85',
                    ];
                    const currentSrc = target.getAttribute('src') || '';
                    const currentIndex = candidates.findIndex((c) => currentSrc.endsWith(c));
                    if (currentIndex !== -1 && currentIndex + 1 < candidates.length) {
                      target.src = candidates[currentIndex + 1];
                    } else if (!currentSrc.includes('unsplash.com')) {
                      target.src = 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85';
                    }
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Dragging Overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-[#060e1c]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 border-2 border-dashed border-[#d4af37]">
                    <Upload className="w-12 h-12 text-[#d4af37] animate-bounce mb-3" />
                    <p className="text-sm font-bold text-white">Solte a foto IMG_0609 aqui</p>
                    <p className="text-xs text-slate-300 mt-1">A imagem será aplicada imediatamente</p>
                  </div>
                )}

                {/* Uploading Status Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-[#060e1c]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
                    <div className="w-8 h-8 border-3 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs font-semibold text-white">Processando imagem...</p>
                  </div>
                )}

                {/* Floating Historic Badge */}
                <div className="absolute top-4 left-4 px-3.5 py-2 rounded-lg bg-[#060e1c]/90 border border-[#d4af37]/50 backdrop-blur-md flex items-center gap-2.5 shadow-lg pointer-events-none z-10">
                  <Logo variant="emblem" className="h-8" />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Desde 1990</div>
                    <div className="text-xs font-bold text-white">Natação Paradesportiva</div>
                  </div>
                </div>

                {/* Top Right Action Controls */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="sr-only"
                    id="upload-about-photo"
                  />
                  <label
                    htmlFor="upload-about-photo"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#060e1c]/85 hover:bg-[#d4af37] text-slate-100 hover:text-[#060e1c] border border-white/20 hover:border-[#d4af37] backdrop-blur-md text-xs font-semibold transition-all duration-200 shadow-lg cursor-pointer select-none active:scale-95"
                    title="Escolher imagem do seu dispositivo"
                  >
                    {uploadSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Foto Atualizada!</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Alterar Foto</span>
                      </>
                    )}
                  </label>

                  <button
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="p-1.5 rounded-lg bg-[#060e1c]/85 hover:bg-white/20 text-slate-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
                    title="Inserir link da imagem"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>

                  {imageSrc !== fallbackPhoto && (
                    <button
                      onClick={handleResetImage}
                      className="p-1.5 rounded-lg bg-[#060e1c]/85 hover:bg-red-500/80 text-slate-300 hover:text-white border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
                      title="Restaurar foto padrão"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Optional URL Input Popover */}
                {showUrlInput && (
                  <form 
                    onSubmit={handleApplyUrl}
                    className="absolute top-16 right-4 left-4 z-30 p-3 rounded-xl bg-[#060e1c]/95 border border-[#d4af37] backdrop-blur-md shadow-2xl flex gap-2 animate-fadeIn"
                  >
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="Cole o link da imagem (ex: https://...)"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-black/50 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-[#d4af37]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-[#060e1c] text-xs font-bold hover:bg-[#b8952b] transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(false)}
                      className="px-2 py-1.5 rounded-lg bg-white/10 text-slate-300 text-xs hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </form>
                )}

                {/* Bottom Watermark Caption */}
                <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/75 border border-white/10 backdrop-blur-[3px] transition-all duration-300 z-10">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#f3e5ab]">
                    <Award className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                    <span>Equipe ACEDEP • Garra, foco e determinação nas piscinas.</span>
                  </div>
                  <p className="text-[10px] text-slate-200/80 leading-tight mt-0.5 font-light">
                    Nossa equipe de cerca de 35 atletas com deficiência intelectual participa ativamente de Campeonatos Regionais, Nacionais e Internacionais.
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Metrics Bar below image */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-[#0f2744]/60 border border-white/5 text-center">
                <div className="text-xl font-extrabold text-[#d4af37] font-serif">1990</div>
                <div className="text-[11px] text-slate-300 font-medium">Ano de Fundação</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0f2744]/60 border border-white/5 text-center">
                <div className="text-xl font-extrabold text-white font-serif">~35</div>
                <div className="text-[11px] text-slate-300 font-medium">Atletas na Equipe</div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0f2744]/60 border border-white/5 text-center">
                <div className="text-xl font-extrabold text-[#d4af37] font-serif">12+</div>
                <div className="text-[11px] text-slate-300 font-medium">Idade Mínima (anos)</div>
              </div>
            </div>
          </div>

          {/* Right Column: Institutional Identity & Tabs */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Nossa História
              </h3>
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                Somos uma organização sem fins lucrativos, que promove a saúde das pessoas com Deficiência Intelectual, apoiando sua inclusão social através do esporte.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                A ACEDEP nasceu em 1990, quando um grupo de pais viu na natação uma grande oportunidade de cuidar da saúde, fazer novos amigos e incluir seus filhos na sociedade.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Nosso objetivo é acolher, treinar e desenvolver atletas de natação, preparando a equipe para participar com alegria e dedicação de competições regionais, estaduais, nacionais e internacionais.
              </p>
            </div>

            {/* Interactive Pillar Switcher */}
            <div className="pt-2">
              <div className="flex border-b border-white/10 gap-2 mb-4">
                {(['missao', 'visao', 'valores'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`pb-3 px-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-2 flex items-center gap-2 cursor-pointer ${
                      activeTab === key
                        ? 'border-[#d4af37] text-[#d4af37] bg-white/5 rounded-t-md'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pillars[key].icon}
                    <span>{pillars[key].title}</span>
                  </button>
                ))}
              </div>

              {/* Pillar Content Card */}
              <div className="p-6 rounded-xl bg-[#0f2744]/70 border border-white/10 shadow-lg min-h-[210px] flex flex-col justify-between">
                <div>
                  <p className="text-sm text-slate-200 leading-relaxed font-normal mb-4">
                    {pillars[activeTab].text}
                  </p>
                  <ul className="space-y-2">
                    {pillars[activeTab].points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
