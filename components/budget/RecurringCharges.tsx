import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { RecurringChargesResponse } from '@/lib/api';

export function RecurringCharges({ data }: { data: RecurringChargesResponse | undefined }) {
  const theme = Colors[useColorScheme()];
  const recurring = data?.recurring ?? [];

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={styles.title}>
        Recurring charges · ≈ ${(data?.monthly_total ?? 0).toFixed(2)}/mo
      </Text>

      {recurring.length === 0 ? (
        <Text style={{ fontSize: 13, color: theme.textMuted }}>No recurring charges detected.</Text>
      ) : (
        recurring.map((charge) => (
          <View key={charge.merchant_name} style={[styles.row, !charge.active && styles.inactiveRow]}>
            <Text style={[styles.merchant, !charge.active && { color: theme.textMuted }]}>
              {charge.merchant_name}
            </Text>
            <View style={styles.rowRight}>
              <Text style={[styles.interval, { color: theme.textSecondary }]}>
                every ~{Math.round(charge.median_interval_days)}d
              </Text>
              <Text style={[styles.amount, !charge.active && { color: theme.textMuted }]}>
                ${charge.last_amount.toFixed(2)}
              </Text>
              {!charge.active && (
                <View style={[styles.tag, { backgroundColor: theme.border }]}>
                  <Text style={[styles.tagText, { color: theme.textMuted }]}>inactive</Text>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 0.5, padding: 16, marginBottom: 12 },
  title: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  inactiveRow: { opacity: 0.5 },
  merchant: { fontSize: 13 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  interval: { fontSize: 12 },
  amount: { fontSize: 13, fontWeight: '500' },
  tag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 11, fontWeight: '500' },
});
