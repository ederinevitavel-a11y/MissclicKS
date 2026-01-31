import { RawDataRow, RankedPlayer, TimeFrame, OverviewData } from '../types';

/**
 * CONFIGURAÇÃO DE FONTES DE DADOS
 * Para o GitHub: Use o link que termina em 'raw.githubusercontent.com/...'
 */
const GITHUB_CSV_NAME = 'dados.csv'; // Nome do arquivo dentro do seu repositório
const GOOGLE_SHEET_FALLBACK = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQkJhKP1MWxMqBupRr3TmzbsuoZHF2ljzRG1lMCjZ--46ON-vVoPf4mgn5PqjmiWtOpphpmkPYFeYLK/pub?output=csv';

export const fetchAndParseData = async (): Promise<RawDataRow[]> => {
  try {
    // 1. Tenta carregar do próprio repositório (Vercel/GitHub Pages)
    let response = await fetch(`./${GITHUB_CSV_NAME}?t=${Date.now()}`);
    
    // 2. Se não encontrar localmente, tenta o Google Sheets
    if (!response.ok) {
      console.log("Arquivo local não detectado. Sincronizando via Nuvem MJR...");
      response = await fetch(`${GOOGLE_SHEET_FALLBACK}&t=${Date.now()}`);
    }
    
    if (!response.ok) {
      throw new Error('Todas as fontes de dados estão inacessíveis.');
    }
    
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error("Erro crítico de sincronização:", error);
    return []; 
  }
};

const parseCSV = (csvText: string): RawDataRow[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const data: RawDataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], delimiter);
    if (cols.length <= 2) continue;

    const dateStr = cols[0];
    const name = cols[2];
    const rank = cols[3] ? cols[3].trim() : 'Unranked';
    const respawn = cols[5] ? cols[5].trim() : 'Unknown Area';

    if (!name || name.trim() === '') continue;

    let dateObj = parseFlexibleDate(dateStr) || new Date();

    let points = 1;
    // Lógica de Peso 02 para KS pesado
    if (cols.length > 8) {
        for (let j = 8; j < Math.min(cols.length, 14); j++) {
            if (cols[j] && cols[j].trim().toLowerCase() === 'peso 02') {
                points = 2;
                break;
            }
        }
    }

    data.push({
      player: name.trim(),
      ks: points, 
      date: dateObj.toISOString(),
      playerRank: rank,
      respawn: respawn
    });
  }
  return data;
};

const detectDelimiter = (header: string): string => {
    const semicolons = (header.match(/;/g) || []).length;
    return semicolons > (header.match(/,/g) || []).length ? ';' : ',';
};

const parseCSVLine = (text: string, delimiter: string): string[] => {
    const cols: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') inQuote = !inQuote;
        else if (char === delimiter && !inQuote) {
            cols.push(current.trim());
            current = '';
        } else current += char;
    }
    cols.push(current.trim());
    return cols;
};

const parseFlexibleDate = (dateStr: string): Date | null => {
    const cleanStr = dateStr.trim();
    // Regex melhorada: Captura DD/MM/AAAA e opcionalmente HH:mm ou HHhMM
    const dateMatch = cleanStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})(?:\s+(\d{1,2})[:h](\d{1,2}))?/i);
    
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1;
        let year = parseInt(dateMatch[3]);
        if (year < 100) year += 2000;
        
        const hour = dateMatch[4] ? parseInt(dateMatch[4]) : 0;
        const minute = dateMatch[5] ? parseInt(dateMatch[5]) : 0;
        
        return new Date(year, month, day, hour, minute);
    }
    
    const iso = new Date(cleanStr);
    return isNaN(iso.getTime()) ? null : iso;
};

export const getOverviewStats = (rawData: RawDataRow[]): OverviewData => {
    let totalKills = 0;
    const hourlyCounts = new Array(24).fill(0);
    const weeklyCounts = new Array(7).fill(0);
    const dateMap = new Map<string, number>();
    const rankMap = new Map<string, number>();
    const respawnMap = new Map<string, number>();
    const playerTotalMap = new Map<string, number>();
    let normalKills = 0;
    let heavyKills = 0;

    rawData.forEach(row => {
        const date = new Date(row.date);
        if (isNaN(date.getTime())) return;
        totalKills += row.ks;
        if (row.ks > 1) heavyKills++; else normalKills++;
        hourlyCounts[date.getHours()] += row.ks;
        weeklyCounts[date.getDay()] += row.ks;
        const dateKey = date.toISOString().split('T')[0];
        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + row.ks);
        rankMap.set(row.playerRank, (rankMap.get(row.playerRank) || 0) + row.ks);
        respawnMap.set(row.respawn, (respawnMap.get(row.respawn) || 0) + row.ks);
        playerTotalMap.set(row.player, (playerTotalMap.get(row.player) || 0) + row.ks);
    });

    const sortedDates = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
    const recentTrend = sortedDates.slice(-14);
    const killsByRank = Array.from(rankMap.entries()).map(([rank, count]) => ({ rank, count })).sort((a, b) => b.count - a.count);
    const topRespawns = Array.from(respawnMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dominationStats = Array.from(playerTotalMap.entries())
        .map(([name, count]) => ({ name, count, percentage: (count / (totalKills || 1)) * 100 }))
        .sort((a, b) => b.count - a.count).slice(0, 5);

    return {
        totalKills,
        totalRecords: rawData.length,
        busiestDay: days[weeklyCounts.indexOf(Math.max(...weeklyCounts))],
        avgKillsPerDay: Math.round(totalKills / (dateMap.size || 1)),
        hourlyDistribution: hourlyCounts,
        weeklyDistribution: weeklyCounts,
        dailyTrend: recentTrend,
        weightDistribution: { normal: normalKills, heavy: heavyKills },
        killsByRank,
        topRespawns,
        recentActivity: rawData.slice(-5).reverse(),
        dominationStats
    };
};

export const aggregateData = (rawData: RawDataRow[], frame: TimeFrame): RankedPlayer[] => {
  const now = new Date();
  const playerMap = new Map<string, { totalKS: number; games: number; }>();

  rawData.filter(row => {
    const rowDate = new Date(row.date);
    if (isNaN(rowDate.getTime())) return false;
    if (frame === TimeFrame.DAILY) return rowDate.toDateString() === now.toDateString();
    if (frame === TimeFrame.WEEKLY) {
        const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
        return rowDate >= weekAgo;
    }
    if (frame === TimeFrame.MONTHLY) {
        const monthAgo = new Date(); monthAgo.setDate(now.getDate() - 30);
        return rowDate >= monthAgo;
    }
    return true;
  }).forEach(row => {
    const current = playerMap.get(row.player) || { totalKS: 0, games: 0 };
    playerMap.set(row.player, { totalKS: current.totalKS + row.ks, games: current.games + 1 });
  });

  return Array.from(playerMap.entries())
    .map(([name, stats]) => ({
      name, totalKS: stats.totalKS, gamesPlayed: stats.games,
      averageKS: 1, rank: 0, trend: 'same' as const
    }))
    .sort((a, b) => b.totalKS - a.totalKS)
    .map((p, i) => ({ ...p, rank: i + 1, trend: i < 3 ? 'up' as const : 'same' as const }));
};