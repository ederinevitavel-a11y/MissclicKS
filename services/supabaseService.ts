import { supabase } from './supabase';
import { RawDataRow } from '../types';

/**
 * Maps any Supabase row to the uniform RawDataRow format.
 * Extremely robust to support different naming conventions (camelCase or snake_case).
 */
const mapSupabaseRowToRawData = (row: any): RawDataRow => {
  const dateStr = row.date || row.created_at || row.timestamp || new Date().toISOString();
  let points = typeof row.ks === 'number' ? row.ks : (Number(row.points || row.score || row.ks || 1));

  // A partir de 09 de julho de 2026, todos os novos registros têm peso 1 obrigatoriamente
  const dateObj = new Date(dateStr);
  const cutoffDate = new Date('2026-07-09T00:00:00');
  if (!isNaN(dateObj.getTime()) && dateObj >= cutoffDate) {
    points = 1;
  }

  const player = row.player || row.char_name || row.charName || row.name || '';
  const huntedName = row.huntedName || row.hunted_name || row.hunted_target || '';

  // Se o jogador ou alvo for Capistrano, o peso deve ser sempre 1 (conforme regra do usuário)
  if (player.toLowerCase().includes('capistrano') || huntedName.toLowerCase().includes('capistrano')) {
    points = 1;
  }

  return {
    player,
    ks: points,
    date: dateStr,
    playerRank: row.playerRank || row.player_rank || row.rank || 'Member',
    respawn: row.respawn || 'Unknown Area',
    huntedName,
    usualTime: row.usualTime || row.usual_time || row.time || ''
  };
};

/**
 * Fetches all KS entries from Supabase.
 * Tries the 'ks_entries' table, then falls back to 'kills' if it fails.
 */
export const fetchKSEntriesFromSupabase = async (): Promise<RawDataRow[]> => {
  if (!supabase) {
    throw new Error("Supabase URL and Anon Key are not configured in the system.");
  }

  // Attempt 1: Fetch from 'ks_entries'
  try {
    const { data, error } = await supabase
      .from('ks_entries')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      console.log(`Successfully fetched ${data.length} records from Supabase 'ks_entries'`);
      return data.map(mapSupabaseRowToRawData);
    }
    
    if (error) {
      console.warn("Error fetching from 'ks_entries', trying 'kills' fallback...", error.message);
    }
  } catch (err) {
    console.warn("Exception fetching from 'ks_entries', trying fallback...", err);
  }

  // Attempt 2: Fallback to 'kills'
  const { data, error } = await supabase
    .from('kills')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return (data || []).map(mapSupabaseRowToRawData);
};

/**
 * Helper to perform robust inserts into Supabase tables.
 * Dynamically detects "column does not exist" errors and strips non-existent columns from the payload,
 * retrying the insertion until it succeeds or no more recognized columns can be stripped.
 */
const robustInsert = async (tableName: string, initialRecord: any): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const record = { ...initialRecord };
  const maxAttempts = 15;
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    const { error } = await supabase
      .from(tableName)
      .insert([record]);

    if (!error) {
      console.log(`Successfully inserted record into '${tableName}' on attempt ${attempts}`);
      return;
    }

    const errMsg = error.message || '';
    console.warn(`Insert into '${tableName}' failed (attempt ${attempts}): ${errMsg}`);

    // Try to extract the missing column name from common error messages
    // Error pattern 1: "Could not find the 'colName' column of 'tableName' in the schema cache"
    // Error pattern 2: "column \"colName\" of relation \"tableName\" does not exist"
    // Error pattern 3: "column \"colName\" does not exist"
    let missingColumn: string | null = null;

    const match1 = errMsg.match(/Could not find the '([^']+)' column/i);
    const match2 = errMsg.match(/column "([^"]+)" of relation/i);
    const match3 = errMsg.match(/column "([^"]+)" does not exist/i);

    if (match1) {
      missingColumn = match1[1];
    } else if (match2) {
      missingColumn = match2[1];
    } else if (match3) {
      missingColumn = match3[1];
    }

    if (missingColumn && missingColumn in record) {
      console.log(`Dynamically removing missing column '${missingColumn}' and retrying...`);
      delete record[missingColumn];
    } else {
      // If we cannot identify a column to strip or the column isn't in our record, throw the error
      throw error;
    }
  }

  throw new Error(`Failed to insert into ${tableName} after exhausting retries.`);
};

/**
 * Inserts a new KS entry into Supabase.
 * Tries 'ks_entries' or falls back to 'kills' using robustInsert.
 */
export const insertKSEntryIntoSupabase = async (formData: {
  email: string;
  charName: string;
  rank: string;
  huntedName: string;
  respawn: string;
  idCode: string;
  prints: { name: string; url: string }[];
}): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const print1 = formData.prints[0];
  const print2 = formData.prints[1];

  const record: any = {
    player: formData.charName,
    char_name: formData.charName,
    ks: 1, // Default points
    date: new Date().toISOString(),
    player_rank: formData.rank,
    playerRank: formData.rank,
    respawn: formData.respawn,
    hunted_name: formData.huntedName,
    huntedName: formData.huntedName,
    id_code: formData.idCode,
    idCode: formData.idCode,
    email: formData.email,
    print1_url: print1?.url || '',
    print1_name: print1?.name || '',
    print2_url: print2?.url || '',
    print2_name: print2?.name || '',
    print1Url: print1?.url || '',
    print1Name: print1?.name || '',
    print2Url: print2?.url || '',
    print2Name: print2?.name || ''
  };

  // Attempt to insert to 'ks_entries'
  try {
    await robustInsert('ks_entries', record);
    return;
  } catch (err: any) {
    console.warn("Exception/failure inserting into 'ks_entries', trying 'kills' fallback...", err.message || err);
  }

  // Fallback to insert into 'kills'
  try {
    await robustInsert('kills', record);
  } catch (err: any) {
    throw new Error(`Failed to save entry: ${err.message || String(err)}`);
  }
};

/**
 * Fetches dynamic blacklist from Supabase 'blacklist' or 'black_list'.
 */
export const fetchBlackListFromSupabase = async (): Promise<string[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('blacklist')
      .select('name');

    if (!error && data) {
      return data.map(r => r.name || r.char_name).filter(Boolean);
    }
  } catch (err) {
    console.warn("Error reading blacklist table, trying black_list fallback", err);
  }

  try {
    const { data, error } = await supabase
      .from('black_list')
      .select('name');

    if (!error && data) {
      return data.map(r => r.name || r.char_name).filter(Boolean);
    }
  } catch (err) {
    console.warn("Error reading black_list table", err);
  }

  return [];
};

/**
 * Submits target suggestions to Supabase 'hunted_suggestions' or 'suggested_targets'.
 */
export const submitHuntedSuggestionToSupabase = async (suggestion: {
  charName: string;
  huntedName: string;
  reason: string;
  prints: { name: string; url: string }[];
}): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const record = {
    char_name: suggestion.charName,
    charName: suggestion.charName,
    hunted_name: suggestion.huntedName,
    huntedName: suggestion.huntedName,
    reason: suggestion.reason,
    prints: JSON.stringify(suggestion.prints),
    created_at: new Date().toISOString()
  };

  try {
    await robustInsert('hunted_suggestions', record);
    return;
  } catch (err: any) {
    console.warn("Exception/failure inserting into 'hunted_suggestions', trying 'suggested_targets' fallback...", err.message || err);
  }

  try {
    await robustInsert('suggested_targets', record);
  } catch (err: any) {
    throw new Error(`Failed to submit suggestion: ${err.message || String(err)}`);
  }
};

/**
 * Submits team applications to Supabase 'ks_team_applications' or 'team_applications'.
 */
export const submitTeamApplicationToSupabase = async (application: {
  email: string;
  charName: string;
  vocation: string;
  phone: string;
}): Promise<void> => {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const record = {
    email: application.email,
    char_name: application.charName,
    charName: application.charName,
    vocation: application.vocation,
    phone: application.phone,
    created_at: new Date().toISOString()
  };

  try {
    await robustInsert('ks_team_applications', record);
    return;
  } catch (err: any) {
    console.warn("Exception/failure inserting into 'ks_team_applications', trying 'team_applications' fallback...", err.message || err);
  }

  try {
    await robustInsert('team_applications', record);
  } catch (err: any) {
    throw new Error(`Failed to submit team application: ${err.message || String(err)}`);
  }
};
