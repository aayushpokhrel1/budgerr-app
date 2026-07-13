const PLAYSTAT_API_URL = process.env.EXPO_PUBLIC_PLAYSTAT_API_URL ?? 'http://localhost:8000';

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

export const playstatApi = {
  edges: {
    listTonight: async (): Promise<PlaystatEdge[]> => {
      const res = await fetch(`${PLAYSTAT_API_URL}/edges`);
      if (!res.ok) throw new Error(`Playstat API request failed: /edges (${res.status})`);
      const edges: PlaystatEdge[] = await res.json();
      const today = new Date().toISOString().slice(0, 10);
      return edges.filter((edge) => edge.date === today);
    },
  },
};
