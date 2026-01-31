import React from 'react';
import { OverviewData } from '../types';

interface OverviewProps {
  data: OverviewData;
}

export const Overview: React.FC<OverviewProps> = ({ data }) => {
  // Helper for charts
  const maxWeekly = Math.max(...data.weeklyDistribution, 1);
  const maxTrend = Math.max(...data.dailyTrend.map(d => d.count), 1);
  const totalWeeklyKS = data.weeklyDistribution.reduce((a, b) => a + b, 0);
  
  // Calculate max for Rank chart to normalize widths
  const maxRankCount = Math.max(...data.killsByRank.map(r => r.count), 1);
  const maxRespawnCount = Math.max(...data.topRespawns.map(r => r.count), 1);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full max-w-6xl mx-auto px-2 pb-12 animate-fade-in">
      
      {/* 1. Hero Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
            label="Total KS" 
            value={data.totalKills.toLocaleString()} 
            color="text-neon-purple"
            borderColor="border-neon-purple"
        />
        <StatCard 
            label="Avg KS / Day" 
            value={data.avgKillsPerDay.toString()} 
            color="text-neon-blue"
            borderColor="border-neon-blue"
        />
        <StatCard 
            label="Heavy Weights" 
            value={data.weightDistribution.heavy.toString()} 
            subValue={`vs ${data.weightDistribution.normal} Normal`}
            color="text-neon-green"
            borderColor="border-neon-green"
        />
        <StatCard 
            label="Peak Day" 
            value={data.busiestDay.substring(0, 3)} 
            color="text-white"
            borderColor="border-gray-500"
        />
      </div>

      {/* NEW SECTION: Logs & Domination */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        {/* Combat Logs (Recent Activity) */}
        <div className="md:col-span-2 bg-black/60 border border-neon-purple/30 rounded-xl p-6 relative overflow-hidden">
            <h3 className="text-neon-purple font-display mb-4 tracking-widest text-sm uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"></span>
                Combat Logs (Live Feed)
            </h3>
            <div className="flex flex-col gap-2 font-mono text-sm max-h-[160px] overflow-y-auto custom-scrollbar">
                {data.recentActivity.map((log, i) => {
                    const d = new Date(log.date);
                    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                    return (
                        <div key={i} className="flex items-center justify-between border-b border-gray-800 pb-2 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-neon-green text-xs opacity-70">[{timeStr}]</span>
                                <span className="text-white font-bold">{log.player}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 text-xs hidden sm:block">{log.respawn}</span>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${log.ks > 1 ? 'bg-neon-purple text-black' : 'bg-gray-800 text-gray-300'}`}>
                                    +{log.ks} KS
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Warlords (Server Domination) */}
        <div className="bg-black/60 border border-neon-blue/30 rounded-xl p-6 relative overflow-hidden">
            <h3 className="text-neon-blue font-display mb-4 tracking-widest text-sm uppercase">Warlords (Top Share)</h3>
            <div className="flex flex-col justify-center h-full pb-4 gap-3">
                {data.dominationStats.map((stat, i) => (
                    <div key={i} className="relative">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300 font-bold">{i+1}. {stat.name}</span>
                            <span className="text-neon-blue font-mono">{stat.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                                style={{ width: `${stat.percentage}%` }}
                                className="h-full bg-neon-blue shadow-[0_0_8px_#00f3ff]"
                            />
                        </div>
                    </div>
                ))}
                {/* Visual filler for 'Others' */}
                <div className="mt-2 text-center text-[10px] text-gray-600 uppercase tracking-widest">
                    Remaining {100 - data.dominationStats.reduce((acc, curr) => acc + curr.percentage, 0) > 0 
                        ? (100 - data.dominationStats.reduce((acc, curr) => acc + curr.percentage, 0)).toFixed(1) 
                        : '0'}% held by others
                </div>
            </div>
        </div>
      </div>

      {/* 3. Weekly Distribution (Expanded & Redesigned) */}
      <div className="bg-neon-surface/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden mb-8">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-neon-green font-display tracking-widest text-sm uppercase">Weekly Intensity</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Activity distribution by day of week</p>
                </div>
                <div className="text-right">
                     <span className="text-2xl font-mono font-bold text-white">{totalWeeklyKS}</span>
                     <span className="text-[10px] text-gray-500 block uppercase tracking-wider">Weekly Total</span>
                </div>
            </div>
            
            <div className="relative h-48 w-full max-w-5xl mx-auto mt-4 group">
                
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                     <div className="w-full h-px bg-gray-600 border-t border-dashed border-gray-500"></div>
                     <div className="w-full h-px bg-gray-700"></div>
                     <div className="w-full h-px bg-gray-700"></div>
                     <div className="w-full h-px bg-gray-700"></div>
                     <div className="w-full h-px bg-neon-green"></div>
                </div>

                {/* Bars Container */}
                <div className="absolute inset-0 flex items-end justify-between gap-2 sm:gap-4 z-10">
                    {daysOfWeek.map((day, i) => {
                        const count = data.weeklyDistribution[i];
                        const percentage = (count / maxWeekly) * 100;
                        const isPeak = count === maxWeekly && count > 0;
                        
                        // Dynamic Colors based on intensity/peak
                        const barColor = isPeak ? 'bg-neon-purple' : 'bg-neon-green';
                        const gradientFrom = isPeak ? 'from-neon-purple/20' : 'from-neon-green/20';
                        const gradientTo = isPeak ? 'to-neon-purple' : 'to-neon-green';
                        const shadowColor = isPeak ? 'shadow-[0_0_20px_#bc13fe]' : 'shadow-[0_0_15px_#0aff0a]';

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group/bar relative hover:z-20">
                                
                                {/* Hover Tooltip */}
                                <div className="mb-2 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 transform translate-y-2 group-hover/bar:translate-y-0 bg-black border border-gray-700 px-2 py-1 rounded text-center shadow-xl pointer-events-none absolute bottom-full">
                                    <span className={`block font-bold font-mono ${isPeak ? 'text-neon-purple' : 'text-neon-green'}`}>{count}</span>
                                    <span className="text-[9px] text-gray-500 uppercase">Kills</span>
                                </div>

                                {/* The Bar */}
                                <div 
                                    style={{ height: `${percentage}%` }}
                                    className={`
                                        w-full max-w-[40px] rounded-t-sm relative transition-all duration-300
                                        bg-gradient-to-t ${gradientFrom} ${gradientTo}
                                        group-hover/bar:brightness-125
                                        /* Dim others on hover logic is handled by parent group opacity if needed, 
                                           but simpler looks better here: */
                                    `}
                                >
                                    {/* Top Cap Light */}
                                    <div className={`w-full h-[2px] ${barColor} shadow-[0_0_10px_currentColor] absolute top-0 left-0`}></div>
                                    
                                    {/* Inner Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
                                </div>

                                {/* Label */}
                                <div className={`
                                    mt-3 text-xs font-mono uppercase tracking-widest transition-colors
                                    ${isPeak ? 'text-neon-purple font-bold' : 'text-gray-500 group-hover/bar:text-white'}
                                `}>
                                    {day}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* 4. KS By Rank Distribution */}
        <div className="bg-neon-surface/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden group">
             <div className="absolute inset-0 bg-neon-purple/5 opacity-0 group-hover:opacity-10 transition-opacity" />
             <h3 className="text-neon-purple font-display mb-6 tracking-widest text-sm uppercase">Combat Efficiency by Rank</h3>
             
             <div className="flex flex-col gap-3 h-48 overflow-y-auto pr-2 custom-scrollbar">
                {data.killsByRank.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm">
                        <div className="w-24 text-right truncate text-gray-300 font-bold text-xs uppercase" title={item.rank}>
                            {item.rank}
                        </div>
                        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden relative">
                             <div 
                                style={{ width: `${(item.count / maxRankCount) * 100}%` }}
                                className="h-full bg-gradient-to-r from-neon-purple to-neon-blue shadow-[0_0_10px_#bc13fe] rounded-full"
                             />
                        </div>
                        <div className="w-10 text-right font-mono text-white">
                            {item.count}
                        </div>
                    </div>
                ))}
                {data.killsByRank.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500 text-xs italic">
                        No rank data available
                    </div>
                )}
             </div>
        </div>

        {/* 5. Top 5 Respawns (Hotzones) */}
        <div className="bg-neon-surface/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden group">
             <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover:opacity-10 transition-opacity" />
             <h3 className="text-neon-green font-display mb-6 tracking-widest text-sm uppercase">High Traffic Zones (Top 5)</h3>
             
             <div className="flex flex-col gap-3 h-48 overflow-y-auto pr-2 custom-scrollbar">
                {data.topRespawns.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm">
                        <div className="flex items-center justify-end w-24 gap-2">
                             <span className="text-[10px] text-gray-500">#{i+1}</span>
                             <div className="truncate text-gray-300 font-bold text-xs uppercase" title={item.name}>{item.name}</div>
                        </div>
                        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden relative">
                             <div 
                                style={{ width: `${(item.count / maxRespawnCount) * 100}%` }}
                                className="h-full bg-gradient-to-r from-neon-green to-neon-blue shadow-[0_0_10px_#0aff0a] rounded-full"
                             />
                        </div>
                        <div className="w-10 text-right font-mono text-white">
                            {item.count}
                        </div>
                    </div>
                ))}
                {data.topRespawns.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500 text-xs italic">
                        No respawn data available
                    </div>
                )}
             </div>
        </div>
      </div>

      {/* 6. Recent Trend (Full Width) */}
      <div className="w-full bg-black/40 border border-gray-800 rounded-xl p-6 relative">
            <h3 className="text-white font-display mb-4 tracking-widest text-sm uppercase">KS Trend (Last 14 Active Days)</h3>
            
            {/* Chart Container */}
            <div className="relative h-48 w-full mt-4">
                
                {/* Background Grid Lines for easier reading */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                     <div className="w-full h-px bg-gray-800/50 border-t border-dashed border-gray-700/50"></div>
                     <div className="w-full h-px bg-gray-800/30"></div>
                     <div className="w-full h-px bg-gray-800/30"></div>
                     <div className="w-full h-px bg-gray-800/30"></div>
                     <div className="w-full h-px bg-neon-blue/10"></div>
                </div>

                <div className="absolute inset-0 flex items-end justify-between gap-2 px-1 z-10">
                    {data.dailyTrend.map((d, i) => {
                         const heightPercentage = (d.count / maxTrend) * 100;
                         const isPeak = d.count === maxTrend;
                         
                         return (
                         <div key={i} className="flex-1 flex flex-col justify-end group h-full relative">
                             {/* Tooltip Popup (Moved outside overflow-hidden container) */}
                             <div 
                                style={{ bottom: `${heightPercentage}%` }}
                                className={`absolute left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border ${isPeak ? 'border-neon-purple' : 'border-neon-blue'} text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none`}
                             >
                                 {d.count} KS
                                 <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${isPeak ? 'border-t-neon-purple' : 'border-t-neon-blue'}`}></div>
                             </div>

                             {/* Background Track */}
                             <div className="relative flex flex-col justify-end h-full w-full bg-white/5 rounded-sm overflow-hidden">
                                
                                {/* The Data Bar */}
                                 <div 
                                    style={{ height: `${heightPercentage}%` }}
                                    className={`w-full relative min-h-[4px] rounded-t-sm transition-all duration-500 border-t-2 
                                        ${isPeak 
                                            ? 'bg-gradient-to-t from-transparent via-neon-purple/60 to-neon-purple border-white shadow-[0_0_20px_#bc13fe] z-10' 
                                            : 'bg-gradient-to-t from-transparent via-neon-blue/40 to-neon-blue/80 border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.4)] hover:to-neon-blue hover:shadow-[0_0_15px_rgba(0,243,255,0.6)]'}
                                    `}
                                 />
                             </div>
                             
                             {/* Date Labels */}
                             <div className="mt-2 text-center">
                                <span className={`text-[10px] font-mono block transition-colors ${isPeak ? 'text-neon-purple font-bold drop-shadow-[0_0_5px_rgba(188,19,254,0.5)]' : 'text-gray-500 group-hover:text-neon-blue'}`}>
                                    {d.date.split('-')[2]}
                                </span>
                                <span className="text-[8px] text-gray-700 block -mt-0.5">
                                    {d.date.split('-')[1]}
                                </span>
                             </div>
                         </div>
                     )})}
                </div>
            </div>
        </div>

    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; subValue?: string; color: string; borderColor: string }> = ({ label, value, subValue, color, borderColor }) => (
    <div className={`bg-neon-surface border ${borderColor} border-opacity-30 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 p-2 opacity-20 ${color}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
        </div>
        <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">{label}</span>
        <span className={`font-display font-black text-2xl md:text-3xl ${color} drop-shadow-sm`}>{value}</span>
        {subValue && <span className="text-xs text-gray-600 mt-1">{subValue}</span>}
    </div>
);
