import { addUser, authenticateUser, getUserByEmail, initDatabase, type User } from '@/utils/database';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

/**
 * ============================================================
 *  AuthContext
 * ============================================================
 *  Menyediakan status autentikasi global untuk aplikasi.
 *  Fitur utama:
 *    - Menyimpan sesi user secara aman menggunakan SecureStore
 *    - Menyediakan helper login/register/logout
 *    - Menginisialisasi database sebelum mengambil sesi
 *  Komponen lain cukup memakai `useAuth()` untuk mengakses state ini.
 * ============================================================
 */

type AuthContextValue = {
  user: User | null; // Data user aktif (null jika belum login)
  initializing: boolean; // Menandakan proses pemulihan sesi masih berjalan
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: { name: string; email: string; password: string }) => Promise<{
    success: boolean;
    message?: string;
  }>;
  logout: () => Promise<void>;
};

const SESSION_KEY = 'belajar_db_session_user';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  /**
   * ------------------------------------------------------------
   *  Pemulihan Sesi Awal
   * ------------------------------------------------------------
   *  - Pastikan database terinisialisasi
   *  - Ambil user yang tersimpan di SecureStore (jika ada)
   *  - Tandai `initializing` selesai agar UI bisa lanjut
   */
  useEffect(() => {
    const loadSession = async () => {
      try {
        await initDatabase();
        const storedUser = await SecureStore.getItemAsync(SESSION_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading session user:', error);
      } finally {
        setInitializing(false);
      }
    };

    loadSession();
  }, []);

  /**
   * Menyimpan/menghapus user ke SecureStore untuk sesi berkelanjutan.
   */
  const persistUser = useCallback(async (sessionUser: User | null) => {
    if (sessionUser) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionUser));
    } else {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    }
  }, []);

  /**
   * Login: validasi kredensial dan simpan sesi jika berhasil.
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const authenticated = await authenticateUser(email, password);
        if (!authenticated) {
          return { success: false, message: 'Email atau password salah' };
        }
        setUser(authenticated);
        await persistUser(authenticated);
        return { success: true };
      } catch (error) {
        console.error('Error during login:', error);
        return { success: false, message: 'Terjadi kesalahan saat login' };
      }
    },
    [persistUser]
  );

  /**
   * Register: pastikan email belum dipakai, lalu simpan user baru.
   */
  const register = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      try {
        const existing = await getUserByEmail(email);
        if (existing) {
          return { success: false, message: 'Email sudah terdaftar, gunakan email lain' };
        }
        await addUser({ name, email, password });
        return { success: true };
      } catch (error) {
        console.error('Error during register:', error);
        return { success: false, message: 'Terjadi kesalahan saat registrasi' };
      }
    },
    []
  );

  /**
   * Logout: hapus user dari context dan storage.
   */
  const logout = useCallback(async () => {
    try {
      setUser(null);
      await persistUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [persistUser]);

  const value = useMemo(
    () => ({
      user,
      initializing,
      login,
      register,
      logout,
    }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

