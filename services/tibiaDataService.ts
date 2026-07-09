
export interface TibiaDataCharacterResponse {
  character: {
    character: {
      name: string;
      status: string;
      vocation: string;
      level: number;
      experience: number;
      last_login?: string;
      guild?: {
        name: string;
        rank: string;
      };
      [key: string]: any;
    };
    deaths?: {
      time: string;
      level: number;
      killers: { name: string; player: boolean; [key: string]: any }[];
      reason: string;
    }[];
  };
}

export interface CharacterStatus {
  isOnline: boolean;
  lastLogin?: string;
  vocation?: string;
  level?: number;
  experience?: number;
  guild?: {
    name: string;
    rank: string;
  };
  recentDeaths?: {
    time: string;
    level: number;
    reason: string;
    isMonsterDeath: boolean;
  }[];
}

// Memory cache to store fetched character statuses with timestamps
interface CacheEntry {
  status: CharacterStatus;
  timestamp: number;
}

const statusCache: Record<string, CacheEntry> = (() => {
  try {
    const stored = localStorage.getItem('tibia_status_cache');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Fail silently in case localStorage is disabled or corrupted
  }
  return {};
})();

const saveCacheToLocalStorage = () => {
  try {
    localStorage.setItem('tibia_status_cache', JSON.stringify(statusCache));
  } catch (e) {
    // Fail silently
  }
};

async function robustFetch(url: string): Promise<Response> {
  const timeout = 6000;
  const fetchWithTimeout = async (targetUrl: string) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) return res;
    console.warn(`Direct fetch response status not OK for ${url}: ${res.status}`);
  } catch (err) {
    console.warn(`Direct fetch failed for ${url}, trying proxy 1...`, err);
  }

  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetchWithTimeout(proxyUrl);
    if (res.ok) return res;
    console.warn(`Proxy 1 response status not OK for ${url}: ${res.status}`);
  } catch (err) {
    console.warn(`Proxy 1 failed for ${url}, trying proxy 2...`, err);
  }

  try {
    const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetchWithTimeout(allOriginsUrl);
    if (res.ok) return res;
  } catch (err) {
    console.warn(`Proxy 2 failed for ${url}`, err);
  }

  throw new Error(`Failed to fetch from ${url} (all methods exhausted)`);
}

// Queue system to prevent concurrent bursting of TibiaData API requests
let activeRequestsCount = 0;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchCharacterStatus(name: string): Promise<CharacterStatus> {
  if (!name || name.includes('@')) {
    return { isOnline: false };
  }

  const cleanName = name.trim().toLowerCase();
  const now = Date.now();
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Return from cache if still valid
  if (statusCache[cleanName] && (now - statusCache[cleanName].timestamp < CACHE_EXPIRY)) {
    return statusCache[cleanName].status;
  }

  // If there are too many active requests in parallel, wait a short random bit to stagger
  if (activeRequestsCount > 0) {
    await delay(Math.random() * 800 + 200 * activeRequestsCount);
  }

  activeRequestsCount++;

  try {
    const response = await robustFetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`);
    const data: any = await response.json();
    const char = data.character.character;
    const deaths = data.character.deaths;
    const otherCharacters = data.character.other_characters;
    
    let isOnline = false;

    if (otherCharacters && Array.isArray(otherCharacters)) {
      const charInList = otherCharacters.find((c: any) => c.name === char.name);
      if (charInList) {
        isOnline = charInList.status === 'online';
      }
    } else if (char.world) {
      // Character is hidden, check the world's online list
      try {
        const worldResponse = await robustFetch(`https://api.tibiadata.com/v4/world/${encodeURIComponent(char.world)}`);
        const worldData: any = await worldResponse.json();
        if (worldData.world && Array.isArray(worldData.world.online_players)) {
          isOnline = worldData.world.online_players.some((p: any) => p.name === char.name);
        }
      } catch (worldError) {
        console.warn(`Error fetching world data for ${char.world}:`, worldError);
      }
    }
    
    const resultStatus: CharacterStatus = {
      isOnline,
      lastLogin: char.last_login,
      vocation: char.vocation,
      level: char.level,
      experience: char.experience,
      guild: char.guild,
      recentDeaths: deaths?.slice(0, 3).map((d: any) => ({
        time: d.time,
        level: d.level,
        reason: d.reason,
        isMonsterDeath: d.killers.every((k: any) => !k.player)
      }))
    };

    // Cache the successful status
    statusCache[cleanName] = {
      status: resultStatus,
      timestamp: now
    };
    saveCacheToLocalStorage();

    return resultStatus;
  } catch (error: any) {
    console.warn(`Graceful warning: Error fetching status for ${name}: ${error.message || error}`);
    
    // If we have an expired cache entry, return it as a fallback instead of failing
    if (statusCache[cleanName]) {
      console.log(`Returning expired cache fallback for ${name}`);
      return statusCache[cleanName].status;
    }
    
    return { isOnline: false };
  } finally {
    activeRequestsCount = Math.max(0, activeRequestsCount - 1);
  }
}
