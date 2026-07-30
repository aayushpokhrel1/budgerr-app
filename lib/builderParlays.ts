import { BetInput, BetLegInput } from './api';
import { PlaystatBuilderConstruction, PlaystatBuilderLeg, PlaystatBuilderPlayerLeg, PlaystatBuilderTeamLeg, PlaystatGame } from './playstat';

const MARKET_LABEL: Record<'first_inning_runs' | 'f5_runs', string> = {
  first_inning_runs: 'NRFI',
  f5_runs: 'F5',
};

export function marketLabel(market: 'first_inning_runs' | 'f5_runs'): string {
  return MARKET_LABEL[market];
}

/** Player-leg labels are "{name} {stat_type} {side} {line}"; strip the known
 *  suffix to recover the name. Falls back to the raw label if it doesn't match. */
export function playerNameFromLabel(leg: {
  label: string;
  stat_type: string;
  side: string;
  line: number;
}): string {
  const suffix = ` ${leg.stat_type} ${leg.side} ${leg.line}`;
  return leg.label.endsWith(suffix) ? leg.label.slice(0, -suffix.length) : leg.label;
}

/** "Away @ Home" for a team leg, or undefined if the game isn't in the map. */
export function matchup(gameId: number, gamesById: Map<number, PlaystatGame>): string | undefined {
  const g = gamesById.get(gameId);
  return g ? `${g.away_team_name} @ ${g.home_team_name}` : undefined;
}

/** One-line display string for a leg (used by BuilderParlayCard). */
export function legDisplay(leg: PlaystatBuilderLeg, gamesById: Map<number, PlaystatGame>): string {
  if (leg.kind === 'team') {
    const m = matchup(leg.game_id, gamesById);
    return `${m ? `${m} — ` : ''}${marketLabel(leg.market)} ${leg.side} ${leg.line}`;
  }
  return `${playerNameFromLabel(leg)} ${leg.side} ${leg.line} ${leg.stat_type}`;
}

export function hasTeamLeg(construction: PlaystatBuilderConstruction): boolean {
  return construction.legs.some((leg) => leg.kind === 'team');
}

/** Most-recent nightly run (by created_at DATE), top N by joint_prob desc. */
export function selectLatestRun(
  constructions: PlaystatBuilderConstruction[],
  n = 4
): PlaystatBuilderConstruction[] {
  if (constructions.length === 0) return [];
  const dates = constructions.map((c) => c.created_at.slice(0, 10)).sort();
  const latestDate = dates[dates.length - 1];
  return constructions
    .filter((c) => c.created_at.slice(0, 10) === latestDate)
    .sort((a, b) => b.joint_prob - a.joint_prob)
    .slice(0, n);
}

/** Paper-bet payload for a construction. Team legs log but cannot auto-settle
 *  (BetLegInput has no game_id/market) — that's intentional and documented. */
export function builderConstructionToBetInput(
  construction: PlaystatBuilderConstruction,
  gamesById: Map<number, PlaystatGame>,
  stake: number
): BetInput {
  const legs: BetLegInput[] = construction.legs.map((leg) => {
    if (leg.kind === 'team') {
      const m = matchup(leg.game_id, gamesById);
      return {
        player_name: `${m ?? `Game ${leg.game_id}`} · ${marketLabel(leg.market)}`,
        stat_type: leg.market,
        line_value: leg.line,
        side: leg.side,
        odds: leg.odds,
      };
    }
    return {
      player_name: playerNameFromLabel(leg),
      stat_type: leg.stat_type,
      line_value: leg.line,
      side: leg.side,
      odds: leg.odds,
    };
  });
  const gameDate = construction.legs
    .map((leg) => gamesById.get(leg.game_id)?.date)
    .find((d): d is string => !!d);
  return {
    sportsbook: 'paper',
    bet_type: construction.legs.length > 1 ? 'parlay' : 'single',
    stake,
    potential_payout: stake * construction.combined_odds,
    placed_at: gameDate ? `${gameDate}T12:00:00Z` : undefined,
    is_paper: true,
    legs,
  };
}

/** The created_at date (YYYY-MM-DD) of the run these constructions belong to,
 *  used to fetch that run's games for matchup + settlement-date resolution. */
export function runDate(constructions: PlaystatBuilderConstruction[]): string | undefined {
  return constructions[0]?.created_at.slice(0, 10);
}

// Statuses meaning a game has not started yet (mirrors GameCard's "Upcoming").
const UPCOMING_STATUSES: ReadonlySet<string | null> = new Set([null, 'NS', 'S']);

/** A run is fully past when it has at least one resolvable game and none of its
 *  resolvable games are still upcoming (all have started or finished). Used to
 *  hide a stale builder run whose slate has already played. */
export function isRunFullyPast(
  constructions: PlaystatBuilderConstruction[],
  gamesById: Map<number, PlaystatGame>
): boolean {
  const games = constructions
    .flatMap((c) => c.legs.map((l) => gamesById.get(l.game_id)))
    .filter((g): g is PlaystatGame => !!g);
  if (games.length === 0) return false;
  return games.every((g) => !UPCOMING_STATUSES.has(g.status));
}

/** Stable identity for a player leg (dedup + slate-suppression key). */
export function playerLegIdentity(leg: PlaystatBuilderPlayerLeg): string {
  return `${leg.player_id}|${leg.stat_type}|${leg.side}|${leg.line}`;
}

/** Set of player-leg identities across the given constructions (e.g. the
 *  top-N already shown in the section), for slate suppression. */
export function playerLegKeys(constructions: PlaystatBuilderConstruction[]): Set<string> {
  const keys = new Set<string>();
  for (const c of constructions)
    for (const leg of c.legs) if (leg.kind === 'player') keys.add(playerLegIdentity(leg));
  return keys;
}

/** Deduped flat list of the LATEST player run's player legs (quick-entry picker). */
export function distinctPlayerLegs(
  playerConstructions: PlaystatBuilderConstruction[]
): PlaystatBuilderPlayerLeg[] {
  const run = selectLatestRun(playerConstructions, Infinity);
  const seen = new Set<string>();
  const out: PlaystatBuilderPlayerLeg[] = [];
  for (const c of run)
    for (const leg of c.legs)
      if (leg.kind === 'player') {
        const k = playerLegIdentity(leg);
        if (!seen.has(k)) {
          seen.add(k);
          out.push(leg);
        }
      }
  return out;
}

/** Latest player run's distinct player legs grouped by game_id, minus excluded keys. */
export function playerLegsByGame(
  playerConstructions: PlaystatBuilderConstruction[],
  excludeKeys: ReadonlySet<string> = new Set()
): Map<number, PlaystatBuilderPlayerLeg[]> {
  const map = new Map<number, PlaystatBuilderPlayerLeg[]>();
  for (const leg of distinctPlayerLegs(playerConstructions)) {
    if (excludeKeys.has(playerLegIdentity(leg))) continue;
    const list = map.get(leg.game_id) ?? [];
    list.push(leg);
    map.set(leg.game_id, list);
  }
  return map;
}

/** Latest team run's first-inning (NRFI) leg per game_id. */
export function firstInningLegByGame(
  teamConstructions: PlaystatBuilderConstruction[]
): Map<number, PlaystatBuilderTeamLeg> {
  const map = new Map<number, PlaystatBuilderTeamLeg>();
  const run = selectLatestRun(teamConstructions, Infinity);
  for (const c of run)
    for (const leg of c.legs)
      if (leg.kind === 'team' && leg.market === 'first_inning_runs' && !map.has(leg.game_id))
        map.set(leg.game_id, leg);
  return map;
}
