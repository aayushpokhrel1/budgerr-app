import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { api, BetLegInput, BetType } from '@/lib/api';
import { PlaystatEdge } from '@/lib/playstat';
import { useCreateBet, usePlaystatEdges, usePlaystatSlate } from '@/lib/queries';

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
  const slate = usePlaystatSlate();
  const tonightsEdges = usePlaystatEdges(slate.data?.date);

  const [sportsbook, setSportsbook] = useState('');
  const [betType, setBetType] = useState<BetType>('single');
  const [stake, setStake] = useState('');
  const [potentialPayout, setPotentialPayout] = useState('');
  const [legs, setLegs] = useState<LegDraft[]>([]);
  const [importing, setImporting] = useState(false);

  const importFromScreenshot = async () => {
    if (importing) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required to import a bet slip screenshot.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setImporting(true);
    try {
      const parsed = await api.bets.parseSlip({
        uri: asset.uri,
        name: asset.fileName ?? 'bet-slip.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });

      // Merge parsed fields into the existing draft for review — never
      // auto-submit, since slip parsing can misread lines/odds.
      if (parsed.sportsbook) setSportsbook(parsed.sportsbook);
      if (parsed.bet_type) setBetType(parsed.bet_type);
      if (parsed.stake != null) setStake(String(parsed.stake));
      if (parsed.potential_payout != null) setPotentialPayout(String(parsed.potential_payout));
      if (parsed.legs && parsed.legs.length > 0) {
        setLegs((prev) => [
          ...prev,
          ...parsed.legs!.map((leg) => ({
            player_name: leg.player_name ?? '',
            stat_type: leg.stat_type ?? '',
            line_value: leg.line_value != null ? String(leg.line_value) : '',
            side: leg.side ?? '',
            odds: leg.odds != null ? String(leg.odds) : '',
          })),
        ]);
      }
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      if (status === 501) {
        Alert.alert(
          'Import unavailable',
          'Screenshot import needs ANTHROPIC_API_KEY set on the backend.'
        );
      } else {
        Alert.alert('Import failed', 'Could not read that bet slip. Please enter the bet manually.');
      }
    } finally {
      setImporting(false);
    }
  };

  const updateLeg = (index: number, field: keyof LegDraft, value: string) => {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, [field]: value } : leg)));
  };

  const addLegFromEdge = (edge: PlaystatEdge) => {
    setLegs((prev) => [
      ...prev,
      {
        player_name: edge.player_name,
        stat_type: edge.stat_type,
        line_value: String(edge.line_value),
        side: edge.side,
        odds: String(edge.odds),
      },
    ]);
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
      <Pressable
        style={[styles.importButton, { borderColor: theme.border }]}
        onPress={importFromScreenshot}
        disabled={importing}
      >
        {importing ? (
          <ActivityIndicator size="small" color={theme.textSecondary} />
        ) : (
          <Text style={{ color: theme.tint, fontSize: 13, fontWeight: '500' }}>
            Import from screenshot
          </Text>
        )}
      </Pressable>

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

      {tonightsEdges.data && tonightsEdges.data.length > 0 && (
        <View style={[styles.edgesCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.edgesTitle, { color: theme.textSecondary }]}>
            Tonight&apos;s edges (from playstat)
          </Text>
          {tonightsEdges.data.map((edge) => (
            <View key={`${edge.player_id}-${edge.game_id}-${edge.stat_type}`} style={styles.edgeRow}>
              <Text style={{ fontSize: 13, flex: 1 }} numberOfLines={1}>
                {edge.player_name} {edge.side} {edge.line_value} {edge.stat_type}{' '}
                <Text style={{ color: theme.textMuted }}>
                  ({edge.odds > 0 ? '+' : ''}
                  {edge.odds})
                </Text>
              </Text>
              <Pressable onPress={() => addLegFromEdge(edge)}>
                <Text style={{ color: theme.tint, fontSize: 13 }}>+ Add</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

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
  importButton: {
    borderWidth: 0.5,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 0.5, borderRadius: 8, padding: 10, fontSize: 15 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 0.5 },
  legsHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  edgesCard: { borderRadius: 8, padding: 12, marginTop: 14, gap: 6 },
  edgesTitle: { fontSize: 12, marginBottom: 4 },
  edgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  legCard: { borderWidth: 0.5, borderRadius: 8, padding: 12, marginTop: 10, gap: 8 },
  legRow: { flexDirection: 'row', gap: 8 },
  legInput: { flex: 1 },
  submitButton: { marginTop: 24, padding: 14, borderRadius: 8, alignItems: 'center' },
});
