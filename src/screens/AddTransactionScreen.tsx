import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../store/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { addTransaction } from '../services/transactions';
import { Colors, Spacing, FontSize, Radius } from '../constants/theme';
import { TransactionType } from '../types/transaction';
import { AppStackParamList } from '../navigation/types';

type RouteT = RouteProp<AppStackParamList, 'AddTransaction'>;

export default function AddTransactionScreen() {
  const { user } = useAuth();
  const { categories } = useCategories(user?.uid);
  const route = useRoute<RouteT>();
  const nav = useNavigation();

  const [type, setType] = useState<TransactionType>(route.params?.defaultType ?? 'expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [date, setDate] = useState(new Date());
  const [saving, setSaving] = useState(false);

  const filteredCats = useMemo(
    () => categories.filter((c) => c.type === type || c.type === 'both'),
    [categories, type],
  );

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleSave = async () => {
    const num = parseFloat(amount.replace(',', '.'));
    if (!num || num <= 0) return Alert.alert('Ошибка', 'Введите корректную сумму');
    if (!categoryId) return Alert.alert('Ошибка', 'Выберите категорию');
    if (!user) return;

    setSaving(true);
    try {
      await addTransaction(user.uid, {
        amount: num,
        type,
        categoryId,
        tags,
        note: note.trim(),
        date,
        createdAt: new Date(),
      });
      nav.goBack();
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          {/* Type selector */}
          <View style={styles.typeRow}>
            {(['expense', 'income'] as TransactionType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, type === t && { backgroundColor: t === 'expense' ? Colors.expense : Colors.income }]}
                onPress={() => { setType(t); setCategoryId(''); }}
              >
                <Text style={[styles.typeBtnText, type === t && styles.typeBtnActive]}>
                  {t === 'expense' ? '↓ Расход' : '↑ Доход'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <View style={styles.amountWrap}>
            <Text style={styles.currency}>₽</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={Colors.textLight}
              autoFocus
            />
          </View>

          {/* Category */}
          <Text style={styles.label}>Категория</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScroll}>
            {filteredCats.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, categoryId === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '20' }]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text style={styles.catChipIcon}>{cat.icon}</Text>
                <Text style={[styles.catChipText, categoryId === cat.id && { color: cat.color }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tags */}
          <Text style={styles.label}>Теги</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="#тег"
              placeholderTextColor={Colors.textLight}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={addTag}>
              <Text style={styles.addTagBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsRow}>
            {tags.map((t) => (
              <TouchableOpacity key={t} style={styles.tag} onPress={() => removeTag(t)}>
                <Text style={styles.tagText}>#{t} ×</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note */}
          <Text style={styles.label}>Заметка</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Комментарий..."
            placeholderTextColor={Colors.textLight}
            multiline
          />

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: type === 'expense' ? Colors.expense : Colors.income }, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Сохранение...' : 'Сохранить'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.md },
  typeRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.md },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  typeBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  typeBtnActive: { color: Colors.white },
  amountWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  currency: { fontSize: FontSize.xxxl, color: Colors.textSecondary, marginRight: Spacing.sm },
  amountInput: { fontSize: 48, fontWeight: '800', color: Colors.text, minWidth: 100 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  catsScroll: { marginBottom: Spacing.md },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, marginRight: 8, backgroundColor: Colors.surface },
  catChipIcon: { fontSize: 16 },
  catChipText: { fontSize: FontSize.sm, color: Colors.text },
  tagInputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  tagInput: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSize.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  addTagBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, width: 44, alignItems: 'center', justifyContent: 'center' },
  addTagBtnText: { color: Colors.white, fontSize: 24, fontWeight: '300' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  tag: { backgroundColor: Colors.primary + '20', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '600' },
  noteInput: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border, minHeight: 80, textAlignVertical: 'top', marginBottom: Spacing.lg },
  saveBtn: { borderRadius: Radius.xl, paddingVertical: 16, alignItems: 'center', marginBottom: Spacing.xxl },
  saveBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
});
