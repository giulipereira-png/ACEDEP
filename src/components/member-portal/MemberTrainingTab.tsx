import React from 'react';
import { MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { AthleteRecord } from '../../types';

interface MemberTrainingTabProps {
  athlete: AthleteRecord;
}

export const MemberTrainingTab: React.FC<MemberTrainingTabProps> = ({ athlete }) => {
  return (
    <div className="space-y-6">
      {/* Schedule Card */}
      <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
        <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Grade Oficial de Treinos Aquáticos
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
            <span className="text-xs text-slate-400 block">Local dos Treinos</span>
            <p className="text-sm font-bold text-white">
              {athlete.trainingSchedule?.pool || 'Piscina Olímpica 50m - CPB'}
            </p>
            <p className="text-xs text-[#f3e5ab]">
              {athlete.trainingSchedule?.lane || 'Raia 3 - Rendimento S14'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
            <span className="text-xs text-slate-400 block">Dias & Horários</span>
            <p className="text-sm font-bold text-white">
              {Array.isArray(athlete.trainingSchedule?.days)
                ? athlete.trainingSchedule.days.join(', ')
                : (athlete.trainingSchedule?.days || 'Segunda, Quarta, Sexta')}
            </p>
            <p className="text-xs text-cyan-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {athlete.trainingSchedule?.time || '14:00 às 15:30'}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-between text-xs text-[#f3e5ab]">
          <span className="font-semibold">
            Treinador Responsável: {athlete.trainingSchedule?.coachName || 'Prof. Leonardo Ramos'}
          </span>
          <span className="text-slate-400">Padrão de Alto Rendimento Paralímpico</span>
        </div>
      </div>

      {/* Attendance Log */}
      <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Histórico Recente de Presença nas Piscinas
          </h4>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {athlete.attendanceRate}% de Assiduidade
          </span>
        </div>

        <div className="space-y-2.5">
          {(!athlete.recentAttendance || athlete.recentAttendance.length === 0) ? (
            <div className="p-4 rounded-xl bg-black/30 text-center text-xs text-slate-400">
              Nenhum registro recente de presença disponível.
            </div>
          ) : (
            athlete.recentAttendance.map((att, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 font-semibold">{att.date}</span>
                  <span className="text-slate-200 font-medium">{att.note}</span>
                </div>
                <div>
                  {att.status === 'presente' || att.status === 'treino_extra' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] uppercase">
                      Presente
                    </span>
                  ) : att.status === 'falta_justificada' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px] uppercase">
                      Justificado
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold text-[10px] uppercase">
                      Falta
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
