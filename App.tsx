import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Podium } from './components/Podium';
import { RankingList } from './components/RankingList';
import { Overview } from './components/Overview';
import { LegendsView } from './components/LegendsView'; 
import { KSRegistrationForm } from './components/KSRegistrationForm';
import { JoinKSTeamForm } from './components/JoinKSTeamForm';
import { aggregateData, fetchAndParseData, getOverviewStats } from './services/csvService';
import { RankedPlayer, RawDataRow, TimeFrame, OverviewData } from './types';
import { RefreshCw, LayoutDashboard, Trophy, Shield, Terminal, Skull, Sword } from 'lucide-react';
import { CrosshairIcon } from './components/NeonIcons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('DADOS_STATS');
  const [dadosSubTab, setDadosSubTab] = useState<string>(TimeFrame.OVERVIEW);
  const [ksSubTab, setKsSubTab] = useState<TimeFrame>(TimeFrame.DAILY);
  const [rawData, setRawData] = useState<RawDataRow[]>([]);
  const [rankedPlayers, setRankedPlayers] = useState<RankedPlayer[]>([]);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const data = await fetchAndParseData();
      if (data.length === 0) {
        setError("A planilha foi lida, mas não encontramos dados válidos.");
      } else {
        setRawData(data);
        setOverviewData(getOverviewStats(data));
        if (activeTab === 'KS_RANKING') {
          setRankedPlayers(aggregateData(data, ksSubTab));
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao banco de dados combatente.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, ksSubTab]);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (rawData.length > 0) {
      if (activeTab === 'KS_RANKING') {
        setRankedPlayers(aggregateData(rawData, ksSubTab));
      }
    }
  }, [activeTab, ksSubTab, rawData]);

  const tabs = [
    { id: 'DADOS_STATS', label: 'Intelligence', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'KS_RANKING', label: 'KS RANKING', icon: <Skull className="w-4 h-4" /> },
  ];

  const dadosFilters = [
    { id: TimeFrame.OVERVIEW, label: 'Overview' },
    { id: 'REGISTRO_KS', label: 'New Entry' },
  ];

  const ksFilters = [
    { id: TimeFrame.DAILY, label: 'Hoje' },
    { id: TimeFrame.WEEKLY, label: 'Semanal' },
    { id: TimeFrame.MONTHLY, label: 'Mensal' },
    { id: TimeFrame.ALL_TIME, label: 'Legends' },
  ];

  return (
    <div className="min-h-screen bg-neon-dark text-white font-sans selection:bg-neon-blue selection:text-black overflow-x-hidden">
      {/* Scanline Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      {/* Background Grid & Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-blue/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-purple/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-neon-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-3 md:py-0 md:h-16 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          <div className="w-full md:w-auto flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <motion.div 
                whileHover={{ rotate: 180 }}
                className="w-10 h-10 bg-neon-blue/20 border border-neon-blue/40 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.2)]"
              >
                <CrosshairIcon className="w-6 h-6 text-neon-blue" />
              </motion.div>
              <div>
                <h1 className="text-xl font-display font-black tracking-tighter group-hover:tracking-widest transition-all duration-500">
                  <span className="neon-text-blue">MISSCLIC</span>
                  <span className="neon-text-red">KS</span>
                </h1>
                <div className="flex items-center gap-1 text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                  <span className="w-1 h-1 bg-neon-green rounded-full animate-ping" />
                  Online
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-center justify-center p-2 bg-transparent border border-neon-blue/50 rounded-2xl w-12 h-12 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
              <div className="flex flex-col items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.8)] translate-y-0.5">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <div className="text-neon-blue font-display font-black text-[10px] tracking-widest leading-none drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">MJR</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-display text-xs uppercase transition-all duration-300 relative overflow-hidden group ${
                  activeTab === tab.id
                    ? 'text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabBg" 
                    className={`absolute inset-0 ${tab.id === 'KS_RANKING' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-neon-blue shadow-[0_0_20px_rgba(0,243,255,0.4)]'}`} 
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center justify-center p-2 bg-transparent border border-neon-blue/50 rounded-2xl w-14 h-14 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
            <div className="flex flex-col items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.8)] translate-y-0.5">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              <div className="text-neon-blue font-display font-black text-xs tracking-widest leading-none drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">MJR</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Refresh Button */}
      <button 
        onClick={() => loadData(true)}
        disabled={isRefreshing || loading}
        className="fixed bottom-6 left-6 z-50 p-3 bg-neon-dark/90 backdrop-blur-2xl border border-white/10 rounded-xl text-gray-400 hover:text-neon-blue hover:border-neon-blue transition-all active:scale-90 shadow-2xl"
      >
        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>



      <div className="relative z-10 container mx-auto px-4 py-8 pb-24 md:pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
            <div className="relative w-24 h-24">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="absolute inset-0 border-4 border-neon-blue/20 rounded-2xl" 
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                className="absolute inset-2 border-2 border-neon-purple/40 rounded-xl" 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <CrosshairIcon className="w-10 h-10 text-neon-blue animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-display text-xs uppercase tracking-[0.4em] text-neon-blue animate-pulse mb-2">System Initializing</p>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-neon-blue"
                />
              </div>
            </div>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto cyber-card p-8 border-red-500/30"
          >
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <Terminal className="w-6 h-6" />
              <h2 className="font-display font-bold uppercase tracking-wider">System Error</h2>
            </div>
            <p className="text-gray-400 text-sm mb-8 font-mono">{error}</p>
            <button onClick={() => loadData()} className="neon-button neon-button-blue w-full">
              Restart System
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'DADOS_STATS' ? (
                <div className="space-y-8">
                  {dadosSubTab === TimeFrame.OVERVIEW ? (
                    overviewData && <Overview 
                      data={overviewData} 
                      onBackToIntelligence={() => {
                        setActiveTab('DADOS_STATS');
                        setDadosSubTab(TimeFrame.OVERVIEW);
                      }} 
                      onNewEntry={() => {
                        setActiveTab('DADOS_STATS');
                        setDadosSubTab('REGISTRO_KS');
                      }}
                      onJoinTeam={() => {
                        setActiveTab('DADOS_STATS');
                        setDadosSubTab('JOIN_KS_TEAM');
                      }}
                    />
                  ) : dadosSubTab === 'REGISTRO_KS' ? (
                    <KSRegistrationForm overviewData={overviewData} onBack={() => {
                      setActiveTab('DADOS_STATS');
                      setDadosSubTab(TimeFrame.OVERVIEW);
                    }} />
                  ) : (
                    <JoinKSTeamForm onBack={() => {
                      setActiveTab('DADOS_STATS');
                      setDadosSubTab(TimeFrame.OVERVIEW);
                    }} />
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-center w-full">
                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl gap-1 overflow-x-auto no-scrollbar max-w-full">
                      {ksFilters.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setKsSubTab(filter.id as TimeFrame)}
                          className={`flex-1 px-1 md:px-6 py-2 rounded-lg text-[10px] md:text-xs font-display font-bold uppercase whitespace-nowrap transition-all relative ${
                            ksSubTab === filter.id
                              ? filter.id === TimeFrame.ALL_TIME ? 'text-yellow-400' : 'text-neon-purple'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {ksSubTab === filter.id && (
                            <motion.div layoutId="ksSubTab" className={`absolute inset-0 border rounded-lg ${filter.id === TimeFrame.ALL_TIME ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-neon-purple/10 border-neon-purple/30'}`} />
                          )}
                          <span className="relative z-10">{filter.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {ksSubTab === TimeFrame.ALL_TIME ? (
                    <LegendsView players={rankedPlayers} />
                  ) : (
                    <div className="space-y-12">
                      {rankedPlayers.length === 0 ? (
                        <div className="cyber-card p-20 text-center opacity-50">
                          <p className="font-display text-xl text-gray-500 uppercase tracking-widest">No Data Detected</p>
                        </div>
                      ) : (
                        <>
                          <Podium players={rankedPlayers} />
                          <RankingList players={rankedPlayers} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <footer className="container mx-auto px-4 py-12 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/10" />
          <Shield className="w-4 h-4 text-gray-600" />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10" />
        </div>
        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.5em]">
          MJR Monitoring System // v2
        </p>
      </footer>
    </div>
  );
};

export default App;
