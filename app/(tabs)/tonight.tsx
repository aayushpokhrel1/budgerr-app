import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { BudgetPeriodCard } from '@/components/budget/BudgetPeriodCard';
import { GameCard } from '@/components/tonight/GameCard';
import { ParlayCard } from '@/components/tonight/ParlayCard';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PlaystatEdge, PlaystatGamePrediction } from '@/lib/playstat';
import {
  currentMonth,
  useBudgetPeriods,
  useCategories,
  usePlaystatEdges,
  usePlaystatGamePredictions,
  usePlaystatParlays,
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
  const parlays = usePlaystatParlays();

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
    parlays.refetch();
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

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Recommended parlays</Text>
      {(parlays.data?.length ?? 0) === 0 ? (
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>
          No parlay recommendations yet — the optimizer runs daily at 8:30am and needs a
          multi-game slate with lines.
        </Text>
      ) : (
        parlays.data?.map((parlay) => (
          <ParlayCard key={parlay.parlay_id} parlay={parlay} edges={edges.data ?? []} />
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
