import React from 'react';
import { RankedPlayer } from '../types';
import { TrendDown, TrendSame, TrendUp } from './NeonIcons';

interface RankingListProps {
  players: RankedPlayer[];
}

export const RankingList: React.FC<RankingListProps> = ({ players }) => {
  // Skip top 3 for the list if there are enough players, otherwise show all
  const displayPlayers = players.length > 3 ? players.slice(3) : [];

  if (displayPlayers.length === 0 && players.length <= 3) {
      return <div className="text-center text-gray-500 py-8 italic">No other contenders yet...</div>
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-20">
      <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest mb-4 px-4 font-display">
        <span>Rank / Player</span>
        <div className="flex gap-8">
            <span className="w-16 text-right">Trend</span>
            <span className="w-16 text-right">KS</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {displayPlayers.map((player) => (
          <div 
            key={player.name}
            className="group relative flex items-center justify-between p-4 bg-neon-surface rounded-xl border border-gray-800 hover:border-neon-blue transition-all duration-300 hover:shadow-neon-blue hover:-translate-y-1"
          >
            {/* Rank & Name */}
            <div className="flex items-center space-x-4">
              <span className="font-display font-bold text-gray-400 text-lg w-8 text-center">#{player.rank}</span>
              <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                    <span className="text-xs text-gray-300">{player.name.substring(0, 1)}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="font-bold text-white tracking-wide group-hover:text-neon-blue transition-colors">{player.name}</span>
                    <span className="text-xs text-gray-500">{player.gamesPlayed} games</span>
                 </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
                {/* Trend */}
                <div className="w-16 flex justify-end">
                    {player.trend === 'up' && <TrendUp className="w-5 h-5 text-neon-green" />}
                    {player.trend === 'down' && <TrendDown className="w-5 h-5 text-red-500" />}
                    {player.trend === 'same' && <TrendSame className="w-5 h-5 text-gray-600" />}
                </div>

                {/* KS Score */}
                <div className="w-16 text-right">
                    <span className="font-mono font-bold text-xl text-white text-shadow-sm">{player.totalKS}</span>
                </div>
            </div>
            
            {/* Background Glow on Hover */}
            <div className="absolute inset-0 rounded-xl bg-neon-blue opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};