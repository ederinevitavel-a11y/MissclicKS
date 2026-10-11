
export enum TimeFrame {
  OVERVIEW = 'OVERVIEW',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME'
}

export interface RawDataRow {
  player: string;
  ks: number;
  date: string; 
  playerRank: string; 
  respawn: string; 
  huntedName?: string; // Coluna E
  usualTime?: string;  // Coluna M
  email?: string;      // E-mail do operador que realizou o registro
  tempoKS?: string;    // Coluna K (Tempo de KS, ex: 'PT')
  isPT?: boolean;      // Indica se o registro foi marcado como PT (vale 2 pontos)
}

export interface RankedPlayer {
  rank: number;
  name: string;
  totalKS: number; // Pontos totais acumulados (incluindo PT = 2 pts)
  gamesPlayed: number; // Quantidade de registros de KS realizados
  ptCount?: number; // Quantidade de KS em PT (2 pontos cada)
  averageKS: number;
  trend: 'up' | 'down' | 'same';
}

export interface OverviewData {
  totalKills: number;
  totalRecords: number;
  busiestDay: string;
  avgKillsPerDay: number;
  hourlyDistribution: number[]; 
  weeklyDistribution: number[]; 
  dailyTrend: { date: string; count: number }[]; 
  weightDistribution: { normal: number; heavy: number };
  killsByRank: { rank: string; count: number }[]; 
  topRespawns: { name: string; count: number }[]; 
  recentActivity: RawDataRow[]; 
  dominationStats: { name: string; percentage: number; count: number }[];
  huntedIntel: {
    timeDistribution: number[]; // 0-23h baseado na Coluna M
    targets: { 
      name: string; 
      count: number; 
      peakHour: string;
      lastSeen: string; // ISO string da última vez visto
      topLocations: { name: string; count: number }[]; 
      isOnline?: boolean;
      nemesis: { name: string; kills: number }[];
    }[]; 
  };
  activityStreaks: { name: string; streak: number; lastActive: string }[];
}

export interface RankingData {
  timeFrame: TimeFrame;
  lastUpdated: string;
  players: RankedPlayer[];
}
