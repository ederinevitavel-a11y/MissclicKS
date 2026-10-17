import React from 'react';
import { motion } from 'motion/react';
import { RankedPlayer } from '../types';
import { TrendDown, TrendSame, TrendUp } from './NeonIcons';
import { Hash, Activity, TrendingUp } from 'lucide-react';

interface RankingListProps {
  players: RankedPlayer[];
}

export const RankingList: React.FC<RankingListProps> = ({ players }) => {
  const displayPlayers = players.length > 3 ? players.slice(3) : [];

  if (displayPlayers.length === 0 && players.length <= 3) {
    return (
      <div className="text-center py-12">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-gray-600">No other contenders detected in sector.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between px-6 py-2 text-[10px] font-display uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
        <div className="flex items-center gap-8">
          <span className="w-8 flex justify-center"><Hash className="w-3 h-3" /></span>
          <span>Nome</span>
        </div>
        <div className="flex items-center gap-6 sm:gap-10">
          <span className="w-12 text-center hidden sm:block"><TrendingUp className="w-3 h-3 mx-auto" /></span>
          <span className="w-24 text-right flex items-center justify-end gap-1"><Activity className="w-3 h-3" /> KS</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {displayPlayers.map((player, index) => (
          <motion.div 
            key={player.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group cyber-card p-4 flex items-center justify-between hover:border-neon-blue/50 hover:bg-neon-blue/5 transition-all"
          >
            <div className="flex items-center gap-8">
              <span className="font-display font-black text-gray-600 group-hover:text-neon-blue transition-colors w-8 text-center">
                {player.rank.toString().padStart(2, '0')}
              </span>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-display text-xs text-gray-500 group-hover:border-neon-blue/30 group-hover:text-neon-blue transition-all">
                  {player.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm group-hover:text-white transition-colors">
                    {player.name}
                  </h4>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 sm:gap-10">
              <div className="w-12 flex justify-center hidden sm:block">
                {player.trend === 'up' && <TrendUp className="w-4 h-4 text-neon-green" />}
                {player.trend === 'down' && <TrendDown className="w-4 h-4 text-red-500" />}
                {player.trend === 'same' && <TrendSame className="w-4 h-4 text-gray-700" />}
              </div>
              <div className="w-24 text-right">
                <span className="font-display font-black text-xl text-white group-hover:neon-text-blue transition-all">
                  {player.totalKS}
                </span>
                <span className="text-[10px] font-mono text-gray-500 block">KS</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
