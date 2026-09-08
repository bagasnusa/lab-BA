const AdminDashboard = {
  async render() {
    let stats = null;
    let pendingBookings = [];
    let labs = [];

    try {
      const statsRes = await Api.stats.getDashboard();
      stats = statsRes.data?.overview;
      const bookingsRes = await Api.bookings.getAll({ status: 'all' });
      const allBookings = bookingsRes.data || [];
      pendingBookings = allBookings.filter(b => b.status === 'menunggu_admin');
      const labRes = await Api.labs.getAll();
      labs = labRes.data || [];
    } catch (e) {
      console.error('Error loading admin dashboard data:', e);
    }

    const pendingRowsHtml = pendingBookings.length > 0
      ? pendingBookings.map(b => `
        <tr class="hover:bg-slate-50/80 transition text-xs border-b border-slate-100">
          <td class="px-4 py-3.5 font-mono font-bold text-sky-700">${b.bookingCode || b.id}</td>
          <td class="px-4 py-3.5">
            <div class="font-bold text-slate-900">${b.userName}</div>
            <div class="text-[11px] text-slate-500 font-mono">${b.userNim} • ${b.userJurusan || ''}</div>
          </td>
          <td class="px-4 py-3.5">
            <div class="font-semibold text-slate-800">${b.labName}</div>
            <div class="text-[11px] text-slate-500">${b.date} • ${b.timeSlot}</div>
          </td>
          <td class="px-4 py-3.5 max-w-xs truncate text-slate-600" title="${b.purpose}">
            ${b.purpose}
          </td>
          <td class="px-4 py-3.5">
            <span class="text-indigo-700 font-medium">${b.dosenName || '-'}</span>
          </td>
          <td class="px-4 py-3.5">
            <div class="flex items-center gap-1.5">
              <button onclick="AdminDashboard.approveBooking('${b.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow-2xs flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Setujui
              </button>
              <button onclick="AdminDashboard.rejectBooking('${b.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Tolak
              </button>
            </div>
          </td>
        </tr>
      `).join('')
      : `
        <tr>
          <td colspan="6" class="text-center py-8 text-xs text-slate-400">
            🎉 Tidak ada peminjaman yang menunggu persetujuan Admin saat ini.
          </td>
        </tr>
      `;

    const labStatusCards = labs.map(lab => `
      <div class="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs hover:shadow-md transition">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
            ${lab.code.split('-')[1] || 'LAB'}
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-800">${lab.shortName || lab.name}</h4>
            <p class="text-[11px] text-slate-500">${lab.location} • ${lab.capacity} PC</p>
          </div>
        </div>
        <div class="text-right">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${lab.status === 'Tersedia' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            <span class="w-1.5 h-1.5 rounded-full ${lab.status === 'Tersedia' ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
            ${lab.status}
          </span>
        </div>
      </div>
    `).join('');

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Welcome Header (Figma Matched) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-700 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/30 text-sky-200 rounded-full text-xs font-bold uppercase tracking-wider">
              🛡️ Panel Kontrol Laboran
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, Admin Lab 👋
            </h1>
            <p class="text-xs sm:text-sm text-sky-100/80">
              Kelola persetujuan peminjaman ruang, monitor inventaris perangkat keras, dan jadwalkan kegiatan lab.
            </p>
          </div>

          <!-- Fast Scan QR Action -->
          <div class="flex items-center gap-3">
            <button onclick="AdminDashboard.openQRScannerModal()" class="px-4 py-2.5 bg-white text-slate-900 hover:bg-sky-50 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2">
              <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
              Scan QR Check-In
            </button>
            <button onclick="App.navigate('jadwal')" class="px-4 py-2.5 bg-sky-600/40 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition border border-sky-400/30">
              Tabel Semua Data
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards (Figma Matched) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <!-- Stat 1 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
              ⏳
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Menunggu Admin</div>
              <div class="text-2xl font-extrabold text-slate-900">${stats?.pendingAdmin ?? 0}</div>
              <div class="text-[11px] text-amber-600 font-medium">Perlu tindakan segera</div>
            </div>
          </div>

          <!-- Stat 2 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
              🟢
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Aktif / Disetujui</div>
              <div class="text-2xl font-extrabold text-slate-900">${stats?.approvedActive ?? 0}</div>
              <div class="text-[11px] text-emerald-600 font-medium">Jadwal berjalan lancar</div>
            </div>
          </div>

          <!-- Stat 3 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xl">
              🏢
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Ruang Laboratorium</div>
              <div class="text-2xl font-extrabold text-slate-900">${stats?.totalLabs ?? 5}</div>
              <div class="text-[11px] text-sky-600 font-medium">${stats?.availableLabs ?? 5} Ruang Tersedia</div>
            </div>
          </div>

          <!-- Stat 4 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
              📦
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Inventaris Alat</div>
              <div class="text-2xl font-extrabold text-slate-900">${stats?.totalEquipments ?? 60}</div>
              <div class="text-[11px] text-indigo-600 font-medium">${stats?.availableEquipments ?? 50} Unit Tersedia</div>
            </div>
          </div>

        </div>

        <!-- Pending Approvals Section (Figma Matched) -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Daftar Pengajuan Butuh Persetujuan Admin</span>
                <span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">${pendingBookings.length}</span>
              </h3>
              <p class="text-xs text-slate-500">Tinjau dan setujui peminjaman yang telah direkomendasikan oleh Dosen Pembimbing.</p>
            </div>
            <button onclick="App.navigate('jadwal')" class="text-xs font-bold text-sky-600 hover:text-sky-700">
              Lihat Riwayat & Filter Lengkap &rarr;
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <th class="px-4 py-3">No. Booking</th>
                  <th class="px-4 py-3">Mahasiswa / Peminjam</th>
                  <th class="px-4 py-3">Lab & Waktu</th>
                  <th class="px-4 py-3">Keperluan / Riset</th>
                  <th class="px-4 py-3">Dosen Pembimbing</th>
                  <th class="px-4 py-3">Aksi Validasi</th>
                </tr>
              </thead>
              <tbody>
                ${pendingRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Lab Monitoring Grid -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">Status Ketersediaan Laboratorium Real-Time</h3>
            <span class="text-xs text-slate-500">5 Laboratorium Terintegrasi</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${labStatusCards}
          </div>
        </div>

      </div>
    `;
  },

  async approveBooking(id) {
    const notes = prompt('Catatan Admin Lab (opsional, contoh: "Disetujui. Kunci & alat siap di meja laboran."):', 'Disetujui oleh Admin Lab.');
    if (notes === null) return; // user cancelled

    try {
      const res = await Api.bookings.updateStatus(id, 'approve_admin', notes);
      Toast.success(res.message || 'Peminjaman disetujui!');
      App.refreshCurrentView();
    } catch (err) {
      Toast.error(err.message || 'Gagal menyetujui peminjaman');
    }
  },

  async rejectBooking(id) {
    const notes = prompt('Alasan penolakan:', 'Jadwal bertabrakan dengan agenda praktikum wajib.');
    if (notes === null) return;

    try {
      const res = await Api.bookings.updateStatus(id, 'reject_admin', notes);
      Toast.warning(res.message || 'Peminjaman ditolak.');
      App.refreshCurrentView();
    } catch (err) {
      Toast.error(err.message || 'Gagal menolak peminjaman');
    }
  },

  openQRScannerModal() {
    const modalHtml = `
      <div id="scanner-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div class="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sky-400 font-bold">📷</span>
              <h3 class="font-bold text-sm">Scanner QR Code Check-In Laboran</h3>
            </div>
            <button onclick="document.getElementById('scanner-modal').remove()" class="text-slate-400 hover:text-white">✕</button>
          </div>

          <div class="p-6 space-y-4">
            <div class="border-2 border-dashed border-sky-400 bg-sky-50/50 rounded-2xl p-6 text-center space-y-3">
              <div class="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                📱
              </div>
              <p class="text-xs text-slate-600">
                Arahkan scanner ke QR Code E-Ticket Mahasiswa, atau masukkan kode booking di bawah untuk simulasi check-in:
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kode Booking / QR Data</label>
              <input type="text" id="scan-code-input" placeholder="LAB-ILKOM-2026-0902-A atau LAB-AUTH:BOOK-2026-001..." value="LAB-AUTH:BOOK-2026-001:22051204001:LAB-02:20260902" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono">
            </div>

            <button onclick="AdminDashboard.submitQRCheckin()" class="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm transition">
              Validasi & Check-In Mahasiswa
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async submitQRCheckin() {
    const code = document.getElementById('scan-code-input').value.trim();
    if (!code) return Toast.warning('Masukkan kode booking!');

    try {
      const res = await Api.bookings.checkinByQR(code);
      Toast.success(res.message || 'Check-in berhasil!');
      document.getElementById('scanner-modal').remove();
      App.refreshCurrentView();
    } catch (err) {
      Toast.error(err.message || 'Gagal check-in QR');
    }
  }
};

window.AdminDashboard = AdminDashboard;
