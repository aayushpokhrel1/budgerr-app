import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BestCardResponse, Category } from '@/lib/api';

export function BestCardTip({ category, result }: { category: Category; result: BestCardResponse }) {
  const theme = Colors[useColorScheme()];

  if (!result.best) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={styles.title}>Best card for {category.name.toLowerCase()} right now</Text>
      <View style={styles.row}>
        <Text style={styles.cardName}>{result.best.card_name}</Text>
        <Text style={[styles.multiplier, { color: theme.tint }]}>{result.best.multiplier}% back</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 0.5, padding: 16, marginBottom: 12 },
  title: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardName: { fontSize: 13 },
  multiplier: { fontSize: 13, fontWeight: '500' },
});
