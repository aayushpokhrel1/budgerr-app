import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { cardShadow } from '@/constants/Shadow';
import { useColorScheme } from '@/components/useColorScheme';
import { PlaystatParlayRecommendation } from '@/lib/playstat';

export function ParlayCard({ parlay }: { parlay: PlaystatParlayRecommendation }) {
  const theme = Colors[useColorScheme()];

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.edgeBorder }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {parlay.legs.length}-leg parlay · {parlay.combined_odds.toFixed(2)}x
        </Text>
        <View style={[styles.badge, { backgroundColor: theme.edgeBg }]}>
          <Text style={[styles.badgeText, { color: theme.edge }]}>
            {Math.round(parlay.joint_prob * 100)}% to hit
          </Text>
        </View>
      </View>
      <View style={styles.legsList}>
        {parlay.legs.map((leg) => (
          <Text
            key={`${leg.player_id}-${leg.stat_type}`}
            style={[styles.legRow, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {leg.player_name ?? `#${leg.player_id}`} {leg.side} {leg.stat_type}{' '}
            <Text style={{ color: theme.tint }}>
              ({leg.odds > 0 ? '+' : ''}
              {leg.odds})
            </Text>
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginBottom: 10, ...cardShadow },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 14, fontWeight: '500', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  legsList: { marginTop: 8, gap: 4 },
  legRow: { fontSize: 12 },
});
