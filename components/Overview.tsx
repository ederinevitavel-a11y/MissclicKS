import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { OverviewData, RawDataRow } from '../types';
import { SkullIcon } from './NeonIcons';
import { fetchCharacterStatus, fetchWorldOnlinePlayers, CharacterStatus } from '../services/tibiaDataService';
import { SuggestHuntedForm } from './SuggestHuntedForm';
import { formatPlayerName } from '../services/csvService';
import { Activity, Target, Zap, TrendingUp, MapPin, ShieldAlert, Terminal, Clock, Flame, Plus, Users, Eye, MapPinned, BarChart3, Scan, Crosshair, Search, Radio, AlertTriangle, Copy, Check, Skull, BellRing, Sparkles, AlertCircle } from 'lucide-react';

interface OverviewProps {
  data: OverviewData;
  rawData?: RawDataRow[];
  onBackToIntelligence: () => void;
  onNewEntry: () => void;
  onJoinTeam: () => void;
  onOpenBlackList: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ data, rawData, onBackToIntelligence, onNewEntry, onJoinTeam, onOpenBlackList }) => {
  const [onlineStatus, setOnlineStatus] = useState<Record<string, CharacterStatus>>({});
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [searchHunted, setSearchHunted] = useState('');

  const weeklyDistribution = data?.weeklyDistribution || [];
  const maxWeekly = Math.max(...(weeklyDistribution.length > 0 ? weeklyDistribution : [1]), 1);
  const totalWeeklyKS = weeklyDistribution.reduce((a, b) => a + b, 0);
  const topRespawns = data?.topRespawns || [];
  const maxRespawnCount = Math.max(...(topRespawns.length > 0 ? topRespawns.map(r => r.count) : [1]), 1);
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const huntedIntel = data?.huntedIntel;
  const now = new Date();

  // Hunteds ordenados: JOGADORES ONLINE PRIMEIRO, depois por quantidade de KS sofridos
  const sortedTargets = useMemo(() => {
    const list = (huntedIntel?.targets || []).filter(t => 
      t.name.toLowerCase().includes(searchHunted.toLowerCase().trim())
    );

    return [...list].sort((a, b) => {
      const aStatus = onlineStatus[a.name] || onlineStatus[a.name.toLowerCase()];
      const bStatus = onlineStatus[b.name] || onlineStatus[b.name.toLowerCase()];
      const aOnline = aStatus?.isOnline ? 1 : 0;
      const bOnline = bStatus?.isOnline ? 1 : 0;
      if (bOnline !== aOnline) {
        return bOnline - aOnline; // ONLINE APARECE PRIMEIRO
      }
      return b.count - a.count; // Em caso de empate, ordena por mais KS
    });
  }, [huntedIntel?.targets, searchHunted, onlineStatus]);

  // Contagem de hunteds online em tempo real
  const onlineHuntedsCount = useMemo(() => {
    return (huntedIntel?.targets || []).filter(t => {
      const st = onlineStatus[t.name] || onlineStatus[t.name.toLowerCase()];
      return st?.isOnline;
    }).length;
  }, [huntedIntel?.targets, onlineStatus]);

  // Lista de kszeiros únicos do KS ordenados por pontos
  const uniqueCombatants = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    const map = new Map<string, { name: string; totalKS: number; count: number }>();
    rawData.forEach(r => {
      const p = (r.player || '').trim();
      if (!p) return;
      const formatted = formatPlayerName(p);
      const key = formatted.toLowerCase();
      const curr = map.get(key) || { name: formatted, totalKS: 0, count: 0 };
      curr.totalKS += r.ks || 1;
      curr.count += 1;
      map.set(key, curr);
    });
    return Array.from(map.values()).sort((a, b) => b.totalKS - a.totalKS);
  }, [rawData]);

  const [selectedCombatant, setSelectedCombatant] = useState<string>('');
  const [combatantSearchQuery, setCombatantSearchQuery] = useState<string>('');

  // Define o kszeiro padrão inicial
  useEffect(() => {
    if (!selectedCombatant && uniqueCombatants.length > 0) {
      setSelectedCombatant(uniqueCombatants[0].name);
    }
  }, [uniqueCombatants, selectedCombatant]);

  // Lista filtrada para sugestões / busca
  const filteredCombatantList = useMemo(() => {
    if (!combatantSearchQuery.trim()) return uniqueCombatants;
    const query = combatantSearchQuery.toLowerCase().trim();
    return uniqueCombatants.filter(c => c.name.toLowerCase().includes(query));
  }, [uniqueCombatants, combatantSearchQuery]);

  // Estatísticas completas do kszeiro selecionado
  const combatantDetails = useMemo(() => {
    const targetPlayer = selectedCombatant || (uniqueCombatants[0]?.name ?? '');
    if (!targetPlayer || !rawData || rawData.length === 0) return null;

    const targetLower = targetPlayer.toLowerCase().trim();
    const rows = rawData.filter(r => (r.player || '').trim().toLowerCase() === targetLower);
    if (rows.length === 0) return null;

    let totalKS = 0;
    let ptKSCount = 0;
    let soloKSCount = 0;
    const huntedMap = new Map<string, number>();
    const respawnMap = new Map<string, number>();
    let latestActivity: Date | null = null;
    const hourDist = new Array(24).fill(0);

    rows.forEach(r => {
      const points = r.ks || 1;
      totalKS += points;

      const isPT = points === 2;
      if (isPT) ptKSCount += points; else soloKSCount += points;

      // Alvo / Hunted
      const hName = (r.huntedName || '').trim();
      if (hName) {
        const cleanH = formatPlayerName(hName);
        huntedMap.set(cleanH, (huntedMap.get(cleanH) || 0) + points);
      }

      // Respawn
      const rName = (r.respawn || '').trim();
      if (rName) {
        respawnMap.set(rName, (respawnMap.get(rName) || 0) + points);
      }

      // Data de atividade
      const d = new Date(r.date);
      if (!isNaN(d.getTime())) {
        if (!latestActivity || d > latestActivity) latestActivity = d;
        hourDist[d.getHours()] += points;
      }
    });

    const topHunteds = Array.from(huntedMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const topRespawns = Array.from(respawnMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    let peakHour = 0;
    let maxHourPoints = 0;
    hourDist.forEach((pts, hr) => {
      if (pts > maxHourPoints) {
        maxHourPoints = pts;
        peakHour = hr;
      }
    });

    const maxHuntedCount = Math.max(...(topHunteds.length > 0 ? topHunteds.map(h => h.count) : [1]), 1);
    const maxRespawnCount = Math.max(...(topRespawns.length > 0 ? topRespawns.map(r => r.count) : [1]), 1);

    return {
      name: targetPlayer,
      totalKS,
      actionsCount: rows.length,
      ptKSCount,
      soloKSCount,
      latestActivity,
      peakHourFormatted: `${peakHour.toString().padStart(2, '0')}:00h`,
      topHunteds,
      topRespawns,
      maxHuntedCount,
      maxRespawnCount
    };
  }, [selectedCombatant, rawData, uniqueCombatants]);

  useEffect(() => {
    if (!huntedIntel?.targets) return;

    let isMounted = true;
    const updateStatus = async () => {
      try {
        // 1. Busca lista global de jogadores online em Kalibra (1 requisição instantânea para todos)
        const worldOnlineMap = await fetchWorldOnlinePlayers('Kalibra');
        if (!isMounted) return;

        // 2. Busca detalhes aprofundados (mortes recentes, vocação) dos alvos prioritários
        const priorityTargets = huntedIntel.targets.slice(0, 15);
        const detailedResults = await Promise.all(
          priorityTargets.map(async (target) => ({
            name: target.name,
            status: await fetchCharacterStatus(target.name)
          }))
        );

        if (!isMounted) return;

        setOnlineStatus(prev => {
          const merged: Record<string, CharacterStatus> = { ...worldOnlineMap, ...prev };
          detailedResults.forEach(r => {
            const current = merged[r.name] || merged[r.name.toLowerCase()] || {};
            merged[r.name] = { ...current, ...r.status };
            merged[r.name.toLowerCase()] = merged[r.name];
          });
          return merged;
        });
      } catch (err) {
        console.warn("Erro ao atualizar status dos alvos:", err);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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
        {/* Activity Streaks - Full Width */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-5 cyber-card p-6 cyber-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm uppercase tracking-widest flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Activity Streaks <span className="text-[10px] text-gray-500 normal-case tracking-normal">(Sequência de Atividade)</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {data.activityStreaks.map((streak, i) => (
              <div key={i} className="flex flex-col p-3 bg-white/5 rounded border border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:opacity-100 transition-opacity">
                   <Flame className="w-8 h-8 text-orange-500" />
                 </div>
                 <div className="flex items-center gap-2 mb-2 z-10">
                   <span className="text-orange-500/50 font-mono font-bold text-xs">#{i+1}</span>
                   <span className="text-sm font-black text-white group-hover:text-orange-400 transition-colors uppercase tracking-wider">{streak.name}</span>
                 </div>
                 <div className="z-10 mt-auto">
                   <div className="text-orange-500 font-mono font-bold text-lg leading-none">
                     {streak.streak} <span className="text-[10px] text-gray-500 font-normal">DAYS</span>
                   </div>
                   <div className="text-[8px] text-gray-600 uppercase tracking-wider mt-1">Last: {new Date(streak.lastActive).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                 </div>
              </div>
            ))}
            {data.activityStreaks.length === 0 && (
              <p className="col-span-full text-xs text-gray-500 font-mono text-center py-4">No active streaks recorded.</p>
            )}
          </div>
        </motion.div>

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
              const dateStr = !isNaN(d.getTime()) 
                ? `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}` 
                : '';
              const timeStr = !isNaN(d.getTime()) 
                ? `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` 
                : '';
              const displayTime = dateStr ? `[${dateStr} ${timeStr}]` : '';
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-neon-blue/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap">{displayTime}</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="font-bold text-sm group-hover:text-neon-blue transition-colors">{log.player}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">⚔️</span>
                      <span className="text-sm font-semibold text-zinc-300">{log.huntedName || 'Hunted'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-[10px] text-gray-500 font-mono hidden sm:block">{log.respawn}</span>
                    {log.isPT && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-neon-purple/20 text-neon-purple border border-neon-purple/40 tracking-wider">
                        PT
                      </span>
                    )}
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
                className="w-full group flex flex-col items-start p-4 bg-neon-green/5 border border-neon-green/20 rounded-xl hover:border-neon-green hover:bg-neon-green/10 transition-all text-left"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center text-neon-green group-hover:scale-110 transition-transform shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-display font-bold uppercase tracking-wider text-white">Registro KS</p>
                      <span className="text-[9px] font-mono text-neon-green bg-neon-green/10 px-2 py-0.5 rounded border border-neon-green/20">Novo</span>
                    </div>
                    <p className="text-[9px] text-gray-500 uppercase">Preenchimento de KS & Coluna K</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 w-full grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                  <span className="text-gray-400">• <strong className="text-white">Solo:</strong> normal</span>
                  <span className="text-amber-300">• <strong className="text-white">TC:</strong> Tancando hunt</span>
                  <span className="text-emerald-300">• <strong className="text-white">LC:</strong> Localizou hunted</span>
                  <span className="text-neon-purple">• <strong className="text-white">PT:</strong> KS Party (2 pts)</span>
                </div>
              </button>

              <button 
                onClick={() => setShowSuggestForm(true)}
                className="w-full group flex items-center gap-4 p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-xl hover:border-neon-blue hover:bg-neon-blue/10 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-neon-blue/20 flex items-center justify-center text-neon-blue group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-display font-bold uppercase tracking-wider">Sugerir Hunted</p>
                  <p className="text-[9px] text-gray-500 uppercase">Submit for analysis</p>
                </div>
              </button>

              <button 
                onClick={onJoinTeam}
                className="w-full group flex items-center gap-4 p-4 bg-neon-purple/5 border border-neon-purple/20 rounded-xl hover:border-neon-purple hover:bg-neon-purple/10 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center text-neon-purple group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-display font-bold uppercase tracking-wider">Time de KS</p>
                  <p className="text-[9px] text-gray-500 uppercase">Join the Elite Squad</p>
                </div>
              </button>

              <button 
                onClick={onOpenBlackList}
                className="w-full group flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl hover:border-red-500 hover:bg-red-500/10 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <SkullIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-display font-bold uppercase tracking-wider">Black List</p>
                  <p className="text-[9px] text-red-500/70 uppercase">Tactical Mitigation</p>
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
              <p className="text-[8px] text-gray-500 uppercase tracking-widest flex items-center justify-end gap-1">
                <BarChart3 className="w-3 h-3" /> Total Weekly KS
              </p>
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
            <Clock className="w-4 h-4 text-red-500" />
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

      {/* Card Visão KS (Kszeiros) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.88 }}
        className="cyber-card p-6 md:p-8 cyber-border border-neon-blue/30 relative overflow-hidden bg-gradient-to-br from-neon-blue/5 via-black to-black"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-neon-blue/10 blur-[130px] rounded-full -mr-32 -mt-32 pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neon-blue/20 border border-neon-blue/40 rounded-xl flex items-center justify-center text-neon-blue shadow-[0_0_25px_rgba(0,243,255,0.25)]">
              <Crosshair className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight">
                  Visão KS
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neon-blue/10 border border-neon-blue/30 text-neon-blue uppercase tracking-widest">
                  Individual Intel
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-400">
                Filtre por qualquer kszeiro do KS para analisar seus alvos mais frequentes e respawns dominados
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-fit">
            <Users className="w-4 h-4 text-neon-blue" />
            <span>{uniqueCombatants.length} Kszeiros Registrados</span>
          </div>
        </div>

        {/* Search & Selection Controls */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Input with Search Icon */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-blue" />
              <input
                type="text"
                value={combatantSearchQuery}
                onChange={(e) => setCombatantSearchQuery(e.target.value)}
                placeholder="Pesquisar kszeiro do KS pelo nome (ex: Prezord, Alis Mell)..."
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-neon-blue transition-all"
              />
              {combatantSearchQuery && (
                <button
                  onClick={() => setCombatantSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Dropdown select */}
            <select
              value={selectedCombatant}
              onChange={(e) => {
                setSelectedCombatant(e.target.value);
                setCombatantSearchQuery('');
              }}
              className="bg-black/80 border border-white/15 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white font-mono outline-none focus:border-neon-blue transition-all cursor-pointer"
            >
              {uniqueCombatants.map(c => (
                <option key={c.name} value={c.name} className="bg-neutral-900 text-white">
                  {c.name} ({c.totalKS} KS)
                </option>
              ))}
            </select>
          </div>

          {/* Quick Select Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mr-1">Sugestões rápidas:</span>
            {filteredCombatantList.slice(0, 6).map(c => {
              const isSelected = selectedCombatant.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedCombatant(c.name);
                    setCombatantSearchQuery('');
                  }}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-neon-blue/20 border-neon-blue text-white shadow-[0_0_10px_rgba(0,243,255,0.3)]' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {c.name} <span className="opacity-60 text-[9px]">({c.totalKS})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Combatant Stats Card */}
        {combatantDetails ? (
          <div className="space-y-6">
            {/* Operator Header Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/40 flex items-center justify-center font-display font-black text-xl text-white shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                  {combatantDetails.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold font-display uppercase tracking-tight text-white">
                      {combatantDetails.name}
                    </h4>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neon-green/10 border border-neon-green/30 text-neon-green uppercase font-bold">
                      Ativo no KS
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">
                    {combatantDetails.actionsCount} ações registradas • Último KS: {combatantDetails.latestActivity ? new Date(combatantDetails.latestActivity).toLocaleDateString('pt-BR') : 'Recente'}
                  </p>
                </div>
              </div>

              {/* Badges / Metrics Row - Pontuação Geral */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-black/50 border border-neon-blue/30 rounded-xl text-center shadow-[0_0_15px_rgba(0,243,255,0.1)]">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block">Pontuação Geral</span>
                  <span className="text-xl font-display font-black text-neon-blue">{combatantDetails.totalKS} <span className="text-xs font-mono font-normal">KS</span></span>
                </div>
                <div className="p-2.5 bg-black/50 border border-white/10 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-gray-500 uppercase block">Total de Ações</span>
                  <span className="text-xl font-display font-black text-white">{combatantDetails.actionsCount}</span>
                </div>
                <div className="p-2.5 bg-black/50 border border-white/10 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-gray-500 uppercase block">Média / Registro</span>
                  <span className="text-xl font-display font-black text-neon-purple">
                    {(combatantDetails.totalKS / (combatantDetails.actionsCount || 1)).toFixed(1)}
                  </span>
                </div>
                <div className="p-2.5 bg-black/50 border border-white/10 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-gray-500 uppercase block">Hora de Pico</span>
                  <span className="text-xl font-display font-black text-red-400">{combatantDetails.peakHourFormatted}</span>
                </div>
              </div>
            </div>

            {/* Top 3 Hunteds & Top 3 Respawns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top 3 Hunteds Card */}
              <div className="bg-black/50 border border-red-500/20 rounded-2xl p-5 space-y-4 hover:border-red-500/40 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500 animate-pulse" />
                    <div>
                      <h5 className="font-display font-black text-sm text-white uppercase tracking-tight">
                        Top 3 Hunteds Mais Caçados
                      </h5>
                      <span className="text-[10px] font-mono text-gray-500">
                        Alvos que mais sofreram KS deste kszeiro
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-red-400 font-bold">ALVOS</span>
                </div>

                <div className="space-y-3">
                  {combatantDetails.topHunteds.length > 0 ? (
                    combatantDetails.topHunteds.map((hunted, idx) => {
                      const medalColors = ['text-yellow-400 border-yellow-400/40 bg-yellow-400/10', 'text-gray-300 border-gray-400/40 bg-gray-400/10', 'text-amber-500 border-amber-600/40 bg-amber-600/10'];
                      const percentage = Math.round((hunted.count / combatantDetails.totalKS) * 100);

                      return (
                        <div key={hunted.name} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 hover:border-red-500/30 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-6 h-6 rounded-lg border font-mono font-bold text-xs flex items-center justify-center ${medalColors[idx] || 'text-gray-400 border-white/10'}`}>
                                #{idx + 1}
                              </span>
                              <span className="font-mono font-bold text-sm text-white tracking-wide">
                                {hunted.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-display font-black text-red-400">{hunted.count} KS</span>
                              <span className="text-[9px] font-mono text-gray-500 block">{percentage}% do total</span>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-700"
                              style={{ width: `${(hunted.count / combatantDetails.maxHuntedCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs font-mono text-gray-500">
                      Nenhum alvo específico catalogado para este kszeiro.
                    </div>
                  )}
                </div>
              </div>

              {/* Top 3 Respawns Card */}
              <div className="bg-black/50 border border-neon-blue/20 rounded-2xl p-5 space-y-4 hover:border-neon-blue/40 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-neon-blue animate-pulse" />
                    <div>
                      <h5 className="font-display font-black text-sm text-white uppercase tracking-tight">
                        Top 3 Respawns
                      </h5>
                      <span className="text-[10px] font-mono text-gray-500">
                        Locais onde mais registrou ações de KS
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neon-blue font-bold">SPAWNS</span>
                </div>

                <div className="space-y-3">
                  {combatantDetails.topRespawns.length > 0 ? (
                    combatantDetails.topRespawns.map((respawn, idx) => {
                      const medalColors = ['text-neon-blue border-neon-blue/40 bg-neon-blue/10', 'text-neon-purple border-neon-purple/40 bg-neon-purple/10', 'text-neon-green border-neon-green/40 bg-neon-green/10'];
                      const percentage = Math.round((respawn.count / combatantDetails.totalKS) * 100);

                      return (
                        <div key={respawn.name} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 hover:border-neon-blue/30 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-6 h-6 rounded-lg border font-mono font-bold text-xs flex items-center justify-center ${medalColors[idx] || 'text-gray-400 border-white/10'}`}>
                                #{idx + 1}
                              </span>
                              <span className="font-mono font-bold text-sm text-white tracking-wide">
                                {respawn.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-display font-black text-neon-blue">{respawn.count} KS</span>
                              <span className="text-[9px] font-mono text-gray-500 block">{percentage}% do total</span>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full transition-all duration-700"
                              style={{ width: `${(respawn.count / combatantDetails.maxRespawnCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs font-mono text-gray-500">
                      Nenhum respawn catalogado para este kszeiro.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl text-xs font-mono text-gray-500">
            Nenhum kszeiro selecionado ou sem registros disponíveis.
          </div>
        )}
      </motion.div>

      {/* Target Intelligence */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="cyber-card p-6 cyber-border border-red-500/20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">
                  Target Intelligence <span className="text-xs text-gray-500 normal-case tracking-normal font-normal">(Inteligência de Alvos)</span>
                </h3>
                {onlineHuntedsCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-green/10 border border-neon-green/30 text-neon-green font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                    {onlineHuntedsCount} Online
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-gray-400">
                Alvos ordenados por prioridade tática: <span className="text-neon-green font-bold">Jogadores Online Primeiro</span>
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right hidden sm:block">
            <p className="text-xs font-mono text-red-500 uppercase tracking-widest flex items-center justify-end gap-1">
              <Scan className="w-3 h-3" /> Tactical Monitoring
            </p>
            <p className="text-[10px] text-gray-500 uppercase">Last 30 Days Activity</p>
          </div>
        </div>

        {/* Search Filter Bar */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={searchHunted}
            onChange={(e) => setSearchHunted(e.target.value)}
            placeholder="Pesquisar hunted por nome (ex: Alvo, Guilda)..."
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-all shadow-inner"
          />
          {searchHunted && (
            <button
              onClick={() => setSearchHunted('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-mono text-gray-500 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTargets.map((target, i) => {
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
                    <p className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" /> Peak Hour
                    </p>
                    <p className="text-xs font-mono font-bold text-red-400">{target.peakHour}</p>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-mono flex items-center gap-1 mb-1">
                      <Eye className="w-3 h-3" /> Last Seen
                    </p>
                    <p className="text-xs font-mono font-bold text-neon-green">{diffDays === 0 ? 'TODAY' : `${diffDays}D AGO`}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest flex items-center gap-1">
                    <MapPinned className="w-3 h-3" /> Top Locations
                  </p>
                  {target.topLocations.slice(0, 2).map((loc, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-mono p-1.5 bg-black/20 rounded border border-white/5">
                      <span className="text-gray-400 truncate max-w-[100px]">{loc.name}</span>
                      <span className="text-neon-blue">{loc.count}x</span>
                    </div>
                  ))}
                </div>

                {/* Nemesis Section */}
                <div className="mt-3 pt-3 border-t border-white/5">
                   <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-1 flex items-center gap-1">
                     <SkullIcon className="w-3 h-3 text-red-500" /> Nemesis
                   </p>
                   <div className="space-y-1">
                     {target.nemesis.length > 0 ? (
                       target.nemesis.map((nemesis, idx) => (
                         <div key={idx} className="flex justify-between items-center bg-red-500/5 border border-red-500/10 rounded p-1.5 hover:bg-red-500/10 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-red-500/50 w-3">{idx + 1}.</span>
                              <span className="text-xs font-bold text-red-400 truncate max-w-[100px]">{nemesis.name}</span>
                            </div>
                            <span className="text-xs font-mono text-red-500 font-bold">{nemesis.kills} KS</span>
                         </div>
                       ))
                     ) : (
                       <div className="text-[10px] text-gray-500 font-mono italic p-1">No data</div>
                     )}
                   </div>
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
