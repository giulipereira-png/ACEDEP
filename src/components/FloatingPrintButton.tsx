import React, { useState } from 'react';
import { Printer, FileText, X } from 'lucide-react';

interface FloatingPrintButtonProps {
  onOpenFlyerModal: () => void;
}

export const FloatingPrintButton: React.FC<FloatingPrintButtonProps> = ({ onOpenFlyerModal }) => {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 no-print flex flex-col items-end group animate-bounce-subtle">
      {!minimized ? (
        <div className="flex items-center shadow-2xl rounded-2xl overflow-hidden border-2 border-[#d4af37] bg-gradient-to-r from-[#060e1c] via-[#0a192f] to-[#132f52] p-1.5 gap-2 backdrop-blur-md">
          <button
            onClick={onOpenFlyerModal}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] font-black text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow"
            title="Abrir Folheto Oficial para Imprimir em A4 ou Salvar em PDF"
          >
            <Printer className="w-5 h-5 text-[#060e1c]" />
            <span className="font-extrabold tracking-tight">Imprimir Folheto (PDF / A4)</span>
          </button>

          <button
            onClick={() => setMinimized(true)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Minimizar botão"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setMinimized(false);
            onOpenFlyerModal();
          }}
          className="p-3.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#060e1c] shadow-2xl border-2 border-white/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          title="Abrir Folheto Oficial para Impressão (A4 / PDF)"
        >
          <Printer className="w-6 h-6 text-[#060e1c]" />
        </button>
      )}
    </div>
  );
};
