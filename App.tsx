
import React, { useEffect, useState, useCallback } from 'react';
import { TargetIcon } from './components/NeonIcons';
import { Podium } from './components/Podium';
import { RankingList } from './components/RankingList';
import { Overview } from './components/Overview';
import { LegendsView } from './components/LegendsView'; 
import { KSRegistrationForm } from './components/KSRegistrationForm';
import { aggregateData, fetchAndParseData, getOverviewStats } from './services/csvService';
import { RankedPlayer, RawDataRow, TimeFrame, OverviewData } from './types';

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
    console.log("Iniciando loadData...");
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      console.log("Chamando fetchAndParseData...");
      const data = await fetchAndParseData();
      console.log("Dados carregados com sucesso:", data.length);
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
      console.error("Erro em loadData:", err);
      setError(err.message || "Erro de conexão ao banco de dados combatente.");
    } finally {
      console.log("Finalizando loadData...");
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
    { id: 'DADOS_STATS', label: 'Dados KS', subLabel: 'Informações' },
    { id: 'KS_RANKING', label: 'Ranking KS', subLabel: 'Rankings' },
  ];

  const dadosFilters = [
    { id: TimeFrame.OVERVIEW, label: 'Intelligence' },
    { id: 'REGISTRO_KS', label: 'Registro KS' },
  ];

  const ksFilters = [
    { id: TimeFrame.DAILY, label: 'Hoje' },
    { id: TimeFrame.WEEKLY, label: 'Semana' },
    { id: TimeFrame.MONTHLY, label: 'Mês' },
    { id: TimeFrame.ALL_TIME, label: 'Legends' },
  ];

  return (
    <div className="min-h-screen bg-neon-dark text-white selection:bg-neon-blue selection:text-black font-sans overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-neon-purple opacity-10 blur-[100px] rounded-full" />
         <div className="absolute top-1/2 right-0 w-80 h-80 bg-neon-blue opacity-10 blur-[120px] rounded-full" />
      </div>

      {/* Símbolo MJR */}
      <div className="fixed top-6 right-6 z-50 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-neon-blue/40 rounded-xl p-2 flex flex-col items-center justify-center w-14 h-14 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 text-neon-blue">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
          <span className="text-[10px] font-display font-black text-neon-blue tracking-tighter leading-none mt-0.5">MJR</span>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex flex-col items-center mb-10">
          <div className="relative mb-2">
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-neon-purple drop-shadow-lg">
              MissclicKS
            </h1>
            <div className="absolute -inset-1 blur-lg bg-neon-blue opacity-20 animate-pulse"></div>
          </div>
          <p className="text-neon-blue tracking-widest text-xs uppercase opacity-80 flex items-center gap-2">
            <TargetIcon className="w-4 h-4" /> Kalibra
          </p>
        </header>

        <div className="flex justify-center mb-10">
            <div className="flex flex-wrap justify-center p-1 bg-neon-surface border border-gray-800 rounded-xl gap-1">
                {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                    relative px-3 md:px-6 py-2 rounded-lg transition-all duration-300 flex flex-col items-center justify-center min-w-[80px] md:min-w-[100px]
                    ${activeTab === tab.id 
                        ? (tab.id === 'KS_RANKING' 
                            ? 'text-white bg-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.5)]' 
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
                <p className="text-red-400 font-bold mb-2">Erro de Sincronização</p>
                <p className="text-gray-400 text-sm mb-6">{error}</p>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => loadData()} 
                        className="w-full px-6 py-2 bg-neon-blue text-black font-bold rounded border border-neon-blue shadow-lg hover:shadow-neon-blue transition-all"
                    >
                        Tentar Novamente
                    </button>
                    
                    <div className="pt-4 border-t border-gray-800">
                        <p className="text-[10px] text-gray-500 uppercase mb-2">Caminho Seguro para Link CSV:</p>
                        <input 
                            type="text" 
                            placeholder="Cole aqui o link .csv publicado..."
                            className="w-full bg-black/40 border border-gray-800 rounded px-3 py-2 text-xs text-white outline-none focus:border-neon-purple transition-all mb-2"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value;
                                    if (val.includes('http')) {
                                        localStorage.setItem('CUSTOM_SHEET_URL', val);
                                        loadData();
                                    }
                                }
                            }}
                        />
                        <p className="text-[9px] text-gray-600 italic">Pressione Enter para salvar e recarregar.</p>
                    </div>
                </div>
            </div>
        ) : (
          <main className="animate-fade-in">
            {activeTab === 'DADOS_STATS' ? (
                <>
                    <div className="flex justify-center mb-8">
                        <div className="flex p-1 bg-neon-surface/50 border border-gray-800 rounded-lg gap-1">
                            {dadosFilters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setDadosSubTab(filter.id)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-display font-bold uppercase transition-all
                                        ${dadosSubTab === filter.id 
                                            ? (filter.id === 'REGISTRO_KS'
                                                ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]' 
                                                : filter.id === TimeFrame.OVERVIEW
                                                    ? 'bg-neon-green text-black shadow-[0_0_10px_rgba(10,255,10,0.4)]'
                                                    : 'bg-neon-blue text-black shadow-[0_0_10px_rgba(0,243,255,0.3)]') 
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {dadosSubTab === TimeFrame.OVERVIEW ? (
                        overviewData && <Overview data={overviewData} onBackToIntelligence={() => {
                            setActiveTab('DADOS_STATS');
                            setDadosSubTab(TimeFrame.OVERVIEW);
                        }} />
                    ) : (
                        <KSRegistrationForm overviewData={overviewData} />
                    )}
                </>
            ) : activeTab === 'KS_RANKING' ? (
                <>
                    <div className="flex justify-center mb-8">
                        <div className="flex p-1 bg-neon-surface/50 border border-gray-800 rounded-lg gap-1">
                            {ksFilters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setKsSubTab(filter.id)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-display font-bold uppercase transition-all
                                        ${ksSubTab === filter.id 
                                            ? (filter.id === TimeFrame.ALL_TIME 
                                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-[0_0_10px_rgba(234,179,8,0.4)]' 
                                                : 'bg-neon-green text-black shadow-[0_0_10px_rgba(10,255,10,0.4)]') 
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {ksSubTab === TimeFrame.ALL_TIME ? (
                        <LegendsView players={rankedPlayers} />
                    ) : (
                        <>
                            <div className="mb-4 text-center">
                                <h2 className="text-2xl font-display text-white mb-1">Ranking {ksFilters.find(f => f.id === ksSubTab)?.label}</h2>
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
                </>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-500">Selecione uma aba válida.</p>
                </div>
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
