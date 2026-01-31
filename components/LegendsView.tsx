
import React from 'react';
import { RankedPlayer } from '../types';

interface LegendsViewProps {
  players: RankedPlayer[];
}

export const LegendsView: React.FC<LegendsViewProps> = ({ players }) => {
  const first = players[0];
  const second = players.length > 1 ? players[1] : null;
  const third = players.length > 2 ? players[2] : null;
  const others = players.slice(3);

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-24 px-4">
      
      {/* HEADER: Epic Theme */}
      <div className="text-center mb-10 pt-4">
          <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-100 to-yellow-600">Legends</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-2">
             <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-yellow-600"></div>
             <p className="text-yellow-500/80 font-mono text-[9px] md:text-xs tracking-[0.4em] uppercase">Eternal Glory to the MJR Immortals</p>
             <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-yellow-600"></div>
          </div>
      </div>

      {/* PODIUM SECTION */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-5 mb-12">
        
        {/* 2nd Place - Silver */}
        <div className="order-2 md:order-1 flex-1 w-full flex">
            {second ? (
                <WarriorCard player={second} rank={2} type="silver" title="Grand Champion" subtitle="The Silver Blade" />
            ) : <div className="flex-1 min-h-[220px] opacity-5 bg-slate-800 rounded-xl border border-dashed border-slate-700" />}
        </div>

        {/* 1st Place - Gold */}
        <div className="order-1 md:order-2 flex-1 w-full flex z-10">
             {first ? (
                <WarriorCard player={first} rank={1} type="gold" title="Supreme Warlord" subtitle="The Golden Legend" isPrime />
            ) : <div className="flex-1 min-h-[260px] opacity-5 bg-yellow-900 rounded-xl border border-dashed border-yellow-700" />}
        </div>

        {/* 3rd Place - Bronze */}
        <div className="order-3 md:order-3 flex-1 w-full flex">
             {third ? (
                <WarriorCard player={third} rank={3} type="bronze" title="Elite Vanguard" subtitle="The Bronze Shield" />
            ) : <div className="flex-1 min-h-[220px] opacity-5 bg-orange-900 rounded-xl border border-dashed border-orange-700" />}
        </div>
      </div>

      {/* THE ELITE LIST */}
      {others.length > 0 && (
          <div className="max-w-2xl mx-auto mt-16">
              <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-gradient-to-r from-transparent to-gray-800 flex-1"></div>
                  <span className="font-display text-gray-500 text-[10px] tracking-[0.3em] uppercase">Honorable Mention</span>
                  <div className="h-px bg-gradient-to-l from-transparent to-gray-800 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                  {others.map((p) => (
                      <div key={p.name} className="group flex items-center justify-between bg-black/40 border border-white/5 hover:border-white/20 rounded-lg p-3 transition-all duration-300">
                          <div className="flex items-center gap-4">
                              <span className="font-display font-bold text-gray-700 text-sm w-6 text-center group-hover:text-yellow-500">
                                  {p.rank}
                              </span>
                              <span className="text-gray-300 font-bold text-sm tracking-wide group-hover:text-white transition-colors">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                              <span className="font-mono text-lg text-white font-bold group-hover:text-yellow-500">{p.totalKS}</span>
                              <div className="h-4 w-px bg-gray-800"></div>
                              <span className="text-[9px] text-gray-600 uppercase tracking-widest">Kills</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

interface WarriorCardProps {
    player: RankedPlayer;
    rank: number;
    type: 'gold' | 'silver' | 'bronze';
    title: string;
    subtitle: string;
    isPrime?: boolean;
}

const WarriorCard: React.FC<WarriorCardProps> = ({ player, rank, type, title, subtitle, isPrime }) => {
    
    const styles = {
        gold: {
            border: 'border-yellow-500',
            innerBorder: 'border-yellow-200/30',
            text: 'text-yellow-500',
            accent: 'bg-yellow-500',
            glow: 'shadow-[0_0_50px_rgba(234,179,8,0.2)]',
            bg: 'bg-gradient-to-b from-yellow-950/50 via-black to-black',
            titleBg: 'bg-yellow-500/20 text-yellow-400',
            height: isPrime ? 'min-h-[290px]' : 'min-h-[250px]'
        },
        silver: {
            border: 'border-slate-400',
            innerBorder: 'border-slate-100/30',
            text: 'text-slate-300',
            accent: 'bg-slate-400',
            glow: 'shadow-[0_0_30px_rgba(148,163,184,0.15)]',
            bg: 'bg-gradient-to-b from-slate-900/50 via-black to-black',
            titleBg: 'bg-slate-500/20 text-slate-300',
            height: 'min-h-[240px]'
        },
        bronze: {
            border: 'border-orange-600',
            innerBorder: 'border-orange-200/20',
            text: 'text-orange-500',
            accent: 'bg-orange-600',
            glow: 'shadow-[0_0_30px_rgba(249,115,22,0.15)]',
            bg: 'bg-gradient-to-b from-orange-950/50 via-black to-black',
            titleBg: 'bg-orange-500/20 text-orange-400',
            height: 'min-h-[240px]'
        }
    };

    const s = styles[type];

    return (
        <div className={`relative group w-full flex flex-col transition-all duration-500 hover:-translate-y-2`}>
            
            {/* Crown/Star Icon */}
            {type === 'gold' && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_12px_rgba(255,215,0,0.6)] animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-yellow-400">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            {/* Main Card Shell */}
            <div className={`
                relative w-full flex-1 ${s.height} rounded-2xl 
                border-2 ${s.border} ${s.bg} ${s.glow}
                flex flex-col items-center pt-8 pb-5 px-3 overflow-hidden
            `}>
                
                {/* Decorative Inner Frame */}
                <div className={`absolute inset-2 border ${s.innerBorder} rounded-xl pointer-events-none opacity-30`}></div>

                {/* Rank Badge Emblem */}
                <div className={`
                    absolute -top-1 right-4 px-2.5 py-1
                    ${s.accent} rounded-b-lg
                    flex items-center justify-center
                    z-10 shadow-lg
                `}>
                    <span className="font-display font-black text-[11px] text-black italic">RANK {rank}</span>
                </div>

                {/* Title Badge (Ribbon Style) */}
                <div className={`
                    px-4 py-0.5 ${s.titleBg} rounded-full 
                    border border-current border-opacity-30 
                    mb-5 z-10 backdrop-blur-sm
                `}>
                    <span className="text-[7px] md:text-[9px] uppercase tracking-[0.4em] font-black">
                        {title}
                    </span>
                </div>

                {/* Player Identity (Avatar Initials) */}
                <div className={`
                    w-14 h-14 rounded-full 
                    border-2 ${s.innerBorder} bg-black 
                    flex items-center justify-center 
                    mb-4 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] shrink-0
                `}>
                    <span className={`font-display font-bold text-lg ${s.text}`}>
                        {player.name.substring(0, 2).toUpperCase()}
                    </span>
                </div>

                {/* HERO NAME - O Grande Destaque */}
                <div className="flex-1 flex flex-col justify-center items-center w-full min-h-[45px] z-10">
                    <h3 className={`
                        text-white font-display font-black text-center leading-tight tracking-tight px-1
                        ${player.name.length > 15 ? 'text-base' : 'text-xl md:text-2xl'}
                        drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]
                        group-hover:text-white transition-all
                    `}>
                        {player.name}
                    </h3>
                    <p className={`text-[8px] uppercase tracking-[0.2em] mt-1.5 font-bold opacity-60 ${s.text}`}>
                        {subtitle}
                    </p>
                </div>

                {/* Footer Divider */}
                <div className={`h-[1px] w-1/2 bg-gradient-to-r from-transparent via-current to-transparent opacity-30 my-4 shrink-0 ${s.text}`}></div>

                {/* Score Section */}
                <div className="text-center shrink-0 z-10">
                    <span className="text-gray-500 text-[8px] uppercase tracking-[0.3em] block mb-1">Lifetime Score</span>
                    <div className="flex items-center justify-center gap-1">
                         <span className={`font-mono ${isPrime ? 'text-4xl' : 'text-3xl'} font-black text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]`}>
                            {player.totalKS}
                        </span>
                    </div>
                </div>

                {/* Subtle Glow Background behind text */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-[50px] opacity-10 rounded-full ${s.accent}`}></div>

            </div>
        </div>
    );
}
