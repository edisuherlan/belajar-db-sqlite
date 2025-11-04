import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { addProdi } from '@/utils/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

/**
 * Komponen Halaman Tambah Prodi
 * Form untuk menambahkan data program studi baru ke database
 * Fitur: input data, validasi form (kode_prodi, nama_prodi, fakultas wajib; akreditasi dan deskripsi opsional)
 */
export default function AddProdiScreen() {
  // State untuk menyimpan data form prodi
  const [formData, setFormData] = useState({
    kode_prodi: '', // Kode program studi (contoh: TI, SI, MI) - wajib, unique
    nama_prodi: '', // Nama lengkap program studi - wajib
    fakultas: '', // Nama fakultas - wajib
    akreditasi: '', // Status akreditasi (opsional, contoh: A, B, C, Unggul)
    deskripsi: '', // Deskripsi program studi (opsional)
  });
  // State untuk menandai apakah sedang menyimpan data
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Fungsi untuk menangani submit form
   * Melakukan validasi dan menyimpan data prodi ke database
   */
  const handleSubmit = async () => {
    // Validasi: Pastikan semua field wajib terisi
    if (!formData.kode_prodi.trim()) {
      Alert.alert('Error', 'Kode Prodi tidak boleh kosong');
      return;
    }
    if (!formData.nama_prodi.trim()) {
      Alert.alert('Error', 'Nama Prodi tidak boleh kosong');
      return;
    }
    if (!formData.fakultas.trim()) {
      Alert.alert('Error', 'Fakultas tidak boleh kosong');
      return;
    }

    // Set loading menjadi true untuk menampilkan loading indicator
    setLoading(true);
    try {
      console.log('=== Start adding prodi ===');
      console.log('Form data:', formData);
      
      // Siapkan data untuk disimpan ke database
      // .trim() digunakan untuk menghapus spasi di awal dan akhir
      // || undefined digunakan untuk mengubah string kosong menjadi undefined (field opsional)
      const prodiData = {
        kode_prodi: formData.kode_prodi.trim(),
        nama_prodi: formData.nama_prodi.trim(),
        fakultas: formData.fakultas.trim(),
        akreditasi: formData.akreditasi.trim() || undefined, // Opsional
        deskripsi: formData.deskripsi.trim() || undefined, // Opsional
      };
      console.log('Prodi data to insert:', prodiData);
      
      // addProdi akan memanggil getDatabase() yang akan memastikan database ter-initialize
      const result = await addProdi(prodiData);
      console.log('Prodi added successfully with ID:', result);
      
      // Tampilkan notifikasi sukses dan kembali ke halaman sebelumnya
      Alert.alert('Sukses', 'Prodi berhasil ditambahkan', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      // Log error secara detail untuk debugging
      console.error('=== Error adding prodi ===');
      console.error('Error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error string:', String(error));
      console.error('Error JSON:', JSON.stringify(error, null, 2));
      
      // Format error message
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Final error message:', errorMessage);
      
      // Handle error berdasarkan jenis error
      if (errorMessage.includes('UNIQUE constraint') || errorMessage.includes('UNIQUE') || errorMessage.includes('UNIQUE')) {
        Alert.alert('Error', 'Kode Prodi sudah terdaftar. Silakan gunakan kode prodi lain.');
      } else if (errorMessage.includes('no such table') || errorMessage.includes('no such table')) {
        Alert.alert('Error', 'Database belum terinisialisasi. Silakan restart aplikasi.');
      } else {
        Alert.alert('Error', `Gagal menambahkan prodi:\n${errorMessage}`);
      }
    } finally {
      // Set loading menjadi false setelah selesai (baik berhasil maupun gagal)
      setLoading(false);
      console.log('=== End adding prodi ===');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header halaman: tombol back, judul */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Tambah Prodi
        </ThemedText>
        <View style={styles.placeholder} /> {/* Placeholder untuk balance layout */}
      </View>

      {/* ScrollView untuk form yang bisa di-scroll jika terlalu panjang */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          {/* Input Kode Prodi */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Kode Prodi *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Contoh: TI, SI, MI"
              value={formData.kode_prodi}
              onChangeText={(text) => setFormData({ ...formData, kode_prodi: text.toUpperCase() })} // Auto uppercase
              autoCapitalize="characters"
            />
          </View>

          {/* Input Nama Prodi */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nama Prodi *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama prodi"
              value={formData.nama_prodi}
              onChangeText={(text) => setFormData({ ...formData, nama_prodi: text })}
            />
          </View>

          {/* Input Fakultas */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Fakultas *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama fakultas"
              value={formData.fakultas}
              onChangeText={(text) => setFormData({ ...formData, fakultas: text })}
            />
          </View>

          {/* Input Akreditasi (opsional) */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Akreditasi</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Contoh: A, B, C, Unggul, Baik Sekali"
              value={formData.akreditasi}
              onChangeText={(text) => setFormData({ ...formData, akreditasi: text })}
            />
          </View>

          {/* Input Deskripsi (opsional, multiline) */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Deskripsi</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Masukkan deskripsi prodi (opsional)"
              value={formData.deskripsi}
              onChangeText={(text) => setFormData({ ...formData, deskripsi: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Tombol Simpan */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Simpan</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  textArea: {
    minHeight: 100, // Minimum height untuk textarea
    paddingTop: 12,
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
});
