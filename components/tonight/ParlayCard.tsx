import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { cardShadow } from '@/constants/Shadow';
import { useColorScheme } from '@/components/useColorScheme';
import { BetLegInput } from '@/lib/api';
import { quarterKelly } from '@/lib/kelly';
import { PlaystatEdge, PlaystatParlayLeg, PlaystatParlayRecommendation } from '@/lib/playstat';
import { useCreateBet } from '@/lib/queries';

const PAPER_STAKE = 10;

function edgeForLeg(leg: PlaystatParlayLeg, edges: PlaystatEdge[]): PlaystatEdge | undefined {
  return edges.find(
    (edge) =>
      edge.player_id === leg.player_id &&
      edge.game_id === leg.game_id &&
      edge.stat_type === leg.stat_type
  );
}

export function ParlayCard({
  parlay,
  edges = [],
  remainingBudget = 0,
}: {
  parlay: PlaystatParlayRecommendation;
  edges?: PlaystatEdge[];
  remainingBudget?: number;
}) {
  const theme = Colors[useColorScheme()];
  const createBet = useCreateBet();
  const [logged, setLogged] = useState(false);

  const { suggested: kellyStake } = quarterKelly(
    parlay.combined_odds,
    parlay.joint_prob,
    remainingBudget
  );

  const logAsPaperBet = () => {
    if (createBet.isPending || logged) return;

    // The matching edge carries the prop line and game date the parlay
    // recommendation omits — auto-settlement needs the line to grade a leg
    // and matches box scores on the bet's placed_at date.
    const matchedEdges = parlay.legs.map((leg) => edgeForLeg(leg, edges));
    const legInputs: BetLegInput[] = parlay.legs.map((leg, i) => ({
      player_name: leg.player_name ?? undefined,
      stat_type: leg.stat_type,
      line_value: matchedEdges[i]?.line_value,
      side: leg.side,
      odds: leg.odds,
      model_prob: leg.model_prob,
    }));
    const gameDate = matchedEdges.find((e) => e)?.date;

    createBet.mutate(
      {
        sportsbook: 'paper',
        bet_type: parlay.legs.length > 1 ? 'parlay' : 'single',
        stake: PAPER_STAKE,
        potential_payout: PAPER_STAKE * parlay.combined_odds,
        placed_at: gameDate ? `${gameDate}T12:00:00Z` : undefined,
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
      {kellyStake > 0 && (
        <View style={styles.kellyRow}>
          <Text style={[styles.kellyText, { color: theme.text }]}>
            ¼-Kelly stake: ${kellyStake.toFixed(2)}
          </Text>
          <Text style={[styles.kellyCaption, { color: theme.textMuted }]}>
            Guidance only — sizing depends on model calibration, not a bet recommendation.
          </Text>
        </View>
      )}
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
  kellyRow: { marginTop: 8, gap: 2 },
  kellyText: { fontSize: 12, fontWeight: '500' },
  kellyCaption: { fontSize: 10 },
  paperButton: {
    marginTop: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  paperButtonText: { fontSize: 12, fontWeight: '500' },
});
