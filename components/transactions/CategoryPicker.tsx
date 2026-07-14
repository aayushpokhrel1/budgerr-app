import { useState } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Category } from '@/lib/api';

export function CategoryPicker({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string | null;
  onChange: (categoryName: string | null) => void;
}) {
  const theme = Colors[useColorScheme()];
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={[styles.pill, { borderColor: theme.border }]} onPress={() => setOpen(true)}>
        <Text style={{ fontSize: 12, color: value ? theme.text : theme.textMuted }}>
          {value ?? 'Uncategorized'}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Pressable
              style={styles.option}
              onPress={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <Text style={{ color: theme.textMuted }}>Uncategorized</Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category.category_id}
                style={styles.option}
                onPress={() => {
                  onChange(category.name);
                  setOpen(false);
                }}
              >
                <Text style={value === category.name ? { color: theme.tint, fontWeight: '600' } : undefined}>
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: { borderWidth: 0.5, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 0.5,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  option: { paddingHorizontal: 20, paddingVertical: 14 },
});
