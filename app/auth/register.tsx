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
 *  Halaman Registrasi Sederhana
 * ============================================================
 *  Fitur:
 *    - Validasi dasar: nama, email, password & konfirmasi
 *    - Cek email ganda sebelum membuat akun
 *    - Menyimpan user baru ke tabel users di SQLite
 *    - Navigasi cepat kembali ke halaman login
 * ============================================================
 */

export default function RegisterScreen() {
  const router = useRouter();
  const { register, user, initializing } = useAuth(); // Gunakan helper register + status sesi
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Jika user sudah login, tidak perlu berada di halaman registrasi lagi
  useEffect(() => {
    if (!initializing && user) {
      router.replace('/(tabs)' as any);
    }
  }, [initializing, user, router]);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validasi', 'Nama wajib diisi');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Validasi', 'Email wajib diisi');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Validasi', 'Password wajib diisi');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Validasi', 'Password minimal 6 karakter');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validasi', 'Konfirmasi password tidak sesuai');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (!result.success) {
        Alert.alert('Registrasi Gagal', result.message || 'Tidak dapat membuat akun');
        return;
      }
      Alert.alert('Registrasi Berhasil', 'Akun berhasil dibuat. Silakan login.', [
        {
          text: 'OK',
          onPress: () => router.replace('/auth/login' as any),
        },
      ]);
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="person-add-outline" size={36} color="#16A34A" />
          <ThemedText type="title" style={styles.title}>
            Buat Akun Baru
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Isi data di bawah ini untuk membuat akun.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nama Lengkap</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="contoh: Budi Santoso"
              value={name}
              onChangeText={setName}
            />
          </View>

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
              placeholder="Minimal 6 karakter"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Konfirmasi Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Ulangi password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <ThemedText style={styles.submitText}>Daftar</ThemedText>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Sudah punya akun?</ThemedText>
            <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
              <ThemedText style={styles.footerLink}>Masuk di sini</ThemedText>
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
    backgroundColor: '#16A34A',
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
    color: '#16A34A',
    fontWeight: '600',
  },
});

