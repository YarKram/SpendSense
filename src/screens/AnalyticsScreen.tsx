import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
import { useAuth } from '../store/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import {
  getTotals,
  getLast7DaysSummary,
  getLast12MonthsSummary,
  getYearlySummary,
  getCategorySummary,
  getAverageDailyExpense,
} from '../utils/aggregators';
import { formatCurrency } from '../utils/formatters';
import { Colors, Spacing, FontSize, Radius } from '../constants/theme';

type Period = 'week' | 'month' | 'year' | 'all';

const W = Dimensions.get('window').width - Spacing.md * 2;

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { transactions } = useTransactions(user?.uid);
  const { categories } = useCategories(user?.uid);
  const [period, setPeriod] = useState<Period>('month');

  const periodTx = useMemo(() => {
    const now = new Date();
    if (period === 'week') {
      const from = new Date(now); from.setDate(now.getDate() - 6);
      return transactions.filter((t) => t.date >= from);
    }
    if (period === 'month') return transactions.filter((t) => new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear());
    if (period === 'year') return transactions.filter((t) => new Date(t.date).getFullYear() === now.getFullYear());
    return transactions;
  }, [transactions, period]);

  const totals = useMemo(() => getTotals(periodTx), [periodTx]);
  const avg = useMemo(() => getAverageDailyExpense(periodTx), [periodTx]);
  const catSummary = useMemo(() => getCategorySummary(periodTx, categories, 'expense'), [periodTx, categories]);

  const barData = useMemo(() => {
    const summary = period === 'week' ? getLast7DaysSummary(transactions) : period === 'year' ? getYearlySummary(transactions) : getLast12MonthsSummary(transactions);
    return summary.flatMap((s) => [
      { value: s.income, label: s.label, frontColor: Colors.income + 'CC', spacing: 2, labelWidth: 30, labelTextStyle: { color: Colors.textSecondary, fontSize: 9 } },
      { value: s.expense, frontColor: Colors.expense + 'CC', spacing: 8 },
    ]);
  }, [transactions, period]);

  const lineData = useMemo(() => {
    const summary = period === 'week' ? getLast7DaysSummary(transactions) : period === 'year' ? getYearlySummary(transactions) : getLast12MonthsSummary(transactions);
    let running = 0;
    return summary.map((s) => {
      running += s.balance;
      return { value: running, label: s.label, labelTextStyle: { color: Colors.textSecondary, fontSize: 9 } };
    });
  }, [transactions, period]);

  const pieData = useMemo(() =>
    catSummary.slice(0, 6).map((cs) => ({
      value: cs.total,
      color: cs.color,
      text: `${Math.round(cs.percent)}%`,
    })),
    [catSummary],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Period selector */}
        <View style={styles.periodRow}>
          {([['week', 'Неделя'], ['month', 'Месяц'], ['year', 'Год'], ['all', 'Всё']] as [Period, string][]).map(([val, label]) => (
            <TouchableOpacity
              key={val}
              style={[styles.periodBtn, period === val && styles.periodBtnActive]}
              onPress={() => setPeriod(val)}
            >
              <Text style={[styles.periodBtnText, period === val && styles.periodBtnTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.income + '20' }]}>
            <Text style={styles.summaryIcon}>↑</Text>
            <Text style={styles.summaryLabel}>Доходы</Text>
            <Text style={[styles.summaryValue, { color: Colors.income }]}>{formatCurrency(totals.income)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.expense + '20' }]}>
            <Text style={styles.summaryIcon}>↓</Text>
            <Text style={styles.summaryLabel}>Расходы</Text>
            <Text style={[styles.summaryValue, { color: Colors.expense }]}>{formatCurrency(totals.expense)}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.primary + '20' }]}>
            <Text style={styles.summaryIcon}>≡</Text>
            <Text style={styles.summaryLabel}>Баланс</Text>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{formatCurrency(totals.balance)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.surfaceSecondary }]}>
            <Text style={styles.summaryIcon}>📅</Text>
            <Text style={styles.summaryLabel}>Ср./день</Text>
            <Text style={[styles.summaryValue, { color: Colors.text }]}>{formatCurrency(avg)}</Text>
          </View>
        </View>

        {/* Bar Chart */}
        {barData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Доходы и расходы</Text>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.income }]} />
                <Text style={styles.legendText}>Доходы</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.expense }]} />
                <Text style={styles.legendText}>Расходы</Text>
              </View>
            </View>
            <BarChart
              data={barData}
              barWidth={12}
              spacing={4}
              roundedTop
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: Colors.textLight, fontSize: 9 }}
              noOfSections={4}
              maxValue={Math.max(...barData.map((d) => d.value), 1) * 1.2}
              width={W - Spacing.lg * 2}
            />
          </View>
        )}

        {/* Line Chart */}
        {lineData.length > 1 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Динамика баланса</Text>
            <LineChart
              data={lineData}
              color={Colors.primary}
              thickness={2}
              dataPointsColor={Colors.primary}
              dataPointsRadius={4}
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: Colors.textLight, fontSize: 9 }}
              noOfSections={4}
              width={W - Spacing.lg * 2}
              areaChart
              startFillColor={Colors.primary + '40'}
              endFillColor={Colors.primary + '05'}
            />
          </View>
        )}

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Расходы по категориям</Text>
            <View style={styles.pieWrap}>
              <PieChart
                data={pieData}
                donut
                radius={90}
                innerRadius={55}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: FontSize.xs, color: Colors.textSecondary }}>Итого</Text>
                    <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: Colors.text }}>{formatCurrency(totals.expense)}</Text>
                  </View>
                )}
              />
              <View style={styles.pieLegend}>
                {catSummary.slice(0, 6).map((cs) => (
                  <View key={cs.categoryId} style={styles.pieLegendItem}>
                    <View style={styles.pieLegendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: cs.color }]} />
                      <Text style={styles.pieLegendName} numberOfLines={1}>{cs.icon} {cs.name}</Text>
                    </View>
                    <Text style={styles.pieLegendVal}>{formatCurrency(cs.total)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Top 5 table */}
        {catSummary.length > 0 && (
          <View style={[styles.chartCard, { marginBottom: Spacing.xxl }]}>
            <Text style={styles.chartTitle}>Топ расходов</Text>
            {catSummary.slice(0, 5).map((cs, i) => (
              <View key={cs.categoryId} style={styles.topRow}>
                <Text style={styles.topRank}>{i + 1}</Text>
                <View style={[styles.catDot, { backgroundColor: cs.color + '30' }]}>
                  <Text style={{ fontSize: 16 }}>{cs.icon}</Text>
                </View>
                <Text style={styles.topName} numberOfLines={1}>{cs.name}</Text>
                <Text style={styles.topPct}>{Math.round(cs.percent)}%</Text>
                <Text style={styles.topVal}>{formatCurrency(cs.total)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  periodRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.md },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.md, alignItems: 'center' },
  periodBtnActive: { backgroundColor: Colors.primary },
  periodBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  periodBtnTextActive: { color: Colors.white },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  summaryCard: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md },
  summaryIcon: { fontSize: 20, marginBottom: 2 },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.md, fontWeight: '800', marginTop: 2 },
  chartCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.lg, marginTop: Spacing.md },
  chartTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  legend: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  pieWrap: { alignItems: 'center' },
  pieLegend: { width: '100%', marginTop: Spacing.md, gap: Spacing.xs },
  pieLegendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pieLegendLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  pieLegendName: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
  pieLegendVal: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  topRank: { width: 20, fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, textAlign: 'center' },
  catDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  topName: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  topPct: { fontSize: FontSize.xs, color: Colors.textSecondary, width: 35, textAlign: 'right' },
  topVal: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, width: 90, textAlign: 'right' },
});
