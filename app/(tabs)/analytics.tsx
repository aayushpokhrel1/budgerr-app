import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { cardShadow } from '@/constants/Shadow';
import { useColorScheme } from '@/components/useColorScheme';
import { AnalyticsBreakdown, AnalyticsScope, AnalyticsStatType, CalibrationBucket } from '@/lib/api';
import { useBetAnalytics } from '@/lib/queries';

function pct(value: number | null, digits = 1): string {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(digits)}%`;
}

function money(value: number): string {
  return `${value >= 0 ? '+' : ''}$${value.toFixed(2)}`;
}

export default function AnalyticsScreen() {
  const theme = Colors[useColorScheme()];
  const [scope, setScope] = useState<AnalyticsScope>('real');
  const analytics = useBetAnalytics(scope);

  if (analytics.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const data = analytics.data;
  const isEmpty = !data || data.overall.settled === 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={analytics.isFetching} onRefresh={() => analytics.refetch()} />}
    >
      <Text style={styles.header}>Analytics</Text>

      <View style={[styles.segmentRow, { backgroundColor: theme.card }]}>
        {(['real', 'paper'] as AnalyticsScope[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => setScope(s)}
            style={[
              styles.segmentButton,
              scope === s && { backgroundColor: theme.tint },
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: scope === s ? '#fff' : theme.textSecondary },
              ]}
            >
              {s === 'real' ? 'Real' : 'Paper'}
            </Text>
          </Pressable>
        ))}
      </View>

      {isEmpty && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
          <Text style={{ color: theme.textMuted, fontSize: 13 }}>
            No settled {scope === 'paper' ? 'paper' : ''} bets yet — log and settle a bet to see analytics here.
          </Text>
        </View>
      )}

      {!isEmpty && data && (
        <>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
            <Text style={styles.sectionTitle}>Overall</Text>
            <View style={styles.overallRow}>
              <View style={styles.overallTile}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Record</Text>
                <Text style={styles.value}>
                  {data.overall.wins}-{data.overall.losses}-{data.overall.pushes}
                </Text>
              </View>
              <View style={styles.overallTile}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Staked</Text>
                <Text style={styles.value}>${data.overall.total_staked.toFixed(2)}</Text>
              </View>
              <View style={styles.overallTile}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Net profit</Text>
                <Text
                  style={[
                    styles.value,
                    { color: data.overall.net_profit >= 0 ? theme.success : theme.danger },
                  ]}
                >
                  {money(data.overall.net_profit)}
                </Text>
              </View>
              <View style={styles.overallTile}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>ROI</Text>
                <Text
                  style={[
                    styles.value,
                    data.overall.roi !== null && {
                      color: data.overall.roi >= 0 ? theme.success : theme.danger,
                    },
                  ]}
                >
                  {pct(data.overall.roi)}
                </Text>
              </View>
            </View>
          </View>

          <BreakdownSection title="By sportsbook" rows={data.by_sportsbook} theme={theme} />
          <BreakdownSection title="By bet type" rows={data.by_bet_type} theme={theme} />
          <StatTypeSection title="By stat type" rows={data.by_stat_type} theme={theme} />

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
            <Text style={styles.sectionTitle}>Calibration</Text>
            <Text style={{ fontSize: 12, color: theme.textMuted, marginBottom: 12 }}>
              {data.calibration.legs} settled legs with a model probability
            </Text>

            <CalibrationRow
              label="Overall"
              predicted={data.calibration.overall_predicted}
              actual={data.calibration.overall_actual}
              theme={theme}
            />

            {data.calibration.buckets.map((bucket, i) => (
              <CalibrationBucketRow key={i} bucket={bucket} theme={theme} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function BreakdownSection({
  title,
  rows,
  theme,
}: {
  title: string;
  rows: AnalyticsBreakdown[];
  theme: (typeof Colors)['light'];
}) {
  if (rows.length === 0) return null;
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rows.map((row, i) => (
        <View
          key={row.key}
          style={[styles.row, i > 0 && { borderTopColor: theme.border, borderTopWidth: 0.5 }]}
        >
          <View>
            <Text style={styles.rowTitle}>{row.key}</Text>
            <Text style={{ fontSize: 12, color: theme.textMuted }}>
              {row.wins}-{row.losses}-{row.pushes} · ${row.total_staked.toFixed(2)} staked
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: row.net_profit >= 0 ? theme.success : theme.danger }}>
              {money(row.net_profit)}
            </Text>
            <Text style={{ fontSize: 12, color: theme.textMuted }}>{pct(row.roi)} ROI</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function StatTypeSection({
  title,
  rows,
  theme,
}: {
  title: string;
  rows: AnalyticsStatType[];
  theme: (typeof Colors)['light'];
}) {
  if (rows.length === 0) return null;
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, cardShadow]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rows.map((row, i) => (
        <View
          key={row.key}
          style={[styles.row, i > 0 && { borderTopColor: theme.border, borderTopWidth: 0.5 }]}
        >
          <View>
            <Text style={styles.rowTitle}>{row.key}</Text>
            <Text style={{ fontSize: 12, color: theme.textMuted }}>
              {row.won}-{row.lost}-{row.pushed} · {row.legs} legs
            </Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '500' }}>{pct(row.hit_rate)}</Text>
        </View>
      ))}
    </View>
  );
}

function CalibrationRow({
  label,
  predicted,
  actual,
  theme,
}: {
  label: string;
  predicted: number | null;
  actual: number | null;
  theme: (typeof Colors)['light'];
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.calibHeaderRow}>
        <Text style={{ fontSize: 13, fontWeight: '500' }}>{label}</Text>
        <Text style={{ fontSize: 12, color: theme.textMuted }}>
          predicted {pct(predicted)} · actual {pct(actual)}
        </Text>
      </View>
      <CalibrationBars predicted={predicted} actual={actual} theme={theme} />
    </View>
  );
}

function CalibrationBucketRow({ bucket, theme }: { bucket: CalibrationBucket; theme: (typeof Colors)['light'] }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.calibHeaderRow}>
        <Text style={{ fontSize: 13 }}>
          {(bucket.lo * 100).toFixed(0)}–{(bucket.hi * 100).toFixed(0)}%
        </Text>
        <Text style={{ fontSize: 12, color: theme.textMuted }}>
          {bucket.legs} legs · predicted {pct(bucket.predicted)} · actual {pct(bucket.actual)}
        </Text>
      </View>
      <CalibrationBars predicted={bucket.predicted} actual={bucket.actual} theme={theme} />
    </View>
  );
}

function CalibrationBars({
  predicted,
  actual,
  theme,
}: {
  predicted: number | null;
  actual: number | null;
  theme: (typeof Colors)['light'];
}) {
  return (
    <View style={{ gap: 4, marginTop: 6 }}>
      <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.max(0, Math.min(1, predicted ?? 0)) * 100}%`, backgroundColor: theme.tint },
          ]}
        />
      </View>
      <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.max(0, Math.min(1, actual ?? 0)) * 100}%`, backgroundColor: theme.edge },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 22, fontWeight: '500', marginBottom: 16 },
  segmentRow: { flexDirection: 'row', borderRadius: 10, padding: 3, marginBottom: 16 },
  segmentButton: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  segmentLabel: { fontSize: 13, fontWeight: '500' },
  card: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '500', marginBottom: 10 },
  overallRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  overallTile: { minWidth: '40%', flexGrow: 1 },
  label: { fontSize: 12, marginBottom: 2 },
  value: { fontSize: 18, fontWeight: '500' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowTitle: { fontSize: 14, fontWeight: '500', textTransform: 'capitalize' },
  calibHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});
