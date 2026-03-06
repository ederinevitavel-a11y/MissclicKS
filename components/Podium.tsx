import React from 'react';
import { motion } from 'motion/react';
import { RankedPlayer } from '../types';
import { TrophyIcon } from './NeonIcons';
import { Crown, Star, Medal } from 'lucide-react';

interface PodiumProps {
  players: RankedPlayer[];
}

const PodiumStep: React.FC<{ player: RankedPlayer; place: 1 | 2 | 3 }> = ({ player, place }) => {
  const isFirst = place === 1;
  
  const colors = {
    1: {
      border: 'border-neon-purple',
      shadow: 'shadow-[0_0_40px_rgba(188,19,254,0.4)]',
      text: 'text-neon-purple',
      bg: 'bg-neon-purple/20',
      icon: <Crown className="w-8 h-8 text-yellow-400" />
    },
    2: {
      border: 'border-neon-blue',
      shadow: 'shadow-[0_0_30px_rgba(0,243,255,0.3)]',
      text: 'text-neon-blue',
      bg: 'bg-neon-blue/20',
      icon: <Star className="w-6 h-6 text-gray-300" />
    },
    3: {
      border: 'border-neon-green',
      shadow: 'shadow-[0_0_30px_rgba(10,255,10,0.3)]',
      text: 'text-neon-green',
      bg: 'bg-neon-green/20',
      icon: <Medal className="w-6 h-6 text-orange-400" />
    }
  };

  const style = colors[place];
  const order = isFirst ? 'order-2' : place === 2 ? 'order-1' : 'order-3';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: place * 0.2, type: 'spring', stiffness: 100 }}
      className={`flex-1 flex flex-col items-center ${order} relative group`}
    >
      {/* Floating Icon */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="mb-4 z-20"
      >
        {style.icon}
      </motion.div>

      {/* Avatar */}
      <div className={`relative z-10 ${isFirst ? 'w-24 h-24' : 'w-20 h-20'} rounded-2xl border-2 ${style.border} bg-black flex items-center justify-center overflow-hidden shadow-2xl ${style.shadow}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <span className={`font-display font-black ${isFirst ? 'text-3xl' : 'text-2xl'} text-white`}>
          {player.name.substring(0, 2).toUpperCase()}
        </span>
        
        {/* Rank Badge */}
        <div className={`absolute -bottom-1 -right-1 w-8 h-8 bg-black border ${style.border} rounded-lg flex items-center justify-center font-display font-black text-xs ${style.text}`}>
          {place}
        </div>
      </div>

      {/* Base */}
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: isFirst ? 180 : 140 }}
        transition={{ delay: 0.5, duration: 1 }}
        className={`w-full max-w-[140px] ${style.bg} border-x border-t ${style.border} rounded-t-2xl mt-[-20px] flex flex-col items-center pt-12 pb-4 px-2 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.5))] pointer-events-none" />
        
        <div className="relative z-10 text-center w-full px-2">
          <h3 className={`font-display font-bold text-xs uppercase tracking-tighter line-clamp-2 ${isFirst ? 'text-white' : 'text-gray-400'}`}>
            {player.name}
          </h3>
          <div className="mt-4">
            <p className="text-[8px] text-gray-500 uppercase font-mono tracking-widest">Combat Score</p>
            <p className={`font-display font-black ${isFirst ? 'text-3xl' : 'text-2xl'} ${style.text}`}>
              {player.totalKS}
            </p>
          </div>
        </div>

        {/* Bottom Glow */}
        <div className={`absolute bottom-0 left-0 w-full h-1 bg-white shadow-[0_0_20px_white] opacity-50`} />
      </motion.div>
    </motion.div>
  );
};

export const Podium: React.FC<PodiumProps> = ({ players }) => {
  if (players.length === 0) return null;

  const first = players[0];
  const second = players.length > 1 ? players[1] : null;
  const third = players.length > 2 ? players[2] : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex items-end justify-center gap-4 md:gap-8 min-h-[300px]">
        {second && <PodiumStep player={second} place={2} />}
        {first && <PodiumStep player={first} place={1} />}
        {third && <PodiumStep player={third} place={3} />}
      </div>
    </div>
  );
};
