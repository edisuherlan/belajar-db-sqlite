import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Komponen Layout untuk Tab Navigation
 * Mendefinisikan struktur navigasi tab dengan 4 halaman utama:
 * 1. Fakultas - untuk mengelola data fakultas (hierarki tertinggi)
 * 2. Prodi - untuk mengelola data program studi (dibawah fakultas)
 * 3. Mahasiswa - untuk mengelola data mahasiswa (data utama)
 * 4. Info - untuk menampilkan informasi aplikasi dan pembuat
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  // Ambil safe area insets untuk menghindari bentrok dengan navigation bar sistem
  const insets = useSafeAreaInsets();
  
  // Hitung padding bottom yang aman untuk menghindari bentrok dengan navigation bar
  // Di Android, biasanya perlu extra spacing untuk gesture navigation bar
  const safeBottomPadding = Platform.OS === 'android' 
    ? Math.max(insets.bottom, 12) // Minimum 12 untuk Android
    : Math.max(insets.bottom, 8); // Minimum 8 untuk iOS

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint, // Warna ikon dan teks saat aktif
        headerShown: false, // Sembunyikan header default (menggunakan header custom di setiap halaman)
        tabBarButton: HapticTab, // Tambahkan haptic feedback saat tab diklik
        tabBarStyle: {
          paddingTop: 6, // Padding atas tab bar
          paddingBottom: safeBottomPadding, // Padding bawah menggunakan safe area yang sudah disesuaikan
          height: 55 + safeBottomPadding, // Tinggi tab bar disesuaikan dengan safe area
          borderTopWidth: 1, // Border atas untuk pemisah visual
          borderTopColor: '#E0E0E0', // Warna border
          elevation: 8, // Shadow untuk Android
          shadowColor: '#000', // Shadow color untuk iOS
          shadowOffset: { width: 0, height: -2 }, // Shadow offset
          shadowOpacity: 0.1, // Shadow opacity
          shadowRadius: 4, // Shadow radius
          position: 'absolute', // Posisi absolute untuk kontrol lebih baik
          bottom: 0, // Posisi di bawah
        },
        tabBarLabelStyle: {
          fontSize: 11, // Ukuran font label sedikit lebih kecil
          fontWeight: '600', // Ketebalan font label
          marginBottom: 2, // Margin bawah label untuk spacing
        },
        tabBarIconStyle: {
          marginTop: 2, // Margin atas ikon untuk spacing
        },
      }}>
      {/* Tab 1: Halaman Fakultas - Daftar dan manajemen data fakultas (hierarki tertinggi) */}
      <Tabs.Screen
        name="fakultas"
        options={{
          title: 'Fakultas', // Label tab
          tabBarIcon: ({ color }) => (
            <Ionicons name="school" size={24} color={color} /> // Ikon untuk tab fakultas
          ),
        }}
      />
      
      {/* Tab 2: Halaman Prodi - Daftar dan manajemen data program studi (dibawah fakultas) */}
      <Tabs.Screen
        name="prodi"
        options={{
          title: 'Prodi', // Label tab
          tabBarIcon: ({ color }) => (
            <Ionicons name="library" size={24} color={color} /> // Ikon untuk tab prodi
          ),
        }}
      />
      
      {/* Tab 3: Halaman Mahasiswa - Daftar dan manajemen data mahasiswa (data utama) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mahasiswa', // Label tab
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} /> // Ikon untuk tab mahasiswa
          ),
        }}
      />
      
      {/* Tab 4: Halaman Info - Informasi aplikasi dan identitas pembuat */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Info', // Label tab
          tabBarIcon: ({ color }) => (
            <Ionicons name="information-circle" size={24} color={color} /> // Ikon untuk tab info
          ),
        }}
      />
    </Tabs>
  );
}
