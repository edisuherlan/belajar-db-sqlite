import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { addMahasiswa, getAllProdi, type Prodi } from '@/utils/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * Komponen Halaman Tambah Mahasiswa
 * Form untuk menambahkan data mahasiswa baru ke database
 * Fitur: input data, validasi form, dropdown pemilihan prodi/jurusan
 */
export default function AddMahasiswaScreen() {
  // State untuk menyimpan data form mahasiswa
  const [formData, setFormData] = useState({
    nim: '', // Nomor Induk Mahasiswa
    nama: '', // Nama lengkap
    jurusan: '', // Jurusan/prodi (dipilih dari dropdown)
    semester: '', // Semester (string, akan dikonversi ke number saat submit)
    email: '', // Email
  });
  // State untuk menandai apakah sedang menyimpan data
  const [loading, setLoading] = useState(false);
  // State untuk menyimpan daftar prodi (untuk dropdown)
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  // State untuk menandai apakah sedang memuat data prodi
  const [loadingProdi, setLoadingProdi] = useState(true);
  // State untuk mengontrol visibility modal pemilihan prodi
  const [showProdiModal, setShowProdiModal] = useState(false);
  // Router untuk navigasi ke halaman lain
  const router = useRouter();

  // useEffect untuk memuat data prodi saat komponen pertama kali dimount
  useEffect(() => {
    loadProdi();
  }, []);

  /**
   * Fungsi untuk memuat daftar prodi dari database
   * Data prodi digunakan untuk dropdown pemilihan jurusan
   */
  const loadProdi = async () => {
    try {
      // Ambil semua data prodi dari database
      const data = await getAllProdi();
      // Update state dengan data prodi yang diperoleh
      setProdiList(data);
    } catch (error) {
      console.error('Error loading prodi:', error);
      Alert.alert('Error', 'Gagal memuat data prodi');
    } finally {
      // Set loading menjadi false setelah selesai (baik berhasil maupun gagal)
      setLoadingProdi(false);
    }
  };

  /**
   * Fungsi untuk menangani pemilihan prodi dari dropdown
   * @param prodi - Data prodi yang dipilih
   */
  const handleSelectProdi = (prodi: Prodi) => {
    // Set nama_prodi sebagai jurusan di form data
    setFormData({ ...formData, jurusan: prodi.nama_prodi });
    // Tutup modal setelah memilih
    setShowProdiModal(false);
  };

  /**
   * Fungsi untuk menangani submit form
   * Melakukan validasi dan menyimpan data mahasiswa ke database
   */
  const handleSubmit = async () => {
    // Validasi: Pastikan semua field wajib terisi
    if (!formData.nim.trim()) {
      Alert.alert('Error', 'NIM tidak boleh kosong');
      return;
    }
    if (!formData.nama.trim()) {
      Alert.alert('Error', 'Nama tidak boleh kosong');
      return;
    }
    if (!formData.jurusan.trim()) {
      Alert.alert('Error', 'Jurusan tidak boleh kosong');
      return;
    }
    if (!formData.semester.trim()) {
      Alert.alert('Error', 'Semester tidak boleh kosong');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email tidak boleh kosong');
      return;
    }

    // Validasi: Semester harus berupa angka antara 1-14
    const semesterNum = parseInt(formData.semester, 10);
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 14) {
      Alert.alert('Error', 'Semester harus berupa angka antara 1-14');
      return;
    }

    // Validasi: Format email harus valid menggunakan regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    // Set loading menjadi true untuk menampilkan loading indicator
    setLoading(true);
    try {
      // Simpan data mahasiswa ke database
      // .trim() digunakan untuk menghapus spasi di awal dan akhir
      await addMahasiswa({
        nim: formData.nim.trim(),
        nama: formData.nama.trim(),
        jurusan: formData.jurusan.trim(),
        semester: semesterNum, // Konversi string ke number
        email: formData.email.trim(),
      });
      // Tampilkan notifikasi sukses dan kembali ke halaman sebelumnya
      Alert.alert('Sukses', 'Mahasiswa berhasil ditambahkan', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error adding mahasiswa:', error);
      // Handle error khusus untuk NIM yang sudah terdaftar (UNIQUE constraint)
      if (error.message?.includes('UNIQUE constraint')) {
        Alert.alert('Error', 'NIM sudah terdaftar');
      } else {
        Alert.alert('Error', 'Gagal menambahkan mahasiswa');
      }
    } finally {
      // Set loading menjadi false setelah selesai (baik berhasil maupun gagal)
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header halaman: tombol back, judul, dan placeholder untuk balance layout */}
      <View style={styles.header}>
        {/* Tombol untuk kembali ke halaman sebelumnya */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        {/* Judul halaman di tengah */}
        <ThemedText type="title" style={styles.title}>
          Tambah Mahasiswa
        </ThemedText>
        {/* Placeholder untuk balance layout (sama dengan width tombol back) */}
        <View style={styles.placeholder} />
      </View>

      {/* ScrollView untuk form yang bisa di-scroll jika terlalu panjang */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          {/* Input Group: NIM */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>NIM *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan NIM"
              value={formData.nim}
              onChangeText={(text) => setFormData({ ...formData, nim: text })} // Update state nim saat user mengetik
              keyboardType="numeric" // Keyboard numeric untuk input angka
            />
          </View>

          {/* Input Group: Nama Lengkap */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nama Lengkap *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap"
              value={formData.nama}
              onChangeText={(text) => setFormData({ ...formData, nama: text })} // Update state nama saat user mengetik
            />
          </View>

          {/* Input Group: Jurusan/Prodi - Menggunakan dropdown untuk memilih dari data prodi */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Jurusan/Prodi *</ThemedText>
            {/* TouchableOpacity digunakan sebagai dropdown button */}
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowProdiModal(true)} // Buka modal saat diklik
              activeOpacity={0.7}> {/* Opacity saat ditekan */}
              {/* Tampilkan nama jurusan yang dipilih atau placeholder */}
              <ThemedText style={[styles.inputText, !formData.jurusan && styles.placeholderText]}>
                {formData.jurusan || 'Pilih jurusan/prodi'} {/* Tampilkan placeholder jika belum dipilih */}
              </ThemedText>
              {/* Ikon chevron-down untuk indikator dropdown */}
              <Ionicons name="chevron-down" size={20} color="#666" style={styles.dropdownIcon} />
            </TouchableOpacity>
            {/* Pesan hint jika belum ada data prodi */}
            {prodiList.length === 0 && !loadingProdi && (
              <ThemedText style={styles.hintText}>
                Belum ada data prodi. Silakan tambahkan prodi terlebih dahulu.
              </ThemedText>
            )}
          </View>

          {/* Input Group: Semester */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Semester *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan semester (1-14)"
              value={formData.semester}
              onChangeText={(text) => setFormData({ ...formData, semester: text })} // Update state semester saat user mengetik
              keyboardType="numeric" // Keyboard numeric untuk input angka
            />
          </View>

          {/* Input Group: Email */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })} // Update state email saat user mengetik
              keyboardType="email-address" // Keyboard khusus email
              autoCapitalize="none" // Tidak auto capitalize untuk email
            />
          </View>

          {/* Tombol Submit untuk menyimpan data */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} // Tambahkan style disabled saat loading
            onPress={handleSubmit}
            disabled={loading}> {/* Disable tombol saat sedang loading */}
            {loading ? (
              // Tampilkan loading indicator saat sedang menyimpan
              <ActivityIndicator color="#FFF" />
            ) : (
              // Tampilkan teks "Simpan" saat tidak loading
              <ThemedText style={styles.submitButtonText}>Simpan</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal untuk memilih prodi dari dropdown */}
      <Modal
        visible={showProdiModal} // Kontrol visibility modal
        transparent={true} // Modal transparan dengan overlay
        animationType="slide" // Animasi slide dari bawah
        onRequestClose={() => setShowProdiModal(false)}> {/* Handle back button Android */}
        {/* Overlay background transparan */}
        <View style={styles.modalOverlay}>
          {/* Container konten modal */}
          <View style={styles.modalContent}>
            {/* Header modal: judul dan tombol close */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Pilih Jurusan/Prodi</ThemedText>
              {/* Tombol untuk menutup modal */}
              <TouchableOpacity
                onPress={() => setShowProdiModal(false)}
                style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Tampilkan loading indicator jika sedang memuat data prodi */}
            {loadingProdi ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <ThemedText style={styles.modalLoadingText}>Memuat data prodi...</ThemedText>
              </View>
            ) : prodiList.length === 0 ? (
              /* Tampilkan empty state jika tidak ada data prodi */
              <View style={styles.modalEmptyContainer}>
                <Ionicons name="school-outline" size={48} color="#999" />
                <ThemedText style={styles.modalEmptyText}>
                  Belum ada data prodi
                </ThemedText>
                <ThemedText style={styles.modalEmptySubtext}>
                  Silakan tambahkan prodi terlebih dahulu
                </ThemedText>
              </View>
            ) : (
              /* FlatList untuk menampilkan daftar prodi yang bisa dipilih */
              <FlatList
                data={prodiList} // Data prodi yang akan ditampilkan
                keyExtractor={(item) => item.id?.toString() || item.kode_prodi} // Key unik untuk setiap item
                renderItem={({ item }) => (
                  // Item prodi yang bisa diklik
                  <TouchableOpacity
                    style={[
                      styles.prodiItem,
                      // Highlight item yang sedang dipilih
                      formData.jurusan === item.nama_prodi && styles.prodiItemSelected,
                    ]}
                    onPress={() => handleSelectProdi(item)}> {/* Handle pemilihan prodi */}
                    {/* Konten item: nama, kode, dan fakultas */}
                    <View style={styles.prodiItemContent}>
                      <ThemedText style={styles.prodiItemName}>{item.nama_prodi}</ThemedText>
                      <ThemedText style={styles.prodiItemCode}>{item.kode_prodi}</ThemedText>
                      {/* Tampilkan fakultas jika ada */}
                      {item.fakultas && (
                        <ThemedText style={styles.prodiItemFakultas}>
                          {item.fakultas}
                        </ThemedText>
                      )}
                    </View>
                    {/* Tampilkan checkmark untuk prodi yang sedang dipilih */}
                    {formData.jurusan === item.nama_prodi && (
                      <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.prodiList}
              />
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

// Stylesheet untuk styling komponen
const styles = StyleSheet.create({
  // Container utama halaman
  container: {
    flex: 1,
    paddingTop: 60, // Padding atas untuk status bar
  },
  // Header halaman dengan tombol back dan judul
  header: {
    flexDirection: 'row', // Layout horizontal
    alignItems: 'center', // Rata tengah vertikal
    justifyContent: 'space-between', // Space between untuk distribusi ruang
    paddingHorizontal: 16, // Padding horizontal
    paddingBottom: 16, // Padding bawah
    borderBottomWidth: 1, // Border bawah untuk pemisah
    borderBottomColor: '#E0E0E0', // Warna border
  },
  // Style untuk tombol back
  backButton: {
    padding: 8, // Padding untuk area tap yang lebih besar
  },
  // Style untuk judul halaman
  title: {
    flex: 1, // Mengambil sisa ruang
    textAlign: 'center', // Rata tengah
  },
  // Placeholder untuk balance layout
  placeholder: {
    width: 40, // Sama dengan width tombol back
  },
  // Style untuk ScrollView
  scrollView: {
    flex: 1, // Mengambil sisa ruang
  },
  // Style untuk konten ScrollView
  content: {
    padding: 16, // Padding konten
  },
  // Container untuk form
  form: {
    gap: 20, // Jarak antar input group
  },
  // Container untuk setiap input group
  inputGroup: {
    gap: 8, // Jarak antara label dan input
  },
  // Style untuk label input
  label: {
    fontSize: 16, // Ukuran font
    fontWeight: '600', // Ketebalan font
    color: '#333', // Warna teks gelap
  },
  // Style untuk input field
  input: {
    backgroundColor: '#F5F5F5', // Background abu-abu muda
    borderWidth: 1, // Border width
    borderColor: '#E0E0E0', // Warna border
    borderRadius: 8, // Border radius untuk sudut membulat
    paddingHorizontal: 16, // Padding horizontal
    paddingVertical: 12, // Padding vertikal
    fontSize: 16, // Ukuran font
    color: '#000', // Warna teks
    flexDirection: 'row', // Layout horizontal (untuk dropdown)
    alignItems: 'center', // Rata tengah vertikal
    justifyContent: 'space-between', // Space between untuk dropdown
  },
  // Style untuk teks di dalam input (khusus dropdown)
  inputText: {
    flex: 1, // Mengambil sisa ruang
    fontSize: 16, // Ukuran font
    color: '#000', // Warna teks
  },
  // Style untuk placeholder text (khusus dropdown)
  placeholderText: {
    color: '#999', // Warna abu-abu untuk placeholder
  },
  // Style untuk ikon chevron dropdown
  dropdownIcon: {
    marginLeft: 8, // Margin kiri
  },
  // Style untuk hint text
  hintText: {
    fontSize: 12, // Ukuran font kecil
    color: '#999', // Warna abu-abu
    marginTop: 4, // Margin atas
  },
  // Style untuk tombol submit
  submitButton: {
    backgroundColor: '#4A90E2', // Background biru
    paddingVertical: 16, // Padding vertikal
    borderRadius: 8, // Border radius
    alignItems: 'center', // Rata tengah
    marginTop: 8, // Margin atas
  },
  // Style untuk tombol submit saat disabled
  submitButtonDisabled: {
    opacity: 0.6, // Opacity rendah untuk indikasi disabled
  },
  // Style untuk teks tombol submit
  submitButtonText: {
    color: '#FFF', // Warna putih
    fontSize: 16, // Ukuran font
    fontWeight: '600', // Ketebalan font
  },
  // Modal styles
  // Overlay background untuk modal
  modalOverlay: {
    flex: 1, // Full screen
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background semi-transparan
    justifyContent: 'flex-end', // Konten di bawah
  },
  // Container konten modal
  modalContent: {
    backgroundColor: '#FFF', // Background putih
    borderTopLeftRadius: 20, // Border radius kiri atas
    borderTopRightRadius: 20, // Border radius kanan atas
    maxHeight: '80%', // Maksimum tinggi 80% dari screen
    paddingBottom: 20, // Padding bawah
  },
  // Header modal
  modalHeader: {
    flexDirection: 'row', // Layout horizontal
    alignItems: 'center', // Rata tengah vertikal
    justifyContent: 'space-between', // Space between
    padding: 16, // Padding
    borderBottomWidth: 1, // Border bawah
    borderBottomColor: '#E0E0E0', // Warna border
  },
  // Style untuk judul modal
  modalTitle: {
    fontSize: 18, // Ukuran font
    fontWeight: '600', // Ketebalan font
    color: '#333', // Warna teks gelap
  },
  // Style untuk tombol close modal
  modalCloseButton: {
    padding: 4, // Padding kecil
  },
  // Container untuk loading state di modal
  modalLoadingContainer: {
    padding: 40, // Padding besar
    alignItems: 'center', // Rata tengah
    gap: 12, // Jarak antar elemen
  },
  // Style untuk teks loading
  modalLoadingText: {
    color: '#666', // Warna abu-abu
  },
  // Container untuk empty state di modal
  modalEmptyContainer: {
    padding: 40, // Padding besar
    alignItems: 'center', // Rata tengah
    gap: 12, // Jarak antar elemen
  },
  // Style untuk teks empty state
  modalEmptyText: {
    fontSize: 16, // Ukuran font
    fontWeight: '600', // Ketebalan font
    color: '#666', // Warna abu-abu
  },
  // Style untuk subteks empty state
  modalEmptySubtext: {
    fontSize: 14, // Ukuran font lebih kecil
    color: '#999', // Warna abu-abu muda
    textAlign: 'center', // Rata tengah
  },
  // Style untuk FlatList prodi
  prodiList: {
    maxHeight: 400, // Maksimum tinggi list
  },
  // Style untuk setiap item prodi
  prodiItem: {
    flexDirection: 'row', // Layout horizontal
    alignItems: 'center', // Rata tengah vertikal
    justifyContent: 'space-between', // Space between
    padding: 16, // Padding
    borderBottomWidth: 1, // Border bawah
    borderBottomColor: '#F0F0F0', // Warna border
  },
  // Style untuk item prodi yang dipilih
  prodiItemSelected: {
    backgroundColor: '#F0F7FF', // Background biru muda
  },
  // Container untuk konten item prodi
  prodiItemContent: {
    flex: 1, // Mengambil sisa ruang
  },
  // Style untuk nama prodi
  prodiItemName: {
    fontSize: 16, // Ukuran font
    fontWeight: '600', // Ketebalan font
    color: '#333', // Warna teks gelap
    marginBottom: 4, // Margin bawah
  },
  // Style untuk kode prodi
  prodiItemCode: {
    fontSize: 14, // Ukuran font lebih kecil
    color: '#666', // Warna abu-abu
    marginBottom: 2, // Margin bawah
  },
  // Style untuk fakultas prodi
  prodiItemFakultas: {
    fontSize: 12, // Ukuran font kecil
    color: '#999', // Warna abu-abu muda
  },
});
