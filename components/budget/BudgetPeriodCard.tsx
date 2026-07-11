import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BudgetPeriod, Category } from '@/lib/api';

function statusForPct(pct: number): 'ok' | 'warning' | 'danger' {
  if (pct >= 100) return 'danger';
  if (pct >= 80) return 'warning';
  return 'ok';
}

export function BudgetPeriodCard({ category, period }: { category: Category; period: BudgetPeriod }) {
  const theme = Colors[useColorScheme()];
  const pct = period.limit > 0 ? (period.spent / period.limit) * 100 : 0;
  const status = statusForPct(pct);

  const badgeColors = {
    ok: { bg: theme.successBg, fg: theme.success },
    warning: { bg: theme.warningBg, fg: theme.warning },
    danger: { bg: theme.dangerBg, fg: theme.danger },
  }[status];

  const barColor = { ok: theme.success, warning: theme.warning, danger: theme.danger }[status];

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{category.name}</Text>
        <View style={[styles.badge, { backgroundColor: badgeColors.bg }]}>
          <Text style={[styles.badgeText, { color: badgeColors.fg }]}>{Math.round(pct)}% used</Text>
        </View>
      </View>
      <View style={styles.amountRow}>
        <Text style={styles.amount}>${period.spent.toFixed(0)}</Text>
        <Text style={[styles.amountSub, { color: theme.textSecondary }]}>
          {' '}
          of ${period.limit.toFixed(0)} spent · ${period.remaining.toFixed(0)} left
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 0.5, padding: 16, marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 14, fontWeight: '500' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '500' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  amount: { fontSize: 22, fontWeight: '500' },
  amountSub: { fontSize: 13 },
  track: { height: 6, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
