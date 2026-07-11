import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { BestCardTip } from '@/components/budget/BestCardTip';
import { BudgetPeriodCard } from '@/components/budget/BudgetPeriodCard';
import { CategoryTile } from '@/components/budget/CategoryTile';
import { RecentBets } from '@/components/budget/RecentBets';
import { TrendStats } from '@/components/budget/TrendStats';
import { Text, View } from '@/components/Themed';
import {
  currentMonth,
  useBestCard,
  useBets,
  useBetsTrend,
  useBudgetPeriods,
  useCategories,
} from '@/lib/queries';

export default function BudgetScreen() {
  const month = useMemo(() => currentMonth(), []);
  const [start, end] = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
    return [month, nextMonth];
  }, [month]);

  const categories = useCategories();
  const budgetPeriods = useBudgetPeriods(month);
  const bets = useBets();
  const trend = useBetsTrend(start, end);

  const bettingCategory = categories.data?.find((c) => c.is_betting_category);
  const otherCategories = categories.data?.filter((c) => !c.is_betting_category) ?? [];
  const tipCategory = otherCategories[0] ?? null;
  const bestCard = useBestCard(tipCategory?.category_id ?? null);

  const periodFor = (categoryId: number) =>
    budgetPeriods.data?.find((p) => p.category_id === categoryId);

  const isLoading = categories.isLoading || budgetPeriods.isLoading || bets.isLoading;
  const isRefetching = categories.isFetching || budgetPeriods.isFetching || bets.isFetching;

  const refetchAll = () => {
    categories.refetch();
    budgetPeriods.refetch();
    bets.refetch();
    trend.refetch();
    bestCard.refetch();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const bettingPeriod = bettingCategory ? periodFor(bettingCategory.category_id) : undefined;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />}
    >
      <Text style={styles.header}>Budget</Text>

      {bettingCategory && bettingPeriod && (
        <BudgetPeriodCard category={bettingCategory} period={bettingPeriod} />
      )}

      {otherCategories.length > 0 && (
        <View style={styles.tileRow}>
          {otherCategories.slice(0, 2).map((category) => {
            const period = periodFor(category.category_id);
            return period ? (
              <CategoryTile key={category.category_id} category={category} period={period} />
            ) : null;
          })}
        </View>
      )}

      <RecentBets bets={bets.data ?? []} />

      {tipCategory && bestCard.data && <BestCardTip category={tipCategory} result={bestCard.data} />}

      <TrendStats month={trend.data?.by_month.find((m) => m.month === month)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 22, fontWeight: '500', marginBottom: 16 },
  tileRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
});
