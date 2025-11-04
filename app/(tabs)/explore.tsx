import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

/**
 * Komponen Halaman Info Aplikasi
 * Menampilkan informasi tentang aplikasi dan identitas pembuat
 * Menggunakan ParallaxScrollView untuk efek parallax yang menarik
 */
export default function InfoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#4A90E2', dark: '#2C5282' }} // Warna background header untuk light dan dark mode
      headerImage={
        // Ikon informasi besar sebagai header image dengan efek parallax
        <Ionicons
          name="information-circle"
          size={310}
          color="#FFFFFF"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.container}>
        {/* Section 1: Informasi Nama Aplikasi */}
        <View style={styles.section}>
          <ThemedView style={styles.card}>
            {/* Container untuk ikon aplikasi */}
            <View style={styles.iconContainer}>
              <Ionicons name="apps" size={48} color="#4A90E2" />
            </View>
            
            {/* Judul aplikasi */}
            <ThemedText type="title" style={styles.appTitle}>
              Belajar Database
            </ThemedText>
            
            {/* Subtitle/deskripsi singkat aplikasi */}
            <ThemedText style={styles.appSubtitle}>
              Aplikasi Manajemen Data Mahasiswa dan Program Studi
            </ThemedText>
            
            {/* Deskripsi lengkap tentang aplikasi */}
            <ThemedText style={styles.appDescription}>
              Aplikasi mobile untuk mengelola data mahasiswa dan program studi menggunakan 
              database lokal SQLite. Fitur lengkap CRUD (Create, Read, Update, Delete) 
              dengan antarmuka yang mudah digunakan.
            </ThemedText>
          </ThemedView>
        </View>

        {/* Section 2: Informasi Pembuat Aplikasi */}
        <View style={styles.section}>
          <ThemedView style={styles.card}>
            {/* Header section dengan ikon dan judul */}
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle" size={32} color="#4A90E2" />
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Tentang Pembuat
              </ThemedText>
            </View>
            
            {/* Baris informasi: Nama Pembuat */}
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={24} color="#666" />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Nama</ThemedText>
                <ThemedText style={styles.infoValue}>Edi Suherlan</ThemedText>
              </View>
            </View>

            {/* Baris informasi: Email Pembuat */}
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={24} color="#666" />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Email</ThemedText>
                <ThemedText style={styles.infoValue}>edisuherlan@gmail.com</ThemedText>
              </View>
            </View>

            {/* Baris informasi: Institusi/Universitas */}
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={24} color="#666" />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Institusi</ThemedText>
                <ThemedText style={styles.infoValue}>Universitas Faletehan</ThemedText>
              </View>
            </View>

            {/* Baris informasi: Teknologi yang digunakan */}
            <View style={styles.infoRow}>
              <Ionicons name="code-slash-outline" size={24} color="#666" />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Teknologi</ThemedText>
                <ThemedText style={styles.infoValue}>
                  React Native • Expo • SQLite • TypeScript
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </View>

        {/* Section 3: Informasi Versi dan Detail Aplikasi */}
        <View style={styles.section}>
          <ThemedView style={styles.card}>
            {/* Header section dengan ikon dan judul */}
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={32} color="#4A90E2" />
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Informasi Aplikasi
              </ThemedText>
            </View>
            
            {/* Baris informasi: Versi aplikasi */}
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={24} color="#666" />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Versi</ThemedText>
                <ThemedText style={styles.infoValue}>1.0.0</ThemedText>
              </View>
            </View>

            {/* Baris informasi: Tahun pembuatan */}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={24} color="#666" />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Tahun</ThemedText>
                <ThemedText style={styles.infoValue}>2024</ThemedText>
              </View>
            </View>

            {/* Baris informasi: Lisensi aplikasi */}
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={24} color="#666" />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Lisensi</ThemedText>
                <ThemedText style={styles.infoValue}>Educational Purpose</ThemedText>
              </View>
            </View>
          </ThemedView>
        </View>

        {/* Footer: Copyright dan pesan */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Dibuat dengan ❤️ untuk pembelajaran
          </ThemedText>
          <ThemedText style={styles.footerSubtext}>
            © 2024 Belajar Database App
          </ThemedText>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

// Stylesheet untuk styling komponen
const styles = StyleSheet.create({
  // Container utama untuk konten halaman
  container: {
    flex: 1,
    paddingBottom: 20, // Padding bawah untuk spacing dengan tab bar
  },
  // Style untuk header image (ikon informasi di background header)
  headerImage: {
    bottom: -90, // Posisi vertikal untuk efek parallax
    left: -35, // Posisi horizontal
    position: 'absolute', // Absolute positioning
    opacity: 0.3, // Opacity rendah untuk efek background
  },
  // Style untuk setiap section/kartu informasi
  section: {
    marginBottom: 20, // Jarak antar section
    paddingHorizontal: 16, // Padding horizontal
  },
  // Style untuk kartu informasi (card component)
  card: {
    backgroundColor: '#FFF', // Background putih untuk card
    borderRadius: 16, // Border radius untuk sudut membulat
    padding: 20, // Padding dalam card
    shadowColor: '#000', // Warna shadow
    shadowOffset: { width: 0, height: 2 }, // Offset shadow
    shadowOpacity: 0.1, // Opacity shadow
    shadowRadius: 8, // Radius shadow
    elevation: 4, // Elevation untuk Android shadow
    borderWidth: 1, // Border width
    borderColor: '#E0E0E0', // Warna border
  },
  // Container untuk ikon aplikasi di section pertama
  iconContainer: {
    alignItems: 'center', // Rata tengah horizontal
    marginBottom: 16, // Margin bawah
  },
  // Style untuk judul aplikasi
  appTitle: {
    fontSize: 28, // Ukuran font besar
    fontWeight: 'bold', // Tebal
    textAlign: 'center', // Rata tengah
    marginBottom: 8, // Margin bawah
    color: '#333', // Warna teks gelap
  },
  // Style untuk subtitle aplikasi
  appSubtitle: {
    fontSize: 16, // Ukuran font medium
    textAlign: 'center', // Rata tengah
    color: '#666', // Warna abu-abu
    marginBottom: 16, // Margin bawah
    fontWeight: '500', // Ketebalan medium
  },
  // Style untuk deskripsi aplikasi
  appDescription: {
    fontSize: 14, // Ukuran font kecil
    textAlign: 'center', // Rata tengah
    color: '#666', // Warna abu-abu
    lineHeight: 22, // Line height untuk readability
  },
  // Style untuk header setiap section (ikon + judul)
  sectionHeader: {
    flexDirection: 'row', // Layout horizontal
    alignItems: 'center', // Rata tengah vertikal
    marginBottom: 20, // Margin bawah
    gap: 12, // Jarak antar elemen
  },
  // Style untuk judul section
  sectionTitle: {
    fontSize: 20, // Ukuran font
    color: '#333', // Warna teks gelap
  },
  // Style untuk setiap baris informasi (ikon + label + value)
  infoRow: {
    flexDirection: 'row', // Layout horizontal
    alignItems: 'flex-start', // Align items di awal
    marginBottom: 20, // Margin bawah antar baris
    gap: 16, // Jarak antara ikon dan konten
  },
  // Container untuk konten informasi (label + value)
  infoContent: {
    flex: 1, // Mengambil sisa ruang yang tersedia
  },
  // Style untuk label informasi (Nama, Email, dll)
  infoLabel: {
    fontSize: 12, // Ukuran font kecil
    color: '#999', // Warna abu-abu muda
    marginBottom: 4, // Margin bawah
    textTransform: 'uppercase', // Huruf kapital
    letterSpacing: 0.5, // Spasi antar huruf
  },
  // Style untuk value informasi (nilai dari label)
  infoValue: {
    fontSize: 16, // Ukuran font medium
    color: '#333', // Warna teks gelap
    fontWeight: '500', // Ketebalan medium
  },
  // Container untuk footer di bagian bawah
  footer: {
    alignItems: 'center', // Rata tengah horizontal
    marginTop: 20, // Margin atas
    marginBottom: 40, // Margin bawah yang besar untuk spacing dengan tab bar
    paddingHorizontal: 16, // Padding horizontal
  },
  // Style untuk teks footer utama
  footerText: {
    fontSize: 14, // Ukuran font kecil
    color: '#666', // Warna abu-abu
    marginBottom: 8, // Margin bawah
    textAlign: 'center', // Rata tengah
  },
  // Style untuk teks copyright di footer
  footerSubtext: {
    fontSize: 12, // Ukuran font sangat kecil
    color: '#999', // Warna abu-abu muda
    textAlign: 'center', // Rata tengah
  },
});
