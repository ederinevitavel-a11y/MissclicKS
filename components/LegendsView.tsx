import React from 'react';
import { motion } from 'motion/react';
import { RankedPlayer } from '../types';
import { TrophyIcon } from './NeonIcons';
import { Crown, Star, Medal, Shield, Zap } from 'lucide-react';

interface LegendsViewProps {
  players: RankedPlayer[];
}

export const LegendsView: React.FC<LegendsViewProps> = ({ players }) => {
  const first = players[0];
  const second = players.length > 1 ? players[1] : null;
  const third = players.length > 2 ? players[2] : null;
  const others = players.slice(3);

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 px-4">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-500/50" />
          <TrophyIcon className="w-8 h-8 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-500/50" />
        </div>
        <h2 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter mb-2">
          Legends
        </h2>
        <p className="text-yellow-500/60 font-mono text-[10px] uppercase tracking-[0.5em]">Eternal Glory to the Immortal Combatants</p>
      </motion.div>

      {/* Top 3 Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {first && <LegendCard player={first} rank={1} type="gold" className="order-1 md:order-2" />}
        {second && <LegendCard player={second} rank={2} type="silver" className="order-2 md:order-1" />}
        {third && <LegendCard player={third} rank={3} type="bronze" className="order-3 md:order-3" />}
      </div>

      {/* Honorable Mentions */}
      {others.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-white/5 flex-1" />
            <span className="font-display text-gray-500 text-[10px] tracking-[0.4em] uppercase">Honorable Mentions</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {others.map((p, i) => (
              <motion.div 
                key={p.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + (i * 0.05) }}
                className="group flex items-center justify-between cyber-card p-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-6">
                  <span className="font-display font-black text-gray-700 text-sm w-8 text-center group-hover:text-white">
                    {p.rank.toString().padStart(2, '0')}
                  </span>
                  <span className="text-gray-300 font-bold text-sm tracking-wide group-hover:text-neon-blue transition-colors">
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="font-display font-black text-xl text-white group-hover:neon-text-blue">
                      {p.totalKS}
                    </span>
                    <span className="text-[8px] text-gray-600 uppercase ml-2 font-mono">Total KS</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const LegendCard: React.FC<{ player: RankedPlayer; rank: number; type: 'gold' | 'silver' | 'bronze'; className?: string }> = ({ player, rank, type, className }) => {
  const isGold = type === 'gold';
  
  const styles = {
    gold: {
      border: 'border-yellow-500',
      text: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      glow: 'shadow-[0_0_40px_rgba(234,179,8,0.3)]',
      icon: <Crown className="w-8 h-8 text-yellow-400" />,
      label: 'Supreme Warlord'
    },
    silver: {
      border: 'border-slate-400',
      text: 'text-slate-300',
      bg: 'bg-slate-400/10',
      glow: 'shadow-[0_0_30px_rgba(148,163,184,0.2)]',
      icon: <Star className="w-6 h-6 text-slate-300" />,
      label: 'Grand Champion'
    },
    bronze: {
      border: 'border-orange-600',
      text: 'text-orange-500',
      bg: 'bg-orange-600/10',
      glow: 'shadow-[0_0_30px_rgba(249,115,22,0.2)]',
      icon: <Medal className="w-6 h-6 text-orange-500" />,
      label: 'Elite Vanguard'
    }
  };

  const s = styles[type];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: rank * 0.2 }}
      className={`relative flex flex-col items-center ${isGold ? 'z-20 md:-translate-y-4' : 'z-10'} group ${className || ''}`}
    >
      {/* Floating Icon */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="mb-6"
      >
        {s.icon}
      </motion.div>

      <div className={`w-full cyber-card p-8 cyber-border ${s.border} ${s.bg} ${s.glow} relative overflow-hidden flex flex-col items-center text-center`}>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.8))] pointer-events-none" />
        
        {/* Rank Badge */}
        <div className={`absolute top-0 right-0 px-4 py-1 ${s.border} border-b border-l rounded-bl-xl font-display font-black text-[10px] ${s.text} bg-black/80`}>
          RANK {rank}
        </div>

        <div className="relative z-10 mb-6">
          <div className={`w-20 h-20 rounded-2xl border-2 ${s.border} bg-black flex items-center justify-center mb-4 shadow-2xl`}>
            <span className={`font-display font-black text-3xl ${s.text}`}>
              {player.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <h3 className={`font-display font-black text-2xl text-white uppercase tracking-tighter mb-1 group-hover:scale-110 transition-transform`}>
            {player.name}
          </h3>
          <p className={`text-[9px] font-mono uppercase tracking-[0.3em] ${s.text} opacity-80`}>
            {s.label}
          </p>
        </div>

        <div className="relative z-10 w-full pt-6 border-t border-white/10">
          <p className="text-[9px] text-gray-500 uppercase font-mono tracking-widest mb-2">Lifetime Combat Score</p>
          <div className="flex items-center justify-center gap-2">
            <Zap className={`w-4 h-4 ${s.text}`} />
            <span className="font-display font-black text-4xl text-white">
              {player.totalKS}
            </span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" style={{ color: s.text }} />
      </div>
    </motion.div>
  );
};
