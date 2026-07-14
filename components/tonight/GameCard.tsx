import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PlaystatEdge, PlaystatGame, PlaystatGamePrediction } from '@/lib/playstat';

function statusLabel(status: string | null): string {
  if (!status || status === 'NS' || status === 'S') return 'Upcoming';
  if (status === 'FT' || status === 'AOT') return 'Final';
  return status;
}

export function GameCard({
  game,
  edges,
  firstInning,
}: {
  game: PlaystatGame;
  edges: PlaystatEdge[];
  firstInning?: PlaystatGamePrediction;
}) {
  const theme = Colors[useColorScheme()];
  const label = statusLabel(game.status);
  const isFinal = label === 'Final';

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <Text style={styles.matchup} numberOfLines={1}>
          {game.away_team_name} @ {game.home_team_name}
        </Text>
        <View style={[styles.badge, { backgroundColor: theme.border }]}>
          <Text style={[styles.badgeText, { color: isFinal ? theme.textSecondary : theme.tint }]}>
            {label}
          </Text>
        </View>
      </View>

      {firstInning && (
        <Text style={[styles.edgeRow, { color: theme.textSecondary, marginTop: 8 }]}>
          1st inning under {firstInning.line_value} runs:{' '}
          <Text style={{ color: '#059669', fontWeight: '500' }}>
            {Math.round(firstInning.prob_under * 100)}%
          </Text>
          {firstInning.book_under_odds != null && (
            <Text>
              {' '}· book {firstInning.book_under_odds > 0 ? '+' : ''}
              {firstInning.book_under_odds} u{firstInning.book_line_value}
            </Text>
          )}
        </Text>
      )}

      {edges.length > 0 && (
        <View style={styles.edgesList}>
          {edges.map((edge) => (
            <Text
              key={`${edge.player_id}-${edge.stat_type}`}
              style={[styles.edgeRow, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {edge.player_name} {edge.side} {edge.line_value} {edge.stat_type}{' '}
              <Text style={{ color: theme.tint }}>
                ({edge.odds > 0 ? '+' : ''}
                {edge.odds})
              </Text>
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  matchup: { fontSize: 14, fontWeight: '500', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  edgesList: { marginTop: 8, gap: 4 },
  edgeRow: { fontSize: 12 },
});
