import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { OverviewData } from '../types';
import { SkullIcon } from './NeonIcons';
import { fetchCharacterStatus, CharacterStatus } from '../services/tibiaDataService';
import { SuggestHuntedForm } from './SuggestHuntedForm';
import { Activity, Target, Zap, TrendingUp, MapPin, ShieldAlert, Terminal, Clock, Flame, Plus, Users } from 'lucide-react';

interface OverviewProps {
  data: OverviewData;
  onBackToIntelligence: () => void;
  onNewEntry: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ data, onBackToIntelligence, onNewEntry }) => {
  const maxWeekly = Math.max(...data.weeklyDistribution, 1);
  const totalWeeklyKS = data.weeklyDistribution.reduce((a, b) => a + b, 0);
  const maxRespawnCount = Math.max(...data.topRespawns.map(r => r.count), 1);
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const huntedIntel = data.huntedIntel;
  const now = new Date();

  const [onlineStatus, setOnlineStatus] = useState<Record<string, CharacterStatus>>({});
  const [showSuggestForm, setShowSuggestForm] = useState(false);

  useEffect(() => {
    if (!huntedIntel?.targets) return;
    const top6 = huntedIntel.targets.slice(0, 6);
    const updateStatus = async () => {
      const results = await Promise.all(
        top6.map(async (target) => ({
          name: target.name,
          status: await fetchCharacterStatus(target.name)
        }))
      );
      const newStatus: Record<string, CharacterStatus> = {};
      results.forEach(r => { newStatus[r.name] = r.status; });
      setOnlineStatus(newStatus);
    };
    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, [huntedIntel?.targets]);

  if (showSuggestForm) {
    return <SuggestHuntedForm onBack={() => setShowSuggestForm(false)} onBackToIntelligence={onBackToIntelligence} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<Zap className="w-5 h-5" />}
          label="Total KS" 
          value={data.totalKills.toLocaleString()} 
          color="text-neon-blue"
          delay={0.1}
        />
        <StatCard 
          icon={<Activity className="w-5 h-5" />}
          label="Daily Avg" 
          value={data.avgKillsPerDay.toString()} 
          color="text-neon-purple"
          delay={0.2}
        />
        <StatCard 
          icon={<Target className="w-5 h-5" />}
          label="Heavy Kills" 
          value={data.weightDistribution.heavy.toString()} 
          subValue={`${data.weightDistribution.normal} Normal`}
          color="text-neon-green"
          delay={0.3}
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5" />}
          label="Peak Day" 
          value={data.busiestDay.substring(0, 3)} 
          color="text-white"
          delay={0.4}
        />
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Combat Logs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3 cyber-card p-6 cyber-border"
        >
          <div className="flex items-center justify-between mb-6 h-6">
            <h3 className="font-display text-sm uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-neon-blue" />
              Combat Logs <span className="text-[10px] text-gray-500 normal-case tracking-normal">(Registros de Combate)</span>
            </h3>
            <span className="text-[10px] font-mono text-neon-blue animate-pulse">Live Feed</span>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {data.recentActivity.map((log, i) => {
              const d = new Date(log.date);
              const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-neon-blue/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-gray-500">[{timeStr}]</span>
                    <span className="font-bold text-sm group-hover:text-neon-blue transition-colors">{log.player}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-gray-500 font-mono hidden sm:block">{log.respawn}</span>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold ${log.ks > 1 ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30' : 'bg-white/5 text-gray-400'}`}>
                      +{log.ks} KS
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 lg:col-span-2"
        >
          <div className="cyber-card p-6 cyber-border h-full">
            <h3 className="font-display text-sm uppercase tracking-widest mb-6 flex items-center gap-2 h-6">
              <Zap className="w-4 h-4 text-neon-purple" />
              Quick Actions <span className="text-[10px] text-gray-500 normal-case tracking-normal">(Ações Rápidas)</span>
            </h3>
            <div className="space-y-3">
              <button 
                onClick={onNewEntry}
                className="w-full group flex items-center gap-4 p-4 bg-neon-green/5 border border-neon-green/20 rounded-xl hover:border-neon-green hover:bg-neon-green/10 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center text-neon-green group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-display font-bold uppercase tracking-wider">Registro KS</p>
                  <p className="text-[9px] text-gray-500 uppercase">Register KS Data</p>
                </div>
              </button>

              <button 
                onClick={() => setShowSuggestForm(true)}
                className="w-full group flex items-center gap-4 p-3 bg-neon-blue/5 border border-neon-blue/20 rounded-xl hover:border-neon-blue hover:bg-neon-blue/10 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-neon-blue/20 flex items-center justify-center text-neon-blue group-hover:scale-110 transition-transform">
                  <Target className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-display font-bold uppercase tracking-wider">Sugerir Hunted</p>
                  <p className="text-[9px] text-gray-500 uppercase">Submit for analysis</p>
                </div>
              </button>

              <button className="w-full group flex items-center gap-4 p-4 bg-neon-purple/5 border border-neon-purple/20 rounded-xl transition-all opacity-70 cursor-not-allowed">
                <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center text-neon-purple">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-display font-bold uppercase tracking-wider">Time de KS</p>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 font-mono">COMING SOON</span>
                  </div>
                  <p className="text-[9px] text-neon-purple/50 uppercase">Under Construction...</p>
                </div>
              </button>

              <button className="w-full group flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl transition-all opacity-70 cursor-not-allowed">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                  <SkullIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-display font-bold uppercase tracking-wider">Black List</p>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 font-mono">COMING SOON</span>
                  </div>
                  <p className="text-[9px] text-red-500/50 uppercase">Under Construction...</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Intensity */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="cyber-card p-6 cyber-border"
        >
          <div className="flex justify-between items-center mb-8 h-6">
            <h3 className="font-display text-sm uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-neon-green" />
              Weekly Intensity <span className="text-[10px] text-gray-500 normal-case tracking-normal">(Intensidade Semanal)</span>
            </h3>
            <div className="text-right">
              <p className="text-xl font-mono font-bold text-neon-green">{totalWeeklyKS}</p>
              <p className="text-[8px] text-gray-500 uppercase tracking-widest">Total Weekly KS</p>
            </div>
          </div>
          <div className="flex items-end justify-between h-40 gap-2 px-2">
            {daysOfWeek.map((day, i) => {
              const count = data.weeklyDistribution[i] || 0;
              const height = maxWeekly > 0 ? (count / maxWeekly) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full">
                  <div className="relative w-full flex flex-col justify-end h-full bg-white/5 rounded-sm overflow-hidden">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, count > 0 ? 2 : 0)}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.05) }}
                      className={`w-full relative transition-colors duration-300 flex items-center justify-center ${
                        count === maxWeekly && count > 0
                          ? 'bg-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.6)]' 
                          : 'bg-neon-green/60 group-hover:bg-neon-green'
                      }`}
                    >
                      {count > 0 && (
                        <div className="text-[11px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10 z-10 text-white shadow-lg">
                          {count}
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">{day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Hotzones */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="cyber-card p-6 cyber-border"
        >
          <h3 className="font-display text-sm uppercase tracking-widest mb-8 flex items-center gap-2 h-6">
            <MapPin className="w-4 h-4 text-neon-blue" />
            Active Hotzones <span className="text-[10px] text-gray-500 normal-case tracking-normal">(Hotzones Ativas)</span>
          </h3>
          <div className="space-y-4">
            {data.topRespawns.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono uppercase">
                  <span className="text-gray-400">{item.name}</span>
                  <span className="text-neon-blue">{item.count} KS</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxRespawnCount) * 100}%` }}
                    transition={{ duration: 1, delay: 1 + (i * 0.1) }}
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Strike Windows (Heatmap) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="cyber-card p-6 cyber-border"
      >
        <div className="flex items-center justify-between mb-8 h-6">
          <h3 className="font-display text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-red-500 rounded-full" />
            STRIKE WINDOWS <span className="text-[10px] text-gray-500 normal-case tracking-normal">(Janelas de Ataque)</span>
          </h3>
        </div>
        
        <div className="flex items-end h-48 gap-1 mb-2">
          {Array.from({ length: 24 }).map((_, i) => {
            // Mock data to match the screenshot's general shape
            let count = 0;
            if (i === 0 || i === 1) count = 2;
            else if (i === 7) count = 2;
            else if (i === 8) count = 10; // Peak
            else if (i === 9) count = 3;
            else if (i === 10) count = 2;
            else if (i === 11 || i === 13) count = 7;
            else if (i === 12) count = 4;
            else if (i >= 14 && i <= 17) count = 3;
            else if (i === 20 || i === 22 || i === 23) count = 3;
            else if (i === 21) count = 2;
            
            const maxCount = 10;
            const height = (count / maxCount) * 100;
            const isPeak = count === maxCount;
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full">
                <div className="relative w-full flex flex-col justify-end h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, count > 0 ? 2 : 0)}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.02) }}
                    className={`w-full rounded-t-sm relative transition-all duration-300 ${
                      isPeak 
                        ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10' 
                        : count > 0 
                          ? 'bg-[#E52E2E] hover:bg-[#FF3333]' 
                          : 'bg-white/5'
                    }`}
                  >
                    {count > 0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 backdrop-blur-sm px-2 py-1 rounded border border-white/10 z-20 text-white shadow-lg">
                        {count} KS
                      </div>
                    )}
                  </motion.div>
                </div>
                <span className="text-[9px] font-mono text-gray-500">{i}h</span>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2E3A59]" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">LATE NIGHT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">NIGHT</span>
            <div className="w-2 h-2 rounded-full bg-[#4A1515]" />
          </div>
        </div>
      </motion.div>

      {/* Hunted Intelligence */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="cyber-card p-6 cyber-border border-red-500/20"
      >
        <div className="flex items-center justify-between mb-8 h-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">
              Target Intelligence <span className="text-xs text-gray-500 normal-case tracking-normal font-normal">(Inteligência de Alvos)</span>
            </h3>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-mono text-red-500 uppercase tracking-widest">Tactical Monitoring</p>
            <p className="text-[10px] text-gray-500 uppercase">Last 30 Days Activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {huntedIntel?.targets.slice(0, 6).map((target, i) => {
            const lastSeenDate = new Date(target.lastSeen);
            const diffDays = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));
            const isOnline = onlineStatus[target.name]?.isOnline;

            return (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 hover:border-red-500/40 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <Flame className={`w-4 h-4 ${target.count > 10 ? 'text-orange-500 animate-bounce' : 'text-gray-700'}`} />
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base group-hover:text-red-500 transition-colors">{target.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-neon-green animate-pulse shadow-[0_0_5px_#0aff0a]' : 'bg-gray-600'}`} />
                      <span className={`text-[10px] font-mono uppercase ${isOnline ? 'text-neon-green' : 'text-gray-600'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-white/5 rounded font-mono text-xs text-gray-400">x{target.count}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-black/40 rounded border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-mono">Peak Hour</p>
                    <p className="text-xs font-mono font-bold text-red-400">{target.peakHour}</p>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-mono">Last Seen</p>
                    <p className="text-xs font-mono font-bold text-neon-green">{diffDays === 0 ? 'TODAY' : `${diffDays}D AGO`}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">Top Locations</p>
                  {target.topLocations.slice(0, 2).map((loc, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-mono p-1.5 bg-black/20 rounded border border-white/5">
                      <span className="text-gray-400 truncate max-w-[100px]">{loc.name}</span>
                      <span className="text-neon-blue">{loc.count}x</span>
                    </div>
                  ))}
                </div>

                {/* API Deaths Section */}
                {onlineStatus[target.name]?.recentDeaths && onlineStatus[target.name].recentDeaths!.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <p className="text-[10px] text-red-500 uppercase font-mono tracking-widest flex items-center gap-1">
                      <SkullIcon className="w-2.5 h-2.5" /> Recent Deaths (API)
                    </p>
                    <div className="space-y-1">
                      {onlineStatus[target.name].recentDeaths?.map((death, idx) => (
                        <div key={idx} className={`p-1.5 rounded border text-[10px] font-mono leading-tight ${death.isMonsterDeath ? 'bg-orange-500/10 border-orange-500/30' : 'bg-red-500/5 border-red-500/10'}`}>
                          <div className="flex justify-between text-gray-500 mb-0.5">
                            <span className={death.isMonsterDeath ? 'text-orange-400' : ''}>
                              {death.isMonsterDeath ? 'MONSTER DEATH' : `LVL ${death.level}`}
                            </span>
                            <span>{new Date(death.time).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <p className={`${death.isMonsterDeath ? 'text-orange-300/80' : 'text-red-400/80'} italic line-clamp-2`}>{death.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; subValue?: string; color: string; delay: number }> = ({ icon, label, value, subValue, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="cyber-card p-6 cyber-border group"
  >
    <div className={`mb-4 ${color} pl-1 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
    <h4 className={`text-2xl font-display font-black text-white group-hover:text-white transition-colors`}>{value}</h4>
    {subValue && <p className="text-[9px] text-gray-600 mt-1 uppercase font-mono">{subValue}</p>}
  </motion.div>
);
