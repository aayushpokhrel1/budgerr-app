import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { MonthlyNetResult } from '@/lib/api';

export function TrendStats({ month }: { month: MonthlyNetResult | undefined }) {
  const theme = Colors[useColorScheme()];
  const profit = month?.bet_net_profit ?? 0;
  const cashFlow = month?.bank_net_cash_outflow ?? 0;

  return (
    <View style={styles.row}>
      <View style={[styles.tile, { backgroundColor: theme.card }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Net bet profit</Text>
        <Text style={[styles.amount, { color: profit >= 0 ? theme.success : theme.danger }]}>
          {profit >= 0 ? '+' : ''}
          ${profit.toFixed(0)}
        </Text>
      </View>
      <View style={[styles.tile, { backgroundColor: theme.card }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Bank cash flow</Text>
        <Text style={styles.amount}>${cashFlow.toFixed(0)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, borderRadius: 8, padding: 16 },
  label: { fontSize: 13, marginBottom: 4 },
  amount: { fontSize: 20, fontWeight: '500' },
});
