
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
  date: string; // ISO string or simple date string
  playerRank: string; // Column D data
  respawn: string; // Column F data
}

export interface RankedPlayer {
  rank: number;
  name: string;
  totalKS: number;
  gamesPlayed: number;
  averageKS: number;
  trend: 'up' | 'down' | 'same'; // Visual indicator
}

export interface OverviewData {
  totalKills: number;
  totalRecords: number;
  busiestDay: string;
  avgKillsPerDay: number;
  hourlyDistribution: number[]; // 0-23 hours
  weeklyDistribution: number[]; // 0-6 (Sun-Sat)
  dailyTrend: { date: string; count: number }[]; // Last 14 days
  weightDistribution: { normal: number; heavy: number };
  killsByRank: { rank: string; count: number }[]; 
  topRespawns: { name: string; count: number }[]; // New Top 5 Respawns
  recentActivity: RawDataRow[]; // New: Last 5 logs
  dominationStats: { name: string; percentage: number; count: number }[]; // New: Top 5 players % share
}

export interface RankingData {
  timeFrame: TimeFrame;
  lastUpdated: string;
  players: RankedPlayer[];
}
