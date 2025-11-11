import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
    deleteMahasiswa,
    getAllMahasiswa,
    initDatabase,
    searchMahasiswa,
    type Mahasiswa,
} from '@/utils/database';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ============================================================
 *  Halaman Manajemen Mahasiswa
 * ============================================================
 *  Berfungsi sebagai daftar lengkap mahasiswa dengan fitur:
 *    - Pencarian
 *    - Tambah data baru
 *    - Edit dan hapus entri
 *    - Pull-to-refresh
 *  Halaman ini memindahkan list lama dari tab utama agar dashboard
 *  tetap ringkas namun akses CRUD lengkap tetap tersedia.
 * ============================================================
 */
export default function MahasiswaListScreen() {
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    initializeAndLoadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      loadMahasiswa();
    } else {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  const initializeAndLoadData = async () => {
    try {
      await initDatabase();
      await loadMahasiswa();
    } catch (error) {
      console.error('Error initializing:', error);
      Alert.alert('Error', 'Gagal memuat database');
    } finally {
      setLoading(false);
    }
  };

  const loadMahasiswa = async () => {
    try {
      const data = await getAllMahasiswa();
      setMahasiswaList(data);
    } catch (error) {
      console.error('Error loading mahasiswa:', error);
      Alert.alert('Error', 'Gagal memuat data mahasiswa');
    }
  };

  const handleSearch = async (keyword: string) => {
    if (keyword.trim() === '') {
      loadMahasiswa();
      return;
    }
    try {
      const results = await searchMahasiswa(keyword);
      setMahasiswaList(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleDelete = (id: number, nama: string) => {
    Alert.alert('Hapus Mahasiswa', `Apakah Anda yakin ingin menghapus ${nama}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMahasiswa(id);
            await loadMahasiswa();
            Alert.alert('Sukses', 'Mahasiswa berhasil dihapus');
          } catch (error) {
            console.error('Error deleting:', error);
            Alert.alert('Error', 'Gagal menghapus mahasiswa');
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMahasiswa();
    setRefreshing(false);
  };

  const renderMahasiswaItem = ({ item }: { item: Mahasiswa }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <ThemedText type="defaultSemiBold" style={styles.nama}>
            {item.nama}
          </ThemedText>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => {
                if (item.id) {
                  router.push(`/mahasiswa/${item.id}` as any);
                }
              }}
              style={[styles.iconButton, styles.editButton]}>
              <Ionicons name="create-outline" size={20} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (item.id) {
                  handleDelete(item.id, item.nama);
                }
              }}
              style={[styles.iconButton, styles.deleteButton]}>
              <Ionicons name="trash-outline" size={20} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardDetail}>
          <View style={styles.detailRow}>
            <Ionicons name="id-card-outline" size={16} color="#666" />
            <ThemedText style={styles.detailText}>NIM: {item.nim}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="school-outline" size={16} color="#666" />
            <ThemedText style={styles.detailText}>{item.jurusan}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={16} color="#666" />
            <ThemedText style={styles.detailText}>
              {item.fakultas ? `Fakultas ${item.fakultas}` : 'Fakultas belum diisi'}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <ThemedText style={styles.detailText}>Semester {item.semester}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <ThemedText style={styles.detailText}>{item.email}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <ThemedText style={styles.loadingText}>Memuat data...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Kelola Data Mahasiswa
        </ThemedText>
        <TouchableOpacity
          onPress={() => router.push('/mahasiswa/add' as any)}
          style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <ThemedText style={styles.addButtonText}>Tambah</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari mahasiswa..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {mahasiswaList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyText}>
            {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada data mahasiswa'}
          </ThemedText>
          {!searchQuery && (
            <TouchableOpacity
              onPress={() => router.push('/mahasiswa/add' as any)}
              style={styles.emptyAddButton}>
              <ThemedText style={styles.emptyAddButtonText}>Tambah Mahasiswa Pertama</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={mahasiswaList}
          renderItem={renderMahasiswaItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 32 + insets.bottom + tabBarHeight },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nama: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
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

