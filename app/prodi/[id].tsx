import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getProdiById, updateProdi } from '@/utils/database';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
 * Komponen Halaman Edit Prodi
 * Form untuk mengedit data program studi yang sudah ada di database
 * Fitur: memuat data existing, input data, validasi form
 * @param id - ID prodi yang akan diedit (diambil dari route parameter)
 */
export default function EditProdiScreen() {
  // Ambil ID dari route parameter (dynamic route: /prodi/[id])
  const { id } = useLocalSearchParams<{ id: string }>();
  // State untuk menyimpan data form prodi
  const [formData, setFormData] = useState({
    kode_prodi: '', // Kode program studi (contoh: TI, SI, MI) - wajib, unique
    nama_prodi: '', // Nama lengkap program studi - wajib
    fakultas: '', // Nama fakultas - wajib
    akreditasi: '', // Status akreditasi (opsional, contoh: A, B, C, Unggul)
    deskripsi: '', // Deskripsi program studi (opsional)
  });
  // State untuk menandai apakah sedang memuat data prodi dari database
  const [loading, setLoading] = useState(true);
  // State untuk menandai apakah sedang menyimpan perubahan data
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // useEffect untuk memuat data saat komponen pertama kali dimount atau ID berubah
  useEffect(() => {
    loadProdi();
  }, [id]);

  /**
   * Fungsi untuk memuat data prodi berdasarkan ID dari database
   * Data yang dimuat akan diisi ke dalam form untuk diedit
   */
  const loadProdi = async () => {
    // Validasi: pastikan ID ada
    if (!id) {
      Alert.alert('Error', 'ID tidak valid');
      router.back();
      return;
    }

    try {
      // Ambil data prodi dari database berdasarkan ID
      const prodi = await getProdiById(parseInt(id, 10));
      if (!prodi) {
        Alert.alert('Error', 'Prodi tidak ditemukan');
        router.back();
        return;
      }

      // Isi form dengan data yang sudah ada
      // Menggunakan || '' untuk mengubah null/undefined menjadi string kosong
      setFormData({
        kode_prodi: prodi.kode_prodi,
        nama_prodi: prodi.nama_prodi,
        fakultas: prodi.fakultas,
        akreditasi: prodi.akreditasi || '', // Konversi null/undefined ke string kosong
        deskripsi: prodi.deskripsi || '', // Konversi null/undefined ke string kosong
      });
    } catch (error) {
      console.error('Error loading prodi:', error);
      Alert.alert('Error', 'Gagal memuat data prodi');
      router.back();
    } finally {
      // Set loading menjadi false setelah selesai (baik berhasil maupun gagal)
      setLoading(false);
    }
  };

  /**
   * Fungsi untuk menangani submit form (update data)
   * Melakukan validasi dan memperbarui data prodi di database
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

    // Validasi: pastikan ID masih ada
    if (!id) {
      Alert.alert('Error', 'ID tidak valid');
      return;
    }

    // Set saving menjadi true untuk menampilkan loading indicator
    setSaving(true);
    try {
      // Perbarui data prodi di database berdasarkan ID
      // .trim() digunakan untuk menghapus spasi di awal dan akhir
      // || undefined digunakan untuk mengubah string kosong menjadi undefined (field opsional)
      await updateProdi(parseInt(id, 10), {
        kode_prodi: formData.kode_prodi.trim(),
        nama_prodi: formData.nama_prodi.trim(),
        fakultas: formData.fakultas.trim(),
        akreditasi: formData.akreditasi.trim() || undefined, // Opsional
        deskripsi: formData.deskripsi.trim() || undefined, // Opsional
      });
      // Tampilkan notifikasi sukses dan kembali ke halaman sebelumnya
      Alert.alert('Sukses', 'Data prodi berhasil diperbarui', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating prodi:', error);
      // Handle error khusus untuk kode_prodi yang sudah terdaftar (UNIQUE constraint)
      if (error.message?.includes('UNIQUE constraint')) {
        Alert.alert('Error', 'Kode Prodi sudah terdaftar');
      } else {
        Alert.alert('Error', 'Gagal memperbarui data prodi');
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
          Edit Prodi
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
