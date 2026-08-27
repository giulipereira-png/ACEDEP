import React, { useState } from 'react';
import { AdminCoachPortalModal } from '../components/AdminCoachPortalModal';
import { ShieldCheck, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';

export const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Liberação direta para o e-mail da diretoria acessar o painel completo
    if (email.trim().toLowerCase() === 'giuli.pereira@gmail.com') {
      setIsLoggedIn(true);
    } else {
      alert('E-mail não autorizado.');
    }
  };

  // Se não estiver logado, mostra a tela de segurança ADM
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#060e1c] border border-[#d4af37]/30 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <Logo variant="emblem" className="h-16 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white font-serif">Área Restrita - ADM</h1>
            <p className="text-xs text-[#d4af37]">ACEDEP • Acesso exclusivo da Diretoria</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Administrativo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="giuli.pereira@gmail.com"
                className="w-full px-3.5 py-2.5 bg-[#0a192f] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#0a192f] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#c49e29] text-[#060e1c] font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>Entrar no Painel Completo</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <a href="/" className="text-xs text-slate-400 hover:text-[#d4af37] inline-flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Voltar para o site principal
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Se estiver logado, exibe o painel completo original de gestão da ACEDEP
  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100">
      {/* Força o painel completo original a ficar visível em tela cheia */}
      <div className="p-4 bg-[#0a192f] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo variant="emblem" className="h-8" />
          <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">Painel Administrativo Geral - ACEDEP</span>
        </div>
        <a 
          href="/" 
          className="px-3 py-1.5 rounded bg-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-colors"
        >
          Sair / Fechar Painel
        </a>
      </div>
      
      {/* Renderiza o modal completo original em formato de página cheia */}
      <div className="w-full">
        <AdminCoachPortalModal />
      </div>
    </div>
  );
};
