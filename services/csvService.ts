
import { RawDataRow, RankedPlayer, TimeFrame, OverviewData } from '../types';

const GITHUB_CSV_NAME = 'dados.csv';
const DEFAULT_FALLBACK = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQkJhKP1MWxMqBupRr3TmzbsuoZHF2ljzRG1lMCjZ--46ON-vVoPf4mgn5PqjmiWtOpphpmkPYFeYLK/pub?output=csv';

const getSheetUrl = () => {
  const customUrl = localStorage.getItem('CUSTOM_SHEET_URL');
  return customUrl || import.meta.env.VITE_SHEET_URL || DEFAULT_FALLBACK;
};

const fetchWithTimeout = async (url: string, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('A conexão com a planilha expirou (timeout). Verifique se o link está correto e se a planilha está publicada.');
    }
    throw error;
  }
};

export const fetchAndParseData = async (): Promise<RawDataRow[]> => {
  const url = getSheetUrl();
  console.log("URL da planilha sendo acessada:", url);
  try {
    console.log("Tentando fetch local...");
    let response = await fetch(`./${GITHUB_CSV_NAME}?t=${Date.now()}`);
    let text = "";
    
    if (response.ok) {
      console.log("Fetch local OK");
      text = await response.text();
      if (text.includes('<html') || text.includes('<!DOCTYPE')) {
        console.log("Arquivo local 'dados.csv' não encontrado ou é um HTML. Tentando Google Sheets...");
        response = await fetchWithTimeout(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`);
        console.log("Fetch Google Sheets resposta:", response.status);
        if (!response.ok) throw new Error(`Erro ao acessar Google Sheets: ${response.status}`);
        text = await response.text();
      }
    } else {
      console.log("Fetch local falhou, tentando Google Sheets...");
      response = await fetchWithTimeout(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`);
      console.log("Fetch Google Sheets resposta:", response.status);
      if (!response.ok) throw new Error(`Erro ao acessar Google Sheets: ${response.status}`);
      text = await response.text();
    }
    
    if (!text || text.trim().length < 10) {
      throw new Error("A planilha parece estar vazia ou o formato é inválido.");
    }
    
    return parseCSV(text);
  } catch (error: any) {
    console.error("Erro detalhado de sincronização:", error);
    throw error;
  }
};

const parseCSV = (csvText: string): RawDataRow[] => {
  // Verifica se o conteúdo recebido é HTML (erro comum de publicação)
  if (csvText.includes('<html') || csvText.includes('<!DOCTYPE')) {
    throw new Error("O link retornou uma página HTML em vez de um arquivo CSV. Certifique-se de publicar como 'Valores separados por vírgulas (.csv)'.");
  }

  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const header = lines[0];
  const delimiter = detectDelimiter(header);
  const headers = parseCSVLine(header, delimiter).map(h => h.toLowerCase().trim());
  
  // Tenta encontrar os índices das colunas dinamicamente
  const idxDate = headers.findIndex(h => h.includes('data') || h.includes('timestamp') || h.includes('carimbo'));
  const idxName = headers.findIndex(h => 
    (h.includes('nome') || h.includes('player') || h.includes('personagem') || h.includes('char')) && 
    !h.includes('email') && !h.includes('e-mail')
  );
  const idxRank = headers.findIndex(h => h.includes('rank') || h.includes('patente'));
  const idxHunted = headers.findIndex(h => h.includes('hunted') || h.includes('vítima') || h.includes('alvo'));
  const idxRespawn = headers.findIndex(h => h.includes('respawn') || h.includes('respaw') || h.includes('local') || h.includes('área'));
  const idxStatus = headers.findIndex(h => h.includes('status') || h.includes('situação'));
  
  console.log("Cabeçalhos detectados:", headers);
  console.log("Índices mapeados:", { idxDate, idxName, idxRank, idxHunted, idxRespawn, idxStatus });

  const data: RawDataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], delimiter);
    if (cols.length < 2) continue;

    // Filtro de Status (Apenas Aprovados)
    if (idxStatus !== -1 && cols[idxStatus]) {
      const status = cols[idxStatus].toLowerCase();
      if (status.includes('negado') || status.includes('rejeitado')) {
        continue;
      }
    }

    // Usa os índices detectados ou fallbacks fixos (0, 2, 3, 4, 5)
    let name = cols[idxName !== -1 ? idxName : 2];
    
    // Se a coluna cair em um email (comum em forms), tenta a próxima coluna
    if (name && name.includes('@')) {
      name = cols[idxName !== -1 ? idxName + 1 : 3];
    }

    if (!name || name.trim() === '') continue;

    const dateStr = cols[idxDate !== -1 ? idxDate : 0];
    const rank = idxRank !== -1 ? cols[idxRank] : (cols[3] || 'Unranked');
    const hunted = idxHunted !== -1 ? cols[idxHunted] : (cols[4] || '');
    const respawn = idxRespawn !== -1 ? cols[idxRespawn] : (cols[5] || 'Unknown Area');
    const usualTime = cols[12] || ''; 

    let dateObj = parseFlexibleDate(dateStr) || new Date();

    // Lógica de pontos (Peso 02)
    let points = 1;
    const rowText = lines[i].toLowerCase();
    if (rowText.includes('peso 02') || rowText.includes('peso 2')) {
        points = 2;
    }

    data.push({
      player: name.trim(),
      ks: points, 
      date: dateObj.toISOString(),
      playerRank: rank.trim(),
      respawn: respawn.trim(),
      huntedName: hunted.trim(),
      usualTime: usualTime.trim()
    });
  }
  
  console.log(`Total de registros válidos processados: ${data.length}`);
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
    // Tenta DD/MM/YYYY HH:mm:ss
    const dateMatch = cleanStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})(?:\s+(\d{1,2})[:h](\d{1,2})[:h]?(\d{1,2})?)?/i);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1;
        let year = parseInt(dateMatch[3]);
        if (year < 100) year += 2000;
        const hour = dateMatch[4] ? parseInt(dateMatch[4]) : 0;
        const minute = dateMatch[5] ? parseInt(dateMatch[5]) : 0;
        const second = dateMatch[6] ? parseInt(dateMatch[6]) : 0;
        return new Date(year, month, day, hour, minute, second);
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
    
    // Hunted Intel
    const huntedTimeDist = new Array(24).fill(0);
    const huntedMap = new Map<string, { count: number; hours: Map<string, number>; locations: Map<string, number>; lastSeen: Date }>();
    
    let normalKills = 0;
    let heavyKills = 0;

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

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

        // Processamento de Hunted nos últimos 30 dias
        if (row.huntedName && row.huntedName !== '' && date >= thirtyDaysAgo) {
            const huntedData = huntedMap.get(row.huntedName) || { 
              count: 0, 
              hours: new Map<string, number>(), 
              locations: new Map<string, number>(),
              lastSeen: date
            };
            huntedData.count++;
            
            // Atualiza data do último avistamento
            if (date > huntedData.lastSeen) {
                huntedData.lastSeen = date;
            }
            
            // Logica de horas
            if (row.usualTime) {
                const hourMatch = row.usualTime.match(/(\d{1,2})/);
                if (hourMatch) {
                    const h = parseInt(hourMatch[1]);
                    if (h >= 0 && h < 24) {
                        huntedTimeDist[h]++;
                        const hStr = h.toString().padStart(2, '0') + ':00';
                        huntedData.hours.set(hStr, (huntedData.hours.get(hStr) || 0) + 1);
                    }
                }
            }

            // Logica de locais
            if (row.respawn) {
              huntedData.locations.set(row.respawn, (huntedData.locations.get(row.respawn) || 0) + 1);
            }

            huntedMap.set(row.huntedName, huntedData);
        }
    });

    const sortedDates = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
    const recentTrend = sortedDates.slice(-14);
    const killsByRank = Array.from(rankMap.entries()).map(([rank, count]) => ({ rank, count })).sort((a, b) => b.count - a.count);
    const topRespawns = Array.from(respawnMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dominationStats = Array.from(playerTotalMap.entries())
        .map(([name, count]) => ({ name, count, percentage: (count / (totalKills || 1)) * 100 }))
        .sort((a, b) => b.count - a.count).slice(0, 5);

    const targets = Array.from(huntedMap.entries())
        .map(([name, data]) => {
            // Acha a hora mais frequente para esse hunted
            let peakHour = "N/A";
            let maxH = 0;
            data.hours.forEach((count, hour) => {
                if (count > maxH) {
                    maxH = count;
                    peakHour = hour;
                }
            });

            // Top 3 locais
            const topLocations = Array.from(data.locations.entries())
              .map(([locName, locCount]) => ({ name: locName, count: locCount }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 3);

            return { 
                name, 
                count: data.count, 
                peakHour, 
                lastSeen: data.lastSeen.toISOString(),
                topLocations 
            };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

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
        dominationStats,
        huntedIntel: {
            timeDistribution: huntedTimeDist,
            targets
        }
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
