import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Category, TransactionFilters, TransactionType } from '../types/transaction';
import { Colors, Spacing, FontSize, Radius } from '../constants/theme';

interface Props {
  visible: boolean;
  filters: TransactionFilters;
  categories: Category[];
  allTags: string[];
  onApply: (filters: TransactionFilters) => void;
  onClose: () => void;
}

export default function FilterSheet({ visible, filters, categories, allTags, onApply, onClose }: Props) {
  const [local, setLocal] = useState<TransactionFilters>(filters);

  useEffect(() => {
    setLocal(filters);
  }, [visible]);

  const toggleCat = (id: string) => {
    const existing = local.categoryIds ?? [];
    setLocal((f) => ({
      ...f,
      categoryIds: existing.includes(id) ? existing.filter((x) => x !== id) : [...existing, id],
    }));
  };

  const toggleTag = (tag: string) => {
    const existing = local.tags ?? [];
    setLocal((f) => ({
      ...f,
      tags: existing.includes(tag) ? existing.filter((x) => x !== tag) : [...existing, tag],
    }));
  };

  const reset = () =>
    setLocal({ type: 'all', sortBy: 'date', sortOrder: 'desc', categoryIds: [], tags: [], amountMin: undefined, amountMax: undefined, dateFrom: undefined, dateTo: undefined });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Отмена</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Фильтры</Text>
          <TouchableOpacity onPress={reset}>
            <Text style={styles.reset}>Сбросить</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Type */}
          <Text style={styles.sectionLabel}>Тип операции</Text>
          <View style={styles.chipRow}>
            {[
              { val: 'all', label: 'Все' },
              { val: 'income', label: '↑ Доходы' },
              { val: 'expense', label: '↓ Расходы' },
            ].map((t) => (
              <TouchableOpacity
                key={t.val}
                style={[styles.chip, local.type === t.val && styles.chipActive]}
                onPress={() => setLocal((f) => ({ ...f, type: t.val as TransactionType | 'all' }))}
              >
                <Text style={[styles.chipText, local.type === t.val && styles.chipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Text style={styles.sectionLabel}>Сумма</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              value={local.amountMin !== undefined ? String(local.amountMin) : ''}
              onChangeText={(v) => setLocal((f) => ({ ...f, amountMin: v ? Number(v) : undefined }))}
              keyboardType="decimal-pad"
              placeholder="От"
              placeholderTextColor={Colors.textLight}
            />
            <Text style={styles.amountDash}>—</Text>
            <TextInput
              style={styles.amountInput}
              value={local.amountMax !== undefined ? String(local.amountMax) : ''}
              onChangeText={(v) => setLocal((f) => ({ ...f, amountMax: v ? Number(v) : undefined }))}
              keyboardType="decimal-pad"
              placeholder="До"
              placeholderTextColor={Colors.textLight}
            />
            <Text style={styles.amountCurrency}>₽</Text>
          </View>

          {/* Categories */}
          {categories.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Категории</Text>
              <View style={styles.chipRow}>
                {categories.map((cat) => {
                  const active = local.categoryIds?.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.chip, active && { backgroundColor: cat.color + '30', borderColor: cat.color }]}
                      onPress={() => toggleCat(cat.id)}
                    >
                      <Text style={styles.chipIcon}>{cat.icon}</Text>
                      <Text style={[styles.chipText, active && { color: cat.color }]}>{cat.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Теги</Text>
              <View style={styles.chipRow}>
                {allTags.map((tag) => {
                  const active = local.tags?.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>#{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(local)}>
            <Text style={styles.applyBtnText}>Применить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  cancel: { fontSize: FontSize.md, color: Colors.textSecondary },
  reset: { fontSize: FontSize.md, color: Colors.expense },
  scroll: { flex: 1, padding: Spacing.md },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.text },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  chipIcon: { fontSize: 14 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  amountInput: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSize.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border, textAlign: 'center' },
  amountDash: { color: Colors.textSecondary, fontSize: FontSize.lg },
  amountCurrency: { fontSize: FontSize.lg, color: Colors.textSecondary },
  footer: { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  applyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center' },
  applyBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
});
