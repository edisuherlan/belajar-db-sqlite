import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * ============================================================
 *  Halaman Login Sederhana
 * ============================================================
 *  Fitur:
 *    - Validasi input dasar (email & password wajib diisi)
 *    - Pengecekan kredensial menggunakan tabel users di SQLite
 *    - Tombol navigasi ke halaman registrasi
 *    - Komentar detail untuk mempermudah pemahaman kode
 * ============================================================
 */

export default function LoginScreen() {
  const router = useRouter();
  const { login, user, initializing } = useAuth(); // Ambil helper autentikasi & status sesi
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Jika user sudah login, langsung alihkan ke tab utama
  useEffect(() => {
    if (!initializing && user) {
      router.replace('/(tabs)' as any);
    }
  }, [initializing, user, router]);

  /**
   * Validasi sederhana terhadap email/password
   */
  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Validasi', 'Email wajib diisi');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Validasi', 'Password wajib diisi');
      return false;
    }
    return true;
  };

  /**
   * Handler submit login
   */
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        Alert.alert('Login Gagal', result.message || 'Email atau password salah');
        return;
      }
      router.replace('/(tabs)' as any);
    } catch (error) {
      console.error('Error login:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="lock-closed-outline" size={36} color="#4A90E2" />
          <ThemedText type="title" style={styles.title}>
            Masuk ke Aplikasi
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Gunakan email dan password yang sudah terdaftar.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="contoh: user@mail.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <ThemedText style={styles.submitText}>Masuk</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Belum punya akun?</ThemedText>
            <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
              <ThemedText style={styles.footerLink}>Daftar sekarang</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
  },
  form: {
    gap: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    color: '#6B7280',
  },
  footerLink: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});

