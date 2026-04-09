import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { deleteTransaction } from '../services/transactions';
import { filterTransactions, groupTransactionsByDate, getAllTags } from '../utils/filters';
import { formatCurrency, formatDateFull } from '../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../constants/theme';
import { Transaction, TransactionFilters } from '../types/transaction';
import { AppStackParamList } from '../navigation/types';
import FilterSheet from '../components/FilterSheet';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function TransactionsScreen() {
  const { user } = useAuth();
  const { transactions, loading } = useTransactions(user?.uid);
  const { categories } = useCategories(user?.uid);
  const nav = useNavigation<Nav>();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({ type: 'all', sortBy: 'date', sortOrder: 'desc' });
  const [filterOpen, setFilterOpen] = useState(false);

  const allTags = useMemo(() => getAllTags(transactions), [transactions]);

  const filtered = useMemo(
    () => filterTransactions(transactions, { ...filters, searchText: search }),
    [transactions, filters, search],
  );

  const grouped = useMemo(() => groupTransactionsByDate(filtered), [filtered]);

  const handleDelete = useCallback((tx: Transaction) => {
    Alert.alert('Удалить транзакцию?', `${tx.type === 'income' ? '+' : '−'}${formatCurrency(tx.amount)}`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => deleteTransaction(user!.uid, tx.id),
      },
    ]);
  }, [user]);

  const activeFilterCount = [
    filters.type !== 'all' && filters.type,
    filters.categoryIds?.length,
    filters.tags?.length,
    filters.amountMin !== undefined || filters.amountMax !== undefined,
    filters.dateFrom || filters.dateTo,
  ].filter(Boolean).length;

  const renderItem = ({ item: tx }: { item: Transaction }) => {
    const cat = categories.find((c) => c.id === tx.categoryId);
    return (
      <TouchableOpacity
        style={styles.txRow}
        onLongPress={() => handleDelete(tx)}
        delayLongPress={500}
        onPress={() => nav.navigate('AddTransaction', { editId: tx.id })}
      >
        <View style={[styles.txIcon, { backgroundColor: (cat?.color ?? '#999') + '20' }]}>
          <Text style={styles.txEmoji}>{cat?.icon ?? '💸'}</Text>
        </View>
        <View style={styles.txMid}>
          <Text style={styles.txCat} numberOfLines={1}>{cat?.name ?? 'Операция'}</Text>
          {tx.note ? <Text style={styles.txNote} numberOfLines={1}>{tx.note}</Text> : null}
          {tx.tags.length > 0 && (
            <View style={styles.txTagsRow}>
              {tx.tags.slice(0, 3).map((t) => (
                <View key={t} style={styles.txTag}>
                  <Text style={styles.txTagText}>#{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <Text style={[styles.txAmount, { color: tx.type === 'income' ? Colors.income : Colors.expense }]}>
          {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search & Filter */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Поиск по заметке или тегу..."
          placeholderTextColor={Colors.textLight}
        />
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
          <Text style={styles.filterIcon}>⚙️</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Sort chips */}
      <View style={styles.sortRow}>
        {[
          { label: 'По дате', val: 'date' as const },
          { label: 'По сумме', val: 'amount' as const },
        ].map((s) => (
          <TouchableOpacity
            key={s.val}
            style={[styles.sortChip, filters.sortBy === s.val && styles.sortChipActive]}
            onPress={() =>
              setFilters((f) => ({
                ...f,
                sortBy: s.val,
                sortOrder: f.sortBy === s.val && f.sortOrder === 'desc' ? 'asc' : 'desc',
              }))
            }
          >
            <Text style={[styles.sortChipText, filters.sortBy === s.val && styles.sortChipTextActive]}>
              {s.label} {filters.sortBy === s.val ? (filters.sortOrder === 'desc' ? '↓' : '↑') : ''}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.count}>{filtered.length} операций</Text>
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(g) => g.date}
        renderItem={({ item: group }) => (
          <View>
            <Text style={styles.dateHeader}>{formatDateFull(new Date(group.date))}</Text>
            {group.data.map((tx) => renderItem({ item: tx }))}
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Транзакции не найдены</Text>
          </View>
        }
      />

      <FilterSheet
        visible={filterOpen}
        filters={filters}
        categories={categories}
        allTags={allTags}
        onApply={(f) => { setFilters(f); setFilterOpen(false); }}
        onClose={() => setFilterOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  searchRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  searchInput: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSize.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  filterBtn: { backgroundColor: Colors.surface, borderRadius: Radius.lg, width: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  filterIcon: { fontSize: 20 },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.primary, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  sortRow: { flexDirection: 'row', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, alignItems: 'center' },
  sortChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  sortChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  sortChipTextActive: { color: Colors.white },
  count: { marginLeft: 'auto', fontSize: FontSize.xs, color: Colors.textSecondary },
  dateHeader: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.xs, gap: Spacing.sm },
  txIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  txEmoji: { fontSize: 22 },
  txMid: { flex: 1 },
  txCat: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  txNote: { fontSize: FontSize.xs, color: Colors.textSecondary },
  txTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  txTag: { backgroundColor: Colors.primary + '20', borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 1 },
  txTagText: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
  txAmount: { fontSize: FontSize.md, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary },
});
