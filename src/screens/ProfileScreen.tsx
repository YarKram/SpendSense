import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import { signOut } from '../services/auth';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { transactionsToCsv } from '../utils/csvExport';
import { Colors, Spacing, FontSize, Radius } from '../constants/theme';
import { AppStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function ProfileScreen() {
  const { user } = useAuth();
  const { transactions } = useTransactions(user?.uid);
  const { categories } = useCategories(user?.uid);
  const nav = useNavigation<Nav>();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert('Выйти из аккаунта?', undefined, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
          } catch (e: any) {
            Alert.alert('Ошибка', e.message);
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  const handleExport = async () => {
    try {
      const csv = transactionsToCsv(transactions, categories);
      await Share.share({ message: csv, title: 'SpendSense — Экспорт' });
    } catch (e: any) {
      Alert.alert('Ошибка экспорта', e.message);
    }
  };

  const MenuItem = ({ icon, label, onPress, danger }: { icon: string; label: string; onPress: () => void; danger?: boolean }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && { color: Colors.danger }]}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.displayName?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.name}>{user?.displayName ?? 'Пользователь'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{transactions.length}</Text>
              <Text style={styles.statLabel}>операций</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{categories.length}</Text>
              <Text style={styles.statLabel}>категорий</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <MenuItem icon="🗂️" label="Управление категориями" onPress={() => nav.navigate('Categories')} />
          <MenuItem icon="📤" label="Экспорт в CSV" onPress={handleExport} />
        </View>

        <View style={[styles.menu, { marginTop: Spacing.md }]}>
          <MenuItem icon="🚪" label={signingOut ? 'Выход...' : 'Выйти из аккаунта'} onPress={handleSignOut} danger />
        </View>

        <Text style={styles.version}>SpendSense v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl, backgroundColor: Colors.surface, borderRadius: Radius.xl, marginBottom: Spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  avatarText: { fontSize: 36, color: Colors.white, fontWeight: '700' },
  name: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  statRow: { flexDirection: 'row', gap: Spacing.xl, marginTop: Spacing.md },
  stat: { alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  menu: { backgroundColor: Colors.surface, borderRadius: Radius.xl, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  menuIcon: { fontSize: 22, width: 36 },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  menuArrow: { fontSize: 20, color: Colors.textLight },
  version: { textAlign: 'center', color: Colors.textLight, fontSize: FontSize.xs, marginTop: Spacing.xl },
});
