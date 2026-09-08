const DosenDashboard = {
  async render() {
    const user = Api.getUser() || { name: 'Dr. Hendra Gunawan, S.Kom., M.T.', nip: '197805122003121001' };
    let myStudentBookings = [];

    try {
      const res = await Api.bookings.getAll({ dosenId: user.id });
      myStudentBookings = res.data || [];
    } catch (e) {
      console.error('Error loading dosen dashboard data:', e);
    }

    const pendingForMe = myStudentBookings.filter(b => b.status === 'menunggu_dosen');
    const approvedByMe = myStudentBookings.filter(b => b.status !== 'menunggu_dosen' && b.status !== 'ditolak_dosen');

    const pendingRowsHtml = pendingForMe.length > 0 ? pendingForMe.map(b => `
      <tr class="hover:bg-slate-50/80 transition text-xs border-b border-slate-100">
        <td class="px-4 py-3.5 font-mono font-bold text-sky-700">${b.bookingCode || b.id}</td>
        <td class="px-4 py-3.5">
          <div class="font-bold text-slate-900">${b.userName}</div>
          <div class="text-[11px] text-slate-500 font-mono">${b.userNim} • ${b.userJurusan || 'Teknik Informatika'}</div>
        </td>
        <td class="px-4 py-3.5">
          <div class="font-semibold text-slate-800">${b.labName}</div>
          <div class="text-[11px] text-slate-500">${b.date} • ${b.timeSlot}</div>
        </td>
        <td class="px-4 py-3.5 max-w-xs text-slate-600">
          <p class="font-medium text-slate-800 mb-0.5">${b.category}</p>
          <p class="truncate text-[11px]" title="${b.purpose}">${b.purpose}</p>
        </td>
        <td class="px-4 py-3.5">
          <span class="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">Menunggu Validasi Dosen</span>
        </td>
        <td class="px-4 py-3.5">
          <div class="flex items-center gap-1.5">
            <button onclick="DosenDashboard.approveStudentBooking('${b.id}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition shadow-2xs flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              Setujui Rekomendasi
            </button>
            <button onclick="DosenDashboard.rejectStudentBooking('${b.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition">
              Tolak
            </button>
          </div>
        </td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="6" class="text-center py-8 text-xs text-slate-400">
          ✅ Semua pengajuan mahasiswa bimbingan telah divalidasi.
        </td>
      </tr>
    `;

    const allMyStudentsRows = myStudentBookings.map(b => {
      let statusBadge = '';
      if (b.status === 'disetujui_admin') statusBadge = '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">Disetujui Admin</span>';
      else if (b.status === 'menunggu_admin') statusBadge = '<span class="px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full text-[10px] font-bold">Menunggu Admin Lab</span>';
      else if (b.status === 'menunggu_dosen') statusBadge = '<span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">Menunggu Validasi Anda</span>';
      else statusBadge = `<span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">${b.status}</span>`;

      return `
        <tr class="hover:bg-slate-50 text-xs border-b border-slate-100">
          <td class="px-4 py-3 font-mono font-medium text-slate-700">${b.bookingCode || b.id}</td>
          <td class="px-4 py-3 font-bold text-slate-800">${b.userName} (${b.userNim})</td>
          <td class="px-4 py-3 text-slate-700">${b.labName}</td>
          <td class="px-4 py-3 text-slate-600">${b.date}</td>
          <td class="px-4 py-3">${statusBadge}</td>
          <td class="px-4 py-3 text-right">
            <button onclick="QRModal.renderModal(${JSON.stringify(b).replace(/"/g, '&quot;')})" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px]">
              Lihat Detail
            </button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Welcome Header (Figma Matched) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider">
              👨‍🏫 Portal Dosen Pembimbing & Peneliti
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, ${user.name} 👋
            </h1>
            <p class="text-xs sm:text-sm text-indigo-100/80">
              Validasi permohonan riset mahasiswa bimbingan dan jadwalkan penggunaan laboratorium untuk kegiatan akademik.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="App.navigate('booking')" class="px-4 py-2.5 bg-white text-slate-900 hover:bg-indigo-50 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Pinjam Lab untuk Riset Dosen
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards (Figma Matched) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          <!-- Card 1 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
              📋
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Perlu Validasi Anda</div>
              <div class="text-2xl font-extrabold text-slate-900">${pendingForMe.length}</div>
              <div class="text-[11px] text-amber-600 font-medium">Mahasiswa Bimbingan</div>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
              ✅
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Telah Disetujui</div>
              <div class="text-2xl font-extrabold text-slate-900">${approvedByMe.length}</div>
              <div class="text-[11px] text-emerald-600 font-medium">Aktif / Berjalan</div>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
              🎓
            </div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Riwayat Peminjaman</div>
              <div class="text-2xl font-extrabold text-slate-900">${myStudentBookings.length}</div>
              <div class="text-[11px] text-indigo-600 font-medium">Agenda Terdaftar</div>
            </div>
          </div>

        </div>

        <!-- Pending Approval Table -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Daftar Pengajuan Mahasiswa Bimbingan yang Membutuhkan Validasi</span>
                <span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">${pendingForMe.length}</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Persetujuan Anda akan meneruskan pengajuan ke Admin Laboran untuk alokasi kunci & alat.</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <th class="px-4 py-3">No. Booking</th>
                  <th class="px-4 py-3">Mahasiswa</th>
                  <th class="px-4 py-3">Laboratorium & Waktu</th>
                  <th class="px-4 py-3">Tujuan / Agenda</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Aksi Dosen</th>
                </tr>
              </thead>
              <tbody>
                ${pendingRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Full History of Supervised Students -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Semua Peminjaman di Bawah Bimbingan Anda</h3>
            <p class="text-xs text-slate-500 mt-0.5">Pantau seluruh riwayat penggunaan laboratorium oleh mahasiswa tugas akhir / praktikum Anda.</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <th class="px-4 py-3">No. Booking</th>
                  <th class="px-4 py-3">Mahasiswa</th>
                  <th class="px-4 py-3">Laboratorium</th>
                  <th class="px-4 py-3">Tanggal</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${allMyStudentsRows}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  async approveStudentBooking(id) {
    const notes = prompt('Catatan persetujuan dosen pembimbing (opsional):', 'Disetujui pembimbing. Topik riset telah sesuai rencana skripsi.');
    if (notes === null) return;

    try {
      const res = await Api.bookings.updateStatus(id, 'approve_dosen', notes);
      Toast.success(res.message || 'Peminjaman disetujui dosen!');
      App.refreshCurrentView();
    } catch (err) {
      Toast.error(err.message || 'Gagal memproses validasi dosen');
    }
  },

  async rejectStudentBooking(id) {
    const notes = prompt('Alasan penolakan bimbingan:', 'Proposal riset belum lengkap, silakan konsultasi terlebih dahulu.');
    if (notes === null) return;

    try {
      const res = await Api.bookings.updateStatus(id, 'reject_dosen', notes);
      Toast.warning(res.message || 'Peminjaman ditolak dosen.');
      App.refreshCurrentView();
    } catch (err) {
      Toast.error(err.message || 'Gagal menolak peminjaman');
    }
  }
};

window.DosenDashboard = DosenDashboard;
