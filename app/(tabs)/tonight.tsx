import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { BudgetPeriodCard } from '@/components/budget/BudgetPeriodCard';
import { BuilderParlayCard } from '@/components/tonight/BuilderParlayCard';
import { GameCard } from '@/components/tonight/GameCard';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { isRunFullyPast, runDate, selectLatestRun } from '@/lib/builderParlays';
import { PlaystatEdge, PlaystatGame, PlaystatGamePrediction } from '@/lib/playstat';
import {
  currentMonth,
  useBudgetPeriods,
  useCategories,
  usePlaystatBuilderParlays,
  usePlaystatEdges,
  usePlaystatGamePredictions,
  usePlaystatGames,
  usePlaystatSlate,
} from '@/lib/queries';

function slateHeading(date: string, isToday: boolean, count: number): string {
  if (isToday) return `Tonight's slate (${count})`;
  const day = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `Next slate — ${day} (${count})`;
}

export default function TonightScreen() {
  const theme = Colors[useColorScheme()];
  const month = useMemo(() => currentMonth(), []);

  const categories = useCategories();
  const budgetPeriods = useBudgetPeriods(month);
  const slate = usePlaystatSlate();
  const edges = usePlaystatEdges(slate.data?.date);
  const gamePredictions = usePlaystatGamePredictions(slate.data?.date);

  const builderParlays = usePlaystatBuilderParlays();
  const latestRun = useMemo(
    () => selectLatestRun(builderParlays.data ?? [], 4),
    [builderParlays.data]
  );
  // Resolve builder-leg games from the builder RUN's own date (which can differ
  // from the displayed slate) so matchups and settlement dates are correct.
  const builderGames = usePlaystatGames(runDate(latestRun));
  const builderGamesById = useMemo(() => {
    const map = new Map<number, PlaystatGame>();
    for (const game of builderGames.data ?? []) map.set(game.game_id, game);
    return map;
  }, [builderGames.data]);

  const builderConstructions = useMemo(() => {
    if (latestRun.length === 0) return [];
    if (!builderGames.data) return []; // wait for the run's games before deciding
    if (isRunFullyPast(latestRun, builderGamesById)) return []; // hide a stale past run
    return latestRun;
  }, [latestRun, builderGames.data, builderGamesById]);

  const bettingCategory = categories.data?.find((c) => c.is_betting_category);
  const bettingPeriod = bettingCategory
    ? budgetPeriods.data?.find((p) => p.category_id === bettingCategory.category_id)
    : undefined;

  const edgesByGame = useMemo(() => {
    const map = new Map<number, PlaystatEdge[]>();
    for (const edge of edges.data ?? []) {
      const list = map.get(edge.game_id) ?? [];
      list.push(edge);
      map.set(edge.game_id, list);
    }
    return map;
  }, [edges.data]);

  const firstInningByGame = useMemo(() => {
    const map = new Map<number, PlaystatGamePrediction>();
    for (const pred of gamePredictions.data ?? []) {
      if (pred.market === 'first_inning_runs') map.set(pred.game_id, pred);
    }
    return map;
  }, [gamePredictions.data]);

  const isLoading = categories.isLoading || budgetPeriods.isLoading || slate.isLoading;
  const isRefetching = categories.isFetching || budgetPeriods.isFetching || slate.isFetching;

  const refetchAll = () => {
    categories.refetch();
    budgetPeriods.refetch();
    slate.refetch();
    edges.refetch();
    gamePredictions.refetch();
    builderParlays.refetch();
    builderGames.refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const games = slate.data?.games ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}
    >
      <Text style={styles.header}>Tonight</Text>

      {bettingCategory && bettingPeriod && (
        <BudgetPeriodCard category={bettingCategory} period={bettingPeriod} />
      )}

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Low-risk builder parlays</Text>
      {builderConstructions.length === 0 ? (
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>
          No builder parlays yet — Playstat precomputes the low-risk parlay each evening.
        </Text>
      ) : (
        builderConstructions.map((construction) => (
          <BuilderParlayCard
            key={construction.parlay_id}
            construction={construction}
            gamesById={builderGamesById}
            remainingBudget={bettingPeriod?.remaining ?? 0}
          />
        ))
      )}

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {slate.data ? slateHeading(slate.data.date, slate.data.isToday, games.length) : ''}
      </Text>

      {games.length === 0 && (
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>
          No games scheduled in the next week.
        </Text>
      )}

      {games.map((game) => (
        <GameCard
          key={game.game_id}
          game={game}
          edges={edgesByGame.get(game.game_id) ?? []}
          firstInning={firstInningByGame.get(game.game_id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 22, fontWeight: '500', marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '500', marginBottom: 10, marginTop: 4 },
});
