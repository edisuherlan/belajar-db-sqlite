import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { deleteProdi, getAllProdi, initDatabase, searchProdi, type Prodi } from '@/utils/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

/**
 * Komponen Halaman Daftar Prodi
 * Menampilkan daftar semua program studi yang tersimpan di database
 * Fitur: tampil data, pencarian, tambah, edit, hapus, dan pull-to-refresh
 */
export default function ProdiScreen() {
  // State untuk menyimpan daftar prodi
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  // State untuk menyimpan keyword pencarian
  const [searchQuery, setSearchQuery] = useState('');
  // State untuk menandai apakah data sedang dimuat (saat pertama kali buka halaman)
  const [loading, setLoading] = useState(true);
  // State untuk menandai apakah sedang melakukan refresh (pull-to-refresh)
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // useEffect untuk menjalankan fungsi initialization saat komponen pertama kali dimount
  useEffect(() => {
    initializeAndLoadData();
  }, []);

  // useEffect untuk melakukan pencarian otomatis ketika searchQuery berubah
  useEffect(() => {
    // Jika searchQuery kosong, tampilkan semua data
    // Jika tidak kosong, lakukan pencarian
    if (searchQuery.trim() === '') {
      loadProdi();
    } else {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  /**
   * Fungsi untuk menginisialisasi database dan memuat data prodi
   * Dipanggil saat halaman pertama kali dibuka
   */
  const initializeAndLoadData = async () => {
    try {
      // Pastikan database sudah ter-initialize
      await initDatabase();
      // Muat data prodi dari database
      await loadProdi();
    } catch (error) {
      console.error('Error initializing:', error);
      Alert.alert('Error', 'Gagal memuat database');
    } finally {
      // Set loading menjadi false setelah selesai (baik berhasil maupun gagal)
      setLoading(false);
    }
  };

  /**
   * Fungsi untuk memuat semua data prodi dari database
   */
  const loadProdi = async () => {
    try {
      // Ambil semua data prodi dari database
      const data = await getAllProdi();
      // Update state dengan data yang diperoleh
      setProdiList(data);
    } catch (error) {
      console.error('Error loading prodi:', error);
      Alert.alert('Error', 'Gagal memuat data prodi');
    }
  };

  /**
   * Fungsi untuk melakukan pencarian prodi berdasarkan keyword
   * @param keyword - Kata kunci untuk pencarian
   */
  const handleSearch = async (keyword: string) => {
    // Jika keyword kosong, tampilkan semua data
    if (keyword.trim() === '') {
      loadProdi();
      return;
    }
    try {
      // Lakukan pencarian di database berdasarkan keyword
      const results = await searchProdi(keyword);
      // Update state dengan hasil pencarian
      setProdiList(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  /**
   * Fungsi untuk menghapus data prodi
   * Menampilkan konfirmasi sebelum menghapus
   * @param id - ID prodi yang ingin dihapus
   * @param namaProdi - Nama prodi (untuk ditampilkan di konfirmasi)
   */
  const handleDelete = (id: number, namaProdi: string) => {
    // Tampilkan dialog konfirmasi sebelum menghapus
    Alert.alert(
      'Hapus Prodi',
      `Apakah Anda yakin ingin menghapus ${namaProdi}?`,
      [
        { text: 'Batal', style: 'cancel' }, // Tombol batal
        {
          text: 'Hapus',
          style: 'destructive', // Tombol hapus dengan style destructive (merah)
          onPress: async () => {
            try {
              // Hapus data dari database
              await deleteProdi(id);
              // Muat ulang data setelah berhasil menghapus
              await loadProdi();
              // Tampilkan notifikasi sukses
              Alert.alert('Sukses', 'Prodi berhasil dihapus');
            } catch (error) {
              console.error('Error deleting:', error);
              Alert.alert('Error', 'Gagal menghapus prodi');
            }
          },
        },
      ]
    );
  };

  /**
   * Fungsi untuk refresh data (pull-to-refresh)
   * Dipanggil ketika user melakukan gesture pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing menjadi true untuk menampilkan indicator
    await loadProdi(); // Muat ulang data dari database
    setRefreshing(false); // Set refreshing menjadi false setelah selesai
  };

  /**
   * Komponen untuk render setiap item prodi di dalam FlatList
   * @param item - Data prodi yang akan dirender
   */
  const renderProdiItem = ({ item }: { item: Prodi }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {/* Header card: nama prodi, kode prodi, dan tombol aksi */}
        <View style={styles.cardHeader}>
          <View style={styles.titleSection}>
            <ThemedText type="defaultSemiBold" style={styles.namaProdi}>
              {item.nama_prodi}
            </ThemedText>
            <ThemedText style={styles.kodeProdi}>{item.kode_prodi}</ThemedText>
          </View>
          {/* Tombol edit dan hapus */}
          <View style={styles.actionButtons}>
            {/* Tombol edit: navigasi ke halaman edit */}
            <TouchableOpacity
              onPress={() => {
                if (item.id) {
                  router.push(`/prodi/${item.id}` as any);
                }
              }}
              style={[styles.iconButton, styles.editButton]}>
              <Ionicons name="create-outline" size={20} color="#4A90E2" />
            </TouchableOpacity>
            {/* Tombol hapus: tampilkan konfirmasi dan hapus data */}
            <TouchableOpacity
              onPress={() => {
                if (item.id) {
                  handleDelete(item.id, item.nama_prodi);
                }
              }}
              style={[styles.iconButton, styles.deleteButton]}>
              <Ionicons name="trash-outline" size={20} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Detail card: informasi lengkap prodi */}
        <View style={styles.cardDetail}>
          {/* Baris detail: Fakultas */}
          <View style={styles.detailRow}>
            <Ionicons name="school-outline" size={16} color="#666" />
            <ThemedText style={styles.detailText}>{item.fakultas}</ThemedText>
          </View>
          {/* Baris detail: Akreditasi (opsional, hanya tampil jika ada) */}
          {item.akreditasi && (
            <View style={styles.detailRow}>
              <Ionicons name="star-outline" size={16} color="#666" />
              <ThemedText style={styles.detailText}>Akreditasi: {item.akreditasi}</ThemedText>
            </View>
          )}
          {/* Baris detail: Deskripsi (opsional, hanya tampil jika ada) */}
          {item.deskripsi && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <ThemedText style={styles.detailText} numberOfLines={2}>
                {item.deskripsi}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // Tampilkan loading indicator saat data sedang dimuat pertama kali
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
      {/* Header halaman: judul dan tombol tambah */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Data Prodi
        </ThemedText>
        {/* Tombol untuk navigasi ke halaman tambah prodi */}
        <TouchableOpacity
          onPress={() => router.push('/prodi/add' as any)}
          style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <ThemedText style={styles.addButtonText}>Tambah</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Container untuk search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        {/* Input untuk pencarian */}
        <TextInput
          style={styles.searchInput}
          placeholder="Cari prodi..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery} // Update searchQuery setiap kali user mengetik
        />
        {/* Tombol untuk clear search (hanya tampil jika ada text di search) */}
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tampilkan empty state jika tidak ada data */}
      {prodiList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="school-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyText}>
            {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data prodi'}
          </ThemedText>
          {/* Tombol tambah prodi pertama (hanya tampil jika tidak ada pencarian) */}
          {!searchQuery && (
            <TouchableOpacity
              onPress={() => router.push('/prodi/add' as any)}
              style={styles.emptyAddButton}>
              <ThemedText style={styles.emptyAddButtonText}>Tambah Prodi Pertama</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* FlatList untuk menampilkan daftar prodi */
        <FlatList
          data={prodiList} // Data yang akan ditampilkan
          renderItem={renderProdiItem} // Fungsi untuk render setiap item
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()} // Key unik untuk setiap item
          contentContainerStyle={styles.listContent} // Style untuk container list
          refreshControl={
            // RefreshControl untuk pull-to-refresh functionality
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </ThemedView>
  );
}

// Stylesheet untuk styling komponen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Padding atas untuk status bar
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow untuk Android
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  namaProdi: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  kodeProdi: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#E3F2FD', // Background biru muda untuk tombol edit
  },
  deleteButton: {
    backgroundColor: '#FFEBEE', // Background merah muda untuk tombol hapus
  },
  cardDetail: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
