
export enum TimeFrame {
  OVERVIEW = 'OVERVIEW',
  BLACK_LIST = 'BLACK_LIST',
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
}

export interface RankedPlayer {
  rank: number;
  name: string;
  totalKS: number;
  gamesPlayed: number;
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
    }[]; 
  };
}

export interface RankingData {
  timeFrame: TimeFrame;
  lastUpdated: string;
  players: RankedPlayer[];
}
