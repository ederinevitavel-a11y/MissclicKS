
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
  }[];
}

export async function fetchCharacterStatus(name: string): Promise<CharacterStatus> {
  try {
    const response = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch character data');
    }
    const data: TibiaDataCharacterResponse = await response.json();
    const char = data.character.character;
    const deaths = data.character.deaths;
    
    return {
      isOnline: char.status === 'online',
      lastLogin: char.last_login,
      vocation: char.vocation,
      level: char.level,
      experience: char.experience,
      guild: char.guild,
      recentDeaths: deaths?.slice(0, 2).map(d => ({
        time: d.time,
        level: d.level,
        reason: d.reason
      }))
    };
  } catch (error) {
    console.error(`Error fetching status for ${name}:`, error);
    return { isOnline: false };
  }
}
