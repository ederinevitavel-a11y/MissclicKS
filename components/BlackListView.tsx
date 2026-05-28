import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, User, Clock, Flame, Zap, ArrowLeft, Search } from 'lucide-react';
import { fetchCharacterStatus, CharacterStatus } from '../services/tibiaDataService';

interface BlackListViewProps {
  onBack: () => void;
}

const BLACKLIST_NAMES = [
  "Denari Dakis",
  "Vy Canis Majoris",
  "Huitzilopotzli",
  "Dede Granger",
  "Kip Fraga Feru",
  "Laddyziinha",
  "Main Warwick",
  "Isabel",
  "Capistrano",
  "Emilly Candy",
  "Bonjandom Vopel",
  "Ra fhael",
  "Hatred Belial",
  "Vann Insane",
  "Leandrin Predator",
  "Moianof",
  "Capistrano Implacavel",
  "bomba baguncinha"
];

export const BlackListView: React.FC<BlackListViewProps> = ({ onBack }) => {
  const [statuses, setStatuses] = useState<Record<string, CharacterStatus>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllStatuses = async () => {
      setLoading(true);
      const results = await Promise.all(
        BLACKLIST_NAMES.map(async (name) => ({
          name,
          status: await fetchCharacterStatus(name)
        }))
      );
      const newStatuses: Record<string, CharacterStatus> = {};
      results.forEach(r => { newStatuses[r.name] = r.status; });
      setStatuses(newStatuses);
      setLoading(false);
    };

    fetchAllStatuses();
    const interval = setInterval(fetchAllStatuses, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredNames = BLACKLIST_NAMES.filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-display uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3 text-neon-blue" /> Voltar para o Painel
        </button>
        
        <div className="relative group w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
          <input 
            type="text"
            placeholder="Filtrar Black List..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-white outline-none focus:border-neon-blue transition-all"
          />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-8 cyber-border border-red-500/30 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter">Banned Operators</h3>
            <p className="text-[10px] font-mono text-red-500/70 uppercase tracking-[0.2em]">Black List // Permanent Mitigation Targets</p>
          </div>
        </div>

        {loading && Object.keys(statuses).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Scanning Network Status...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNames.map((name, i) => {
              const status = statuses[name];
              const isOnline = status?.isOnline;
              
              const isMaxThreat = ["Capistrano Implacavel", "Leandrin Predator", "Capistrano"].includes(name);
              
              return (
                <motion.div 
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-black/40 border rounded-xl p-4 transition-all group relative overflow-hidden ${isMaxThreat ? 'border-red-500/20 hover:border-red-500/40' : 'border-white/5 hover:border-orange-500/40'}`}
                >
                  {isOnline && (
                    <div className={`absolute top-0 right-0 w-16 h-16 blur-xl rounded-full -mr-8 -mt-8 ${isMaxThreat ? 'bg-red-500/10' : 'bg-neon-green/5'}`} />
                  )}
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${isOnline ? 'bg-neon-green/10 border-neon-green/30 text-neon-green shadow-[0_0_10px_rgba(10,255,10,0.2)]' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm tracking-tight transition-colors uppercase ${isMaxThreat ? 'group-hover:text-red-500' : 'group-hover:text-orange-500'}`}>{name}</h4>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-neon-green animate-pulse' : 'bg-gray-600'}`} />
                          <span className={`text-[8px] font-mono uppercase ${isOnline ? 'text-neon-green' : 'text-gray-600'}`}>
                            {isOnline ? 'Critical Awareness' : 'Deep Sleep'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="p-2 bg-white/5 rounded border border-white/5 text-center">
                      <p className="text-[8px] text-gray-500 uppercase mb-1">Last Seen</p>
                      <p className="text-[10px] font-mono font-bold text-gray-300">
                        {status?.lastLogin ? new Date(status.lastLogin).toLocaleDateString('pt-BR') : '??/??'}
                      </p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border border-white/5 text-center">
                      <p className="text-[8px] text-gray-500 uppercase mb-1">Threat Lvl</p>
                      <p className={`text-[10px] font-mono font-bold ${isMaxThreat ? 'text-red-500' : 'text-orange-500'}`}>
                        {isMaxThreat ? 'MAX' : 'HIGH'}
                      </p>
                    </div>
                  </div>

                  {status?.level && (
                    <div className="mt-3 text-[9px] font-mono text-gray-500 flex justify-between items-center px-1">
                      <span>LVL {status.level}</span>
                      <span className="truncate max-w-[100px]">{status.vocation}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filteredNames.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <p className="text-sm font-display text-gray-600 uppercase tracking-[0.2em]">No Matches Found in Protocol</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
