import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * ============================================================
 *  Root Stack Layout
 * ============================================================
 *  - Mengaplikasikan tema terang/gelap berdasarkan sistem
 *  - Mendaftarkan semua route stack di aplikasi
 *  - Membungkus navigasi dengan AuthProvider agar seluruh layar
 *    memiliki akses state login.
 * ============================================================
 */

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="mahasiswa/add" options={{ presentation: 'modal', title: 'Tambah Mahasiswa' }} />
          <Stack.Screen name="mahasiswa/[id]" options={{ presentation: 'modal', title: 'Edit Mahasiswa' }} />
          <Stack.Screen name="prodi/add" options={{ presentation: 'modal', title: 'Tambah Prodi' }} />
          <Stack.Screen name="prodi/[id]" options={{ presentation: 'modal', title: 'Edit Prodi' }} />
          <Stack.Screen name="fakultas/add" options={{ presentation: 'modal', title: 'Tambah Fakultas' }} />
          <Stack.Screen name="fakultas/[id]" options={{ presentation: 'modal', title: 'Edit Fakultas' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
