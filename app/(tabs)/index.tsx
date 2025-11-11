import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
    getAllFakultas,
    getAllMahasiswa,
    getAllProdi,
    getRecentMahasiswa,
    type Mahasiswa,
} from '@/utils/database';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ============================================================
 *  Dashboard Mahasiswa (Halaman Utama)
 * ============================================================
 *  Memberikan ringkasan singkat mengenai data akademik:
 *    - Statistik jumlah entitas
 *    - Insight semester
 *    - Pintasan aksi dan daftar mahasiswa terbaru
 *  Tujuan utamanya adalah membantu pengguna memahami keadaan
 *  database secara cepat dan melakukan aksi penting dengan mudah.
 * ============================================================
 */

type DashboardStats = {
  totalMahasiswa: number;
  totalProdi: number;
  totalFakultas: number;
  avgSemester: number;
  highestSemester: number;
  lowestSemester: number;
  lastCreatedAt: string | null;
};

const initialStats: DashboardStats = {
  totalMahasiswa: 0,
  totalProdi: 0,
  totalFakultas: 0,
  avgSemester: 0,
  highestSemester: 0,
  lowestSemester: 0,
  lastCreatedAt: null,
};

const getGreetingMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
};

const formatSemesterAverage = (value: number, hasData: boolean) => {
  if (!hasData) {
    return '-';
  }
  return value.toFixed(1).replace('.', ',');
};

const formatTimestamp = (value: string | null) => {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
};

export default function DashboardMahasiswaScreen() {
  // ------------------------------------------------------------
  // STATE MANAGEMENT
  // ------------------------------------------------------------
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [recentMahasiswa, setRecentMahasiswa] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();

  // ------------------------------------------------------------
  // DATA FETCHING
  // ------------------------------------------------------------
  const loadDashboardData = useCallback(
    async (options?: { silent?: boolean }) => {
      const isSilent = options?.silent;
      if (isSilent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [mahasiswaList, prodiList, fakultasList, recentList] = await Promise.all([
          getAllMahasiswa(),
          getAllProdi(),
          getAllFakultas(),
          getRecentMahasiswa(5),
        ]);

        const semesterValues = mahasiswaList
          .map((item) => item.semester)
          .filter((value) => typeof value === 'number' && !Number.isNaN(value));

        const totalSemester = semesterValues.reduce((sum, value) => sum + value, 0);
        const avgSemester =
          semesterValues.length > 0 ? totalSemester / semesterValues.length : 0;
        const highestSemester =
          semesterValues.length > 0 ? Math.max(...semesterValues) : 0;
        const lowestSemester =
          semesterValues.length > 0 ? Math.min(...semesterValues) : 0;

        setStats({
          totalMahasiswa: mahasiswaList.length,
          totalProdi: prodiList.length,
          totalFakultas: fakultasList.length,
          avgSemester,
          highestSemester,
          lowestSemester,
          lastCreatedAt: recentList[0]?.created_at ?? null,
        });

        setRecentMahasiswa(recentList);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        Alert.alert('Error', 'Gagal memuat data dashboard');
      } finally {
        if (isSilent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    loadDashboardData({ silent: true });
  };

  // ------------------------------------------------------------
  // DERIVED DATA
  // ------------------------------------------------------------
  const statsCards = useMemo(
    () => [
      {
        key: 'mahasiswa',
        title: 'Total Mahasiswa',
        value: stats.totalMahasiswa.toString(),
        icon: 'people',
        accent: '#4A90E2',
      },
      {
        key: 'prodi',
        title: 'Total Prodi',
        value: stats.totalProdi.toString(),
        icon: 'library',
        accent: '#6C5CE7',
      },
      {
        key: 'fakultas',
        title: 'Total Fakultas',
        value: stats.totalFakultas.toString(),
        icon: 'school',
        accent: '#00B894',
      },
    ],
    [stats.totalMahasiswa, stats.totalProdi, stats.totalFakultas]
  );

  const hasSemesterData = stats.totalMahasiswa > 0 && stats.highestSemester > 0;

  const semesterInsights = useMemo(
    () => [
      {
        key: 'avg',
        label: 'Rata-rata Semester',
        value: formatSemesterAverage(stats.avgSemester, hasSemesterData),
      },
      {
        key: 'max',
        label: 'Semester Tertinggi',
        value: hasSemesterData ? stats.highestSemester : '-',
      },
      {
        key: 'min',
        label: 'Semester Terendah',
        value: hasSemesterData ? stats.lowestSemester : '-',
      },
    ],
    [hasSemesterData, stats.avgSemester, stats.highestSemester, stats.lowestSemester]
  );

  const quickActions = useMemo(
    () => [
      {
        key: 'addMahasiswa',
        label: 'Tambah Mahasiswa',
        icon: 'person-add',
        action: () => router.push('/mahasiswa/add' as any),
      },
      {
        key: 'manageMahasiswa',
        label: 'Kelola Mahasiswa',
        icon: 'list-circle',
        action: () => router.push('/mahasiswa' as any),
      },
      {
        key: 'addProdi',
        label: 'Tambah Prodi',
        icon: 'library-outline',
        action: () => router.push('/prodi/add' as any),
      },
      {
        key: 'addFakultas',
        label: 'Tambah Fakultas',
        icon: 'school-outline',
        action: () => router.push('/fakultas/add' as any),
      },
    ],
    [router]
  );

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <ThemedText style={styles.loadingText}>Menyiapkan dashboard...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 32 + insets.bottom + tabBarHeight },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* --------------------------------------------------------
            HEADER
            -------------------------------------------------------- */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="title" style={styles.greeting}>
              {getGreetingMessage()} 👋
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Pantau ringkasan data akademik Anda di sini.
            </ThemedText>
          </View>
          <View style={styles.headerIconContainer}>
            <Ionicons name="analytics" size={28} color="#4A90E2" />
          </View>
        </View>

        {/* --------------------------------------------------------
            STATISTIC CARDS
            -------------------------------------------------------- */}
        <View style={styles.statsGrid}>
          {statsCards.map((card) => (
            <View key={card.key} style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: `${card.accent}20` }]}>
                <Ionicons name={card.icon as any} size={20} color={card.accent} />
              </View>
              <ThemedText style={styles.statLabel}>{card.title}</ThemedText>
              <ThemedText type="title" style={styles.statValue}>
                {card.value}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* --------------------------------------------------------
            SEMESTER INSIGHTS
            -------------------------------------------------------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Insight Semester
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Data dari {stats.totalMahasiswa} mahasiswa aktif
            </ThemedText>
          </View>
          <View style={styles.insightsRow}>
            {semesterInsights.map((item) => (
              <View key={item.key} style={styles.insightCard}>
                <ThemedText style={styles.insightLabel}>{item.label}</ThemedText>
                <ThemedText style={styles.insightValue}>{item.value}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* --------------------------------------------------------
            QUICK ACTIONS
            -------------------------------------------------------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Aksi Cepat
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Kelola data dengan pintasan berikut
            </ThemedText>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={[
                  styles.quickActionButton,
                  width >= 768
                    ? styles.quickActionButtonWide
                    : styles.quickActionButtonDefault,
                ]}
                onPress={action.action}>
                <View style={styles.quickActionLeft}>
                  <View style={styles.quickActionIcon}>
                    <Ionicons name={action.icon as any} size={20} color="#4A90E2" />
                  </View>
                  <ThemedText style={styles.quickActionLabel}>{action.label}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#4A90E2" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --------------------------------------------------------
            RECENT STUDENTS
            -------------------------------------------------------- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Mahasiswa Terbaru
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Terakhir diperbarui: {formatTimestamp(stats.lastCreatedAt)}
            </ThemedText>
          </View>

          {recentMahasiswa.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Ionicons name="alert-circle-outline" size={28} color="#999" />
              <ThemedText style={styles.emptyStateTitle}>
                Belum ada data mahasiswa
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtitle}>
                Tambahkan mahasiswa pertama Anda melalui tombol aksi cepat.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recentMahasiswa.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentItem}
                  onPress={() => {
                    if (item.id) {
                      router.push(`/mahasiswa/${item.id}` as any);
                    }
                  }}>
                  <View style={styles.recentLeft}>
                    <View style={styles.recentAvatar}>
                      <Ionicons name="person-circle" size={36} color="#4A90E2" />
                    </View>
                    <View style={styles.recentInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.recentName}>
                        {item.nama}
                      </ThemedText>
                      <ThemedText style={styles.recentSubtext}>
                        {item.jurusan} • Semester {item.semester}
                      </ThemedText>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// ------------------------------------------------------------
// STYLES
// ------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 24,
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
    backgroundColor: '#E9F2FF',
    padding: 20,
    borderRadius: 16,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  greeting: {
    fontSize: 22,
  },
  subtitle: {
    color: '#4A5568',
    fontSize: 14,
  },
  headerIconContainer: {
    backgroundColor: '#FFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexBasis: '48%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  insightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  insightLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  quickActionsGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#E9F2FF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D6E4FF',
  },
  quickActionButtonDefault: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  quickActionButtonWide: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  quickActionLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0ECFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 15,
    marginBottom: 2,
  },
  recentSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyStateCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});

