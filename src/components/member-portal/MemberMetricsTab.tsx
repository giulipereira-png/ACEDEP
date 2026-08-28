import React from 'react';
import { TrendingUp } from 'lucide-react';
import { AthleteRecord } from '../../types';

interface MemberMetricsTabProps {
  athlete: AthleteRecord;
}

export const MemberMetricsTab: React.FC<MemberMetricsTabProps> = ({ athlete }) => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#0a192f] border border-[#1e3a5f] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recordes Pessoais (RP) & Tempos Oficiais
            </h4>
            <p className="text-xs text-slate-400 pt-1">
              Cronometragens oficiais nas provas de natação paralímpica para atletas da classe S14.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {(!athlete.swimmingMetrics || athlete.swimmingMetrics.length === 0) ? (
            <div className="col-span-2 p-6 text-center text-xs text-slate-400 bg-black/30 rounded-xl">
              Nenhuma métrica ou tempo oficial registrado até o momento.
            </div>
          ) : (
            athlete.swimmingMetrics.map((metric) => (
              <div
                key={metric.id}
                className="p-5 rounded-2xl bg-black/40 border border-[#1e3a5f] hover:border-[#d4af37]/40 transition-all space-y-3 shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{metric.event}</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                    Piscina {metric.laneType}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#d4af37]">
                    {metric.bestTime}
                  </span>
                  {metric.evolution && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {metric.evolution}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{metric.stageName}</span>
                  <span>{metric.dateRecorded}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
