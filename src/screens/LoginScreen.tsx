import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { signInWithGoogle } from '../services/auth';
import { Colors, Spacing, FontSize, Radius } from '../constants/theme';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      Alert.alert('Ошибка входа', err.message ?? 'Попробуйте ещё раз');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.logo}>💸</Text>
          <Text style={styles.appName}>SpendSense</Text>
          <Text style={styles.tagline}>Умный учёт финансов</Text>
        </View>

        <View style={styles.features}>
          {[
            ['📊', 'Аналитика доходов и расходов'],
            ['🏷️', 'Категории и теги'],
            ['🎯', 'Бюджеты и лимиты'],
            ['📅', 'История по дням, месяцам, годам'],
          ].map(([icon, text]) => (
            <View key={text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{icon}</Text>
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text} />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Войти через Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 72,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FontSize.lg,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  features: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: FontSize.md,
    color: Colors.white,
    flex: 1,
  },
  googleButton: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  googleButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
});
