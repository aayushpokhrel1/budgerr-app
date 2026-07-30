import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { cardShadow } from '@/constants/Shadow';
import { useColorScheme } from '@/components/useColorScheme';
import { PlaystatBuilderPlayerLeg, PlaystatBuilderTeamLeg, PlaystatGame } from '@/lib/playstat';
import { marketLabel, playerNameFromLabel } from '@/lib/builderParlays';

function statusLabel(status: string | null): string {
  if (!status || status === 'NS' || status === 'S') return 'Upcoming';
  if (status === 'FT' || status === 'AOT') return 'Final';
  return status;
}

export function GameCard({
  game,
  playerLegs,
  firstInningLeg,
}: {
  game: PlaystatGame;
  playerLegs: PlaystatBuilderPlayerLeg[];
  firstInningLeg?: PlaystatBuilderTeamLeg;
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

      {firstInningLeg && (
        <Text style={[styles.edgeRow, { color: theme.textSecondary, marginTop: 8 }]}>
          {marketLabel(firstInningLeg.market)} {firstInningLeg.side} {firstInningLeg.line}:{' '}
          <Text style={{ color: theme.textSecondary, fontWeight: '500' }}>
            {Math.round(firstInningLeg.market_prob * 100)}%
          </Text>
          <Text style={{ color: theme.tint }}>
            {' '}({firstInningLeg.odds > 0 ? '+' : ''}
            {firstInningLeg.odds})
          </Text>
        </Text>
      )}

      {playerLegs.length > 0 && (
        <View style={styles.edgesList}>
          {playerLegs.map((leg) => (
            <Text
              key={`${leg.player_id}-${leg.stat_type}-${leg.side}-${leg.line}`}
              style={[styles.edgeRow, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {playerNameFromLabel(leg)} {leg.side} {leg.line} {leg.stat_type}{' '}
              <Text style={{ color: theme.tint }}>
                ({leg.odds > 0 ? '+' : ''}
                {leg.odds})
              </Text>
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginBottom: 10, ...cardShadow },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  matchup: { fontSize: 14, fontWeight: '500', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  edgesList: { marginTop: 8, gap: 4 },
  edgeRow: { fontSize: 12 },
});
