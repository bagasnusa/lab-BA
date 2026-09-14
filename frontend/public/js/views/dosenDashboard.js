const DosenDashboard = {
  activeTab: 'validasi', // 'validasi', 'bimbingan', 'penguji'

  async render() {
    const user = Api.getUser() || { name: 'Dr. Hendra Gunawan, S.Kom., M.T.', nip: '197805122003121001' };
    
    let myStudentBookings = [];
    let mySupervision = [];
    let myExamsAsExaminer = [];

    try {
      const [bookRes, supRes, examRes] = await Promise.allSettled([
        Api.bookings.getAll({ dosenId: user.id }),
        Api.thesis.getMySupervision(),
        Api.thesis.getMyExamsAsExaminer()
      ]);
      if (bookRes.status === 'fulfilled') myStudentBookings = bookRes.value?.data || [];
      if (supRes.status === 'fulfilled') mySupervision = supRes.value?.data || [];
      if (examRes.status === 'fulfilled') myExamsAsExaminer = examRes.value?.data || [];
    } catch (e) {
      console.error('Error loading dosen dashboard data:', e);
    }

    const pendingForMe = myStudentBookings.filter(b => b.status === 'menunggu_dosen');

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Welcome Header Dosen -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider">
              👨‍🏫 Portal Dosen Pembimbing & Penguji
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang, ${user.name} 👋
            </h1>
            <p class="text-xs sm:text-sm text-indigo-100/80">
              NIP: ${user.nip || '-'} • Bidang: ${user.bidang || 'Kecerdasan Buatan & Sistem Cerdas'}
            </p>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="px-3.5 py-1.5 bg-white/10 text-white rounded-xl text-xs font-bold border border-white/20">
              ${mySupervision.length} Mahasiswa Bimbingan
            </span>
            <span class="px-3.5 py-1.5 bg-white/10 text-white rounded-xl text-xs font-bold border border-white/20">
              ${myExamsAsExaminer.length} Jadwal Sidang
            </span>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">⏳</div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Izin Lab Pending</div>
              <div class="text-2xl font-extrabold text-slate-900">${pendingForMe.length}</div>
              <div class="text-[11px] text-amber-600 font-medium">Perlu rekomendasi Anda</div>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xl">🎓</div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mahasiswa Bimbingan</div>
              <div class="text-2xl font-extrabold text-slate-900">${mySupervision.length}</div>
              <div class="text-[11px] text-sky-600 font-medium">Pembimbing 1 & 2</div>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">📅</div>
            <div>
              <div class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sidang sbg Penguji</div>
              <div class="text-2xl font-extrabold text-slate-900">${myExamsAsExaminer.length}</div>
              <div class="text-[11px] text-purple-600 font-medium">Proposal & Skripsi</div>
            </div>
          </div>
        </div>

        <!-- Section 1: Mahasiswa Bimbingan & Permohonan Pembimbing -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-base font-bold text-slate-900">Mahasiswa Bimbingan & Permohonan Pembimbing Skripsi</h3>
              <p class="text-xs text-slate-500">Tinjau permohonan menjadi pembimbing atau pantau mahasiswa yang aktif dibimbing</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                ${mySupervision.filter(s => s.statusSaya === 'menunggu').length} Permohonan Menunggu
              </span>
              <span class="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full">
                ${mySupervision.filter(s => s.statusSaya === 'disetujui').length} Aktif
              </span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <th class="px-5 py-3.5">Mahasiswa</th>
                  <th class="px-5 py-3.5">NIM & Program Studi</th>
                  <th class="px-5 py-3.5">Peran Bimbingan</th>
                  <th class="px-5 py-3.5">Judul Skripsi</th>
                  <th class="px-5 py-3.5">Respon Anda</th>
                  <th class="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${mySupervision.length > 0 ? mySupervision.map(s => `
                  <tr class="hover:bg-slate-50 text-xs border-b border-slate-100">
                    <td class="px-5 py-4 font-bold text-slate-900">${s.mahasiswaName}</td>
                    <td class="px-5 py-4 font-mono text-slate-600">${s.mahasiswaNim} • ${s.mahasiswaJurusan || '-'}</td>
                    <td class="px-5 py-4">
                      <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        s.peran === 'Pembimbing 1' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }">
                        ${s.peran}
                      </span>
                    </td>
                    <td class="px-5 py-4 max-w-xs text-slate-700 font-medium leading-relaxed">
                      "${s.judul_skripsi || 'Judul belum didaftarkan'}"
                    </td>
                    <td class="px-5 py-4">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        s.statusSaya === 'disetujui' ? 'bg-emerald-100 text-emerald-800' :
                        s.statusSaya === 'menunggu' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }">
                        ${s.statusSaya === 'disetujui' ? '✓ Disetujui' : s.statusSaya === 'menunggu' ? '⏳ Menunggu Respon' : '✕ Ditolak'}
                      </span>
                    </td>
                    <td class="px-5 py-4 text-right">
                      ${s.statusSaya === 'menunggu' ? `
                        <div class="flex items-center justify-end gap-1.5">
                          <button onclick="DosenDashboard.respondSupervision('${s.id}', 'approve')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow-2xs text-[11px] flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            Terima
                          </button>
                          <button onclick="DosenDashboard.respondSupervision('${s.id}', 'reject')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition text-[11px]">
                            Tolak
                          </button>
                        </div>
                      ` : `
                        ${s.mahasiswaPhone ? `
                          <a href="https://wa.me/${s.mahasiswaPhone.replace(/[^0-9]/g, '')}" target="_blank" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1 text-[11px] transition">
                            WhatsApp
                          </a>
                        ` : '<span class="text-slate-400 text-[11px]">-</span>'}
                      `}
                    </td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="6" class="text-center py-8 text-xs text-slate-400">Belum ada mahasiswa bimbingan yang ditugaskan atau mengajukan ke Anda.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>


        <!-- Section 2: Jadwal Sidang (Sebagai Penguji) -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900">Jadwal Sidang & Ujian (Sebagai Dewan Penguji)</h3>
              <p class="text-xs text-slate-500">Daftar agenda sidang skripsi mahasiswa yang harus Anda uji</p>
            </div>
            <span class="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">${myExamsAsExaminer.length} Agenda</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <th class="px-5 py-3.5">Jenis Sidang</th>
                  <th class="px-5 py-3.5">Mahasiswa Teruji</th>
                  <th class="px-5 py-3.5">Waktu & Tanggal</th>
                  <th class="px-5 py-3.5">Ruangan Lab</th>
                  <th class="px-5 py-3.5">Dewan Penguji</th>
                  <th class="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                ${myExamsAsExaminer.length > 0 ? myExamsAsExaminer.map(ex => `
                  <tr class="hover:bg-slate-50 text-xs border-b border-slate-100">
                    <td class="px-5 py-4 font-bold text-indigo-900">${ex.jenisLabel}</td>
                    <td class="px-5 py-4">
                      <div class="font-bold text-slate-900">${ex.mahasiswaName}</div>
                      <div class="text-[11px] font-mono text-slate-500">${ex.mahasiswaNim}</div>
                    </td>
                    <td class="px-5 py-4 text-slate-700">
                      <div class="font-semibold">${ex.tanggalFormatted || ex.tanggal}</div>
                      <div class="text-[11px] text-slate-500">${ex.jamMulai} - ${ex.jamSelesai} WIB</div>
                    </td>
                    <td class="px-5 py-4 font-bold text-sky-700">${ex.ruangan}</td>
                    <td class="px-5 py-4">
                      <div class="space-y-1">
                        ${ex.penguji.map(p => `
                          <div class="text-[11px] ${p.dosenName === user.name ? 'font-bold text-indigo-700' : 'text-slate-600'}">
                            • ${p.dosenName} ${p.dosenName === user.name ? '(Anda)' : ''}
                          </div>
                        `).join('')}
                      </div>
                    </td>
                    <td class="px-5 py-4">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        ex.status === 'mendatang' ? 'bg-amber-100 text-amber-800' :
                        ex.status === 'selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }">
                        ${ex.status}
                      </span>
                    </td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="6" class="text-center py-8 text-xs text-slate-400">Tidak ada agenda pengujian sidang untuk Anda saat ini.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Validasi Rekomendasi Peminjaman Lab (Original) -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900">Validasi Pengajuan Peminjaman Lab Mahasiswa</h3>
              <p class="text-xs text-slate-500">Berikan rekomendasi persetujuan untuk pengajuan lab oleh mahasiswa</p>
            </div>
            <span class="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">${pendingForMe.length} Menunggu</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <th class="px-4 py-3">No. Booking</th>
                  <th class="px-4 py-3">Mahasiswa</th>
                  <th class="px-4 py-3">Lab & Jadwal</th>
                  <th class="px-4 py-3">Keperluan</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${pendingForMe.length > 0 ? pendingForMe.map(b => `
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
                    <td class="px-4 py-3.5 max-w-xs text-slate-600 truncate" title="${b.purpose}">
                      ${b.purpose}
                    </td>
                    <td class="px-4 py-3.5">
                      <span class="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">Menunggu Anda</span>
                    </td>
                    <td class="px-4 py-3.5 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button onclick="DosenDashboard.approveStudentBooking('${b.id}')" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition shadow-2xs flex items-center gap-1">
                          Setujui
                        </button>
                        <button onclick="DosenDashboard.rejectStudentBooking('${b.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition">
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="6" class="text-center py-6 text-xs text-slate-400">Semua pengajuan bimbingan telah divalidasi.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  async respondSupervision(assignmentId, action) {
    const actionText = action === 'approve' ? 'menyetujui menjadi pembimbing' : 'menolak permohonan bimbingan';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} untuk mahasiswa ini?`)) return;

    try {
      const res = await Api.thesis.respondSupervision(assignmentId, action);
      Toast.success(res.message || 'Respon berhasil disimpan!');
      App.handleRouting();
    } catch (err) {
      Toast.error(err.message || 'Gagal menyimpan respon bimbingan.');
    }
  },

  async approveStudentBooking(bookingId) {
    try {
      await Api.bookings.updateStatus(bookingId, 'approve_dosen', 'Disetujui oleh dosen pembimbing.');
      Toast.success('Rekomendasi berhasil diberikan! Pengajuan diteruskan ke Admin Laboran.');
      App.handleRouting();
    } catch (err) {
      Toast.error(err.message || 'Gagal menyetujui pengajuan.');
    }
  },

  async rejectStudentBooking(bookingId) {
    const reason = prompt('Masukkan alasan penolakan pengajuan lab ini:');
    if (reason === null) return;
    try {
      await Api.bookings.updateStatus(bookingId, 'reject_dosen', reason || 'Ditolak oleh dosen pembimbing.');
      Toast.info('Pengajuan peminjaman ditolak.');
      App.handleRouting();
    } catch (err) {
      Toast.error(err.message || 'Gagal menolak pengajuan.');
    }
  }
};


window.DosenDashboard = DosenDashboard;
