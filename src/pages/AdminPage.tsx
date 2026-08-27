import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { AdminCoachPortalModal } from '../components/AdminCoachPortalModal';
import { Logo } from '../components/Logo';

export const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === 'giuli.pereira@gmail.com') {
      setIsLoggedIn(true);
    } else {
      alert('E-mail não autorizado.');
    }
  };

  // Se não estiver logado, exibe a caixinha elegante de login ADM
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
              <span>Entrar no Painel</span>
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

  // Se logado, renderiza a home do site de fundo e abre o modal de administração completo por cima
  return (
    <div className="min-h-screen bg-[#060e1c] text-slate-100 relative">
      {/* Fundo com um aviso e botão de voltar para o site */}
      <div className="p-8 text-center space-y-4 max-w-xl mx-auto pt-20">
        <Logo variant="emblem" className="h-20 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Sessão Administrativa Ativa</h2>
        <p className="text-xs text-slate-300">
          O painel de gestão completo da ACEDEP foi aberto. Caso queira fechar e retornar à página inicial do site, utilize o botão abaixo.
        </p>
        <div>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-md bg-[#d4af37] text-[#060e1c] font-bold text-xs hover:bg-[#e5c058] transition-colors"
          >
            Voltar ao Site Principal
          </a>
        </div>
      </div>

      {/* Força o painel original de coordenação a abrir por cima em modo aberto (isOpen = true) */}
      <AdminCoachPortalModal forcedOpen={true} />
    </div>
  );
};
