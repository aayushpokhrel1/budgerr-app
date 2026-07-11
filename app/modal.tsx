import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BetLegInput, BetType } from '@/lib/api';
import { useCreateBet } from '@/lib/queries';

interface LegDraft {
  player_name: string;
  stat_type: string;
  line_value: string;
  side: string;
  odds: string;
}

const emptyLeg: LegDraft = { player_name: '', stat_type: '', line_value: '', side: '', odds: '' };

export default function LogBetModal() {
  const theme = Colors[useColorScheme()];
  const router = useRouter();
  const createBet = useCreateBet();

  const [sportsbook, setSportsbook] = useState('');
  const [betType, setBetType] = useState<BetType>('single');
  const [stake, setStake] = useState('');
  const [potentialPayout, setPotentialPayout] = useState('');
  const [legs, setLegs] = useState<LegDraft[]>([]);

  const updateLeg = (index: number, field: keyof LegDraft, value: string) => {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, [field]: value } : leg)));
  };

  const submit = () => {
    const stakeNum = parseFloat(stake);
    const payoutNum = parseFloat(potentialPayout);
    if (!sportsbook || Number.isNaN(stakeNum) || Number.isNaN(payoutNum)) {
      Alert.alert('Missing info', 'Sportsbook, stake, and potential payout are required.');
      return;
    }

    const legInputs: BetLegInput[] = legs.map((leg) => ({
      player_name: leg.player_name || undefined,
      stat_type: leg.stat_type || undefined,
      line_value: leg.line_value ? parseFloat(leg.line_value) : undefined,
      side: leg.side || undefined,
      odds: leg.odds ? parseInt(leg.odds, 10) : undefined,
    }));

    createBet.mutate(
      { sportsbook, bet_type: betType, stake: stakeNum, potential_payout: payoutNum, legs: legInputs },
      {
        onSuccess: () => router.back(),
        onError: (err) => Alert.alert('Failed to log bet', String(err)),
      }
    );
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Sportsbook</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="DraftKings"
        placeholderTextColor={theme.textMuted}
        value={sportsbook}
        onChangeText={setSportsbook}
      />

      <Text style={styles.label}>Bet type</Text>
      <View style={styles.typeRow}>
        {(['single', 'parlay'] as BetType[]).map((type) => (
          <Pressable
            key={type}
            onPress={() => setBetType(type)}
            style={[
              styles.typeButton,
              { borderColor: theme.border },
              betType === type && { backgroundColor: theme.tint, borderColor: theme.tint },
            ]}
          >
            <Text style={betType === type ? { color: theme.background } : undefined}>{type}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Stake ($)</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="25"
        placeholderTextColor={theme.textMuted}
        keyboardType="decimal-pad"
        value={stake}
        onChangeText={setStake}
      />

      <Text style={styles.label}>Potential payout ($)</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="75"
        placeholderTextColor={theme.textMuted}
        keyboardType="decimal-pad"
        value={potentialPayout}
        onChangeText={setPotentialPayout}
      />

      <View style={styles.legsHeaderRow}>
        <Text style={styles.label}>Legs</Text>
        <Pressable onPress={() => setLegs((prev) => [...prev, { ...emptyLeg }])}>
          <Text style={{ color: theme.tint, fontSize: 13 }}>+ Add leg</Text>
        </Pressable>
      </View>

      {legs.map((leg, index) => (
        <View key={index} style={[styles.legCard, { borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="Player name"
            placeholderTextColor={theme.textMuted}
            value={leg.player_name}
            onChangeText={(v) => updateLeg(index, 'player_name', v)}
          />
          <View style={styles.legRow}>
            <TextInput
              style={[styles.input, styles.legInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Stat (points)"
              placeholderTextColor={theme.textMuted}
              value={leg.stat_type}
              onChangeText={(v) => updateLeg(index, 'stat_type', v)}
            />
            <TextInput
              style={[styles.input, styles.legInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Line (27.5)"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              value={leg.line_value}
              onChangeText={(v) => updateLeg(index, 'line_value', v)}
            />
          </View>
          <View style={styles.legRow}>
            <TextInput
              style={[styles.input, styles.legInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Side (over)"
              placeholderTextColor={theme.textMuted}
              value={leg.side}
              onChangeText={(v) => updateLeg(index, 'side', v)}
            />
            <TextInput
              style={[styles.input, styles.legInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Odds (-115)"
              placeholderTextColor={theme.textMuted}
              keyboardType="numbers-and-punctuation"
              value={leg.odds}
              onChangeText={(v) => updateLeg(index, 'odds', v)}
            />
          </View>
          <Pressable onPress={() => setLegs((prev) => prev.filter((_, i) => i !== index))}>
            <Text style={{ color: theme.danger, fontSize: 13 }}>Remove leg</Text>
          </Pressable>
        </View>
      ))}

      <Pressable
        style={[styles.submitButton, { backgroundColor: theme.tint }]}
        onPress={submit}
        disabled={createBet.isPending}
      >
        <Text style={{ color: theme.background, fontWeight: '500' }}>
          {createBet.isPending ? 'Logging...' : 'Log bet'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 0.5, borderRadius: 8, padding: 10, fontSize: 15 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 0.5 },
  legsHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legCard: { borderWidth: 0.5, borderRadius: 8, padding: 12, marginTop: 10, gap: 8 },
  legRow: { flexDirection: 'row', gap: 8 },
  legInput: { flex: 1 },
  submitButton: { marginTop: 24, padding: 14, borderRadius: 8, alignItems: 'center' },
});
