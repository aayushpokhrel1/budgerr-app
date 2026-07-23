// Requests are forwarded through the Budgerr backend's /playstat proxy
// (same sub-paths, key injected server-side) rather than hitting the
// playstat service directly, so no playstat key ever lives in the client.
import { BUDGERR_API_KEY } from './api';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8001';
const PLAYSTAT_API_URL = process.env.EXPO_PUBLIC_PLAYSTAT_API_URL ?? `${API_URL}/playstat`;

export interface PlaystatEdge {
  player_id: number;
  player_name: string;
  team_id: number | null;
  game_id: number;
  date: string;
  stat_type: string;
  side: 'over' | 'under';
  line_value: number;
  odds: number;
  model_prob: number;
  edge: number;
}

export interface PlaystatGame {
  game_id: number;
  sport: string;
  date: string;
  home_team_id: number;
  home_team_name: string;
  away_team_id: number;
  away_team_name: string;
  status: string | null;
}

export interface PlaystatGamePrediction {
  game_id: number;
  date: string;
  sport: string;
  home_team: string;
  away_team: string;
  market: string;
  line_value: number;
  predicted_mean: number;
  prob_under: number;
  prob_over: number;
  model_version: string;
  book_line_value: number | null;
  book_over_odds: number | null;
  book_under_odds: number | null;
}

export interface PlaystatParlayLeg {
  player_id: number;
  player_name: string | null;
  game_id: number;
  stat_type: string;
  side: 'over' | 'under';
  model_prob: number;
  odds: number;
}

export interface PlaystatParlayRecommendation {
  parlay_id: number;
  created_at: string;
  target_payout: number;
  joint_prob: number;
  combined_odds: number;
  legs: PlaystatParlayLeg[];
}

export interface PlaystatBuilderLegBase {
  game_id: number;
  label: string;
  side: 'over' | 'under';
  line: number;
  odds: number;
  market_prob: number;
  model_prob: number | null; // CONTEXT ONLY — never surfaced as edge/value
}
export interface PlaystatBuilderPlayerLeg extends PlaystatBuilderLegBase {
  kind: 'player';
  player_id: number;
  stat_type: string;
  market: null;
}
export interface PlaystatBuilderTeamLeg extends PlaystatBuilderLegBase {
  kind: 'team';
  player_id: null;
  stat_type: null;
  market: 'first_inning_runs' | 'f5_runs';
}
export type PlaystatBuilderLeg = PlaystatBuilderPlayerLeg | PlaystatBuilderTeamLeg;

export interface PlaystatBuilderConstruction {
  parlay_id: number;
  created_at: string;
  target_payout: number;
  joint_prob: number;
  combined_odds: number;
  n_legs: number;
  legs: PlaystatBuilderLeg[];
}

/** Tonight's slate + everything keyed to its date. During off-days (e.g. the
 * MLB All-Star break) fall forward to the next date with scheduled games, up
 * to a week out, so the view shows the next slate instead of a blank page. */
export interface PlaystatSlate {
  date: string;
  isToday: boolean;
  games: PlaystatGame[];
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${PLAYSTAT_API_URL}${path}`, {
    headers: { 'X-API-Key': BUDGERR_API_KEY },
  });
  if (!res.ok) throw new Error(`Playstat API request failed: ${path} (${res.status})`);
  return res.json();
}

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const playstatApi = {
  slate: {
    next: async (): Promise<PlaystatSlate> => {
      for (let offset = 0; offset <= 7; offset++) {
        const date = isoDate(offset);
        const games = await fetchJson<PlaystatGame[]>(`/games?date=${date}`);
        if (games.length > 0) return { date, isToday: offset === 0, games };
      }
      return { date: isoDate(0), isToday: true, games: [] };
    },
  },
  edges: {
    list: (): Promise<PlaystatEdge[]> => fetchJson<PlaystatEdge[]>('/edges'),
    listForDate: async (date: string): Promise<PlaystatEdge[]> => {
      const edges = await fetchJson<PlaystatEdge[]>('/edges');
      return edges.filter((edge) => edge.date === date);
    },
  },
  gamePredictions: {
    listForDate: async (date: string): Promise<PlaystatGamePrediction[]> =>
      fetchJson<PlaystatGamePrediction[]>(`/game-predictions?date=${date}`),
  },
  games: {
    listForDate: (date: string): Promise<PlaystatGame[]> =>
      fetchJson<PlaystatGame[]>(`/games?date=${date}`),
  },
  parlays: {
    list: async (limit = 3): Promise<PlaystatParlayRecommendation[]> =>
      fetchJson<PlaystatParlayRecommendation[]>(`/parlay-recommendations?limit=${limit}`),
    listBuilder: async (limit = 10): Promise<PlaystatBuilderConstruction[]> =>
      fetchJson<PlaystatBuilderConstruction[]>(`/parlay-builder/saved?limit=${limit}`),
  },
};
