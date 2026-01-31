
import React from 'react';
import { RawDataRow, OverviewData } from '../types';
import { SkullIcon, AlertIcon } from './NeonIcons';

interface BlackListViewProps {
  rawData: RawDataRow[];
  overviewData: OverviewData | null;
}

export const BlackListView: React.FC<BlackListViewProps> = ({ rawData, overviewData }) => {
  const huntedIntel = overviewData?.huntedIntel;
  const maxFreq = huntedIntel ? Math.max(...huntedIntel.timeDistribution, 1) : 1;

  // Divisões do dia para tornar o gráfico intuitivo
  const getTimePeriod = (hour: number) => {
    if (hour >= 0 && hour < 6) return 'Madrugada';
    if (hour >= 6 && hour < 12) return 'Manhã';
    if (hour >= 12 && hour < 18) return 'Tarde';
    return 'Noite';
  };

  const now = new Date();

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in pb-20 px-4 space-y-8">
      
      {/* SEÇÃO DE INTELIGÊNCIA: PADRÕES DE HUNTEDS (Últimos 30 Dias) */}
      <div className="bg-neon-surface border border-neon-blue/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.05)]">
          <div className="bg-gradient-to-r from-neon-blue/10 to-transparent p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-neon-blue rounded-full animate-pulse shadow-[0_0_10px_#00f3ff]"></div>
                  <h2 className="font-display font-black text-white tracking-widest uppercase text-xl md:text-2xl">
                    Inteligência de Alvos
                  </h2>
              </div>
              <div className="flex flex-col md:text-right">
                <span className="font-mono text-[10px] text-neon-blue uppercase tracking-[0.2em] font-bold">Relatório de Atividade Recente</span>
                <span className="text-[9px] text-gray-500 font-mono italic">Baseado nos últimos 30 dias de avistamentos</span>
              </div>
          </div>

          <div className="p-6 space-y-12">
              
              {/* Parte 1: Lista de Alvos, Horários e Status de Evasão */}
              <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="h-4 w-1 bg-neon-blue rounded-full"></div>
                     <h3 className="text-gray-300 font-display text-xs uppercase tracking-widest">Alvos Identificados: Perfil Tático</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {huntedIntel?.targets.map((target, i) => {
                          const lastSeenDate = new Date(target.lastSeen);
                          const diffMs = now.getTime() - lastSeenDate.getTime();
                          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                          const isInactive = diffDays > 7;

                          return (
                              <div key={i} className={`bg-black/40 border ${isInactive ? 'border-gray-800 opacity-80' : 'border-gray-800'} rounded-xl p-5 group hover:border-neon-blue/40 transition-all flex flex-col relative overflow-hidden`}>
                                  
                                  {/* Status de Evasão Badge */}
                                  <div className="absolute top-0 right-0">
                                      <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg font-mono tracking-tighter shadow-lg ${isInactive ? 'bg-zinc-800 text-zinc-500' : 'bg-neon-blue text-black animate-pulse'}`}>
                                          {isInactive ? 'Inativo / Oculto' : 'Ativo no Radar'}
                                      </div>
                                  </div>

                                  <div className="flex justify-between items-start mb-4 mt-2">
                                      <span className={`text-base font-black truncate pr-2 transition-colors ${isInactive ? 'text-gray-500' : 'text-white group-hover:text-neon-blue'}`}>
                                          {target.name}
                                      </span>
                                      <span className="bg-gray-800 text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">x{target.count}</span>
                                  </div>
                                  
                                  <div className="space-y-3 flex-1">
                                      {/* Horário de Pico */}
                                      <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
                                          <span className="text-[10px] text-gray-500 uppercase font-mono tracking-tighter font-bold">Horário Usual:</span>
                                          <span className={`text-xs font-mono font-black ${isInactive ? 'text-gray-600' : 'text-neon-blue'}`}>{target.peakHour}</span>
                                      </div>

                                      {/* Status Temporal */}
                                      <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
                                          <span className="text-[10px] text-gray-500 uppercase font-mono tracking-tighter font-bold">Último Sinal:</span>
                                          <span className={`text-[10px] font-mono font-bold ${isInactive ? 'text-orange-900' : 'text-neon-green/80'}`}>
                                              {diffDays === 0 ? 'HOJE' : `${diffDays} DIA${diffDays > 1 ? 'S' : ''} ATRÁS`}
                                          </span>
                                      </div>

                                      {/* Top Locais */}
                                      <div className="pt-1">
                                          <span className="text-[9px] text-gray-600 uppercase font-mono block mb-2 tracking-widest font-bold">Zonas de Avistamento (Top 3)</span>
                                          <div className="space-y-1.5">
                                              {target.topLocations.map((loc, idx) => (
                                                  <div key={idx} className="flex items-center justify-between bg-zinc-900/40 p-1.5 rounded-md border border-gray-800/30">
                                                      <span className={`text-[10px] truncate max-w-[120px] ${isInactive ? 'text-zinc-600' : 'text-zinc-400'}`} title={loc.name}>
                                                          {idx + 1}. {loc.name}
                                                      </span>
                                                      <span className={`text-[9px] font-mono ${isInactive ? 'text-zinc-700' : 'text-neon-blue/70'}`}>{loc.count}x</span>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                      {(!huntedIntel || huntedIntel.targets.length === 0) && (
                          <div className="col-span-full py-12 text-center opacity-30 border border-dashed border-gray-800 rounded-xl">
                              <p className="font-mono text-xs">Nenhum alvo detectado no radar recentemente.</p>
                          </div>
                      )}
                  </div>
              </div>

              {/* Parte 2: Gráfico de Horários (Strike Windows) */}
              <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="h-4 w-1 bg-neon-blue rounded-full"></div>
                     <h3 className="text-gray-300 font-display text-xs uppercase tracking-widest">Mapa de Calor: Intensidade por Horário</h3>
                  </div>
                  
                  <div className="bg-black/30 p-8 rounded-2xl border border-gray-800/50 relative">
                    <div className="absolute inset-x-8 top-8 bottom-20 flex flex-col justify-between pointer-events-none opacity-5">
                        <div className="w-full h-px bg-white"></div>
                        <div className="w-full h-px bg-white"></div>
                        <div className="w-full h-px bg-white"></div>
                    </div>

                    <div className="relative h-40 flex items-end justify-between gap-1.5 md:gap-3 z-10">
                        {huntedIntel?.timeDistribution.map((freq, hour) => {
                            const height = (freq / maxFreq) * 100;
                            const isPeak = freq === maxFreq && freq > 0;
                            
                            return (
                                <div key={hour} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-neon-blue text-black text-[10px] font-bold px-2 py-1 rounded-md z-20 pointer-events-none whitespace-nowrap shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                                        {freq} Incidências
                                    </div>

                                    <div 
                                        style={{ height: `${Math.max(height, 2)}%` }}
                                        className={`w-full rounded-t-md transition-all duration-700 
                                            ${freq > 0 
                                                ? (isPeak ? 'bg-white shadow-[0_0_20px_white]' : 'bg-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.5)]') 
                                                : 'bg-gray-800 opacity-20'}`}
                                    />
                                    
                                    <div className="mt-4 flex flex-col items-center">
                                        <span className={`text-[9px] font-mono transition-colors ${freq > 0 ? 'text-neon-blue' : 'text-gray-700'}`}>
                                            {hour.toString().padStart(2, '0')}h
                                        </span>
                                        {hour % 6 === 0 && (
                                            <span className="absolute -bottom-6 text-[8px] uppercase tracking-tighter text-gray-600 font-bold whitespace-nowrap">
                                                {getTimePeriod(hour)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-10"></div>
                  </div>
              </div>

          </div>
      </div>

      <div className="text-center py-4 border-t border-gray-900/50">
          <p className="text-gray-700 text-[10px] leading-relaxed font-mono uppercase tracking-widest">
            Monitoramento tático MJR - Acesso Restrito
          </p>
      </div>

    </div>
  );
};
