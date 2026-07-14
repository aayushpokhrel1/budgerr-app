import { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAccounts, useSyncTransactions } from '@/lib/queries';

export default function AccountsScreen() {
  const theme = Colors[useColorScheme()];
  const accounts = useAccounts();
  const syncTransactions = useSyncTransactions();

  const itemIds = useMemo(
    () => Array.from(new Set((accounts.data ?? []).map((a) => a.plaid_item_id))),
    [accounts.data]
  );
  const institutionForItem = (itemId: string) =>
    accounts.data?.find((a) => a.plaid_item_id === itemId)?.institution_name ?? 'account';

  if (accounts.isLoading) {
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
      refreshControl={<RefreshControl refreshing={accounts.isFetching} onRefresh={() => accounts.refetch()} />}
    >
      <Text style={styles.header}>Accounts</Text>

      {accounts.data?.length === 0 && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
            No bank accounts linked yet. Link one from the Budgerr web app — it&apos;ll show up here
            once linked.
          </Text>
        </View>
      )}

      {accounts.data && accounts.data.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {accounts.data.map((account, i) => (
            <View
              key={account.account_id}
              style={[styles.row, i > 0 && { borderTopColor: theme.border, borderTopWidth: 0.5 }]}
            >
              <View>
                <Text style={styles.rowTitle}>
                  {account.institution_name} •••{account.mask}
                </Text>
                <Text style={{ fontSize: 12, color: theme.textMuted, textTransform: 'capitalize' }}>
                  {account.account_type}
                </Text>
              </View>
              <Text style={styles.balance}>${account.current_balance.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      {itemIds.length > 0 && (
        <View style={styles.syncRow}>
          {itemIds.map((itemId) => (
            <Pressable
              key={itemId}
              style={[styles.syncButton, { borderColor: theme.border }]}
              onPress={() => syncTransactions.mutate(itemId)}
              disabled={syncTransactions.isPending}
            >
              <Text style={{ fontSize: 13 }}>
                {syncTransactions.isPending ? 'Syncing...' : `Sync ${institutionForItem(itemId)}`}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 22, fontWeight: '500', marginBottom: 16 },
  card: { borderRadius: 12, borderWidth: 0.5, padding: 4, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowTitle: { fontSize: 14, fontWeight: '500' },
  balance: { fontSize: 14, fontWeight: '500' },
  syncRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  syncButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 0.5 },
});
