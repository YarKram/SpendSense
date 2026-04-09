import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useBudgets } from '../hooks/useBudgets';
import {
  getTotals,
  getMonthlyTransactions,
  getLast7DaysSummary,
  getCategorySummary,
} from '../utils/aggregators';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../constants/theme';
import { AppStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function HomeScreen() {
  const { user } = useAuth();
  const { transactions } = useTransactions(user?.uid);
  const { categories } = useCategories(user?.uid);
  const { budgets } = useBudgets(user?.uid);
  const nav = useNavigation<Nav>();

  const now = new Date();
  const monthly = useMemo(() => getMonthlyTransactions(transactions, now), [transactions]);
  const totals = useMemo(() => getTotals(monthly), [monthly]);
  const week = useMemo(() => getLast7DaysSummary(transactions), [transactions]);
  const recent = transactions.slice(0, 5);
  const catSummary = useMemo(() => getCategorySummary(monthly, categories, 'expense').slice(0, 3), [monthly, categories]);

  const firstName = user?.displayName?.split(' ')[0] ?? 'пользователь';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Привет, {firstName} 👋</Text>
            <Text style={styles.month}>
              {now.toLocaleString('ru', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => nav.navigate('Profile')}
          >
            <Text style={styles.avatarText}>
              {user?.displayName?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Баланс за месяц</Text>
          <Text style={[styles.balanceValue, { color: totals.balance >= 0 ? Colors.white : '#FFD0D0' }]}>
            {formatCurrency(totals.balance)}
          </Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemIcon}>↑</Text>
              <Text style={styles.balanceItemLabel}>Доходы</Text>
              <Text style={[styles.balanceItemValue, { color: '#A8FFD0' }]}>{formatCurrency(totals.income)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemIcon}>↓</Text>
              <Text style={styles.balanceItemLabel}>Расходы</Text>
              <Text style={[styles.balanceItemValue, { color: '#FFD0D0' }]}>{formatCurrency(totals.expense)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.income }]}
            onPress={() => nav.navigate('AddTransaction', { defaultType: 'income' })}
          >
            <Text style={styles.actionBtnIcon}>+</Text>
            <Text style={styles.actionBtnText}>Доход</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.expense }]}
            onPress={() => nav.navigate('AddTransaction', { defaultType: 'expense' })}
          >
            <Text style={styles.actionBtnIcon}>−</Text>
            <Text style={styles.actionBtnText}>Расход</Text>
          </TouchableOpacity>
        </View>

        {/* 7 Days Mini Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Расходы за 7 дней</Text>
          <View style={styles.miniChart}>
            {week.map((d, i) => {
              const maxExpense = Math.max(...week.map((w) => w.expense), 1);
              const h = (d.expense / maxExpense) * 60;
              return (
                <View key={i} style={styles.miniBarWrap}>
                  <View style={[styles.miniBar, { height: Math.max(h, 4) }]} />
                  <Text style={styles.miniBarLabel}>{d.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Budgets */}
        {budgets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Бюджеты</Text>
            {budgets.slice(0, 3).map((b) => {
              const cat = categories.find((c) => c.id === b.categoryId);
              const spent = monthly
                .filter((t) => t.type === 'expense' && t.categoryId === b.categoryId)
                .reduce((s, t) => s + t.amount, 0);
              const pct = Math.min(spent / b.amount, 1);
              const over = pct >= 0.8;
              return (
                <View key={b.categoryId} style={styles.budgetRow}>
                  <Text style={styles.budgetIcon}>{cat?.icon ?? '💰'}</Text>
                  <View style={styles.budgetInfo}>
                    <View style={styles.budgetHeader}>
                      <Text style={styles.budgetName}>{cat?.name ?? 'Бюджет'}</Text>
                      <Text style={[styles.budgetAmount, over && { color: Colors.warning }]}>
                        {formatCurrency(spent)} / {formatCurrency(b.amount)}
                      </Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${pct * 100}%` as any, backgroundColor: over ? Colors.warning : Colors.primary },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Top categories */}
        {catSummary.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Топ расходов</Text>
            {catSummary.map((cs) => (
              <View key={cs.categoryId} style={styles.catRow}>
                <View style={[styles.catIcon, { backgroundColor: cs.color + '20' }]}>
                  <Text style={styles.catEmoji}>{cs.icon}</Text>
                </View>
                <Text style={styles.catName} numberOfLines={1}>{cs.name}</Text>
                <Text style={styles.catAmount}>{formatCurrency(cs.total)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent */}
        {recent.length > 0 && (
          <View style={[styles.section, { marginBottom: Spacing.xxl }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Последние операции</Text>
              <TouchableOpacity onPress={() => nav.navigate('Transactions')}>
                <Text style={styles.seeAll}>Все →</Text>
              </TouchableOpacity>
            </View>
            {recent.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <View key={tx.id} style={styles.txRow}>
                  <View style={[styles.txIcon, { backgroundColor: (cat?.color ?? '#999') + '20' }]}>
                    <Text style={styles.txEmoji}>{cat?.icon ?? '💸'}</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txName} numberOfLines={1}>{cat?.name ?? 'Операция'}</Text>
                    {tx.note ? <Text style={styles.txNote} numberOfLines={1}>{tx.note}</Text> : null}
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txAmount, { color: tx.type === 'income' ? Colors.income : Colors.expense }]}>
                      {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                    </Text>
                    <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  month: { fontSize: FontSize.sm, color: Colors.textSecondary, textTransform: 'capitalize' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.lg },
  balanceCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm },
  balanceValue: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.white, marginVertical: Spacing.xs },
  balanceRow: { flexDirection: 'row', marginTop: Spacing.sm },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceItemIcon: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '700' },
  balanceItemLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs },
  balanceItemValue: { fontSize: FontSize.md, fontWeight: '700' },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: Spacing.sm },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  actionBtnIcon: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '700' },
  actionBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '600' },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  seeAll: { color: Colors.primary, fontWeight: '600' },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm },
  miniBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  miniBar: { width: '80%', backgroundColor: Colors.primary + '99', borderRadius: 4 },
  miniBarLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  budgetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.sm },
  budgetIcon: { fontSize: 24 },
  budgetInfo: { flex: 1 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  budgetName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  budgetAmount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  progressBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  catRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.xs, gap: Spacing.sm },
  catIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  catEmoji: { fontSize: 18 },
  catName: { flex: 1, fontSize: FontSize.sm, fontWeight: '500', color: Colors.text },
  catAmount: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.xs, gap: Spacing.sm },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txEmoji: { fontSize: 20 },
  txInfo: { flex: 1 },
  txName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  txNote: { fontSize: FontSize.xs, color: Colors.textSecondary },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: FontSize.sm, fontWeight: '700' },
  txDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
