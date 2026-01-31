import React from 'react';
import { RankedPlayer } from '../types';

interface LegendsViewProps {
  players: RankedPlayer[];
}

export const LegendsView: React.FC<LegendsViewProps> = ({ players }) => {
  const top3 = players.slice(0, 3);
  const others = players.slice(3);

  const first = players[0];
  const second = players.length > 1 ? players[1] : null;
  const third = players.length > 2 ? players[2] : null;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-24 px-4">
      
      {/* HEADER: Warrior Theme */}
      <div className="text-center mb-16 pt-8">
          <h2 className="text-5xl md:text-6xl font-display font-black text-white uppercase tracking-tighter drop-shadow-xl">
            Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Legends</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-3">
             <div className="h-[2px] w-12 bg-yellow-600"></div>
             <p className="text-yellow-500 font-mono text-xs tracking-[0.4em] uppercase">The Immortals of the Server</p>
             <div className="h-[2px] w-12 bg-yellow-600"></div>
          </div>
      </div>

      {/* PODIUM SECTION */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8 mb-20 min-h-[400px]">
        
        {/* 2nd Place - Silver/Blue (Champion) */}
        <div className="order-2 md:order-1 flex-1 w-full md:max-w-[30%]">
            {second ? (
                <WarriorCard player={second} rank={2} type="silver" title="Champion" />
            ) : <div className="h-64 opacity-20 bg-slate-800 rounded-2xl" />}
        </div>

        {/* 1st Place - Gold (Warlord) */}
        <div className="order-1 md:order-2 flex-1 w-full md:max-w-[35%] -mt-12 md:-mt-16 mb-8 md:mb-0 z-10">
             {first ? (
                <WarriorCard player={first} rank={1} type="gold" title="Warlord" />
            ) : <div className="h-64 opacity-20 bg-yellow-900 rounded-2xl" />}
        </div>

        {/* 3rd Place - Bronze (Vanguard) */}
        <div className="order-3 md:order-3 flex-1 w-full md:max-w-[30%]">
             {third ? (
                <WarriorCard player={third} rank={3} type="bronze" title="Vanguard" />
            ) : <div className="h-64 opacity-20 bg-orange-900 rounded-2xl" />}
        </div>
      </div>

      {/* THE ELITE LIST (4+) */}
      {others.length > 0 && (
          <div className="max-w-3xl mx-auto mt-12">
              <div className="flex items-center gap-4 mb-8">
                  <div className="h-px bg-gray-800 flex-1"></div>
                  <span className="font-display text-gray-500 text-xs tracking-widest uppercase">Elite Roster</span>
                  <div className="h-px bg-gray-800 flex-1"></div>
              </div>

              <div className="space-y-3">
                  {others.map((p) => (
                      <div key={p.name} className="group flex items-center justify-between bg-gray-900/40 border border-gray-800 hover:border-gray-600 rounded-lg p-4 transition-all duration-300 hover:bg-gray-800">
                          <div className="flex items-center gap-5">
                              <span className="font-display font-bold text-gray-600 text-lg w-6 text-center group-hover:text-white">
                                  #{p.rank}
                              </span>
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-gray-400">
                                      {p.name.substring(0, 1)}
                                  </div>
                                  <span className="text-gray-300 font-bold tracking-wide group-hover:text-white">{p.name}</span>
                              </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                              <span className="font-mono text-xl text-white font-bold group-hover:text-yellow-500 transition-colors">
                                  {p.totalKS}
                              </span>
                              <span className="text-[9px] text-gray-600 uppercase tracking-wider">Confirmed Kills</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

const WarriorCard: React.FC<{ player: RankedPlayer; rank: number; type: 'gold' | 'silver' | 'bronze'; title: string }> = ({ player, rank, type, title }) => {
    
    const styles = {
        gold: {
            border: 'border-yellow-500',
            glow: 'shadow-[0_0_30px_rgba(234,179,8,0.15)]',
            text: 'text-yellow-500',
            bg: 'bg-gradient-to-b from-yellow-900/20 via-black to-black',
            circleBorder: 'border-yellow-500',
            rankBg: 'bg-black',
            height: 'h-[340px]'
        },
        silver: {
            border: 'border-slate-300', // Cool silver/blueish
            glow: 'shadow-[0_0_20px_rgba(148,163,184,0.1)]',
            text: 'text-slate-300',
            bg: 'bg-gradient-to-b from-slate-800/20 via-black to-black',
            circleBorder: 'border-slate-300',
            rankBg: 'bg-black',
            height: 'h-[280px]'
        },
        bronze: {
            border: 'border-orange-500',
            glow: 'shadow-[0_0_20px_rgba(249,115,22,0.1)]',
            text: 'text-orange-500',
            bg: 'bg-gradient-to-b from-orange-900/20 via-black to-black',
            circleBorder: 'border-orange-500',
            rankBg: 'bg-black',
            height: 'h-[280px]'
        }
    };

    const s = styles[type];

    return (
        <div className="relative group">
            {/* The Star for Rank 1 */}
            {rank === 1 && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            {/* The Card */}
            <div className={`
                relative w-full ${s.height} rounded-2xl 
                border-2 ${s.border} ${s.bg} ${s.glow}
                flex flex-col items-center pt-12 pb-6 px-4
                transition-transform duration-300 hover:-translate-y-2
            `}>
                
                {/* Rank Badge (Sitting on the border) */}
                <div className={`
                    absolute -top-5 left-1/2 -translate-x-1/2
                    w-10 h-10 rounded-full 
                    border-2 ${s.border} ${s.rankBg}
                    flex items-center justify-center
                    z-10
                `}>
                    <span className={`font-display font-bold text-lg ${s.text}`}>{rank}</span>
                </div>

                {/* Avatar Circle */}
                <div className={`
                    w-20 h-20 rounded-full 
                    border-2 ${s.circleBorder} bg-black 
                    flex items-center justify-center 
                    mb-6 shadow-lg
                `}>
                    <span className={`font-display font-bold text-2xl ${s.text}`}>
                        {player.name.substring(0, 2).toUpperCase()}
                    </span>
                </div>

                {/* Title */}
                <span className={`text-[10px] uppercase tracking-[0.2em] font-bold opacity-80 mb-2 ${s.text}`}>
                    {title}
                </span>

                {/* Name */}
                <h3 className="text-white font-display font-bold text-xl md:text-2xl text-center leading-tight mb-auto line-clamp-2">
                    {player.name}
                </h3>

                {/* Divider */}
                <div className={`h-px w-16 ${s.text} opacity-30 my-4`}></div>

                {/* Stats */}
                <div className="text-center">
                    <span className="text-gray-500 text-[9px] uppercase tracking-widest block mb-1">Lifetime KS</span>
                    <span className={`font-mono text-4xl font-black ${s.text} drop-shadow-sm`}>
                        {player.totalKS}
                    </span>
                </div>

            </div>
        </div>
    );
}
