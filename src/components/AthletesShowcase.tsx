import React, { useState } from 'react';
import { 
  Trophy, 
  ChevronRight,
  ShieldCheck,
  Waves,
  UserCheck
} from 'lucide-react';
import { TEAM_MEMBERS, FAQS } from '../data/mockData';
import { Logo } from './Logo';

export const AthletesShowcase: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="equipe" className="py-20 bg-[#060e1c] text-slate-100 relative border-t border-[#1e3a5f]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-3">
            <span className="h-[2px] w-6 bg-[#d4af37]" />
            Nossa Equipe
            <span className="h-[2px] w-6 bg-[#d4af37]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Atletas e Comissão Técnica da ACEDEP
          </h2>
          <p className="mt-4 text-base text-slate-200 leading-relaxed font-medium">
            Atualmente contamos com 35 atletas, divididos em atletas em desenvolvimento e atletas de alto rendimento.
          </p>
          <p className="mt-2 text-sm text-slate-400 font-light">
            A equipe técnica é formada por 3 profissionais especializados em natação paradesportiva:
          </p>
        </div>

        {/* Technical Team (3 Professionals) Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          {TEAM_MEMBERS.map((member, i) => (
            <div
              key={i}
              className="rounded-xl bg-[#0f2744]/80 border border-white/10 p-6 flex flex-col justify-between hover:border-[#d4af37]/60 transition-all duration-300 shadow-lg relative group"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] group-hover:scale-105 transition-transform">
                    {i === 0 ? <ShieldCheck className="w-6 h-6" /> : i === 1 ? <Waves className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {member.name}
                    </h3>
                    <div className="text-xs font-semibold text-[#d4af37]">
                      {member.role}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#f3e5ab] font-bold font-mono bg-black/50 px-3 py-2 rounded-lg mb-3 border border-[#d4af37]/20">
                  {member.credentials}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {member.experience}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Board / Comitê de Pais da ACEDEP */}
        <div className="max-w-6xl mx-auto mb-16 rounded-2xl bg-gradient-to-r from-[#0f2744] via-[#132f52] to-[#0f2744] border border-[#d4af37]/50 p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                Pais e Família
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Diretoria formada pelos Pais dos Atletas
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                A ACEDEP conta com uma <strong>diretoria formada pelos próprios pais dos atletas</strong>. Todos trabalham de forma voluntária e com muita união para apoiar o dia a dia da equipe, ajudar nos treinos e incentivar o desenvolvimento dos nossos filhos.
              </p>
            </div>
            <div className="lg:col-span-4 bg-black/40 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#d4af37] font-serif">Desde 1990</div>
              <div className="text-xs font-semibold text-white mt-1">União e Trabalho em Família</div>
              <div className="text-[11px] text-slate-300 mt-1">Juntos em cada conquista nas piscinas</div>
            </div>
          </div>
        </div>

        {/* Athletes & Championship Highlights Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0a192f] via-[#0f2744] to-[#0a192f] border border-[#d4af37]/40 p-8 sm:p-12 mb-20 shadow-2xl relative overflow-hidden">
          
          {/* Subtle gold emblem backdrop */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Logo variant="emblem" className="h-96" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab] text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-[#d4af37]" />
                Conquistas no Paradesporto Aquático
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Mais de 30 anos revelando talentos e disputando o topo
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                Nossos atletas com deficiência intelectual provam diariamente que a disciplina e o treinamento constante nas piscinas superam qualquer barreira. Com a camisa da ACEDEP, participamos ativamente de <strong>Campeonatos Regionais, Nacionais e Internacionais</strong>, honrando o paradesporto paulista e brasileiro.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center">
                <div className="text-3xl font-extrabold text-[#d4af37] font-serif">~35</div>
                <div className="text-xs text-slate-300 mt-0.5">Atletas na Equipe Ativa</div>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center">
                <div className="text-3xl font-extrabold text-white font-serif">Piscina Olímpica</div>
                <div className="text-xs text-slate-300 mt-0.5">Estrutura de Alto Nível</div>
              </div>
            </div>

          </div>
        </div>

        {/* Perguntas Frequentes (FAQ) */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Dúvidas Frequentes sobre a ACEDEP
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Informações importantes sobre treinos, critérios de ingresso e apoio
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-white/10 bg-[#0f2744]/50 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-semibold text-sm text-white flex items-center justify-between gap-4 hover:text-[#d4af37] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-[#d4af37] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
