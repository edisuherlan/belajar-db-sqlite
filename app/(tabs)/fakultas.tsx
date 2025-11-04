import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { deleteFakultas, getAllFakultas, initDatabase, searchFakultas, type Fakultas } from '@/utils/database';
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
 * Komponen Halaman Daftar Fakultas
 * Menampilkan daftar semua fakultas yang tersimpan di database
 * Fitur: tampil data, pencarian, tambah, edit, hapus, dan pull-to-refresh
 */
export default function FakultasScreen() {
  // State untuk menyimpan daftar fakultas
  const [fakultasList, setFakultasList] = useState<Fakultas[]>([]);
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
      loadFakultas();
    } else {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  /**
   * Fungsi untuk menginisialisasi database dan memuat data fakultas
   * Dipanggil saat halaman pertama kali dibuka
   */
  const initializeAndLoadData = async () => {
    try {
      // Pastikan database sudah ter-initialize
      await initDatabase();
      // Muat data fakultas dari database
      await loadFakultas();
    } catch (error) {
      console.error('Error initializing:', error);
      Alert.alert('Error', 'Gagal memuat database');
    } finally {
      // Set loading menjadi false setelah selesai (baik berhasil maupun gagal)
      setLoading(false);
    }
  };

  /**
   * Fungsi untuk memuat semua data fakultas dari database
   */
  const loadFakultas = async () => {
    try {
      // Ambil semua data fakultas dari database
      const data = await getAllFakultas();
      // Update state dengan data yang diperoleh
      setFakultasList(data);
    } catch (error) {
      console.error('Error loading fakultas:', error);
      Alert.alert('Error', 'Gagal memuat data fakultas');
    }
  };

  /**
   * Fungsi untuk melakukan pencarian fakultas berdasarkan keyword
   * @param keyword - Kata kunci untuk pencarian
   */
  const handleSearch = async (keyword: string) => {
    // Jika keyword kosong, tampilkan semua data
    if (keyword.trim() === '') {
      loadFakultas();
      return;
    }
    try {
      // Lakukan pencarian di database berdasarkan keyword
      const results = await searchFakultas(keyword);
      // Update state dengan hasil pencarian
      setFakultasList(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  /**
   * Fungsi untuk menghapus data fakultas
   * Menampilkan konfirmasi sebelum menghapus
   * @param id - ID fakultas yang ingin dihapus
   * @param namaFakultas - Nama fakultas (untuk ditampilkan di konfirmasi)
   */
  const handleDelete = (id: number, namaFakultas: string) => {
    // Tampilkan dialog konfirmasi sebelum menghapus
    Alert.alert(
      'Hapus Fakultas',
      `Apakah Anda yakin ingin menghapus ${namaFakultas}?`,
      [
        { text: 'Batal', style: 'cancel' }, // Tombol batal
        {
          text: 'Hapus',
          style: 'destructive', // Tombol hapus dengan style destructive (merah)
          onPress: async () => {
            try {
              // Hapus data dari database
              await deleteFakultas(id);
              // Muat ulang data setelah berhasil menghapus
              await loadFakultas();
              // Tampilkan notifikasi sukses
              Alert.alert('Sukses', 'Fakultas berhasil dihapus');
            } catch (error) {
              console.error('Error deleting:', error);
              Alert.alert('Error', 'Gagal menghapus fakultas');
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
    await loadFakultas(); // Muat ulang data dari database
    setRefreshing(false); // Set refreshing menjadi false setelah selesai
  };

  /**
   * Komponen untuk render setiap item fakultas di dalam FlatList
   * @param item - Data fakultas yang akan dirender
   */
  const renderFakultasItem = ({ item }: { item: Fakultas }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {/* Header card: nama fakultas, kode fakultas, dan tombol aksi */}
        <View style={styles.cardHeader}>
          <View style={styles.titleSection}>
            <ThemedText type="defaultSemiBold" style={styles.namaFakultas}>
              {item.nama_fakultas || ''}
            </ThemedText>
            <ThemedText style={styles.kodeFakultas}>{item.kode_fakultas || ''}</ThemedText>
          </View>
          {/* Tombol edit dan hapus */}
          <View style={styles.actionButtons}>
            {/* Tombol edit: navigasi ke halaman edit */}
            <TouchableOpacity
              onPress={() => {
                if (item.id) {
                  router.push(`/fakultas/${item.id}` as any);
                }
              }}
              style={[styles.iconButton, styles.editButton]}>
              <Ionicons name="create-outline" size={20} color="#4A90E2" />
            </TouchableOpacity>
            {/* Tombol hapus: tampilkan konfirmasi dan hapus data */}
            <TouchableOpacity
              onPress={() => {
                if (item.id) {
                  handleDelete(item.id, item.nama_fakultas);
                }
              }}
              style={[styles.iconButton, styles.deleteButton]}>
              <Ionicons name="trash-outline" size={20} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Detail card: informasi lengkap fakultas */}
        {item.deskripsi && (
          <View style={styles.cardDetail}>
            {/* Baris detail: Deskripsi (opsional, hanya tampil jika ada) */}
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <ThemedText style={styles.detailText} numberOfLines={2}>
                {item.deskripsi || ''}
              </ThemedText>
            </View>
          </View>
        )}
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
          Data Fakultas
        </ThemedText>
        {/* Tombol untuk navigasi ke halaman tambah fakultas */}
        <TouchableOpacity
          onPress={() => router.push('/fakultas/add' as any)}
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
          placeholder="Cari fakultas..."
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
      {fakultasList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="school-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyText}>
            {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data fakultas'}
          </ThemedText>
          {/* Tombol tambah fakultas pertama (hanya tampil jika tidak ada pencarian) */}
          {!searchQuery && (
            <TouchableOpacity
              onPress={() => router.push('/fakultas/add' as any)}
              style={styles.emptyAddButton}>
              <ThemedText style={styles.emptyAddButtonText}>Tambah Fakultas Pertama</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* FlatList untuk menampilkan daftar fakultas */
        <FlatList
          data={fakultasList} // Data yang akan ditampilkan
          renderItem={renderFakultasItem} // Fungsi untuk render setiap item
          keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())} // Key unik untuk setiap item
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
  namaFakultas: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  kodeFakultas: {
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

