import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { cardShadow } from '@/constants/Shadow';
import { useColorScheme } from '@/components/useColorScheme';
import { BetLegInput } from '@/lib/api';
import { PlaystatEdge, PlaystatParlayLeg, PlaystatParlayRecommendation } from '@/lib/playstat';
import { useCreateBet } from '@/lib/queries';

const PAPER_STAKE = 10;

function lineValueForLeg(leg: PlaystatParlayLeg, edges: PlaystatEdge[]): number | null {
  const match = edges.find(
    (edge) =>
      edge.player_id === leg.player_id &&
      edge.game_id === leg.game_id &&
      edge.stat_type === leg.stat_type
  );
  return match?.line_value ?? null;
}

export function ParlayCard({
  parlay,
  edges = [],
}: {
  parlay: PlaystatParlayRecommendation;
  edges?: PlaystatEdge[];
}) {
  const theme = Colors[useColorScheme()];
  const createBet = useCreateBet();
  const [logged, setLogged] = useState(false);

  const logAsPaperBet = () => {
    if (createBet.isPending || logged) return;

    const legInputs: BetLegInput[] = parlay.legs.map((leg) => ({
      player_name: leg.player_name ?? undefined,
      stat_type: leg.stat_type,
      line_value: lineValueForLeg(leg, edges) ?? undefined,
      side: leg.side,
      odds: leg.odds,
      model_prob: leg.model_prob,
    }));

    createBet.mutate(
      {
        sportsbook: 'paper',
        bet_type: parlay.legs.length > 1 ? 'parlay' : 'single',
        stake: PAPER_STAKE,
        potential_payout: PAPER_STAKE * parlay.combined_odds,
        legs: legInputs,
        is_paper: true,
      },
      { onSuccess: () => setLogged(true) }
    );
  };

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
      <Pressable
        style={[
          styles.paperButton,
          { borderColor: theme.border },
          logged && { backgroundColor: theme.successBg, borderColor: theme.successBg },
        ]}
        onPress={logAsPaperBet}
        disabled={createBet.isPending || logged}
      >
        {createBet.isPending ? (
          <ActivityIndicator size="small" color={theme.textSecondary} />
        ) : (
          <Text
            style={[
              styles.paperButtonText,
              { color: logged ? theme.success : theme.textSecondary },
            ]}
          >
            {logged ? 'Logged ✓' : 'Log as paper bet'}
          </Text>
        )}
      </Pressable>
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
  paperButton: {
    marginTop: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  paperButtonText: { fontSize: 12, fontWeight: '500' },
});
