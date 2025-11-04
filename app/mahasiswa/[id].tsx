import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAllProdi, getMahasiswaById, updateMahasiswa, type Prodi } from '@/utils/database';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
 * Komponen Halaman Edit Mahasiswa
 * Form untuk mengedit data mahasiswa yang sudah ada di database
 * Fitur: memuat data existing, input data, validasi form, dropdown pemilihan prodi/jurusan
 * @param id - ID mahasiswa yang akan diedit (diambil dari route parameter)
 */
export default function EditMahasiswaScreen() {
  // Ambil ID dari route parameter (dynamic route: /mahasiswa/[id])
  const { id } = useLocalSearchParams<{ id: string }>();
  // State untuk menyimpan data form mahasiswa
  const [formData, setFormData] = useState({
    nim: '', // Nomor Induk Mahasiswa
    nama: '', // Nama lengkap
    jurusan: '', // Jurusan/prodi (dipilih dari dropdown)
    semester: '', // Semester (string, akan dikonversi ke number saat submit)
    email: '', // Email
  });
  // State untuk menandai apakah sedang memuat data mahasiswa dari database
  const [loading, setLoading] = useState(true);
  // State untuk menandai apakah sedang menyimpan perubahan data
  const [saving, setSaving] = useState(false);
  // State untuk menyimpan daftar prodi (untuk dropdown)
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  // State untuk menandai apakah sedang memuat data prodi
  const [loadingProdi, setLoadingProdi] = useState(true);
  // State untuk mengontrol visibility modal pemilihan prodi
  const [showProdiModal, setShowProdiModal] = useState(false);
  const router = useRouter();

  // useEffect untuk memuat data saat komponen pertama kali dimount atau ID berubah
  useEffect(() => {
    loadData();
  }, [id]);

  /**
   * Fungsi untuk memuat data mahasiswa dan prodi secara bersamaan
   * Menggunakan Promise.all untuk memuat kedua data secara paralel
   */
  const loadData = async () => {
    await Promise.all([loadMahasiswa(), loadProdi()]);
  };

  /**
   * Fungsi untuk memuat daftar prodi dari database
   * Data prodi digunakan untuk dropdown pemilihan jurusan
   */
  const loadProdi = async () => {
    try {
      const data = await getAllProdi();
      setProdiList(data);
    } catch (error) {
      console.error('Error loading prodi:', error);
    } finally {
      setLoadingProdi(false);
    }
  };

  /**
   * Fungsi untuk memuat data mahasiswa berdasarkan ID dari database
   * Data yang dimuat akan diisi ke dalam form untuk diedit
   */
  const loadMahasiswa = async () => {
    // Validasi: pastikan ID ada
    if (!id) {
      Alert.alert('Error', 'ID tidak valid');
      router.back();
      return;
    }

    try {
      // Ambil data mahasiswa dari database berdasarkan ID
      const mahasiswa = await getMahasiswaById(parseInt(id, 10));
      if (!mahasiswa) {
        Alert.alert('Error', 'Mahasiswa tidak ditemukan');
        router.back();
        return;
      }

      // Isi form dengan data yang sudah ada
      // Menggunakan || '' untuk mengubah null/undefined menjadi string kosong
      setFormData({
        nim: mahasiswa.nim || '',
        nama: mahasiswa.nama || '',
        jurusan: mahasiswa.jurusan || '',
        semester: mahasiswa.semester?.toString() || '', // Konversi number ke string untuk TextInput
        email: mahasiswa.email || '',
      });
    } catch (error) {
      console.error('Error loading mahasiswa:', error);
      Alert.alert('Error', 'Gagal memuat data mahasiswa');
      router.back();
    } finally {
      // Set loading menjadi false setelah selesai (baik berhasil maupun gagal)
      setLoading(false);
    }
  };

  /**
   * Fungsi untuk menangani pemilihan prodi dari dropdown
   * @param prodi - Data prodi yang dipilih
   */
  const handleSelectProdi = (prodi: Prodi) => {
    // Set nama_prodi sebagai jurusan
    setFormData({ ...formData, jurusan: prodi.nama_prodi });
    // Tutup modal setelah memilih
    setShowProdiModal(false);
  };

  /**
   * Fungsi untuk menangani submit form (update data)
   * Melakukan validasi dan memperbarui data mahasiswa di database
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

    // Validasi: pastikan ID masih ada
    if (!id) {
      Alert.alert('Error', 'ID tidak valid');
      return;
    }

    // Set saving menjadi true untuk menampilkan loading indicator
    setSaving(true);
    try {
      // Perbarui data mahasiswa di database berdasarkan ID
      // .trim() digunakan untuk menghapus spasi di awal dan akhir
      await updateMahasiswa(parseInt(id, 10), {
        nim: formData.nim.trim(),
        nama: formData.nama.trim(),
        jurusan: formData.jurusan.trim(),
        semester: semesterNum, // Konversi string ke number
        email: formData.email.trim(),
      });
      // Tampilkan notifikasi sukses dan kembali ke halaman sebelumnya
      Alert.alert('Sukses', 'Data mahasiswa berhasil diperbarui', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating mahasiswa:', error);
      // Handle error khusus untuk NIM yang sudah terdaftar (UNIQUE constraint)
      if (error.message?.includes('UNIQUE constraint')) {
        Alert.alert('Error', 'NIM sudah terdaftar');
      } else {
        Alert.alert('Error', 'Gagal memperbarui data mahasiswa');
      }
    } finally {
      // Set saving menjadi false setelah selesai (baik berhasil maupun gagal)
      setSaving(false);
    }
  };

  // Tampilkan loading indicator saat data sedang dimuat dari database
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <ThemedText style={styles.loadingText}>Memuat data...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header halaman: tombol back, judul */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Edit Mahasiswa
        </ThemedText>
        <View style={styles.placeholder} /> {/* Placeholder untuk balance layout */}
      </View>

      {/* ScrollView untuk form yang bisa di-scroll jika terlalu panjang */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          {/* Input NIM */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>NIM *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan NIM"
              value={formData.nim || ''}
              onChangeText={(text) => setFormData({ ...formData, nim: text })}
              keyboardType="numeric"
            />
          </View>

          {/* Input Nama Lengkap */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nama Lengkap *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap"
              value={formData.nama || ''}
              onChangeText={(text) => setFormData({ ...formData, nama: text })}
            />
          </View>

          {/* Input Jurusan/Prodi: Menggunakan dropdown untuk memilih dari data prodi */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Jurusan/Prodi *</ThemedText>
            {/* TouchableOpacity digunakan sebagai dropdown button */}
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowProdiModal(true)} // Buka modal saat diklik
              activeOpacity={0.7}>
              <ThemedText style={[styles.inputText, !formData.jurusan && styles.placeholderText]}>
                {formData.jurusan || 'Pilih jurusan/prodi'} {/* Tampilkan placeholder jika belum dipilih */}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color="#666" style={styles.dropdownIcon} />
            </TouchableOpacity>
            {/* Pesan hint jika belum ada data prodi */}
            {prodiList.length === 0 && !loadingProdi && (
              <ThemedText style={styles.hintText}>
                Belum ada data prodi. Silakan tambahkan prodi terlebih dahulu.
              </ThemedText>
            )}
          </View>

          {/* Input Semester */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Semester *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan semester (1-14)"
              value={formData.semester || ''}
              onChangeText={(text) => setFormData({ ...formData, semester: text })}
              keyboardType="numeric"
            />
          </View>

          {/* Input Email */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan email"
              value={formData.email || ''}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Tombol Update */}
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Update</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal untuk memilih prodi dari dropdown */}
      <Modal
        visible={showProdiModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProdiModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header modal: judul dan tombol close */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Pilih Jurusan/Prodi</ThemedText>
              <TouchableOpacity
                onPress={() => setShowProdiModal(false)}
                style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Tampilkan loading jika sedang memuat data prodi */}
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
                data={prodiList}
                keyExtractor={(item) => item.id?.toString() || item.kode_prodi}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.prodiItem,
                      // Highlight item yang sedang dipilih
                      formData.jurusan === item.nama_prodi && styles.prodiItemSelected,
                    ]}
                    onPress={() => handleSelectProdi(item)}>
                    <View style={styles.prodiItemContent}>
                      <ThemedText style={styles.prodiItemName}>{item.nama_prodi || ''}</ThemedText>
                      <ThemedText style={styles.prodiItemCode}>{item.kode_prodi || ''}</ThemedText>
                      {item.fakultas && (
                        <ThemedText style={styles.prodiItemFakultas}>
                          {item.fakultas || ''}
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
  container: {
    flex: 1,
    paddingTop: 60, // Padding atas untuk status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40, // Placeholder untuk balance layout (sama dengan width tombol back)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay semi-transparan
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  modalLoadingText: {
    color: '#666',
  },
  modalEmptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  modalEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalEmptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  prodiList: {
    maxHeight: 400,
  },
  prodiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  prodiItemSelected: {
    backgroundColor: '#F0F7FF', // Background biru muda untuk item yang dipilih
  },
  prodiItemContent: {
    flex: 1,
  },
  prodiItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  prodiItemCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  prodiItemFakultas: {
    fontSize: 12,
    color: '#999',
  },
});
