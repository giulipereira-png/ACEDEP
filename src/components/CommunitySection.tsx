import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Plus, 
  Send, 
  CheckCircle2, 
  Waves,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { usePhotos } from '../context/PhotosContext';
import { NewsCategory } from '../types';

export const CommunitySection: React.FC = () => {
  const { 
    newsPosts, 
    cheers, 
    addCheer, 
    likeCheer, 
    likeNewsPost, 
    setSelectedNewsForModal,
    setCoachManagerModalOpen
  } = useCommunity();
  const { isAdminAuthenticated } = usePhotos();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Cheer Form State
  const [cheerAuthor, setCheerAuthor] = useState('');
  const [cheerRelation, setCheerRelation] = useState('');
  const [cheerMsg, setCheerMsg] = useState('');
  const [isSubmittingCheer, setIsSubmittingCheer] = useState(false);
  const [cheerSuccess, setCheerSuccess] = useState(false);

  const categories: { label: string; value: string }[] = [
    { label: 'Todas as Novidades', value: 'all' },
    { label: 'Resultados & Provas', value: 'Resultados & Provas' },
    { label: 'Comunicados Oficiais', value: 'Comunicados Oficiais' },
    { label: 'Treinos & Calendário', value: 'Treinos & Calendário' },
    { label: 'Eventos & Festivais', value: 'Eventos & Festivais' },
  ];

  const filteredPosts = selectedCategory === 'all'
    ? newsPosts
    : newsPosts.filter((p) => p.category === selectedCategory);

  const pinnedPost = newsPosts.find((p) => p.pinned) || newsPosts[0];

  const handleCheerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cheerAuthor.trim() || !cheerMsg.trim()) return;

    setIsSubmittingCheer(true);
    const success = await addCheer({
      authorName: cheerAuthor,
      relationship: cheerRelation || 'Comunidade ACEDEP',
      message: cheerMsg,
    });
    setIsSubmittingCheer(false);

    if (success) {
      setCheerAuthor('');
      setCheerRelation('');
      setCheerMsg('');
      setCheerSuccess(true);
      setTimeout(() => setCheerSuccess(false), 4000);
    }
  };

  return (
    <section id="comunidade" className="py-20 bg-[#071326] relative overflow-hidden border-t border-[#1e3a5f]/80">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#f3e5ab] text-xs font-bold tracking-wider uppercase">
            <Waves className="w-4 h-4 text-[#d4af37]" />
            <span>Comunidade & Notícias da Natação</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-serif">
            Mural de Novidades & Conquistas
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Acompanhe o dia a dia dos nossos nadadores com deficiência intelectual (Classe S14), comunicados da comissão técnica e resultados de competições no Centro Paralímpico Brasileiro.
          </p>

          {/* Admin shortcut if logged in */}
          {isAdminAuthenticated && (
            <div className="pt-2">
              <button
                onClick={() => setCoachManagerModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-[#060e1c] text-xs font-bold hover:bg-[#b8952b] transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Nova Notícia / Gerenciar Atletas</span>
              </button>
            </div>
          )}
        </div>

        {/* 1. PINNED / FEATURED HERO NEWS CARD */}
        {pinnedPost && (
          <div 
            onClick={() => setSelectedNewsForModal(pinnedPost)}
            className="group relative rounded-3xl bg-[#0c1f38] border border-[#1e3a5f] hover:border-[#d4af37]/60 transition-all duration-300 overflow-hidden shadow-xl cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
          >
            <div className="lg:col-span-7 h-64 lg:h-auto min-h-[280px] relative overflow-hidden bg-black/40">
              <img
                src={pinnedPost.coverUrl}
                alt={pinnedPost.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f38] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0c1f38]" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-[#d4af37] text-[#060e1c] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow">
                  <Sparkles className="w-3.5 h-3.5" />
                  Destaque
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-[#d4af37] font-semibold">{pinnedPost.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {pinnedPost.date}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#d4af37] transition-colors font-serif leading-snug">
                  {pinnedPost.title}
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                  {pinnedPost.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1e3a5f]/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#f3e5ab] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  Ler notícia completa
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    likeNewsPost(pinnedPost.id);
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200 transition-colors px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                  <span>{pinnedPost.likesCount || 0}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. FILTER PILLS */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-[#d4af37] text-[#060e1c] shadow-md scale-105'
                  : 'bg-[#0c1f38] text-slate-300 border border-[#1e3a5f] hover:border-[#d4af37]/40 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 3. NEWS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedNewsForModal(post)}
              className="group rounded-2xl bg-[#0c1f38] border border-[#1e3a5f] hover:border-[#d4af37]/50 transition-all duration-300 overflow-hidden shadow-lg flex flex-col justify-between cursor-pointer hover:-translate-y-1"
            >
              <div>
                {/* Image */}
                <div className="h-44 w-full relative overflow-hidden bg-black/40">
                  <img
                    src={post.coverUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 text-[#f3e5ab] text-[10px] font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>{post.date}</span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-[#1e3a5f]/40 mt-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 group-hover:text-[#d4af37] transition-colors">
                  Ver detalhes
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    likeNewsPost(post.id);
                  }}
                  className="flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 transition-colors px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20"
                >
                  <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                  <span>{post.likesCount || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 4. MURAL DE APOIO DA FAMÍLIA & TORCIDA ACEDEP */}
        <div className="pt-10 border-t border-[#1e3a5f]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Interactive Form to leave a cheer */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#0c1f38] border border-[#1e3a5f] space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4" />
                  <span>Mural da Família & Torcida</span>
                </div>
                <h3 className="text-xl font-bold text-white font-serif">
                  Deixe uma Mensagem de Apoio aos Nossos Atletas!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pais, mães, amigos e torcedores podem deixar recados de carinho e incentivo para a equipe de natação paralímpica da ACEDEP.
                </p>
              </div>

              <form onSubmit={handleCheerSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={cheerAuthor}
                    onChange={(e) => setCheerAuthor(e.target.value)}
                    placeholder="Ex: Mariana Silva"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Vínculo com a ACEDEP
                  </label>
                  <input
                    type="text"
                    value={cheerRelation}
                    onChange={(e) => setCheerRelation(e.target.value)}
                    placeholder="Ex: Mãe do atleta Lucas (S14), Padrinho, Amigo da Equipe..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Sua Mensagem de Incentivo *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={cheerMsg}
                    onChange={(e) => setCheerMsg(e.target.value)}
                    placeholder="Escreva palavras de ânimo e carinho para os nadadores..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/40 border border-[#1e3a5f] text-white placeholder-slate-500 focus:outline-none focus:border-[#d4af37] resize-none"
                  />
                </div>

                {cheerSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Recado publicado com sucesso no mural!</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingCheer}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#d4af37] text-[#060e1c] text-xs font-bold hover:bg-[#b8952b] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingCheer ? 'Publicando...' : 'Publicar no Mural'}</span>
                </button>
              </form>
            </div>

            {/* Right: Wall of recent messages */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#d4af37]" />
                  Recados Recentes da Comunidade ({cheers.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
                {cheers.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-[#0c1f38] border border-[#1e3a5f] space-y-3 flex flex-col justify-between shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#060e1c] text-xs font-bold shrink-0 shadow"
                          style={{ backgroundColor: c.avatarColor || '#d4af37' }}
                        >
                          {c.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{c.authorName}</p>
                          <p className="text-[10px] text-slate-400">{c.relationship}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed italic">
                        "{c.message}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#1e3a5f]/40 flex items-center justify-end">
                      <button
                        onClick={() => likeCheer(c.id)}
                        className="flex items-center gap-1.5 text-[11px] text-rose-300 hover:text-rose-200 px-2 py-0.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                        <span>{c.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
