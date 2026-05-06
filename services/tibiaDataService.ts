
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

export async function fetchCharacterStatus(name: string): Promise<CharacterStatus> {
  if (!name || name.includes('@')) {
    return { isOnline: false };
  }

  try {
    const response = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch character data');
    }
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
        const worldResponse = await fetch(`https://api.tibiadata.com/v4/world/${encodeURIComponent(char.world)}`);
        if (worldResponse.ok) {
          const worldData: any = await worldResponse.json();
          if (worldData.world && Array.isArray(worldData.world.online_players)) {
            isOnline = worldData.world.online_players.some((p: any) => p.name === char.name);
          }
        }
      } catch (worldError) {
        console.error(`Error fetching world data for ${char.world}:`, worldError);
      }
    }
    
    return {
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
  } catch (error) {
    console.error(`Error fetching status for ${name}:`, error);
    return { isOnline: false };
  }
}
