
import React, { useEffect, useState, useCallback } from 'react';
import { TargetIcon } from './components/NeonIcons';
import { Podium } from './components/Podium';
import { RankingList } from './components/RankingList';
import { Overview } from './components/Overview';
import { LegendsView } from './components/LegendsView'; 
import { BlackListView } from './components/BlackListView';
import { aggregateData, fetchAndParseData, getOverviewStats } from './services/csvService';
import { RankedPlayer, RawDataRow, TimeFrame, OverviewData } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TimeFrame>(TimeFrame.OVERVIEW);
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
        setError("Não foi possível carregar os dados. Verifique a planilha.");
      } else {
        setRawData(data);
        setOverviewData(getOverviewStats(data));
        if (activeTab !== TimeFrame.OVERVIEW && activeTab !== TimeFrame.BLACK_LIST) {
          setRankedPlayers(aggregateData(data, activeTab));
        }
      }
    } catch (err) {
      setError("Erro de conexão ao banco de dados combatente.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (rawData.length > 0 && activeTab !== TimeFrame.OVERVIEW && activeTab !== TimeFrame.BLACK_LIST) {
      setRankedPlayers(aggregateData(rawData, activeTab));
    }
  }, [activeTab, rawData]);

  const tabs = [
    { id: TimeFrame.OVERVIEW, label: 'Overview', subLabel: 'Estatísticas' },
    { id: TimeFrame.BLACK_LIST, label: 'Black List', subLabel: 'Hunteds' },
    { id: TimeFrame.DAILY, label: 'Hoje', subLabel: 'Últimas 24h' },
    { id: TimeFrame.WEEKLY, label: 'Semana', subLabel: 'Últimos 7 dias' },
    { id: TimeFrame.MONTHLY, label: 'Mês', subLabel: 'Últimos 30 dias' },
    { id: TimeFrame.ALL_TIME, label: 'Legends', subLabel: 'Hall da Fama' },
  ];

  return (
    <div className="min-h-screen bg-neon-dark text-white selection:bg-neon-blue selection:text-black font-sans overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-neon-purple opacity-10 blur-[100px] rounded-full" />
         <div className="absolute top-1/2 right-0 w-80 h-80 bg-neon-blue opacity-10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* MJR Badge - Top Right */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 border border-neon-blue/40 bg-black/40 backdrop-blur-md rounded-xl shadow-[0_0_15px_rgba(0,243,255,0.15)] group transition-all hover:border-neon-blue hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-neon-blue transition-transform group-hover:-translate-y-1">
            <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
          </svg>
          <span className="text-[11px] md:text-xs font-display font-black text-neon-blue tracking-tighter -mt-1 group-hover:scale-110 transition-transform">MJR</span>
        </div>

        <header className="flex flex-col items-center mb-10">
          <div className="relative mb-2">
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-neon-purple drop-shadow-lg">
              MissclicKS
            </h1>
            <div className="absolute -inset-1 blur-lg bg-neon-blue opacity-20 animate-pulse"></div>
          </div>
          <p className="text-neon-blue tracking-widest text-xs uppercase opacity-80 flex items-center gap-2">
            <TargetIcon className="w-4 h-4" /> KS Tracker
          </p>
        </header>

        <div className="flex justify-center mb-10">
            <div className="flex flex-wrap justify-center p-1 bg-neon-surface border border-gray-800 rounded-xl gap-1">
                {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                    relative px-4 md:px-6 py-2 rounded-lg transition-all duration-300 flex flex-col items-center justify-center min-w-[100px]
                    ${activeTab === tab.id 
                        ? (tab.id === TimeFrame.ALL_TIME 
                            ? 'text-black bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.6)]' 
                            : tab.id === TimeFrame.BLACK_LIST 
                                ? 'text-white bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)]' 
                                : 'text-black bg-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.5)]') 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                >
                    <span className="font-display font-bold text-sm uppercase">{tab.label}</span>
                    <span className={`text-[10px] ${activeTab === tab.id ? 'text-white/80 font-bold' : 'text-gray-600'}`}>{tab.subLabel}</span>
                </button>
                ))}
            </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
            <div className="text-center p-8 bg-neon-surface border border-red-500/50 rounded-xl max-w-lg mx-auto">
                <p className="text-red-400 font-bold mb-2">Erro de Sistema</p>
                <p className="text-gray-400 text-sm mb-4">{error}</p>
                <button onClick={() => loadData()} className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded border border-red-500/50 transition-colors">Tentar Novamente</button>
            </div>
        ) : (
          <main className="animate-fade-in">
            {activeTab === TimeFrame.OVERVIEW ? (
                 overviewData && <Overview data={overviewData} />
            ) : activeTab === TimeFrame.BLACK_LIST ? (
                 <BlackListView rawData={rawData} overviewData={overviewData} />
            ) : activeTab === TimeFrame.ALL_TIME ? (
                 <LegendsView players={rankedPlayers} />
            ) : (
                <>
                    <div className="mb-4 text-center">
                    <h2 className="text-2xl font-display text-white mb-1">Ranking {tabs.find(t => t.id === activeTab)?.label}</h2>
                    </div>
                    {rankedPlayers.length === 0 ? (
                        <div className="text-center py-20 opacity-50 bg-neon-surface/30 rounded-xl border border-dashed border-gray-800 mx-auto max-w-2xl mt-8">
                            <p className="font-display text-xl text-gray-400">Sem dados para este período.</p>
                        </div>
                    ) : (
                        <>
                            <Podium players={rankedPlayers} />
                            <RankingList players={rankedPlayers} />
                        </>
                    )}
                </>
            )}
          </main>
        )}
      </div>

      <button 
        onClick={() => loadData(true)}
        disabled={isRefreshing || loading}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-neon-surface border border-neon-purple rounded-full flex items-center justify-center text-neon-purple hover:bg-neon-purple hover:text-white transition-all shadow-lg hover:shadow-neon-purple z-50 group ${isRefreshing ? 'cursor-not-allowed opacity-80' : ''}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-7 h-7 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>

      <footer className="text-center py-6 text-gray-600 text-xs">
         <p>MissclicKS &copy; {new Date().getFullYear()} // Sistema de Monitoramento MJR</p>
      </footer>
    </div>
  );
};

export default App;
