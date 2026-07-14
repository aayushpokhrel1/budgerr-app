import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ExpiringRatesResponse } from '@/lib/api';

export function ExpiringRatesBanner({ data }: { data: ExpiringRatesResponse | undefined }) {
  const theme = Colors[useColorScheme()];
  const expiring = data?.expiring ?? [];

  if (expiring.length === 0) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: theme.warningBg, borderColor: theme.warning }]}>
      <Text style={[styles.title, { color: theme.warning }]}>Rotating categories ending soon</Text>
      {expiring.map((rate) => (
        <Text key={rate.rate_id} style={[styles.line, { color: theme.warning }]}>
          {rate.card_name}: {rate.multiplier}x {rate.category_name} ends {rate.effective_end}{' '}
          ({rate.days_left <= 0 ? 'ended' : `${rate.days_left}d`})
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 12, borderWidth: 0.5, padding: 14, marginBottom: 12 },
  title: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  line: { fontSize: 12, marginTop: 2 },
});
