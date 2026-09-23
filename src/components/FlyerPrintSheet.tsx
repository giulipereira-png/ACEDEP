import React from 'react';
import { 
  Trophy, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Globe, 
  ShieldCheck, 
  Award, 
  Clock, 
  Users, 
  CheckCircle2, 
  Heart, 
  Waves,
  Sparkles,
  Scissors
} from 'lucide-react';
import { QrCodeSvg } from './QrCodeSvg';
import { usePhotos } from '../context/PhotosContext';

export type FlyerModel = 'institutional' | 'half_page' | 'sponsor';
export type FlyerTheme = 'navy' | 'light';

interface FlyerPrintSheetProps {
  model: FlyerModel;
  theme: FlyerTheme;
  customMessage?: string;
  contactPhone?: string;
}

export const FlyerPrintSheet: React.FC<FlyerPrintSheetProps> = ({
  model,
  theme,
  customMessage = '',
  contactPhone = '(11) 99880-9708',
}) => {
  const { photos } = usePhotos();
  const teamPhotoUrl = photos?.about_team || '/IMG_4378.jpeg';

  const isNavy = theme === 'navy';

  // Shared color tokens based on theme
  const bgClasses = isNavy 
    ? 'bg-[#060e1c] text-white border-[#1e3a5f]' 
    : 'bg-white text-slate-900 border-slate-300';
  
  const cardBgClasses = isNavy
    ? 'bg-[#0a192f]/90 border-[#1e3a5f]/80'
    : 'bg-slate-50 border-slate-200';

  const headerBgClasses = isNavy
    ? 'bg-gradient-to-r from-[#0a192f] via-[#0f284a] to-[#0a192f] border-[#d4af37]/40'
    : 'bg-gradient-to-r from-slate-900 via-[#0a192f] to-[#0f284a] border-[#d4af37] text-white';

  const goldText = '#d4af37';
  const subtitleColor = isNavy ? 'text-slate-300' : 'text-slate-600';
  const badgeClasses = isNavy 
    ? 'bg-[#d4af37]/15 text-[#f3e5ab] border-[#d4af37]/40' 
    : 'bg-amber-100 text-amber-900 border-amber-300';

  // Sub-component for a single A5 flyer (used twice in half_page mode)
  const HalfPageFlyer = ({ copyNumber }: { copyNumber: number }) => (
    <div 
      className={`p-5 flex flex-col justify-between h-[138mm] box-border relative ${
        isNavy ? 'bg-[#060e1c] text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* Top Banner */}
      <div>
        <div className="flex items-center justify-between gap-3 border-b pb-2.5 mb-2.5 border-[#d4af37]/40">
          <div className="flex items-center gap-2.5">
            <img 
              src="/IMG_3289.png" 
              alt="ACEDEP Natação" 
              className="h-10 w-auto object-contain shrink-0" 
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] block leading-tight">
                Desde 1990 • Tradição Paradesportiva
              </span>
              <h1 className="text-sm font-extrabold tracking-tight leading-tight">
                ACEDEP Natação Paralímpica
              </h1>
              <p className="text-[9px] text-slate-400">
                Pessoas com Deficiência Intelectual (Autismo, DI e Síndrome de Down)
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-[#d4af37]/50 text-[#d4af37] bg-[#d4af37]/10 block">
              Polo CPB
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center my-2">
          <h2 className="text-xs font-black uppercase tracking-wide text-[#d4af37]">
            Vagas Abertas para Novas Avaliações
          </h2>
          <p className="text-[10px] font-medium leading-snug mt-0.5">
            Treinos no Centro Paralímpico Brasileiro com Equipe Especializada!
          </p>
        </div>

        {/* 2 Modalities side by side */}
        <div className="grid grid-cols-2 gap-2 my-2 text-[9px]">
          <div className={`p-2 rounded-lg border ${cardBgClasses}`}>
            <div className="flex items-center gap-1 font-bold text-[#d4af37] mb-1">
              <Waves className="w-3 h-3" />
              <span>Iniciação Esportiva</span>
            </div>
            <p className={subtitleColor}>
              A partir de 12 anos com noção aquática básica. Aperfeiçoamento dos 4 estilos e autonomia.
            </p>
          </div>
          <div className={`p-2 rounded-lg border ${cardBgClasses}`}>
            <div className="flex items-center gap-1 font-bold text-[#d4af37] mb-1">
              <Trophy className="w-3 h-3" />
              <span>Alto Rendimento</span>
            </div>
            <p className={subtitleColor}>
              Classes S14 e S21. Treinamento de alta intensidade e participação em campeonatos oficiais.
            </p>
          </div>
        </div>

        {/* Location & Highlights */}
        <div className={`p-2 rounded-lg border flex items-center justify-between text-[9px] mb-2 ${cardBgClasses}`}>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <div>
              <span className="font-bold block">Centro Paralímpico Brasileiro</span>
              <span className="text-slate-400">Rod. dos Imigrantes, km 11,5 - São Paulo</span>
            </div>
          </div>
          <div className="text-right pl-2 border-l border-slate-700/40">
            <span className="font-bold text-[#d4af37] block">Turmas Tarde & Noite</span>
            <span className="text-slate-400">Piscinas Aquecidas</span>
          </div>
        </div>
      </div>

      {/* Bottom Contact & QR Code */}
      <div className="pt-2 border-t border-[#d4af37]/30 flex items-center justify-between gap-3">
        <div className="space-y-1 text-[9px]">
          <div className="font-bold text-[#d4af37] text-[10px]">
            Agende uma avaliação sem compromisso:
          </div>
          <div className="flex items-center gap-1 font-bold">
            <Phone className="w-3 h-3 text-[#d4af37]" />
            <span>WhatsApp: {contactPhone}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Instagram className="w-3 h-3 text-[#d4af37]" />
            <span>Instagram: @acedepnatacao</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Globe className="w-3 h-3 text-[#d4af37]" />
            <span>acedepnatacao.vercel.app</span>
          </div>
        </div>

        <div className="text-center shrink-0">
          <QrCodeSvg 
            size={68} 
            darkColor={isNavy ? '#060e1c' : '#060e1c'} 
            lightColor="#ffffff" 
            withCenterLogo={false} 
          />
          <span className="text-[7px] text-slate-400 block mt-0.5 font-bold">
            Aponte a Câmera
          </span>
        </div>
      </div>
    </div>
  );

  // Render Half Page Mode (2 leaflets per A4 page with cutting guide)
  if (model === 'half_page') {
    return (
      <div 
        id="acedep-printable-flyer"
        className={`print-sheet w-full max-w-[210mm] mx-auto border shadow-2xl rounded-sm overflow-hidden ${bgClasses}`}
        style={{ minHeight: '295mm' }}
      >
        <HalfPageFlyer copyNumber={1} />

        {/* Perforation / Scissor Cut Divider */}
        <div className="relative py-1.5 flex items-center justify-center bg-slate-800 text-slate-300 border-y border-dashed border-slate-500 text-[10px] font-mono tracking-widest uppercase">
          <Scissors className="w-3.5 h-3.5 mr-2 text-[#d4af37]" />
          <span>Linha de Corte — Destaque e Obtenha 2 Panfletos em 1 Folha A4</span>
          <Scissors className="w-3.5 h-3.5 ml-2 text-[#d4af37]" />
        </div>

        <HalfPageFlyer copyNumber={2} />
      </div>
    );
  }

  // Render Sponsor / Partnership Flyer Mode
  if (model === 'sponsor') {
    return (
      <div 
        id="acedep-printable-flyer"
        className={`print-sheet w-full max-w-[210mm] mx-auto border shadow-2xl rounded-sm overflow-hidden p-8 flex flex-col justify-between ${bgClasses}`}
        style={{ minHeight: '295mm' }}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-[#d4af37] pb-4 mb-5">
            <div className="flex items-center gap-4">
              <img 
                src="/IMG_3289.png" 
                alt="ACEDEP Natação" 
                className="h-16 w-auto object-contain"
              />
              <div>
                <span className="text-xs uppercase tracking-widest text-[#d4af37] font-bold block">
                  Proposta de Apoio & Parceria Paradesportiva
                </span>
                <h1 className="text-xl font-black tracking-tight leading-tight">
                  ACEDEP - Associação Cultural Especial Paradesportiva Paulista
                </h1>
                <p className="text-xs text-slate-400">
                  Entidade Sem Fins Lucrativos Fundada em 1990 • Mais de 35 Anos de Inclusão e Cidadania
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold px-3 py-1 rounded bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] block">
                Polo CPB
              </span>
            </div>
          </div>

          {/* Slogan */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-black text-[#d4af37] uppercase tracking-wide">
              Invista no Sonho de Campeões da Natação Paralímpica
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mx-auto mt-1">
              Conecte a marca da sua empresa ao esporte de alto impacto social, transformação de vidas e superação de limites nas piscinas do Centro Paralímpico Brasileiro.
            </p>
          </div>

          {/* Numbers / Impact */}
          <div className="grid grid-cols-4 gap-3 mb-6 text-center">
            <div className={`p-3 rounded-xl border ${cardBgClasses}`}>
              <span className="text-2xl font-black text-[#d4af37] block">35+</span>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Anos de História</span>
              <span className="text-[9px] text-slate-400">Pioneirismo em SP</span>
            </div>
            <div className={`p-3 rounded-xl border ${cardBgClasses}`}>
              <span className="text-2xl font-black text-[#d4af37] block">35</span>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Atletas Ativos</span>
              <span className="text-[9px] text-slate-400">Iniciação & Alto Rendimento</span>
            </div>
            <div className={`p-3 rounded-xl border ${cardBgClasses}`}>
              <span className="text-2xl font-black text-[#d4af37] block">100%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Dedicação</span>
              <span className="text-[9px] text-slate-400">Deficiência Intelectual</span>
            </div>
            <div className={`p-3 rounded-xl border ${cardBgClasses}`}>
              <span className="text-2xl font-black text-[#d4af37] block">CPB</span>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Estrutura Top</span>
              <span className="text-[9px] text-slate-400">Piscinas Internacionais</span>
            </div>
          </div>

          {/* Benefits to Sponsor */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#d4af37] mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#d4af37]" />
              <span>Contrapartidas & Vantagens para Sua Empresa</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${cardBgClasses} space-y-1`}>
                <div className="flex items-center gap-2 font-bold text-[#d4af37]">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span>Visibilidade em Uniformes & Banners</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Logo da empresa estampado nos uniformes oficiais de treino e pódios nos Campeonatos Brasileiros e Regionais.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${cardBgClasses} space-y-1`}>
                <div className="flex items-center gap-2 font-bold text-[#d4af37]">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span>ESG & Responsabilidade Social Real</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ações genuínas de Diversidade, Equidade e Inclusão (DEI), com relatórios e fotos para os canais institucionais da sua marca.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${cardBgClasses} space-y-1`}>
                <div className="flex items-center gap-2 font-bold text-[#d4af37]">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span>Presença Digital & Redes Sociais</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Destaque no site oficial, redes sociais, cobertura fotográfica de eventos e agradecimento especial à diretoria.
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${cardBgClasses} space-y-1`}>
                <div className="flex items-center gap-2 font-bold text-[#d4af37]">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span>Apoio a Viagens & Equipamentos</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Viabilização de passagens, hospedagem e trajes de competição para atletas participarem de torneios nacionais.
                </p>
              </div>
            </div>
          </div>

          {/* Photo of Team */}
          <div className="mb-6 relative rounded-xl overflow-hidden border border-[#d4af37]/40 max-h-48">
            <img 
              src={teamPhotoUrl} 
              alt="Atletas e Equipe ACEDEP" 
              className="w-full h-48 object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
              <span className="text-xs text-white font-bold">
                Atletas da ACEDEP em treinamento e preparação nas piscinas do Centro Paralímpico Brasileiro
              </span>
            </div>
          </div>
        </div>

        {/* Footer Sponsor Contact */}
        <div className="border-t-2 border-[#d4af37] pt-4 flex items-center justify-between">
          <div className="space-y-1 text-xs">
            <span className="font-bold text-[#d4af37] block text-sm">
              Coordenação Geral & Relações Institucionais:
            </span>
            <div className="flex items-center gap-2 font-semibold">
              <Phone className="w-4 h-4 text-[#d4af37]" />
              <span>Telefone / WhatsApp: {contactPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4 text-[#d4af37]" />
              <span>E-mail: giuli.pereira@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe className="w-4 h-4 text-[#d4af37]" />
              <span>Website: acedepnatacao.vercel.app</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="text-right">
              <span className="text-xs font-bold text-[#d4af37] block">Acesse a Proposta</span>
              <span className="text-[10px] text-slate-400">Escaneie pelo celular</span>
            </div>
            <QrCodeSvg 
              size={85} 
              darkColor="#060e1c" 
              lightColor="#ffffff" 
              withCenterLogo={true} 
            />
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT: Institutional Full A4 Flyer (Cartaz Oficial Completo de Divulgação da Associação)
  return (
    <div 
      id="acedep-printable-flyer"
      className={`print-sheet w-full max-w-[210mm] mx-auto border shadow-2xl rounded-sm overflow-hidden flex flex-col justify-between ${bgClasses}`}
      style={{ minHeight: '295mm', padding: '10mm 12mm' }}
    >
      {/* 1. Header Nobre */}
      <div>
        <div className={`p-4 rounded-2xl border mb-4 flex items-center justify-between gap-4 ${headerBgClasses}`}>
          <div className="flex items-center gap-3.5">
            <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
              <img 
                src="/IMG_3289.png" 
                alt="ACEDEP Natação" 
                className="h-14 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#d4af37] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                  Fundada em 1990 • Tradição & Inclusão
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight">
                ACEDEP Natação Paralímpica
              </h1>
              <p className="text-[11px] text-slate-300 font-medium">
                Associação Cultural Especial Paradesportiva Paulista
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="bg-[#d4af37]/20 border border-[#d4af37] px-3 py-1 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-[#f3e5ab] block">Polo Oficial</span>
              <span className="text-xs font-black text-white block">Centro Paralímpico (CPB)</span>
            </div>
          </div>
        </div>

        {/* 2. Headline & Chamada Principal */}
        <div className="text-center mb-4">
          <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-1 bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
            Esporte • Saúde • Cidadania • Superação
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase leading-tight">
            Natação que <span className="text-[#d4af37]">Transforma Vidas</span> e Constrói Campeões!
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-medium mt-1 max-w-xl mx-auto">
            Treinamento especializado para pessoas com deficiência intelectual, unindo acolhimento pedagógico, autonomia e alto rendimento.
          </p>
        </div>

        {/* 3. Foto Oficial da Equipe */}
        <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/40 mb-4 shadow-lg group">
          <img 
            src={teamPhotoUrl} 
            alt="Equipe de Atletas ACEDEP" 
            className="w-full h-44 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end justify-between p-3.5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] block">
                Nossa Família • Equipe de Atletas
              </span>
              <p className="text-xs text-white font-bold">
                Mais de 35 nadadores federados e em formação nas piscinas do CPB
              </p>
            </div>
            <div className="bg-[#d4af37] text-[#060e1c] font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow">
              Classes S14 & S21
            </div>
          </div>
        </div>

        {/* 4. A Quem Se Destina (Público-Alvo) */}
        <div className={`p-3.5 rounded-xl border mb-4 ${cardBgClasses}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#d4af37]">
              Público-Alvo e Requisitos de Ingresso
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Atendemos <strong>pessoas a partir de 12 anos com Deficiência Intelectual</strong> (incluindo Transtorno do Espectro Autista / TEA, Síndrome de Down e DI Geral), que já possuam experiência prévia básica no ambiente aquático e buscam aperfeiçoamento motor ou carreira competitiva.
          </p>
        </div>

        {/* 5. As Duas Frentes de Atuação */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Modalidade 1 */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${cardBgClasses}`}>
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-[#d4af37] font-black text-xs uppercase">
                <Waves className="w-4 h-4" />
                <span>1. Iniciação Esportiva</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Foco no aprimoramento técnico dos 4 estilos (Crawl, Costas, Peito e Borboleta), melhora da capacidade cardiorrespiratória, postura e desenvolvimento socioafetivo.
              </p>
            </div>
            <ul className="mt-2 space-y-1 text-[10px] text-slate-300 border-t border-slate-700/40 pt-2">
              <li className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#d4af37] shrink-0" />
                <span>Turmas adaptadas e acolhedoras</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#d4af37] shrink-0" />
                <span>Ponte direta para o alto rendimento</span>
              </li>
            </ul>
          </div>

          {/* Modalidade 2 */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${cardBgClasses}`}>
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-[#d4af37] font-black text-xs uppercase">
                <Trophy className="w-4 h-4" />
                <span>2. Alto Rendimento</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Treinamento intensivo para atletas federados das classes funcionais <strong>S14 e S21</strong>, com foco em obtenção de índices para competições oficiais estaduais e nacionais.
              </p>
            </div>
            <ul className="mt-2 space-y-1 text-[10px] text-slate-300 border-t border-slate-700/40 pt-2">
              <li className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#d4af37] shrink-0" />
                <span>Circuito Caixa & Brasileiros CBDI</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#d4af37] shrink-0" />
                <span>Paralimpíadas Escolares e FAP</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 6. Local & Horários */}
        <div className={`p-3 rounded-xl border mb-4 flex items-center justify-between gap-3 ${cardBgClasses}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#d4af37] block">
                Local dos Treinamentos (Estrutura Internacional)
              </span>
              <h4 className="text-xs font-bold text-white">
                Centro de Treinamento Paralímpico Brasileiro (CPB)
              </h4>
              <p className="text-[10px] text-slate-400">
                Rodovia dos Imigrantes, km 11,5 - Vila Guarani, São Paulo - SP
              </p>
            </div>
          </div>
          <div className="text-right border-l border-slate-700/60 pl-3 shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#d4af37] block flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              Horários dos Treinos
            </span>
            <span className="text-[10px] text-slate-200 block font-semibold">Seg / Qua / Sex: 18h00 às 19h30</span>
            <span className="text-[10px] text-slate-400 block">Ter / Qui: 15h00 às 16h30</span>
          </div>
        </div>

        {/* 7. Como Ingressar - 3 Passos */}
        <div className="mb-4">
          <h3 className="text-center text-[11px] font-black uppercase tracking-widest text-[#d4af37] mb-2">
            Como Fazer Parte da ACEDEP em 3 Passos:
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className={`p-2 rounded-xl border ${cardBgClasses}`}>
              <div className="w-5 h-5 rounded-full bg-[#d4af37] text-[#060e1c] font-black mx-auto mb-1 flex items-center justify-center text-[11px]">
                1
              </div>
              <span className="font-bold block text-white">Contato Inicial</span>
              <span className="text-slate-400">Envie mensagem pelo WhatsApp da coordenação</span>
            </div>
            <div className={`p-2 rounded-xl border ${cardBgClasses}`}>
              <div className="w-5 h-5 rounded-full bg-[#d4af37] text-[#060e1c] font-black mx-auto mb-1 flex items-center justify-center text-[11px]">
                2
              </div>
              <span className="font-bold block text-white">Avaliação na Piscina</span>
              <span className="text-slate-400">Teste pedagógico e aquático com os técnicos</span>
            </div>
            <div className={`p-2 rounded-xl border ${cardBgClasses}`}>
              <div className="w-5 h-5 rounded-full bg-[#d4af37] text-[#060e1c] font-black mx-auto mb-1 flex items-center justify-center text-[11px]">
                3
              </div>
              <span className="font-bold block text-white">Início dos Treinos</span>
              <span className="text-slate-400">Entrega do laudo médico e integração com o time</span>
            </div>
          </div>
        </div>

        {customMessage && (
          <div className="p-2.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 mb-3 text-center text-xs font-semibold text-[#f3e5ab]">
            {customMessage}
          </div>
        )}
      </div>

      {/* 8. Rodapé de Contatos com QR Code Oficial */}
      <div className="pt-3 border-t-2 border-[#d4af37] flex items-center justify-between gap-4 mt-auto">
        <div className="space-y-1.5 text-xs">
          <span className="font-black text-sm text-[#d4af37] block leading-tight">
            Fale com a Coordenação e Garanta Sua Vaga:
          </span>
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
            <span>WhatsApp / Telefone: <strong>{contactPhone}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px]">
            <Mail className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <span>E-mail: giuli.pereira@gmail.com</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-[#d4af37]" />
              <strong>@acedepnatacao</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
              <strong>acedepnatacao.vercel.app</strong>
            </span>
          </div>
        </div>

        {/* QR Codes (Site & WhatsApp) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center">
            <QrCodeSvg 
              type="website" 
              size={85} 
              darkColor="#060e1c" 
              lightColor="#ffffff" 
              withCenterLogo={true} 
            />
            <span className="text-[8px] font-bold text-slate-400 block mt-1 uppercase">
              Acesse o Site
            </span>
          </div>

          <div className="text-center">
            <QrCodeSvg 
              type="whatsapp" 
              size={85} 
              darkColor="#060e1c" 
              lightColor="#ffffff" 
              withCenterLogo={false} 
            />
            <span className="text-[8px] font-bold text-[#d4af37] block mt-1 uppercase">
              Chamar WhatsApp
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
