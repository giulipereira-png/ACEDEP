import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  Palette, 
  FileText, 
  Scissors, 
  Building2, 
  Sparkles, 
  Info, 
  Share2, 
  Check, 
  ShieldCheck, 
  Phone, 
  QrCode,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { FlyerPrintSheet, FlyerModel, FlyerTheme } from '../components/FlyerPrintSheet';

interface FlyerPageProps {
  onBackToHome: () => void;
  onNavigateToPage?: (page: any) => void;
}

export const FlyerPage: React.FC<FlyerPageProps> = ({ onBackToHome }) => {
  const [model, setModel] = useState<FlyerModel>('institutional');
  const [theme, setTheme] = useState<FlyerTheme>('navy');
  const [customMessage, setCustomMessage] = useState('🏊 Vagas abertas para novas avaliações nas piscinas do CPB!');
  const [contactPhone, setContactPhone] = useState('(11) 99880-9708');
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    const url = window.location.origin + window.location.pathname + '#folheto';
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#060e1c] text-slate-100">
      {/* Non-printable Control Header & Toolbar */}
      <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-[#d4af37] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o Início</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Copiar link direto para este folheto"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Compartilhar Folheto</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c058] to-[#c49e29] text-[#060e1c] text-sm font-black shadow-lg shadow-[#d4af37]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar em PDF</span>
            </button>
          </div>
        </div>

        {/* Page Title & Instructions */}
        <div className="bg-[#0a192f]/90 border border-[#1e3a5f] rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold">
                <Printer className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Material Gráfico de Divulgação Oficial</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Folheto para Impressão da ACEDEP
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Desenvolvido com a mesma identidade visual da página para você imprimir em papel A4 ou salvar em PDF e divulgar a associação em escolas, consultórios, clínicas, competições e eventos esportivos.
              </p>
            </div>

            {/* Quick Print Callout */}
            <div className="bg-[#060e1c]/80 border border-[#d4af37]/30 rounded-xl p-4 shrink-0 text-center lg:text-right space-y-2">
              <span className="text-xs text-slate-400 block font-medium">Formato Pronto para Folha A4</span>
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#d4af37] text-[#060e1c] text-sm font-black hover:bg-[#e5c058] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Agora (A4)</span>
              </button>
              <span className="text-[10px] text-slate-400 block">
                Dica: Escolha "Salvar como PDF" no diálogo para enviar pelo WhatsApp
              </span>
            </div>
          </div>

          {/* Interactive Customization Controls */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Escolha de Modelo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>1. Formato do Folheto</span>
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setModel('institutional')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    model === 'institutional'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-sm'
                      : 'bg-black/30 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#d4af37]" />
                    <div>
                      <span className="block font-bold">Cartaz Oficial A4</span>
                      <span className="text-[10px] text-slate-400 font-normal">Página inteira • Ideal para murais e recepção</span>
                    </div>
                  </div>
                  {model === 'institutional' && <Check className="w-4 h-4 text-[#d4af37]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setModel('half_page')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    model === 'half_page'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-sm'
                      : 'bg-black/30 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="w-4 h-4 text-[#d4af37]" />
                    <div>
                      <span className="block font-bold">Panfleto 2 Vias (Meio A4)</span>
                      <span className="text-[10px] text-slate-400 font-normal">2 folhetos por folha • Corte com tesoura</span>
                    </div>
                  </div>
                  {model === 'half_page' && <Check className="w-4 h-4 text-[#d4af37]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setModel('sponsor')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    model === 'sponsor'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-white shadow-sm'
                      : 'bg-black/30 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-[#d4af37]" />
                    <div>
                      <span className="block font-bold">Proposta para Empresas</span>
                      <span className="text-[10px] text-slate-400 font-normal">Captação de patrocinadores e apoiadores</span>
                    </div>
                  </div>
                  {model === 'sponsor' && <Check className="w-4 h-4 text-[#d4af37]" />}
                </button>
              </div>
            </div>

            {/* 2. Escolha do Tema de Cores para Impressão */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>2. Modo de Impressão</span>
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setTheme('navy')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    theme === 'navy'
                      ? 'bg-[#0f284a] border-[#d4af37] text-white shadow-sm'
                      : 'bg-black/30 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Moon className="w-4 h-4 text-[#d4af37]" />
                    <div>
                      <span className="block font-bold">Azul Marinho Oficial (Dark)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Visual idêntico ao site • Ótimo para PDF digital</span>
                    </div>
                  </div>
                  {theme === 'navy' && <Check className="w-4 h-4 text-[#d4af37]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                    theme === 'light'
                      ? 'bg-amber-500/20 border-[#d4af37] text-white shadow-sm'
                      : 'bg-black/30 border-[#1e3a5f] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-[#d4af37]" />
                    <div>
                      <span className="block font-bold">Econômico (Fundo Branco)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Economiza tinta na impressora comum</span>
                    </div>
                  </div>
                  {theme === 'light' && <Check className="w-4 h-4 text-[#d4af37]" />}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-200 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Para imprimir em impressoras de casa ou escritório, o modo <strong>Econômico</strong> poupa tinta e garante contraste perfeito.
                </span>
              </div>
            </div>

            {/* 3. Personalização de Texto & Telefone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#d4af37] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3. Personalizar Informações</span>
              </label>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">WhatsApp de Contato:</span>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(11) 99880-9708"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Frase ou Aviso em Destaque:</span>
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Ex: Vagas abertas para novos alunos..."
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#1e3a5f] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="pt-1">
                  <button
                    onClick={handlePrint}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-black text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Visualizar Impressão (Ctrl + P)</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Section title for Preview */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Pré-visualização em Escala Real A4 (210mm × 297mm):</span>
          </div>
          <button
            onClick={handlePrint}
            className="text-xs text-[#d4af37] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir agora</span>
          </button>
        </div>

      </div>

      {/* Printable Sheet Viewport Container */}
      <div className="max-w-[220mm] mx-auto px-4 print:p-0 print:m-0 print:max-w-none">
        <FlyerPrintSheet
          model={model}
          theme={theme}
          customMessage={customMessage}
          contactPhone={contactPhone}
        />
      </div>

      {/* Floating Print Action Button (Mobile & Desktop helper) */}
      <div className="no-print fixed bottom-6 right-6 z-40">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#d4af37] via-[#e5c058] to-[#c49e29] text-[#060e1c] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/20"
        >
          <Printer className="w-5 h-5" />
          <span className="text-sm">Imprimir Folheto</span>
        </button>
      </div>

    </div>
  );
};
