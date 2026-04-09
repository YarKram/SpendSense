import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../store/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { addCategory, updateCategory, deleteCategory } from '../services/categories';
import { Colors, Spacing, FontSize, Radius } from '../constants/theme';
import { Category, TransactionType } from '../types/transaction';

const COLORS = ['#FF6B6B', '#FF8E53', '#FECA57', '#4ECDC4', '#45B7D1', '#6C63FF', '#2ECC71', '#27AE60', '#C44569', '#786FA6', '#778CA3', '#54A0FF'];
const ICONS = ['🍔','🛒','🚗','🏠','💊','🏋️','🎬','👗','📱','📚','✈️','💄','🎁','☕','📺','💸','💼','💻','🏢','📈','🎉','🛍️','💰','🎮','🍕','🚂','⚽','🎵','🏖️','🌱'];

export default function CategoriesScreen() {
  const { user } = useAuth();
  const { categories, reload } = useCategories(user?.uid);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💸');
  const [color, setColor] = useState(COLORS[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null); setName(''); setIcon('💸'); setColor(COLORS[0]); setType('expense');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat); setName(cat.name); setIcon(cat.icon); setColor(cat.color); setType(cat.type === 'both' ? 'expense' : cat.type);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(user.uid, editing.id, { name: name.trim(), icon, color, type });
      } else {
        await addCategory(user.uid, { name: name.trim(), icon, color, type, isDefault: false });
      }
      await reload();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat: Category) => {
    if (cat.isDefault) return Alert.alert('Нельзя удалить', 'Системные категории нельзя удалять');
    Alert.alert('Удалить категорию?', cat.name, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => { await deleteCategory(user!.uid, cat.id); await reload(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openEdit(item)} onLongPress={() => handleDelete(item)}>
            <View style={[styles.icon, { backgroundColor: item.color + '20' }]}>
              <Text style={styles.iconEmoji}>{item.icon}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.type}>{item.type === 'income' ? 'Доход' : 'Расход'}</Text>
            {!item.isDefault && <Text style={styles.edit}>✎</Text>}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openNew}>
            <Text style={styles.addBtnText}>+ Добавить категорию</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalOpen(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalOpen(false)}>
              <Text style={styles.modalCancel}>Отмена</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Редактировать' : 'Новая категория'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text style={[styles.modalSave, saving && { opacity: 0.5 }]}>Сохранить</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Preview */}
            <View style={styles.preview}>
              <View style={[styles.previewIcon, { backgroundColor: color + '30' }]}>
                <Text style={{ fontSize: 36 }}>{icon}</Text>
              </View>
              <Text style={[styles.previewName, { color }]}>{name || 'Название'}</Text>
            </View>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Название категории"
              placeholderTextColor={Colors.textLight}
            />

            <Text style={styles.label}>Тип</Text>
            <View style={styles.typeRow}>
              {(['expense', 'income'] as TransactionType[]).map((t) => (
                <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]} onPress={() => setType(t)}>
                  <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>{t === 'expense' ? 'Расход' : 'Доход'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Иконка</Text>
            <View style={styles.iconsGrid}>
              {ICONS.map((ic) => (
                <TouchableOpacity key={ic} style={[styles.iconOpt, ic === icon && { backgroundColor: color + '30' }]} onPress={() => setIcon(ic)}>
                  <Text style={{ fontSize: 22 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Цвет</Text>
            <View style={styles.colorsRow}>
              {COLORS.map((c) => (
                <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, c === color && styles.colorDotActive]} onPress={() => setColor(c)} />
              ))}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, marginBottom: Spacing.xs, gap: Spacing.sm },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 20 },
  name: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  type: { fontSize: FontSize.xs, color: Colors.textSecondary },
  edit: { fontSize: 16, color: Colors.textLight, marginLeft: 4 },
  addBtn: { borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed', padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  addBtnText: { color: Colors.primary, fontWeight: '600' },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  modalCancel: { fontSize: FontSize.md, color: Colors.textSecondary },
  modalSave: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '700' },
  modalContent: { padding: Spacing.md },
  preview: { alignItems: 'center', marginBottom: Spacing.md },
  previewIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  previewName: { fontSize: FontSize.lg, fontWeight: '700' },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  typeRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.sm },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.md, alignItems: 'center' },
  typeBtnActive: { backgroundColor: Colors.primary },
  typeBtnText: { fontWeight: '600', color: Colors.textSecondary },
  typeBtnTextActive: { color: Colors.white },
  iconsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  iconOpt: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotActive: { borderWidth: 3, borderColor: Colors.text },
});
