
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OverviewData } from '../types';
import { fetchCharacterStatus, CharacterStatus } from '../services/tibiaDataService';
import { 
  Target, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Terminal, 
  Flame, 
  Search, 
  ChevronRight, 
  Activity,
  Crosshair,
  User,
  Sword,
  History
} from 'lucide-react';

interface HuntedIntelligenceProps {
  data: OverviewData;
}

export const HuntedIntelligence: React.FC<HuntedIntelligenceProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<Record<string, CharacterStatus>>({});
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({});

  const huntedIntel = data.huntedIntel;
  const targets = huntedIntel?.targets || [];
  
  const filteredTargets = targets.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchStatus = async (name: string) => {
    if (loadingStatus[name]) return;
    setLoadingStatus(prev => ({ ...prev, [name]: true }));
    try {
      const status = await fetchCharacterStatus(name);
      setTargetStatus(prev => ({ ...prev, [name]: status }));
    } finally {
      setLoadingStatus(prev => ({ ...prev, [name]: false }));
    }
  };

  useEffect(() => {
    // Fetch status for top 5 targets initially
    const top5 = targets.slice(0, 5);
    top5.forEach(t => fetchStatus(t.name));
  }, [targets.length]);

  const maxHuntedActivity = Math.max(...(huntedIntel?.timeDistribution || [1]), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700 shadow-inner">
            <ShieldAlert className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Tactical Dossier</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Hunted Intelligence & Pattern Analysis</p>
          </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Target..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-zinc-600 transition-all w-full md:w-64 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Aggregated Strike Windows */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xs uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Global Strike Windows
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-end justify-between h-32 gap-1">
                {huntedIntel?.timeDistribution.map((count, i) => {
                  const height = (count / maxHuntedActivity) * 100;
                  return (
                    <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className={`w-full rounded-t-[1px] transition-all duration-500 ${
                          count === maxHuntedActivity 
                            ? 'bg-zinc-200 shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                            : 'bg-zinc-700 group-hover:bg-zinc-500'
                        }`}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                        {i}:00 - {count} Sightings
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] font-mono text-zinc-600 uppercase tracking-widest pt-2">
                <span>00:00</span>
                <span>12:00</span>
                <span>23:00</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono leading-relaxed mt-4 border-t border-zinc-800 pt-4">
                Aggregated data from the last 30 days indicates peak activity periods for all targets. Use this to coordinate strikes.
              </p>
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50">
              <p className="text-[8px] text-zinc-500 uppercase font-mono mb-1">Active Targets</p>
              <p className="text-xl font-display font-bold text-white">{targets.length}</p>
            </div>
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50">
              <p className="text-[8px] text-zinc-500 uppercase font-mono mb-1">Total Sightings</p>
              <p className="text-xl font-display font-bold text-white">
                {targets.reduce((acc, t) => acc + t.count, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Individual Target Analysis */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-xs uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Active Targets (30D)
            </h3>
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Sorted by Priority</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTargets.map((target, i) => {
              const status = targetStatus[target.name];
              const isLoading = loadingStatus[target.name];
              const isSelected = selectedTarget === target.name;

              return (
                <motion.div 
                  key={target.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedTarget(isSelected ? null : target.name)}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'bg-zinc-800 border-zinc-600 shadow-2xl' 
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  } border rounded-2xl p-5 overflow-hidden`}
                >
                  {/* Priority Indicator */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    target.count > 10 ? 'bg-red-500' : target.count > 5 ? 'bg-orange-500' : 'bg-zinc-700'
                  }`} />

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800 ${
                        status?.isOnline ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : ''
                      }`}>
                        <User className={`w-5 h-5 ${status?.isOnline ? 'text-green-500' : 'text-zinc-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-zinc-200 transition-colors">{target.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${status?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
                          <span className={`text-[8px] font-mono uppercase ${status?.isOnline ? 'text-green-500' : 'text-zinc-600'}`}>
                            {isLoading ? 'Scanning...' : status?.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-display font-black text-zinc-700 group-hover:text-zinc-500 transition-colors">#{i + 1}</div>
                      <div className="text-[8px] font-mono text-zinc-600 uppercase">Priority</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span className="text-[8px] text-zinc-500 uppercase font-mono">Peak Time</span>
                      </div>
                      <p className="text-xs font-mono font-bold text-zinc-300">{target.peakHour}</p>
                    </div>
                    <div className="bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Activity className="w-3 h-3 text-zinc-500" />
                        <span className="text-[8px] text-zinc-500 uppercase font-mono">Sightings</span>
                      </div>
                      <p className="text-xs font-mono font-bold text-zinc-300">{target.count} Records</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-zinc-800 pt-4 mt-4 space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[8px] text-zinc-500 uppercase font-mono">Vocation</p>
                            <p className="text-[10px] text-zinc-300 font-bold">{status?.vocation || 'Unknown'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] text-zinc-500 uppercase font-mono">Level</p>
                            <p className="text-[10px] text-zinc-300 font-bold">{status?.level || '???'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] text-zinc-500 uppercase font-mono">Guild</p>
                            <p className="text-[10px] text-zinc-300 font-bold">{status?.guild?.name || 'None'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] text-zinc-500 uppercase font-mono">Last Login</p>
                            <p className="text-[10px] text-zinc-300 font-bold">
                              {status?.lastLogin ? new Date(status.lastLogin).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[8px] text-zinc-500 uppercase font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Top Locations
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {target.topLocations.map((loc, idx) => (
                              <span key={idx} className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[9px] font-mono text-zinc-400">
                                {loc.name} ({loc.count})
                              </span>
                            ))}
                          </div>
                        </div>

                        {status?.recentDeaths && status.recentDeaths.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[8px] text-zinc-500 uppercase font-mono flex items-center gap-1">
                              <Sword className="w-3 h-3" />
                              Recent Casualties
                            </p>
                            <div className="space-y-1">
                              {status.recentDeaths.map((death, idx) => (
                                <div key={idx} className="p-2 bg-red-500/5 border border-red-500/10 rounded text-[9px] font-mono text-zinc-400 flex justify-between">
                                  <span>{death.reason}</span>
                                  <span className="text-red-400">Lvl {death.level}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchStatus(target.name);
                          }}
                          className="w-full py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-[10px] font-mono uppercase text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <History className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                          Refresh Intel
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isSelected && (
                    <div className="flex justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; delay: number }> = ({ icon, label, value, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/50 group"
  >
    <div className={`mb-4 ${color} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1 font-mono">{label}</p>
    <h4 className="text-2xl font-display font-black text-white">{value}</h4>
  </motion.div>
);
