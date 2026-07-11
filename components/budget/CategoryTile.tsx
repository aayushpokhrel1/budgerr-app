import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BudgetPeriod, Category } from '@/lib/api';

export function CategoryTile({ category, period }: { category: Category; period: BudgetPeriod }) {
  const theme = Colors[useColorScheme()];

  return (
    <View style={[styles.tile, { backgroundColor: theme.card }]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{category.name}</Text>
      <Text style={styles.amount}>
        ${period.spent.toFixed(0)}
        <Text style={[styles.amountSub, { color: theme.textSecondary }]}> / ${period.limit.toFixed(0)}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, borderRadius: 8, padding: 16 },
  label: { fontSize: 13, marginBottom: 4 },
  amount: { fontSize: 20, fontWeight: '500' },
  amountSub: { fontSize: 13, fontWeight: '400' },
});
