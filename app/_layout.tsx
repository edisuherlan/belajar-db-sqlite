import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="mahasiswa/add" options={{ presentation: 'modal', title: 'Tambah Mahasiswa' }} />
        <Stack.Screen name="mahasiswa/[id]" options={{ presentation: 'modal', title: 'Edit Mahasiswa' }} />
        <Stack.Screen name="prodi/add" options={{ presentation: 'modal', title: 'Tambah Prodi' }} />
        <Stack.Screen name="prodi/[id]" options={{ presentation: 'modal', title: 'Edit Prodi' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
