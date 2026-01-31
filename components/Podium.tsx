import React from 'react';
import { RankedPlayer } from '../types';
import { TrophyIcon } from './NeonIcons';

interface PodiumProps {
  players: RankedPlayer[];
}

const PodiumStep: React.FC<{ player: RankedPlayer; place: 1 | 2 | 3 }> = ({ player, place }) => {
  const isFirst = place === 1;
  
  // Color Schemes
  const colors = {
    1: {
      border: 'border-neon-purple',
      shadow: 'shadow-[0_0_30px_rgba(188,19,254,0.3)]',
      text: 'text-neon-purple',
      bg: 'bg-neon-purple/10',
      glow: 'after:bg-neon-purple'
    },
    2: {
      border: 'border-neon-blue',
      shadow: 'shadow-[0_0_20px_rgba(0,243,255,0.2)]',
      text: 'text-neon-blue',
      bg: 'bg-neon-blue/10',
      glow: 'after:bg-neon-blue'
    },
    3: {
      border: 'border-neon-green',
      shadow: 'shadow-[0_0_20px_rgba(10,255,10,0.2)]',
      text: 'text-neon-green',
      bg: 'bg-neon-green/10',
      glow: 'after:bg-neon-green'
    }
  };

  const style = colors[place];
  
  // Structure styles based on rank
  const containerHeight = isFirst ? 'min-h-[220px]' : 'min-h-[180px]';
  const translateY = isFirst ? '-translate-y-4' : 'translate-y-0';
  const scale = isFirst ? 'scale-105 z-20' : 'scale-100 z-10';
  const order = isFirst ? 'order-2' : place === 2 ? 'order-1' : 'order-3';

  return (
    <div className={`flex-1 flex flex-col items-center ${order} ${translateY} ${scale} transition-all duration-500 max-w-[33%]`}>
      
      {/* Avatar Circle */}
      <div className={`
        relative rounded-full border-2 ${style.border} bg-black flex items-center justify-center
        ${isFirst ? 'w-20 h-20 md:w-24 md:h-24 mb-[-30px]' : 'w-16 h-16 md:w-20 md:h-20 mb-[-25px]'}
        z-30 shadow-lg ${style.shadow}
      `}>
        <span className={`font-display font-bold ${isFirst ? 'text-2xl' : 'text-xl'} text-white`}>
          {player.name.substring(0, 2).toUpperCase()}
        </span>
        
        {/* Crown/Trophy for 1st */}
        {isFirst && (
          <div className="absolute -top-8 animate-bounce drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
            <TrophyIcon className="w-8 h-8 text-yellow-400" />
          </div>
        )}

        {/* Rank Badge */}
        <div className={`
          absolute -bottom-2 bg-black border ${style.border} ${style.text}
          text-xs font-bold px-2 py-0.5 rounded-full
        `}>
          #{place}
        </div>
      </div>

      {/* Holographic Card Body */}
      <div className={`
        relative w-full ${containerHeight} ${style.bg} border ${style.border}
        backdrop-blur-md rounded-xl flex flex-col items-center justify-center pt-10 pb-4 px-2
        ${style.shadow} overflow-hidden
      `}>
        
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />

        {/* Player Name - Full Width, No Truncate, Wrap Text */}
        <div className="relative z-10 w-full text-center px-1 mb-2">
            <h3 className={`
              font-display font-bold leading-tight break-words w-full
              ${isFirst ? 'text-lg md:text-xl text-white' : 'text-base md:text-lg text-gray-200'}
            `}>
              {player.name}
            </h3>
        </div>

        {/* KS Score */}
        <div className="relative z-10 mt-auto">
            <span className="text-gray-400 text-[10px] uppercase tracking-widest block text-center mb-1">Total KS</span>
            <div className={`font-mono font-black ${isFirst ? 'text-3xl' : 'text-2xl'} ${style.text} text-center`}>
              {player.totalKS}
            </div>
        </div>

        {/* Bottom Glow Bar */}
        <div className={`absolute bottom-0 left-0 w-full h-1 ${style.bg.replace('/10', '')} shadow-[0_0_15px_currentColor]`} />
      </div>

    </div>
  );
};

export const Podium: React.FC<PodiumProps> = ({ players }) => {
  if (players.length === 0) return null;

  const first = players[0];
  const second = players.length > 1 ? players[1] : null;
  const third = players.length > 2 ? players[2] : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 mb-12">
      <div className="flex flex-row items-end justify-center gap-2 md:gap-6 pt-10 pb-4">
        {/* Logic to handle missing players if less than 3 */}
        {second ? <PodiumStep player={second} place={2} /> : <div className="flex-1 max-w-[33%]" />}
        {first ? <PodiumStep player={first} place={1} /> : <div className="flex-1 max-w-[33%]" />}
        {third ? <PodiumStep player={third} place={3} /> : <div className="flex-1 max-w-[33%]" />}
      </div>
    </div>
  );
};