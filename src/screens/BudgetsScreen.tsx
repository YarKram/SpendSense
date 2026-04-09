import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../store/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useBudgets } from '../hooks/useBudgets';
import { setBudget, deleteBudget } from '../services/budgets';
import { getMonthlyTransactions } from '../utils/aggregators';
import { formatCurrency } from '../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../constants/theme';
import { Category } from '../types/transaction';

export default function BudgetsScreen() {
  const { user } = useAuth();
  const { transactions } = useTransactions(user?.uid);
  const { categories } = useCategories(user?.uid);
  const { budgets, reload } = useBudgets(user?.uid);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [amountStr, setAmountStr] = useState('');

  const monthly = useMemo(() => getMonthlyTransactions(transactions, new Date()), [transactions]);

  const expenseCats = useMemo(
    () => categories.filter((c) => c.type === 'expense' || c.type === 'both'),
    [categories],
  );

  const openModal = (cat: Category) => {
    const existing = budgets.find((b) => b.categoryId === cat.id);
    setSelectedCat(cat);
    setAmountStr(existing ? String(existing.amount) : '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (!amount || amount <= 0 || !selectedCat || !user) return;
    await setBudget(user.uid, { categoryId: selectedCat.id, amount, period: 'month', currency: 'RUB' });
    await reload();
    setModalOpen(false);
  };

  const handleDelete = async (catId: string) => {
    if (!user) return;
    Alert.alert('Удалить бюджет?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteBudget(user.uid, catId); await reload(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>Задайте лимиты расходов на месяц по категориям</Text>

        {expenseCats.map((cat) => {
          const budget = budgets.find((b) => b.categoryId === cat.id);
          const spent = monthly
            .filter((t) => t.type === 'expense' && t.categoryId === cat.id)
            .reduce((s, t) => s + t.amount, 0);
          const pct = budget ? Math.min(spent / budget.amount, 1) : 0;
          const over = pct >= 0.8;

          return (
            <TouchableOpacity key={cat.id} style={styles.row} onPress={() => openModal(cat)} onLongPress={() => budget && handleDelete(cat.id)}>
              <View style={[styles.icon, { backgroundColor: cat.color + '20' }]}>
                <Text style={styles.iconEmoji}>{cat.icon}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.topRow}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  {budget ? (
                    <Text style={[styles.amounts, over && { color: Colors.warning }]}>
                      {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                    </Text>
                  ) : (
                    <Text style={styles.noBudget}>Нет лимита</Text>
                  )}
                </View>
                {budget ? (
                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct * 100}%` as any, backgroundColor: over ? Colors.warning : cat.color },
                      ]}
                    />
                  </View>
                ) : (
                  <Text style={styles.tapHint}>Нажмите, чтобы задать лимит</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {selectedCat?.icon} {selectedCat?.name}
            </Text>
            <Text style={styles.modalLabel}>Лимит на месяц (₽)</Text>
            <TextInput
              style={styles.modalInput}
              value={amountStr}
              onChangeText={setAmountStr}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={Colors.textLight}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalOpen(false)}>
                <Text style={styles.modalCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSave}>
                <Text style={styles.modalSaveText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  hint: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.sm, marginBottom: Spacing.xs, gap: Spacing.sm },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 22 },
  info: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  amounts: { fontSize: FontSize.xs, color: Colors.textSecondary },
  noBudget: { fontSize: FontSize.xs, color: Colors.textLight },
  progressBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  tapHint: { fontSize: FontSize.xs, color: Colors.textLight, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  modal: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, width: '100%' },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  modalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  modalInput: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, fontSize: 28, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: Spacing.md },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm },
  modalCancel: { flex: 1, paddingVertical: 12, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  modalCancelText: { color: Colors.textSecondary, fontWeight: '600' },
  modalSave: { flex: 1, paddingVertical: 12, borderRadius: Radius.lg, backgroundColor: Colors.primary, alignItems: 'center' },
  modalSaveText: { color: Colors.white, fontWeight: '700' },
});
