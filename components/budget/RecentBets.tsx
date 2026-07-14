import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Bet } from '@/lib/api';

function legsSummary(bet: Bet): string | null {
  if (bet.legs.length === 0) return null;
  return bet.legs
    .map((leg) => {
      const parts = [leg.player_name, leg.side, leg.line_value, leg.stat_type].filter(Boolean);
      return parts.join(' ');
    })
    .join(', ');
}

function statusBadge(bet: Bet, theme: (typeof Colors)['light']) {
  if (bet.status === 'pending') {
    return { text: 'Pending', bg: theme.card, fg: theme.textSecondary };
  }
  if (bet.status === 'won') {
    return { text: `Won +$${(bet.net_result ?? 0).toFixed(0)}`, bg: theme.successBg, fg: theme.success };
  }
  if (bet.status === 'lost') {
    return { text: `Lost $${Math.abs(bet.net_result ?? 0).toFixed(0)}`, bg: theme.dangerBg, fg: theme.danger };
  }
  return { text: bet.status, bg: theme.card, fg: theme.textSecondary };
}

export function RecentBets({ bets }: { bets: Bet[] }) {
  const theme = Colors[useColorScheme()];

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent bets</Text>
        <Link href="/modal" asChild>
          <Pressable style={{ ...styles.logButton, borderColor: theme.border }}>
            <Text style={styles.logButtonText}>+ Log a bet</Text>
          </Pressable>
        </Link>
      </View>

      {bets.length === 0 && (
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>No bets logged yet.</Text>
      )}

      {bets.slice(0, 5).map((bet) => {
        const badge = statusBadge(bet, theme);
        const summary = legsSummary(bet);
        return (
          <View key={bet.bet_id} style={[styles.row, { borderTopColor: theme.border }]}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={styles.rowTitleLine}>
                <Text style={styles.rowTitle}>
                  {bet.sportsbook} {bet.bet_type}
                </Text>
                {bet.is_paper && (
                  <View style={[styles.paperBadge, { backgroundColor: theme.warningBg }]}>
                    <Text style={[styles.paperBadgeText, { color: theme.warning }]}>PAPER</Text>
                  </View>
                )}
              </View>
              {summary && (
                <Text style={{ fontSize: 12, color: theme.textMuted }} numberOfLines={1}>
                  {summary}
                </Text>
              )}
            </View>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.fg }]}>{badge.text}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 0.5, padding: 16, marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 14, fontWeight: '500' },
  logButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5 },
  logButtonText: { fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 0.5,
  },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowTitle: { fontSize: 13, textTransform: 'capitalize' },
  paperBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  paperBadgeText: { fontSize: 10, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 12 },
});
