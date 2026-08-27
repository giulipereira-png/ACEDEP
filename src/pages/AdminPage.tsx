import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogOut, Users, Mail, Phone, Calendar, Loader2, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(false);

  // Verifica se já está logado ao abrir a página
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Opcional: verificar se o email está na tabela 'admins'
        setIsAuthenticated(true);
        fetchAthletes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLogin(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setIsAuthenticated(true);
        fetchAthletes();
      }
    } catch (err: any) {
      setErrorMsg('E-mail ou senha incorretos. Verifique seus dados.');
      console.error(err);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const fetchAthletes = async () => {
    setLoadingAthletes(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL}/rest/v1/athletes?select=*`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY}`,
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setAthletes(data);
      }
    } catch (err) {
      console.error('Erro ao buscar atletas:', err);
    } finally {
      setLoadingAthletes(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  // Se NÃO estiver logado, mostra a tela de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#060e1c] border border-[#d4af37]/30 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <Logo variant="emblem" className="h-16 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white font-serif">Área Restrita - ADM</h1>
            <p className="text-xs text-[#d4af37]">ACEDEP • Acesso exclusivo da Diretoria</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
              {errorMsg}
            </div>
          )}

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
              disabled={loadingLogin}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#c49e29] text-[#060e1c] font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loadingLogin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
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

  // Se ESTIVER logado, mostra o Painel de Controle de Atletas
  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#060e1c] p-6 rounded-2xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <Logo variant="emblem" className="h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">Painel Administrativo</h1>
              <p className="text-xs text-[#d4af37]">Gerenciamento de Inscrições e Atletas - ACEDEP</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAthletes}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/10 transition-colors cursor-pointer"
            >
              Atualizar Lista
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-red-400 border border-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#060e1c] p-5 rounded-xl border border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{athletes.length}</div>
              <div className="text-xs text-slate-400">Atletas Inscritos (Nuvem)</div>
            </div>
          </div>
        </div>

        {/* Athletes Table / List */}
        <div className="bg-[#060e1c] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
              Lista de Inscrições Recebidas pelo Site
            </h2>
          </div>

          {loadingAthletes ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mx-auto" />
              <p className="text-xs text-slate-400 mt-2">Buscando cadastros no banco de dados...</p>
            </div>
          ) : athletes.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Nenhum atleta cadastrado ainda.</p>
              <p className="text-xs text-slate-500">Faça um teste preenchendo o formulário no site principal!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-black/40 text-slate-400 border-b border-white/10">
                    <th className="p-4 font-semibold">Nome do Atleta</th>
                    <th className="p-4 font-semibold">Responsável / Contato</th>
                    <th className="p-4 font-semibold">Condição / Turma</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Data do Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {athletes.map((athlete, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white text-sm">
                        {athlete.full_name}
                      </td>
                      <td className="p-4 text-slate-300 space-y-0.5">
                        <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-[#d4af37]" /> {athlete.phone}</div>
                        <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-[#d4af37]" /> {athlete.email}</div>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div>{athlete.disability_type}</div>
                        <div className="text-[11px] text-slate-400">{athlete.swating_experience}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                          {athlete.status || 'Pendente'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {athlete.created_at ? new Date(athlete.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
