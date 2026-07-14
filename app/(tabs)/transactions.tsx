import { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Switch } from 'react-native';

import { CategoryPicker } from '@/components/transactions/CategoryPicker';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAccounts, useCategories, useCategorizeTransaction, useTransactions } from '@/lib/queries';

export default function TransactionsScreen() {
  const theme = Colors[useColorScheme()];
  const [uncategorizedOnly, setUncategorizedOnly] = useState(false);

  const transactions = useTransactions({ uncategorizedOnly, limit: 100 });
  const accounts = useAccounts();
  const categories = useCategories();
  const categorize = useCategorizeTransaction();

  const accountById = useMemo(
    () => new Map((accounts.data ?? []).map((a) => [a.account_id, a])),
    [accounts.data]
  );
  const nonBettingCategories = useMemo(
    () => (categories.data ?? []).filter((c) => !c.is_betting_category),
    [categories.data]
  );

  if (transactions.isLoading) {
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
      refreshControl={
        <RefreshControl refreshing={transactions.isFetching} onRefresh={() => transactions.refetch()} />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.header}>Transactions</Text>
      </View>

      <View style={styles.toggleRow}>
        <Text style={{ fontSize: 13, color: theme.textSecondary }}>Uncategorized only</Text>
        <Switch value={uncategorizedOnly} onValueChange={setUncategorizedOnly} />
      </View>

      {transactions.data?.length === 0 && (
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>
          No transactions yet — link a bank account and sync from the Accounts tab.
        </Text>
      )}

      {transactions.data && transactions.data.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {transactions.data.map((txn, i) => {
            const account = accountById.get(txn.account_id);
            return (
              <View
                key={txn.txn_id}
                style={[styles.row, i > 0 && { borderTopColor: theme.border, borderTopWidth: 0.5 }]}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {txn.merchant_name ?? 'Unknown merchant'}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textMuted }} numberOfLines={1}>
                    {txn.date}
                    {account ? ` · ${account.institution_name} •••${account.mask}` : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={styles.amount}>${txn.amount.toFixed(2)}</Text>
                  {txn.is_betting ? (
                    <View style={[styles.badge, { backgroundColor: theme.successBg }]}>
                      <Text style={{ fontSize: 11, color: theme.success }}>betting</Text>
                    </View>
                  ) : (
                    <CategoryPicker
                      categories={nonBettingCategories}
                      value={txn.custom_category}
                      onChange={(customCategory) => categorize.mutate({ txnId: txn.txn_id, customCategory })}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  header: { fontSize: 22, fontWeight: '500', marginBottom: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 16 },
  card: { borderRadius: 12, borderWidth: 0.5, padding: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowTitle: { fontSize: 14 },
  amount: { fontSize: 14, fontWeight: '500' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
});
