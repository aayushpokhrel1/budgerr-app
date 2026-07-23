import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { cardShadow } from '@/constants/Shadow';
import { useColorScheme } from '@/components/useColorScheme';
import { quarterKelly } from '@/lib/kelly';
import { PlaystatBuilderConstruction, PlaystatGame } from '@/lib/playstat';
import { builderConstructionToBetInput, hasTeamLeg, legDisplay } from '@/lib/builderParlays';
import { useCreateBet } from '@/lib/queries';

const PAPER_STAKE = 10;

export function BuilderParlayCard({
  construction,
  gamesById,
  remainingBudget = 0,
}: {
  construction: PlaystatBuilderConstruction;
  gamesById: Map<number, PlaystatGame>;
  remainingBudget?: number;
}) {
  const theme = Colors[useColorScheme()];
  const createBet = useCreateBet();
  const [logged, setLogged] = useState(false);

  const { suggested: kellyStake } = quarterKelly(
    construction.combined_odds,
    construction.joint_prob,
    remainingBudget
  );
  const teamNote = hasTeamLeg(construction);

  const logAsPaperBet = () => {
    if (createBet.isPending || logged) return;
    createBet.mutate(builderConstructionToBetInput(construction, gamesById, PAPER_STAKE), {
      onSuccess: () => setLogged(true),
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.edgeBorder }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {construction.n_legs}-leg · {construction.combined_odds.toFixed(2)}x
        </Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: theme.edgeBg }]}>
            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
              {construction.target_payout.toFixed(1)}x
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.edgeBg }]}>
            <Text style={[styles.badgeText, { color: theme.edge }]}>
              {Math.round(construction.joint_prob * 100)}% to hit
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.legsList}>
        {construction.legs.map((leg, i) => (
          <Text key={i} style={[styles.legRow, { color: theme.textSecondary }]} numberOfLines={1}>
            {legDisplay(leg, gamesById)}{' '}
            <Text style={{ color: theme.tint }}>
              ({leg.odds > 0 ? '+' : ''}
              {leg.odds})
            </Text>
          </Text>
        ))}
      </View>
      {teamNote && (
        <Text style={[styles.note, { color: theme.textMuted }]}>
          Team markets log but don&apos;t auto-settle yet.
        </Text>
      )}
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
          <Text style={[styles.paperButtonText, { color: logged ? theme.success : theme.textSecondary }]}>
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
  badges: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  legsList: { marginTop: 8, gap: 4 },
  legRow: { fontSize: 12 },
  note: { marginTop: 8, fontSize: 11, fontStyle: 'italic' },
  kellyRow: { marginTop: 8, gap: 2 },
  kellyText: { fontSize: 12, fontWeight: '500' },
  kellyCaption: { fontSize: 10 },
  paperButton: { marginTop: 10, borderWidth: 0.5, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  paperButtonText: { fontSize: 12, fontWeight: '500' },
});
