import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getFakultasById, updateFakultas } from '@/utils/database';
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
 * Komponen Halaman Edit Fakultas
 * Form untuk mengedit data fakultas yang sudah ada di database
 * Fitur: memuat data existing, input data, validasi form
 * @param id - ID fakultas yang akan diedit (diambil dari route parameter)
 */
export default function EditFakultasScreen() {
  // Ambil ID dari route parameter (dynamic route: /fakultas/[id])
  const { id } = useLocalSearchParams<{ id: string }>();
  // State untuk menyimpan data form fakultas
  const [formData, setFormData] = useState({
    kode_fakultas: '', // Kode fakultas (contoh: FT, FISIP, FKIP) - wajib, unique
    nama_fakultas: '', // Nama lengkap fakultas - wajib
    deskripsi: '', // Deskripsi fakultas (opsional)
  });
  // State untuk menandai apakah sedang memuat data fakultas dari database
  const [loading, setLoading] = useState(true);
  // State untuk menandai apakah sedang menyimpan perubahan data
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // useEffect untuk memuat data saat komponen pertama kali dimount atau ID berubah
  useEffect(() => {
    loadFakultas();
  }, [id]);

  /**
   * Fungsi untuk memuat data fakultas berdasarkan ID dari database
   * Data yang dimuat akan diisi ke dalam form untuk diedit
   */
  const loadFakultas = async () => {
    // Validasi: pastikan ID ada
    if (!id) {
      Alert.alert('Error', 'ID tidak valid');
      router.back();
      return;
    }

    try {
      // Ambil data fakultas dari database berdasarkan ID
      const fakultas = await getFakultasById(parseInt(id, 10));
      if (!fakultas) {
        Alert.alert('Error', 'Fakultas tidak ditemukan');
        router.back();
        return;
      }

      // Isi form dengan data yang sudah ada
      // Menggunakan || '' untuk mengubah null/undefined menjadi string kosong
      setFormData({
        kode_fakultas: fakultas.kode_fakultas || '',
        nama_fakultas: fakultas.nama_fakultas || '',
        deskripsi: fakultas.deskripsi || '', // Konversi null/undefined ke string kosong
      });
    } catch (error) {
      console.error('Error loading fakultas:', error);
      Alert.alert('Error', 'Gagal memuat data fakultas');
      router.back();
    } finally {
      // Set loading menjadi false setelah selesai (baik berhasil maupun gagal)
      setLoading(false);
    }
  };

  /**
   * Fungsi untuk menangani submit form (update data)
   * Melakukan validasi dan memperbarui data fakultas di database
   */
  const handleSubmit = async () => {
    // Validasi: Pastikan semua field wajib terisi
    if (!formData.kode_fakultas.trim()) {
      Alert.alert('Error', 'Kode Fakultas tidak boleh kosong');
      return;
    }
    if (!formData.nama_fakultas.trim()) {
      Alert.alert('Error', 'Nama Fakultas tidak boleh kosong');
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
      // Perbarui data fakultas di database berdasarkan ID
      // .trim() digunakan untuk menghapus spasi di awal dan akhir
      // || undefined digunakan untuk mengubah string kosong menjadi undefined (field opsional)
      await updateFakultas(parseInt(id, 10), {
        kode_fakultas: formData.kode_fakultas.trim(),
        nama_fakultas: formData.nama_fakultas.trim(),
        deskripsi: formData.deskripsi.trim() || undefined, // Opsional
      });
      // Tampilkan notifikasi sukses dan kembali ke halaman sebelumnya
      Alert.alert('Sukses', 'Data fakultas berhasil diperbarui', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating fakultas:', error);
      // Handle error khusus untuk kode_fakultas yang sudah terdaftar (UNIQUE constraint)
      if (error.message?.includes('UNIQUE constraint')) {
        Alert.alert('Error', 'Kode Fakultas sudah terdaftar');
      } else {
        Alert.alert('Error', 'Gagal memperbarui data fakultas');
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
          Edit Fakultas
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* ScrollView untuk form yang bisa di-scroll jika terlalu panjang */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          {/* Input Kode Fakultas */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Kode Fakultas *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Contoh: FT, FISIP, FKIP"
              value={formData.kode_fakultas || ''}
              onChangeText={(text) => setFormData({ ...formData, kode_fakultas: text.toUpperCase() })} // Auto uppercase
              autoCapitalize="characters"
            />
          </View>

          {/* Input Nama Fakultas */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nama Fakultas *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama fakultas"
              value={formData.nama_fakultas || ''}
              onChangeText={(text) => setFormData({ ...formData, nama_fakultas: text })}
            />
          </View>

          {/* Input Deskripsi (opsional, multiline) */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Deskripsi</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Masukkan deskripsi fakultas (opsional)"
              value={formData.deskripsi || ''}
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

