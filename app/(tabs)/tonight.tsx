import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { BudgetPeriodCard } from '@/components/budget/BudgetPeriodCard';
import { GameCard } from '@/components/tonight/GameCard';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PlaystatEdge } from '@/lib/playstat';
import {
  currentMonth,
  useBudgetPeriods,
  useCategories,
  usePlaystatTonightsEdges,
  usePlaystatTonightsGames,
} from '@/lib/queries';

export default function TonightScreen() {
  const theme = Colors[useColorScheme()];
  const month = useMemo(() => currentMonth(), []);

  const categories = useCategories();
  const budgetPeriods = useBudgetPeriods(month);
  const games = usePlaystatTonightsGames();
  const edges = usePlaystatTonightsEdges();

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

  const isLoading = categories.isLoading || budgetPeriods.isLoading || games.isLoading;
  const isRefetching = categories.isFetching || budgetPeriods.isFetching || games.isFetching;

  const refetchAll = () => {
    categories.refetch();
    budgetPeriods.refetch();
    games.refetch();
    edges.refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

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

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        Tonight&apos;s slate{games.data ? ` (${games.data.length})` : ''}
      </Text>

      {games.data?.length === 0 && (
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>No games tonight.</Text>
      )}

      {games.data?.map((game) => (
        <GameCard key={game.game_id} game={game} edges={edgesByGame.get(game.game_id) ?? []} />
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
