const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_lab_ilkom',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL diperlukan untuk TiDB Cloud (production). Dinonaktifkan untuk Laragon lokal.
  ...(isProduction && {
    ssl: { rejectUnauthorized: true }
  })
};

let pool = null;
let isConnected = false;

// Fallback JSON DB path in case MySQL is offline
const JSON_DB_FILE = path.join(__dirname, 'db.json');

async function initMysql() {
  try {
    if (isProduction) {
      // Di production (TiDB Cloud), database sudah ada — langsung buat pool
      pool = mysql.createPool(DB_CONFIG);
    } else {
      // Di lokal (Laragon), buat database jika belum ada
      const rootConn = await mysql.createConnection({
        host: DB_CONFIG.host,
        port: DB_CONFIG.port,
        user: DB_CONFIG.user,
        password: DB_CONFIG.password
      });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await rootConn.end();
      pool = mysql.createPool(DB_CONFIG);
    }

    // Ensure tables exist
    await createTablesIfNotExist();

    isConnected = true;
    const dbLabel = isProduction ? 'TiDB Cloud (Production)' : 'MySQL Laragon (Local)';
    console.log(`✅ [${dbLabel}] Terhubung sukses ke database '${DB_CONFIG.database}' di ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    return true;
  } catch (err) {
    isConnected = false;
    const label = isProduction ? 'TiDB Cloud' : 'MySQL Laragon';
    console.warn(`⚠️ [${label}] Tidak dapat terhubung ke MySQL (${err.code || err.message}).`);
    if (!isProduction) {
      console.warn(`👉 Pastikan Laragon sudah dinyalakan (Klik 'Start All' di aplikasi Laragon).`);
    }
    console.warn(`ℹ️ Menggunakan fallback database sementara.`);
    return false;
  }
}


async function createTablesIfNotExist() {
  // Table: users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(150) NOT NULL,
      \`identifier\` VARCHAR(100) NOT NULL UNIQUE,
      \`email\` VARCHAR(150) NOT NULL UNIQUE,
      \`role\` ENUM('admin', 'dosen', 'mahasiswa') NOT NULL,
      \`nim\` VARCHAR(50) DEFAULT NULL,
      \`nip\` VARCHAR(50) DEFAULT NULL,
      \`jurusan\` VARCHAR(100) DEFAULT NULL,
      \`bidang\` VARCHAR(150) DEFAULT NULL,
      \`semester\` INT DEFAULT NULL,
      \`angkatan\` INT DEFAULT NULL,
      \`password\` VARCHAR(255) NOT NULL,
      \`phone\` VARCHAR(30) DEFAULT NULL,
      \`avatar\` TEXT DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Table: labs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`labs\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(150) NOT NULL,
      \`short_name\` VARCHAR(100) DEFAULT NULL,
      \`code\` VARCHAR(50) NOT NULL UNIQUE,
      \`location\` VARCHAR(150) NOT NULL,
      \`capacity\` INT NOT NULL DEFAULT 30,
      \`available_pc\` INT NOT NULL DEFAULT 30,
      \`category\` VARCHAR(100) NOT NULL,
      \`specs\` TEXT DEFAULT NULL,
      \`facilities\` JSON DEFAULT NULL,
      \`status\` ENUM('Tersedia', 'Sedang Digunakan', 'Maintenance') DEFAULT 'Tersedia',
      \`image\` TEXT DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Table: equipments
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`equipments\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(150) NOT NULL,
      \`category\` VARCHAR(100) NOT NULL,
      \`total\` INT NOT NULL DEFAULT 1,
      \`available\` INT NOT NULL DEFAULT 1,
      \`condition_status\` VARCHAR(50) DEFAULT 'Sangat Baik',
      \`spec\` TEXT DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Table: bookings
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`bookings\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`booking_code\` VARCHAR(100) NOT NULL UNIQUE,
      \`user_id\` VARCHAR(50) NOT NULL,
      \`user_name\` VARCHAR(150) NOT NULL,
      \`user_nim\` VARCHAR(50) DEFAULT NULL,
      \`user_jurusan\` VARCHAR(100) DEFAULT NULL,
      \`user_phone\` VARCHAR(30) DEFAULT NULL,
      \`lab_id\` VARCHAR(50) NOT NULL,
      \`lab_name\` VARCHAR(150) NOT NULL,
      \`date\` VARCHAR(20) NOT NULL,
      \`time_slot\` VARCHAR(100) NOT NULL,
      \`session\` VARCHAR(50) NOT NULL,
      \`participants_count\` INT NOT NULL DEFAULT 1,
      \`purpose\` TEXT NOT NULL,
      \`category\` VARCHAR(100) NOT NULL,
      \`dosen_id\` VARCHAR(50) DEFAULT NULL,
      \`dosen_name\` VARCHAR(150) DEFAULT NULL,
      \`equipments\` JSON DEFAULT NULL,
      \`status\` VARCHAR(50) DEFAULT 'menunggu_dosen',
      \`dosen_notes\` TEXT DEFAULT NULL,
      \`admin_notes\` TEXT DEFAULT NULL,
      \`qr_code_data\` TEXT DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`checked_in_at\` TIMESTAMP NULL DEFAULT NULL,
      \`completed_at\` TIMESTAMP NULL DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Table: thesis_assignments (Pembagian Pembimbing Skripsi)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`thesis_assignments\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`mahasiswa_id\` VARCHAR(50) NOT NULL,
      \`pembimbing1_id\` VARCHAR(50) NOT NULL,
      \`status_p1\` ENUM('menunggu', 'disetujui', 'ditolak') DEFAULT 'menunggu',
      \`pembimbing2_id\` VARCHAR(50) DEFAULT NULL,
      \`status_p2\` ENUM('menunggu', 'disetujui', 'ditolak') DEFAULT 'menunggu',
      \`judul_skripsi\` TEXT DEFAULT NULL,
      \`status\` ENUM('diajukan', 'aktif', 'selesai', 'ditolak', 'dibatalkan') DEFAULT 'diajukan',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`unique_mahasiswa\` (\`mahasiswa_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);


  // Table: thesis_exams (Jadwal Ujian Skripsi)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`thesis_exams\` (
      \`id\` VARCHAR(50) NOT NULL,
      \`mahasiswa_id\` VARCHAR(50) NOT NULL,
      \`jenis_ujian\` ENUM('proposal','seminar_hasil','sidang_skripsi','komprehensif') NOT NULL DEFAULT 'proposal',
      \`tanggal\` DATE NOT NULL,
      \`jam_mulai\` TIME NOT NULL,
      \`jam_selesai\` TIME NOT NULL,
      \`ruangan\` VARCHAR(150) NOT NULL,
      \`status\` ENUM('mendatang','selesai','dibatalkan') DEFAULT 'mendatang',
      \`catatan\` TEXT DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Table: thesis_exam_examiners (Dosen Penguji per Ujian)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`thesis_exam_examiners\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`exam_id\` VARCHAR(50) NOT NULL,
      \`dosen_id\` VARCHAR(50) NOT NULL,
      UNIQUE KEY \`unique_exam_dosen\` (\`exam_id\`, \`dosen_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Check if initial users exist, if not run seed
  const [userRows] = await pool.query('SELECT COUNT(*) as count FROM `users`');
  if (userRows[0].count === 0) {
    await seedMysqlData();
  }
}

async function seedMysqlData() {
  console.log('🌱 Menyiapkan data awal (seed) ke database MySQL db_lab_ilkom...');

  // 1. Seed Users
  const users = [
    ['usr_admin', 'Admin Laboran Ilkom', 'admin', 'admin@ilkom.ac.id', 'admin', null, null, null, null, null, null, 'admin123', '081234567890', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'],
    ['usr_dosen1', 'Dr. Hendra Gunawan, S.Kom., M.T.', '197805122003121001', 'hendra@ilkom.ac.id', 'dosen', null, '197805122003121001', null, 'Kecerdasan Buatan & Sistem Cerdas', null, null, 'dosen123', '081398765432', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'],
    ['usr_dosen2', 'Dr. Siti Nurhaliza, M.Cs.', '198502142008012002', 'siti@ilkom.ac.id', 'dosen', null, '198502142008012002', null, 'Software Engineering & Cloud Computing', null, null, 'dosen123', '081287654321', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'],
    ['usr_mhs1', 'Bagas Pratama', '22051204001', 'bagas@mhs.ilkom.ac.id', 'mahasiswa', '22051204001', null, 'Teknik Informatika', null, 7, 2022, 'mhs123', '082155443322', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'],
    ['usr_mhs2', 'Anisa Rahmawati', '22051204015', 'anisa@mhs.ilkom.ac.id', 'mahasiswa', '22051204015', null, 'Sistem Informasi', null, 5, 2022, 'mhs123', '085712345678', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'],
    ['usr_mhs3', 'Dimas Anggara', '21051204040', 'dimas@mhs.ilkom.ac.id', 'mahasiswa', '21051204040', null, 'Teknik Komputer', null, 7, 2021, 'mhs123', '087811223344', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80']
  ];
  await pool.query('INSERT INTO `users` (id, name, identifier, email, role, nim, nip, jurusan, bidang, semester, angkatan, password, phone, avatar) VALUES ?', [users]);

  // 2. Seed Labs
  const labs = [
    ['LAB-01', 'Lab Rekayasa Perangkat Lunak & Basis Data (RPL)', 'Lab RPL & Database', 'LAB-RPL-201', 'Gedung Teknologi Informasi Polinema Lt. 6 R.601', 40, 40, 'Software Engineering', '40x PC Core i7-13700, RAM 32GB, Dual Monitor 27", SSD NVMe 1TB, VS Code, JetBrains Suite, Docker, PostgreSQL', JSON.stringify(["40 PC High End", "Gigabit LAN & Wi-Fi 6", "Dual Screen Setup", "Smart Interactive Projector", "Central AC & Sound System"]), 'Tersedia', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80'],
    ['LAB-02', 'Lab Kecerdasan Buatan & Data Science (AI)', 'Lab AI & Data Science', 'LAB-AI-202', 'Gedung Teknologi Informasi Polinema Lt. 6 R.602', 36, 36, 'Artificial Intelligence', '36x PC Intel Core i9-13900K, NVIDIA RTX 4080 16GB, RAM 64GB, Dedicated GPU Cluster node, PyTorch/CUDA 12, JupyterHub Server', JSON.stringify(["36 Workstations NVIDIA RTX 4080", "Akses Server GPU Cluster", "High-Speed NAS Storage 100TB", "Smart Whiteboard", "Ultra HD Display"]), 'Tersedia', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'],
    ['LAB-03', 'Lab Jaringan Komputer & Cyber Security', 'Lab Jaringan & Cyber Sec', 'LAB-NET-301', 'Gedung Teknologi Informasi Polinema Lt. 7 R.701', 32, 32, 'Networking & Security', '32x Dual-NIC Workstations, 12x Cisco Catalyst Rack Routers & Switches, Mikrotik CCR, Kali Linux & Wireshark Labs, Air-Gapped Isolated Net', JSON.stringify(["32 Isolated Workstation PC", "Modular Cisco Routing Racks", "Hardware Firewall Sandbox", "Spectrum Analyzer", "Fiber Optic Splicer Kit"]), 'Tersedia', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'],
    ['LAB-04', 'Lab Multimedia, Animasi & Game Development', 'Lab Multimedia & Game', 'LAB-MM-302', 'Gedung Teknologi Informasi Polinema Lt. 7 R.702', 35, 35, 'Multimedia & Gaming', '35x PC Intel Core i7, NVIDIA RTX 4070 Ti, RAM 32GB, Wacom Cintiq 22 Pro Pen Displays, Unreal Engine 5, Unity, Adobe Creative Cloud Master', JSON.stringify(["35 Drawing Pen Displays Wacom", "Unreal Engine 5 & Blender Suite", "Surround Sound Studio Monitoring", "Green Screen Backdrop Room", "VR Ready Stations"]), 'Tersedia', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'],
    ['LAB-05', 'Lab Internet of Things & Robotika', 'Lab IoT & Robotika', 'LAB-IOT-105', 'Gedung Teknologi Informasi Polinema Lt. 5 R.505', 28, 28, 'Hardware & Embedded', '28 Workbenches dengan ESD Protection, Rigol Digital Oscilloscope, SMD Rework Stations, Bambu Lab 3D Printers, ESP32/Raspberry Pi 5 Hubs', JSON.stringify(["28 Anti-Static Workbenches", "3x Bambu Lab X1-Carbon 3D Printer", "Digital Oscilloscopes & Power Supplies", "Complete Sensor Kits & Actuators", "Robotics Arena Mat"]), 'Tersedia', 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80']
  ];
  await pool.query('INSERT INTO `labs` (id, name, short_name, code, location, capacity, available_pc, category, specs, facilities, status, image) VALUES ?', [labs]);

  // 3. Seed Equipments
  const equipments = [
    ['EQ-01', 'Oculus Meta Quest 3 VR Headset', 'VR & Augmented Reality', 8, 6, 'Sangat Baik', '128GB, Snapdragon XR2 Gen 2, 4K+ Infinite Display, Touch Plus Controllers'],
    ['EQ-02', 'NVIDIA Jetson Nano / Orin Developer Kit', 'AI Edge Computing', 15, 12, 'Sangat Baik', 'NVIDIA Ampere architecture, 8GB RAM, Gigabit Ethernet, CSI Camera connector'],
    ['EQ-03', 'Raspberry Pi 5 (8GB) Master IoT Kit', 'Embedded & IoT', 20, 16, 'Sangat Baik', 'Quad-core 2.4GHz ARM Cortex-A76, Active Cooler, 64GB Extreme MicroSD, Sensor Pack'],
    ['EQ-04', 'Proyektor Laser Epson EB-L210W (4500 Lumens)', 'Presentation Display', 6, 5, 'Sangat Baik', 'Laser Light Source 20.000 Jam, WXGA, HDMI / Wireless Miracast support'],
    ['EQ-05', 'Digital Storage Oscilloscope Rigol DS1054Z', 'Elektronika & Pengukuran', 8, 7, 'Sangat Baik', '50MHz Bandwidth, 4 Analogue Channels, 1GSa/s Real-time sample rate'],
    ['EQ-06', 'Wireless Clip-on Microphone & Speaker Set', 'Audio', 5, 5, 'Sangat Baik', 'Dual Wireless Lavalier, Noise Cancelling, Bluetooth Portable Amp']
  ];
  await pool.query('INSERT INTO `equipments` (id, name, category, total, available, condition_status, spec) VALUES ?', [equipments]);

  // 4. Seed Bookings
  const bookings = [
    ['BOOK-2026-001', 'LAB-ILKOM-2026-0902-A', 'usr_mhs1', 'Bagas Pratama', '22051204001', 'Teknik Informatika', '082155443322', 'LAB-02', 'Lab Kecerdasan Buatan & Data Science (AI)', '2026-09-02', '08:00 - 11:30 (Sesi Pagi)', 'pagi', 4, 'Riset Tugas Akhir: Training Model Vision-Language Transformer untuk Deteksi Penyakit Tanaman', 'Riset Skripsi / Tugas Akhir', 'usr_dosen1', 'Dr. Hendra Gunawan, S.Kom., M.T.', JSON.stringify(["NVIDIA Jetson Nano / Orin Developer Kit", "Proyektor Laser Epson EB-L210W (4500 Lumens)"]), 'disetujui_admin', 'Disetujui. Pastikan dataset sudah dibersihkan sebelum menggunakan GPU server cluster.', 'Peminjaman disetujui. Kunci lab dan kit Jetson dapat diambil di meja laboran.', 'LAB-AUTH:BOOK-2026-001:22051204001:LAB-02:20260902'],
    ['BOOK-2026-002', 'LAB-ILKOM-2026-0902-B', 'usr_mhs2', 'Anisa Rahmawati', '22051204015', 'Sistem Informasi', '085712345678', 'LAB-01', 'Lab Rekayasa Perangkat Lunak & Basis Data (RPL)', '2026-09-02', '13:00 - 16:30 (Sesi Siang)', 'siang', 30, 'Praktikum Mandiri dan Evaluasi Sprint Pengembangan Aplikasi Web Enterprise', 'Praktikum Kuliah', 'usr_dosen2', 'Dr. Siti Nurhaliza, M.Cs.', JSON.stringify(["Proyektor Laser Epson EB-L210W (4500 Lumens)"]), 'disetujui_admin', 'Disetujui untuk sesi praktikum mandiri kelompok.', 'Disetujui. Ruang 201 sudah disiapkan.', 'LAB-AUTH:BOOK-2026-002:220512040015:LAB-01:20260902'],
    ['BOOK-2026-003', 'LAB-ILKOM-2026-0903-C', 'usr_mhs3', 'Dimas Anggara', '21051204040', 'Teknik Komputer', '087811223344', 'LAB-03', 'Lab Jaringan Komputer & Cyber Security', '2026-09-03', '08:00 - 11:30 (Sesi Pagi)', 'pagi', 6, 'Latihan Bersama dan Simulasi Penetrasi Jaringan Tim CTF Ilkom untuk Kompetisi Nasional', 'Kegiatan Komunitas / Kompetisi', 'usr_dosen1', 'Dr. Hendra Gunawan, S.Kom., M.T.', JSON.stringify(["Wireless Clip-on Microphone & Speaker Set"]), 'menunggu_dosen', '', '', 'LAB-AUTH:BOOK-2026-003:21051204040:LAB-03:20260903'],
    ['BOOK-2026-004', 'LAB-ILKOM-2026-0904-D', 'usr_mhs1', 'Bagas Pratama', '22051204001', 'Teknik Informatika', '082155443322', 'LAB-04', 'Lab Multimedia, Animasi & Game Development', '2026-09-04', '13:00 - 16:30 (Sesi Siang)', 'siang', 3, 'Rendering Aset Visual 3D & Pengujian Scene VR Menggunakan Oculus Meta Quest 3', 'Proyek Kreatif Mahasiswa', 'usr_dosen2', 'Dr. Siti Nurhaliza, M.Cs.', JSON.stringify(["Oculus Meta Quest 3 VR Headset"]), 'menunggu_admin', 'Rekomendasi disetujui. Mahasiswa telah menyelesaikan desain 3D di Blender.', '', 'LAB-AUTH:BOOK-2026-004:22051204001:LAB-04:20260904']
  ];
  await pool.query('INSERT INTO `bookings` (id, booking_code, user_id, user_name, user_nim, user_jurusan, user_phone, lab_id, lab_name, date, time_slot, session, participants_count, purpose, category, dosen_id, dosen_name, equipments, status, dosen_notes, admin_notes, qr_code_data) VALUES ?', [bookings]);

  // 5. Seed Thesis Assignments (Pembagian Pembimbing)
  const assignments = [
    ['TA-001', 'usr_mhs1', 'usr_dosen1', 'usr_dosen2', 'Implementasi Model Vision-Language Transformer untuk Deteksi Penyakit Tanaman Berbasis Deep Learning', 'aktif'],
    ['TA-002', 'usr_mhs2', 'usr_dosen2', 'usr_dosen1', 'Pengembangan Sistem Informasi Manajemen Keuangan UMKM Berbasis Web dengan Fitur Prediksi Cash Flow', 'aktif'],
    ['TA-003', 'usr_mhs3', 'usr_dosen1', null, 'Analisis Kerentanan Keamanan Jaringan IoT pada Smart Home System Menggunakan Metode Penetration Testing', 'aktif']
  ];
  await pool.query('INSERT INTO `thesis_assignments` (id, mahasiswa_id, pembimbing1_id, pembimbing2_id, judul_skripsi, status) VALUES ?', [assignments]);

  // 6. Seed Thesis Exams (Jadwal Ujian)
  const exams = [
    ['TE-001', 'usr_mhs1', 'proposal', '2026-09-20', '09:00:00', '10:00:00', 'Ruang Sidang Lab TI Lt. 6', 'mendatang', null],
    ['TE-002', 'usr_mhs2', 'seminar_hasil', '2026-09-25', '13:00:00', '14:30:00', 'Ruang Seminar Gedung TI R.601', 'mendatang', 'Bawa printout laporan 3 eksemplar'],
    ['TE-003', 'usr_mhs3', 'proposal', '2026-09-18', '10:00:00', '11:00:00', 'Ruang Sidang Lab TI Lt. 7', 'selesai', null]
  ];
  await pool.query('INSERT INTO `thesis_exams` (id, mahasiswa_id, jenis_ujian, tanggal, jam_mulai, jam_selesai, ruangan, status, catatan) VALUES ?', [exams]);

  // 7. Seed Thesis Exam Examiners (Dosen Penguji)
  const examiners = [
    ['TE-001', 'usr_dosen1'],
    ['TE-001', 'usr_dosen2'],
    ['TE-002', 'usr_dosen1'],
    ['TE-002', 'usr_dosen2'],
    ['TE-003', 'usr_dosen2']
  ];
  await pool.query('INSERT INTO `thesis_exam_examiners` (exam_id, dosen_id) VALUES ?', [examiners]);

  console.log('✅ Seed data MySQL berhasil disiapkan.');
}

// Fallback JSON DB Functions
function getJsonDb() {
  if (!fs.existsSync(JSON_DB_FILE)) return { users: [], labs: [], equipments: [], bookings: [] };
  try {
    return JSON.parse(fs.readFileSync(JSON_DB_FILE, 'utf-8'));
  } catch (e) {
    return { users: [], labs: [], equipments: [], bookings: [] };
  }
}

function saveJsonDb(data) {
  fs.writeFileSync(JSON_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  get pool() { return pool; },
  get isConnected() { return isConnected; },
  initMysql,
  getJsonDb,
  saveJsonDb,
  resetDb: seedMysqlData
};
