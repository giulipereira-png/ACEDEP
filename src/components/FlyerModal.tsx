import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Palette, 
  FileText, 
  Scissors, 
  Building2, 
  Maximize2, 
  Download,
  Share2,
  Check,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { FlyerPrintSheet, FlyerModel, FlyerTheme } from './FlyerPrintSheet';

interface FlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullPage?: () => void;
}

export const FlyerModal: React.FC<FlyerModalProps> = ({
  isOpen,
  onClose,
  onOpenFullPage,
}) => {
  const [model, setModel] = useState<FlyerModel>('institutional');
  const [theme, setTheme] = useState<FlyerTheme>('navy');
  const [customMessage, setCustomMessage] = useState('🏊 Vagas abertas para novas avaliações nas piscinas do CPB!');
  const [contactPhone, setContactPhone] = useState('(11) 99880-9708');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.origin + window.location.pathname + '#folheto';
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0a192f] border border-[#1e3a5f] rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="no-print p-4 sm:p-5 border-b border-[#1e3a5f] bg-[#060e1c] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d4af37]/20 text-[#d4af37]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Folheto de Divulgação da ACEDEP (Impressão A4)
              </h2>
              <p className="text-xs text-slate-400">
                Imprima em folha A4 ou salve em PDF para compartilhar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullPage && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullPage();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold cursor-pointer"
                title="Abrir em página cheia"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Página Completa</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] text-xs font-black hover:brightness-110 shadow-lg cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Controls Bar */}
        <div className="no-print px-4 py-3 bg-[#0a192f] border-b border-[#1e3a5f] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Format Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setModel('institutional')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                model === 'institutional'
                  ? 'bg-[#d4af37] text-[#060e1c] shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Cartaz A4 (Completo)
            </button>
            <button
              onClick={() => setModel('half_page')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                model === 'half_page'
                  ? 'bg-[#d4af37] text-[#060e1c] shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Panfleto (2 Vias na Folha)
            </button>
            <button
              onClick={() => setModel('sponsor')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                model === 'sponsor'
                  ? 'bg-[#d4af37] text-[#060e1c] shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Proposta Patrocínio
            </button>
          </div>

          {/* Color Mode Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setTheme('navy')}
              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer ${
                theme === 'navy'
                  ? 'bg-[#1e3a5f] text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Design Idêntico ao Site (Azul Marinho & Ouro)"
            >
              <Moon className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Azul Oficial</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer ${
                theme === 'light'
                  ? 'bg-amber-400/20 text-[#f3e5ab] font-bold border border-amber-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fundo Branco para Economizar Tinta na Impressora"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Econômico (Branco)</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-black/40 flex justify-center">
          <div className="w-full max-w-[210mm]">
            <FlyerPrintSheet
              model={model}
              theme={theme}
              customMessage={customMessage}
              contactPhone={contactPhone}
            />
          </div>
        </div>

        {/* Modal Footer Quick Actions */}
        <div className="no-print p-3 sm:p-4 bg-[#060e1c] border-t border-[#1e3a5f] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-[11px]">
            💡 Para o melhor resultado ao imprimir, marque <strong>"Gráficos de segundo plano"</strong> nas opções da impressora.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10 cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#d4af37]" />}
              <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-[#d4af37] text-[#060e1c] text-xs font-black hover:bg-[#e5c058] shadow-md cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Agora (A4)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
