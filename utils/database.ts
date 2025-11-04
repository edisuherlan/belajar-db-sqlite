import * as SQLite from 'expo-sqlite';

/**
 * Interface untuk data Mahasiswa
 * Mendefinisikan struktur data mahasiswa yang akan disimpan di database
 */
export interface Mahasiswa {
  id?: number; // ID unik mahasiswa (auto-increment, opsional saat membuat data baru)
  nim: string; // Nomor Induk Mahasiswa (harus unik)
  nama: string; // Nama lengkap mahasiswa
  jurusan: string; // Jurusan/program studi mahasiswa
  semester: number; // Semester yang sedang ditempuh (1-14)
  email: string; // Email mahasiswa
}

/**
 * Interface untuk data Prodi (Program Studi)
 * Mendefinisikan struktur data program studi yang akan disimpan di database
 */
export interface Prodi {
  id?: number; // ID unik prodi (auto-increment, opsional saat membuat data baru)
  kode_prodi: string; // Kode program studi (harus unik, contoh: TI, SI, MI)
  nama_prodi: string; // Nama lengkap program studi
  fakultas: string; // Nama fakultas
  akreditasi?: string; // Status akreditasi (opsional, contoh: A, B, C, Unggul)
  deskripsi?: string; // Deskripsi program studi (opsional)
}

/**
 * Interface untuk data Fakultas
 * Mendefinisikan struktur data fakultas yang akan disimpan di database
 */
export interface Fakultas {
  id?: number; // ID unik fakultas (auto-increment, opsional saat membuat data baru)
  kode_fakultas: string; // Kode fakultas (harus unik, contoh: FT, FISIP, FKIP)
  nama_fakultas: string; // Nama lengkap fakultas
  deskripsi?: string; // Deskripsi fakultas (opsional)
}

// Variabel global untuk menyimpan instance database
let db: SQLite.SQLiteDatabase | null = null;
// Promise untuk mencegah multiple initialization bersamaan (race condition)
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Fungsi untuk menginisialisasi database
 * Membuat koneksi ke database SQLite dan membuat tabel jika belum ada
 * @returns Promise<SQLite.SQLiteDatabase> - Instance database yang sudah ter-initialize
 */
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  // Jika sudah ada proses initialization yang sedang berjalan, tunggu sampai selesai
  // Ini mencegah race condition jika initDatabase dipanggil beberapa kali bersamaan
  if (initPromise) {
    console.log('Database initialization already in progress, waiting...');
    return await initPromise;
  }

  // Jika database sudah ter-initialize sebelumnya, langsung kembalikan instance yang ada
  // Ini menghindari proses initialization yang tidak perlu
  if (db) {
    console.log('Database already initialized');
    return db;
  }

  // Mulai proses initialization dalam bentuk promise
  initPromise = (async () => {
    let database: SQLite.SQLiteDatabase | null = null;
    try {
      // Buka koneksi ke database SQLite
      // Nama file database: mahasiswa.db
      console.log('Opening database...');
      database = await SQLite.openDatabaseAsync('mahasiswa.db');
      console.log('Database opened successfully');
      
      // Validasi: pastikan database object tidak null
      if (!database) {
        throw new Error('Failed to open database: database object is null');
      }

      // Buat tabel mahasiswa jika belum ada
      // Menggunakan IF NOT EXISTS agar tidak error jika tabel sudah ada
      console.log('Creating mahasiswa table...');
      const mahasiswaTableSQL = `CREATE TABLE IF NOT EXISTS mahasiswa (
        id INTEGER PRIMARY KEY AUTOINCREMENT, -- ID auto-increment
        nim TEXT UNIQUE NOT NULL, -- NIM harus unik dan tidak boleh kosong
        nama TEXT NOT NULL, -- Nama tidak boleh kosong
        jurusan TEXT NOT NULL, -- Jurusan tidak boleh kosong
        semester INTEGER NOT NULL, -- Semester harus berupa angka
        email TEXT NOT NULL, -- Email tidak boleh kosong
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Timestamp otomatis saat data dibuat
      )`;
      await database.execAsync(mahasiswaTableSQL);
      console.log('Mahasiswa table created');
      
      // Buat tabel prodi jika belum ada
      console.log('Creating prodi table...');
      const prodiTableSQL = `CREATE TABLE IF NOT EXISTS prodi (
        id INTEGER PRIMARY KEY AUTOINCREMENT, -- ID auto-increment
        kode_prodi TEXT UNIQUE NOT NULL, -- Kode prodi harus unik dan tidak boleh kosong
        nama_prodi TEXT NOT NULL, -- Nama prodi tidak boleh kosong
        fakultas TEXT NOT NULL, -- Fakultas tidak boleh kosong
        akreditasi TEXT, -- Akreditasi opsional (boleh null)
        deskripsi TEXT, -- Deskripsi opsional (boleh null)
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Timestamp otomatis saat data dibuat
      )`;
      await database.execAsync(prodiTableSQL);
      console.log('Prodi table created');
      
      // Buat tabel fakultas jika belum ada
      console.log('Creating fakultas table...');
      const fakultasTableSQL = `CREATE TABLE IF NOT EXISTS fakultas (
        id INTEGER PRIMARY KEY AUTOINCREMENT, -- ID auto-increment
        kode_fakultas TEXT UNIQUE NOT NULL, -- Kode fakultas harus unik dan tidak boleh kosong
        nama_fakultas TEXT NOT NULL, -- Nama fakultas tidak boleh kosong
        deskripsi TEXT, -- Deskripsi opsional (boleh null)
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Timestamp otomatis saat data dibuat
      )`;
      await database.execAsync(fakultasTableSQL);
      console.log('Fakultas table created');
      
      // Simpan instance database ke variabel global
      db = database;
      console.log('Database initialized successfully');
      return db;
    } catch (error: any) {
      // Jika terjadi error, log detail error untuk debugging
      console.error('Error initializing database:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Reset promise dan db jika gagal, agar bisa dicoba lagi
      initPromise = null;
      db = null;
      
      // Coba tutup database jika sudah terbuka (cleanup)
      if (database) {
        try {
          await database.closeAsync();
          console.log('Database closed after error');
        } catch (closeError) {
          console.error('Error closing database:', closeError);
        }
      }
      
      // Throw error dengan pesan yang informatif
      const errorMsg = error?.message || String(error);
      throw new Error(`Database initialization failed: ${errorMsg}`);
    }
  })();

  return await initPromise;
};

/**
 * Fungsi untuk mendapatkan instance database
 * Jika database belum ter-initialize, akan memanggil initDatabase terlebih dahulu
 * @returns Promise<SQLite.SQLiteDatabase> - Instance database
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  // Jika database belum ter-initialize, inisialisasi sekarang
  if (!db) {
    console.log('Database not initialized, initializing now...');
    const database = await initDatabase();
    // Validasi: pastikan database tidak null setelah initialization
    if (!database) {
      throw new Error('Failed to get database: database object is null after initialization');
    }
    return database;
  }
  
  // Double check: pastikan db tidak null (untuk type safety)
  if (!db) {
    throw new Error('Failed to get database: database object is null');
  }
  
  return db;
};

// ==================== CRUD MAHASISWA ====================

/**
 * CREATE - Fungsi untuk menambahkan data mahasiswa baru
 * @param mahasiswa - Data mahasiswa tanpa ID (ID akan auto-generate)
 * @returns Promise<number> - ID mahasiswa yang baru saja dibuat
 */
export const addMahasiswa = async (mahasiswa: Omit<Mahasiswa, 'id'>): Promise<number> => {
  try {
    // Dapatkan instance database
    const database = await getDatabase();
    // Eksekusi query INSERT dengan prepared statement untuk mencegah SQL injection
    const result = await database.runAsync(
      `INSERT INTO mahasiswa (nim, nama, jurusan, semester, email) 
       VALUES (?, ?, ?, ?, ?)`,
      [mahasiswa.nim, mahasiswa.nama, mahasiswa.jurusan, mahasiswa.semester, mahasiswa.email]
    );
    // Kembalikan ID yang baru saja dibuat
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding mahasiswa:', error);
    throw error;
  }
};

/**
 * READ - Fungsi untuk mengambil semua data mahasiswa
 * Data diurutkan berdasarkan nama secara ascending (A-Z)
 * @returns Promise<Mahasiswa[]> - Array berisi semua data mahasiswa
 */
export const getAllMahasiswa = async (): Promise<Mahasiswa[]> => {
  try {
    const database = await getDatabase();
    // Query SELECT untuk mengambil semua data, diurutkan berdasarkan nama
    const result = await database.getAllAsync<Mahasiswa>(
      `SELECT * FROM mahasiswa ORDER BY nama ASC`
    );
    return result;
  } catch (error) {
    console.error('Error getting all mahasiswa:', error);
    throw error;
  }
};

/**
 * READ - Fungsi untuk mengambil data mahasiswa berdasarkan ID
 * @param id - ID mahasiswa yang ingin diambil
 * @returns Promise<Mahasiswa | null> - Data mahasiswa atau null jika tidak ditemukan
 */
export const getMahasiswaById = async (id: number): Promise<Mahasiswa | null> => {
  try {
    const database = await getDatabase();
    // Query SELECT dengan WHERE clause untuk mencari berdasarkan ID
    const result = await database.getFirstAsync<Mahasiswa>(
      `SELECT * FROM mahasiswa WHERE id = ?`,
      [id]
    );
    // Kembalikan null jika tidak ditemukan, atau data jika ditemukan
    return result || null;
  } catch (error) {
    console.error('Error getting mahasiswa by id:', error);
    throw error;
  }
};

/**
 * UPDATE - Fungsi untuk memperbarui data mahasiswa yang sudah ada
 * @param id - ID mahasiswa yang ingin diperbarui
 * @param mahasiswa - Data mahasiswa baru (tanpa ID)
 * @returns Promise<void>
 */
export const updateMahasiswa = async (id: number, mahasiswa: Omit<Mahasiswa, 'id'>): Promise<void> => {
  try {
    const database = await getDatabase();
    // Query UPDATE untuk memperbarui data berdasarkan ID
    await database.runAsync(
      `UPDATE mahasiswa 
       SET nim = ?, nama = ?, jurusan = ?, semester = ?, email = ? 
       WHERE id = ?`,
      [mahasiswa.nim, mahasiswa.nama, mahasiswa.jurusan, mahasiswa.semester, mahasiswa.email, id]
    );
  } catch (error) {
    console.error('Error updating mahasiswa:', error);
    throw error;
  }
};

/**
 * DELETE - Fungsi untuk menghapus data mahasiswa
 * @param id - ID mahasiswa yang ingin dihapus
 * @returns Promise<void>
 */
export const deleteMahasiswa = async (id: number): Promise<void> => {
  try {
    const database = await getDatabase();
    // Query DELETE untuk menghapus data berdasarkan ID
    await database.runAsync(`DELETE FROM mahasiswa WHERE id = ?`, [id]);
  } catch (error) {
    console.error('Error deleting mahasiswa:', error);
    throw error;
  }
};

/**
 * SEARCH - Fungsi untuk mencari mahasiswa berdasarkan keyword
 * Pencarian dilakukan pada kolom: nama, nim, jurusan, dan email
 * @param keyword - Kata kunci pencarian
 * @returns Promise<Mahasiswa[]> - Array berisi hasil pencarian
 */
export const searchMahasiswa = async (keyword: string): Promise<Mahasiswa[]> => {
  try {
    const database = await getDatabase();
    // Query SELECT dengan LIKE untuk pencarian partial match
    // Menggunakan %keyword% untuk mencari di bagian manapun dari field
    const result = await database.getAllAsync<Mahasiswa>(
      `SELECT * FROM mahasiswa 
       WHERE nama LIKE ? OR nim LIKE ? OR jurusan LIKE ? OR email LIKE ?
       ORDER BY nama ASC`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return result;
  } catch (error) {
    console.error('Error searching mahasiswa:', error);
    throw error;
  }
};

// ==================== CRUD PRODI ====================

/**
 * CREATE - Fungsi untuk menambahkan data prodi baru
 * @param prodi - Data prodi tanpa ID (ID akan auto-generate)
 * @returns Promise<number> - ID prodi yang baru saja dibuat
 */
export const addProdi = async (prodi: Omit<Prodi, 'id'>): Promise<number> => {
  try {
    console.log('Getting database in addProdi...');
    // Dapatkan instance database
    const database = await getDatabase();
    
    // Validasi: pastikan database tidak null
    if (!database) {
      throw new Error('Database object is null');
    }
    
    console.log('Database object retrieved, inserting prodi data...');
    console.log('Prodi data:', prodi);
    
    // Eksekusi query INSERT dengan prepared statement
    // Menggunakan || null untuk mengubah undefined menjadi null untuk field opsional
    const result = await database.runAsync(
      `INSERT INTO prodi (kode_prodi, nama_prodi, fakultas, akreditasi, deskripsi) 
       VALUES (?, ?, ?, ?, ?)`,
      [prodi.kode_prodi, prodi.nama_prodi, prodi.fakultas, prodi.akreditasi || null, prodi.deskripsi || null]
    );
    
    console.log('Prodi added successfully with ID:', result.lastInsertRowId);
    // Kembalikan ID yang baru saja dibuat
    return result.lastInsertRowId;
  } catch (error: any) {
    console.error('Error adding prodi:', error);
    // Format error message agar lebih informatif untuk debugging
    const errorMsg = error?.message || error?.toString() || 'Unknown error';
    const formattedError = new Error(`Failed to add prodi: ${errorMsg}`);
    // Simpan error asli untuk referensi
    (formattedError as any).originalError = error;
    throw formattedError;
  }
};

/**
 * READ - Fungsi untuk mengambil semua data prodi
 * Data diurutkan berdasarkan nama prodi secara ascending (A-Z)
 * @returns Promise<Prodi[]> - Array berisi semua data prodi
 */
export const getAllProdi = async (): Promise<Prodi[]> => {
  try {
    const database = await getDatabase();
    // Query SELECT untuk mengambil semua data prodi, diurutkan berdasarkan nama
    const result = await database.getAllAsync<Prodi>(
      `SELECT * FROM prodi ORDER BY nama_prodi ASC`
    );
    return result;
  } catch (error) {
    console.error('Error getting all prodi:', error);
    throw error;
  }
};

/**
 * READ - Fungsi untuk mengambil data prodi berdasarkan ID
 * @param id - ID prodi yang ingin diambil
 * @returns Promise<Prodi | null> - Data prodi atau null jika tidak ditemukan
 */
export const getProdiById = async (id: number): Promise<Prodi | null> => {
  try {
    const database = await getDatabase();
    // Query SELECT dengan WHERE clause untuk mencari berdasarkan ID
    const result = await database.getFirstAsync<Prodi>(
      `SELECT * FROM prodi WHERE id = ?`,
      [id]
    );
    // Kembalikan null jika tidak ditemukan, atau data jika ditemukan
    return result || null;
  } catch (error) {
    console.error('Error getting prodi by id:', error);
    throw error;
  }
};

/**
 * UPDATE - Fungsi untuk memperbarui data prodi yang sudah ada
 * @param id - ID prodi yang ingin diperbarui
 * @param prodi - Data prodi baru (tanpa ID)
 * @returns Promise<void>
 */
export const updateProdi = async (id: number, prodi: Omit<Prodi, 'id'>): Promise<void> => {
  try {
    const database = await getDatabase();
    // Query UPDATE untuk memperbarui data berdasarkan ID
    // Menggunakan || null untuk mengubah undefined menjadi null untuk field opsional
    await database.runAsync(
      `UPDATE prodi 
       SET kode_prodi = ?, nama_prodi = ?, fakultas = ?, akreditasi = ?, deskripsi = ? 
       WHERE id = ?`,
      [prodi.kode_prodi, prodi.nama_prodi, prodi.fakultas, prodi.akreditasi || null, prodi.deskripsi || null, id]
    );
  } catch (error) {
    console.error('Error updating prodi:', error);
    throw error;
  }
};

/**
 * DELETE - Fungsi untuk menghapus data prodi
 * @param id - ID prodi yang ingin dihapus
 * @returns Promise<void>
 */
export const deleteProdi = async (id: number): Promise<void> => {
  try {
    const database = await getDatabase();
    // Query DELETE untuk menghapus data berdasarkan ID
    await database.runAsync(`DELETE FROM prodi WHERE id = ?`, [id]);
  } catch (error) {
    console.error('Error deleting prodi:', error);
    throw error;
  }
};

/**
 * SEARCH - Fungsi untuk mencari prodi berdasarkan keyword
 * Pencarian dilakukan pada kolom: nama_prodi, kode_prodi, fakultas, dan akreditasi
 * @param keyword - Kata kunci pencarian
 * @returns Promise<Prodi[]> - Array berisi hasil pencarian
 */
export const searchProdi = async (keyword: string): Promise<Prodi[]> => {
  try {
    const database = await getDatabase();
    // Query SELECT dengan LIKE untuk pencarian partial match
    // Menggunakan %keyword% untuk mencari di bagian manapun dari field
    const result = await database.getAllAsync<Prodi>(
      `SELECT * FROM prodi 
       WHERE nama_prodi LIKE ? OR kode_prodi LIKE ? OR fakultas LIKE ? OR akreditasi LIKE ?
       ORDER BY nama_prodi ASC`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return result;
  } catch (error) {
    console.error('Error searching prodi:', error);
    throw error;
  }
};



// ==================== CRUD FAKULTAS ====================

/**
 * CREATE - Fungsi untuk menambahkan data fakultas baru
 * @param fakultas - Data fakultas tanpa ID (ID akan auto-generate)
 * @returns Promise<number> - ID fakultas yang baru saja dibuat
 */
export const addFakultas = async (fakultas: Omit<Fakultas, 'id'>): Promise<number> => {
  try {
    console.log('Getting database in addFakultas...');
    // Dapatkan instance database
    const database = await getDatabase();
    
    // Validasi: pastikan database tidak null
    if (!database) {
      throw new Error('Database object is null');
    }
    
    console.log('Database object retrieved, inserting fakultas data...');
    console.log('Fakultas data:', fakultas);
    
    // Eksekusi query INSERT dengan prepared statement
    // Menggunakan || null untuk mengubah undefined menjadi null untuk field opsional
    const result = await database.runAsync(
      `INSERT INTO fakultas (kode_fakultas, nama_fakultas, deskripsi) 
       VALUES (?, ?, ?)`,
      [fakultas.kode_fakultas, fakultas.nama_fakultas, fakultas.deskripsi || null]
    );
    
    console.log('Fakultas added successfully with ID:', result.lastInsertRowId);
    // Kembalikan ID yang baru saja dibuat
    return result.lastInsertRowId;
  } catch (error: any) {
    console.error('Error adding fakultas:', error);
    // Format error message agar lebih informatif untuk debugging
    const errorMsg = error?.message || error?.toString() || 'Unknown error';
    const formattedError = new Error(`Failed to add fakultas: ${errorMsg}`);
    // Simpan error asli untuk referensi
    (formattedError as any).originalError = error;
    throw formattedError;
  }
};

/**
 * READ - Fungsi untuk mengambil semua data fakultas
 * Data diurutkan berdasarkan nama fakultas secara ascending (A-Z)
 * @returns Promise<Fakultas[]> - Array berisi semua data fakultas
 */
export const getAllFakultas = async (): Promise<Fakultas[]> => {
  try {
    const database = await getDatabase();
    // Query SELECT untuk mengambil semua data fakultas, diurutkan berdasarkan nama
    const result = await database.getAllAsync<Fakultas>(
      `SELECT * FROM fakultas ORDER BY nama_fakultas ASC`
    );
    return result;
  } catch (error) {
    console.error('Error getting all fakultas:', error);
    throw error;
  }
};

/**
 * READ - Fungsi untuk mengambil data fakultas berdasarkan ID
 * @param id - ID fakultas yang ingin diambil
 * @returns Promise<Fakultas | null> - Data fakultas atau null jika tidak ditemukan
 */
export const getFakultasById = async (id: number): Promise<Fakultas | null> => {
  try {
    const database = await getDatabase();
    // Query SELECT dengan WHERE clause untuk mencari berdasarkan ID
    const result = await database.getFirstAsync<Fakultas>(
      `SELECT * FROM fakultas WHERE id = ?`,
      [id]
    );
    // Kembalikan null jika tidak ditemukan, atau data jika ditemukan
    return result || null;
  } catch (error) {
    console.error('Error getting fakultas by id:', error);
    throw error;
  }
};

/**
 * UPDATE - Fungsi untuk memperbarui data fakultas yang sudah ada
 * @param id - ID fakultas yang ingin diperbarui
 * @param fakultas - Data fakultas baru (tanpa ID)
 * @returns Promise<void>
 */
export const updateFakultas = async (id: number, fakultas: Omit<Fakultas, 'id'>): Promise<void> => {
  try {
    const database = await getDatabase();
    // Query UPDATE untuk memperbarui data berdasarkan ID
    // Menggunakan || null untuk mengubah undefined menjadi null untuk field opsional
    await database.runAsync(
      `UPDATE fakultas 
       SET kode_fakultas = ?, nama_fakultas = ?, deskripsi = ? 
       WHERE id = ?`,
      [fakultas.kode_fakultas, fakultas.nama_fakultas, fakultas.deskripsi || null, id]
    );
  } catch (error) {
    console.error('Error updating fakultas:', error);
    throw error;
  }
};

/**
 * DELETE - Fungsi untuk menghapus data fakultas
 * @param id - ID fakultas yang ingin dihapus
 * @returns Promise<void>
 */
export const deleteFakultas = async (id: number): Promise<void> => {
  try {
    const database = await getDatabase();
    // Query DELETE untuk menghapus data berdasarkan ID
    await database.runAsync(`DELETE FROM fakultas WHERE id = ?`, [id]);
  } catch (error) {
    console.error('Error deleting fakultas:', error);
    throw error;
  }
};

/**
 * SEARCH - Fungsi untuk mencari fakultas berdasarkan keyword
 * Pencarian dilakukan pada kolom: nama_fakultas, kode_fakultas, dan deskripsi
 * @param keyword - Kata kunci pencarian
 * @returns Promise<Fakultas[]> - Array berisi hasil pencarian
 */
export const searchFakultas = async (keyword: string): Promise<Fakultas[]> => {
  try {
    const database = await getDatabase();
    // Query SELECT dengan LIKE untuk pencarian partial match
    // Menggunakan %keyword% untuk mencari di bagian manapun dari field
    const result = await database.getAllAsync<Fakultas>(
      `SELECT * FROM fakultas 
       WHERE nama_fakultas LIKE ? OR kode_fakultas LIKE ? OR deskripsi LIKE ?
       ORDER BY nama_fakultas ASC`,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    );
    return result;
  } catch (error) {
    console.error('Error searching fakultas:', error);
    throw error;
  }
};
