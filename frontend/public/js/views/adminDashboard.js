const AdminDashboard = {
  currentTab: 'pembimbing', // 'pembimbing', 'ujian', 'peminjaman'

  async render() {
    let stats = null;
    let pendingBookings = [];
    let labs = [];
    let supervisors = [];
    let exams = [];
    let students = [];
    let lecturers = [];

    try {
      const [statsRes, bookRes, labRes, supRes, examRes, mhsRes, dsnRes] = await Promise.allSettled([
        Api.stats.getDashboard(),
        Api.bookings.getAll({ status: 'all' }),
        Api.labs.getAll(),
        Api.thesis.getAllSupervisors(),
        Api.thesis.getAllExams(),
        Api.thesis.getStudents(),
        Api.thesis.getLecturers()
      ]);

      if (statsRes.status === 'fulfilled') stats = statsRes.value?.data?.overview;
      if (bookRes.status === 'fulfilled') {
        const allBookings = bookRes.value?.data || [];
        pendingBookings = allBookings.filter(b => b.status === 'menunggu_admin');
      }
      if (labRes.status === 'fulfilled') labs = labRes.value?.data || [];
      if (supRes.status === 'fulfilled') supervisors = supRes.value?.data || [];
      if (examRes.status === 'fulfilled') exams = examRes.value?.data || [];
      if (mhsRes.status === 'fulfilled') students = mhsRes.value?.data || [];
      if (dsnRes.status === 'fulfilled') lecturers = dsnRes.value?.data || [];

      // Cache for modals
      AdminDashboard.cachedStudents = students;
      AdminDashboard.cachedLecturers = lecturers;
      AdminDashboard.cachedSupervisors = supervisors;
      AdminDashboard.cachedExams = exams;
    } catch (e) {
      console.error('Error loading admin dashboard data:', e);
    }

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Header Panel Admin Sesuai Mockup Sidebar Lab BA Portal -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-700 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/30 text-sky-200 rounded-full text-xs font-bold uppercase tracking-wider">
              🏛️ Lab BA Portal — Academic & Lab Management
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Portal Akademik & Laboran TI Polinema
            </h1>
            <p class="text-xs sm:text-sm text-sky-100/80">
              Kelola pembagian dosen pembimbing, penjadwalan ujian skripsi, dan persetujuan penggunaan ruang lab.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="AdminDashboard.openAssignSupervisorModal()" class="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              + Pembagian Pembimbing
            </button>
            <button onclick="AdminDashboard.openCreateExamModal()" class="px-4 py-2.5 bg-white text-slate-900 hover:bg-sky-50 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5">
              <svg class="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              + Jadwal Ujian
            </button>
          </div>
        </div>

        <!-- Navigation Tabs Sesuai Mockup Sidebar -->
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button onclick="AdminDashboard.switchTab('pembimbing')" class="px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            AdminDashboard.currentTab === 'pembimbing' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Pembagian Pembimbing (${supervisors.length})
          </button>
          <button onclick="AdminDashboard.switchTab('ujian')" class="px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            AdminDashboard.currentTab === 'ujian' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Jadwal Ujian Skripsi (${exams.length})
          </button>
          <button onclick="AdminDashboard.switchTab('peminjaman')" class="px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            AdminDashboard.currentTab === 'peminjaman' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Peminjaman Lab (${pendingBookings.length} Pending)
          </button>
        </div>

        <!-- TAB 1: PEMBAGIAN PEMBIMBING 1 & 2 -->
        ${AdminDashboard.currentTab === 'pembimbing' ? `
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-base font-bold text-slate-900">Data Pembagian Pembimbing Skripsi Mahasiswa</h3>
                <p class="text-xs text-slate-500">Penugasan Pembimbing 1 dan Pembimbing 2 oleh Program Studi</p>
              </div>
              <button onclick="AdminDashboard.openAssignSupervisorModal()" class="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm transition">
                + Tugaskan Pembimbing Baru
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                    <th class="px-5 py-3.5">Mahasiswa</th>
                    <th class="px-5 py-3.5">Judul Skripsi</th>
                    <th class="px-5 py-3.5">Pembimbing 1</th>
                    <th class="px-5 py-3.5">Pembimbing 2</th>
                    <th class="px-5 py-3.5">Status</th>
                    <th class="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${supervisors.length > 0 ? supervisors.map(s => `
                    <tr class="hover:bg-slate-50 text-xs border-b border-slate-100">
                      <td class="px-5 py-4">
                        <div class="font-bold text-slate-900">${s.mahasiswaName}</div>
                        <div class="text-[11px] font-mono text-slate-500">${s.mahasiswaNim} • ${s.mahasiswaJurusan || '-'}</div>
                      </td>
                      <td class="px-5 py-4 max-w-xs truncate text-slate-700 font-medium" title="${s.judul_skripsi || ''}">
                        ${s.judul_skripsi || '<span class="text-slate-400 italic">Belum ada judul</span>'}
                      </td>
                      <td class="px-5 py-4">
                        <div class="font-bold text-sky-900">${s.pembimbing1Name}</div>
                        <div class="text-[10px] text-slate-400">${s.pembimbing1Bidang || '-'}</div>
                      </td>
                      <td class="px-5 py-4">
                        ${s.pembimbing2Name ? `
                          <div class="font-bold text-indigo-900">${s.pembimbing2Name}</div>
                          <div class="text-[10px] text-slate-400">${s.pembimbing2Bidang || '-'}</div>
                        ` : '<span class="text-slate-400 italic">Belum ditentukan</span>'}
                      </td>
                      <td class="px-5 py-4">
                        <div class="space-y-1">
                          <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            s.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' :
                            s.status === 'diajukan' ? 'bg-amber-100 text-amber-800' :
                            s.status === 'ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }">
                            ${s.status}
                          </span>
                          <div class="text-[10px] text-slate-500 font-mono">
                            P1: <strong class="${s.status_p1 === 'disetujui' ? 'text-emerald-600' : s.status_p1 === 'ditolak' ? 'text-rose-600' : 'text-amber-600'}">${s.status_p1 || '-'}</strong>
                            ${s.pembimbing2Id ? ` | P2: <strong class="${s.status_p2 === 'disetujui' ? 'text-emerald-600' : s.status_p2 === 'ditolak' ? 'text-rose-600' : 'text-amber-600'}">${s.status_p2 || '-'}</strong>` : ''}
                          </div>
                        </div>
                      </td>

                      <td class="px-5 py-4 text-right">
                        <button onclick="AdminDashboard.deleteSupervisor('${s.id}')" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus Penugasan">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr><td colspan="6" class="text-center py-8 text-xs text-slate-400">Belum ada data pembagian pembimbing.</td></tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- TAB 2: JADWAL UJIAN SKRIPSI -->
        ${AdminDashboard.currentTab === 'ujian' ? `
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-base font-bold text-slate-900">Jadwal Ujian Skripsi & Sidang Tugas Akhir</h3>
                <p class="text-xs text-slate-500">Jadwal pelaksanaan ujian, alokasi ruangan lab, dan dewan penguji</p>
              </div>
              <button onclick="AdminDashboard.openCreateExamModal()" class="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm transition">
                + Buat Jadwal Sidang
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                    <th class="px-5 py-3.5">Jenis Sidang</th>
                    <th class="px-5 py-3.5">Mahasiswa</th>
                    <th class="px-5 py-3.5">Jadwal Pelaksanaan</th>
                    <th class="px-5 py-3.5">Ruangan Lab</th>
                    <th class="px-5 py-3.5">Dewan Penguji</th>
                    <th class="px-5 py-3.5">Status</th>
                    <th class="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${exams.length > 0 ? exams.map(ex => `
                    <tr class="hover:bg-slate-50 text-xs border-b border-slate-100">
                      <td class="px-5 py-4 font-bold text-indigo-900">${ex.jenisLabel}</td>
                      <td class="px-5 py-4">
                        <div class="font-bold text-slate-900">${ex.mahasiswaName}</div>
                        <div class="text-[11px] font-mono text-slate-500">${ex.mahasiswaNim}</div>
                      </td>
                      <td class="px-5 py-4">
                        <div class="font-semibold text-slate-800">${ex.tanggalFormatted || ex.tanggal}</div>
                        <div class="text-[11px] text-slate-500 font-mono">${ex.jamMulai} - ${ex.jamSelesai} WIB</div>
                      </td>
                      <td class="px-5 py-4 font-bold text-sky-700">${ex.ruangan}</td>
                      <td class="px-5 py-4">
                        <div class="space-y-1">
                          ${ex.penguji.map(p => `
                            <div class="text-[11px] text-slate-700 font-medium">• ${p.dosenName}</div>
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
                      <td class="px-5 py-4 text-right">
                        <button onclick="AdminDashboard.deleteExam('${ex.id}')" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus Jadwal">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr><td colspan="7" class="text-center py-8 text-xs text-slate-400">Belum ada agenda jadwal ujian skripsi.</td></tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- TAB 3: PEMINJAMAN LAB (ORIGINAL ADMIN VIEW) -->
        ${AdminDashboard.currentTab === 'peminjaman' ? `
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-slate-900">Peminjaman Lab Menunggu Persetujuan Admin</h3>
                <p class="text-xs text-slate-500">Validasi alokasi ruangan dan kesiapan peralatan lab komputer</p>
              </div>
              <span class="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">${pendingBookings.length} Permintaan</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                    <th class="px-4 py-3">No. Booking</th>
                    <th class="px-4 py-3">Peminjam</th>
                    <th class="px-4 py-3">Lab & Sesi</th>
                    <th class="px-4 py-3">Keperluan</th>
                    <th class="px-4 py-3">Pembimbing</th>
                    <th class="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingBookings.length > 0 ? pendingBookings.map(b => `
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
                      <td class="px-4 py-3.5 max-w-xs truncate text-slate-600" title="${b.purpose}">${b.purpose}</td>
                      <td class="px-4 py-3.5 text-indigo-700 font-medium">${b.dosenName || '-'}</td>
                      <td class="px-4 py-3.5 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                          <button onclick="AdminDashboard.approveBooking('${b.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow-2xs flex items-center gap-1">
                            Setujui
                          </button>
                          <button onclick="AdminDashboard.rejectBooking('${b.id}')" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition">
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr><td colspan="6" class="text-center py-8 text-xs text-slate-400">Tidak ada permohonan peminjaman yang menunggu verifikasi saat ini.</td></tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

      </div>
    `;
  },

  switchTab(tab) {
    this.currentTab = tab;
    App.handleRouting();
  },

  // Modal: Assign Pembimbing Baru
  openAssignSupervisorModal() {
    const students = this.cachedStudents || [];
    const lecturers = this.cachedLecturers || [];

    const modalHtml = `
      <div id="modal-backdrop" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in border border-slate-100">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-lg">Tugaskan Pembimbing Skripsi</h3>
              <p class="text-xs text-slate-500">Tentukan Pembimbing 1 dan Pembimbing 2 untuk mahasiswa</p>
            </div>
            <button onclick="document.getElementById('modal-backdrop').remove()" class="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">✕</button>
          </div>

          <form id="form-assign-supervisor" onsubmit="AdminDashboard.submitAssignSupervisor(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Pilih Mahasiswa *</label>
              <select name="mahasiswaId" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                <option value="">-- Pilih Mahasiswa --</option>
                ${students.map(m => `<option value="${m.id}">${m.name} (${m.nim})</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Judul Skripsi / Proposal</label>
              <textarea name="judulSkripsi" rows="2" placeholder="Contoh: Implementasi Deep Learning untuk Deteksi Objek..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900"></textarea>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Dosen Pembimbing 1 *</label>
              <select name="pembimbing1Id" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                <option value="">-- Pilih Dosen Pembimbing 1 --</option>
                ${lecturers.map(d => `<option value="${d.id}">${d.name} (${d.bidang || 'Dosen TI'})</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Dosen Pembimbing 2 (Opsional)</label>
              <select name="pembimbing2Id" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                <option value="">-- Tanpa Pembimbing 2 / Pilih Nanti --</option>
                ${lecturers.map(d => `<option value="${d.id}">${d.name} (${d.bidang || 'Dosen TI'})</option>`).join('')}
              </select>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="document.getElementById('modal-backdrop').remove()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl">Batal</button>
              <button type="submit" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md">Simpan Penugasan</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async submitAssignSupervisor(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      mahasiswaId: form.mahasiswaId.value,
      judulSkripsi: form.judulSkripsi.value,
      pembimbing1Id: form.pembimbing1Id.value,
      pembimbing2Id: form.pembimbing2Id.value || null
    };
    try {
      await Api.thesis.createSupervisor(data);
      Toast.success('Dosen pembimbing berhasil ditugaskan!');
      document.getElementById('modal-backdrop')?.remove();
      App.handleRouting();
    } catch (err) {
      Toast.error(err.message || 'Gagal menugaskan pembimbing.');
    }
  },

  async deleteSupervisor(id) {
    if (!confirm('Yakin ingin menghapus pembagian pembimbing ini?')) return;
    try {
      await Api.thesis.deleteSupervisor(id);
      Toast.info('Data pembagian pembimbing berhasil dihapus.');
      App.handleRouting();
    } catch (err) {
      Toast.error(err.message || 'Gagal menghapus data.');
    }
  },

  // Modal: Buat Jadwal Sidang Baru
  openCreateExamModal() {
    const students = this.cachedStudents || [];
    const lecturers = this.cachedLecturers || [];

    const modalHtml = `
      <div id="modal-backdrop-exam" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in border border-slate-100 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-lg">Buat Jadwal Ujian Skripsi</h3>
              <p class="text-xs text-slate-500">Jadwalkan sidang ujian dan tentukan dosen penguji</p>
            </div>
            <button onclick="document.getElementById('modal-backdrop-exam').remove()" class="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">✕</button>
          </div>

          <form id="form-create-exam" onsubmit="AdminDashboard.submitCreateExam(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Pilih Mahasiswa Teruji *</label>
              <select name="mahasiswaId" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                <option value="">-- Pilih Mahasiswa --</option>
                ${students.map(m => `<option value="${m.id}">${m.name} (${m.nim})</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Jenis Sidang *</label>
                <select name="jenisUjian" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                  <option value="proposal">Sidang Proposal Skripsi</option>
                  <option value="seminar_hasil">Seminar Hasil (Semhas)</option>
                  <option value="sidang_skripsi">Sidang Akhir Skripsi</option>
                  <option value="komprehensif">Ujian Komprehensif</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Tanggal *</label>
                <input type="date" name="tanggal" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900" value="${new Date().toISOString().split('T')[0]}">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Jam Mulai *</label>
                <input type="time" name="jamMulai" required value="09:00" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Jam Selesai *</label>
                <input type="time" name="jamSelesai" required value="10:30" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Ruangan Lab *</label>
              <input type="text" name="ruangan" required value="Ruang Sidang Lab TI Lt. 6" placeholder="Contoh: Ruang Lab RPL Lt. 6 / Ruang Sidang BA" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Pilih Dewan Dosen Penguji *</label>
              <div class="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                ${lecturers.map(d => `
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="pengujiIds" value="${d.id}" class="rounded text-sky-600 focus:ring-sky-500">
                    <span class="font-medium text-slate-800">${d.name}</span>
                  </label>
                `).join('')}
              </div>
              <p class="text-[10px] text-slate-400 mt-1">Centang minimal 1-2 dosen penguji.</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
              <input type="text" name="catatan" placeholder="Contoh: Wajib bawa printout proposal 3 rangkap" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="document.getElementById('modal-backdrop-exam').remove()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl">Batal</button>
              <button type="submit" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md">Simpan Jadwal Sidang</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async submitCreateExam(e) {
    e.preventDefault();
    const form = e.target;
    const checkboxes = form.querySelectorAll('input[name="pengujiIds"]:checked');
    const pengujiIds = Array.from(checkboxes).map(cb => cb.value);

    const data = {
      mahasiswaId: form.mahasiswaId.value,
      jenisUjian: form.jenisUjian.value,
      tanggal: form.tanggal.value,
      jamMulai: form.jamMulai.value,
      jamSelesai: form.jamSelesai.value,
      ruangan: form.ruangan.value,
      catatan: form.catatan.value || null,
      pengujiIds: pengujiIds
    };

    try {
      await Api.thesis.createExam(data);
      Toast.success('Jadwal sidang ujian skripsi berhasil diterbitkan!');
      document.getElementById('modal-backdrop-exam')?.remove();
      App.handleRouting();
    } catch (err) {
      Toast.error(err.message || 'Gagal menyimpan jadwal ujian.');
    }
  },

  async deleteExam(id) {
    if (!confirm('Yakin ingin membatalkan & menghapus jadwal sidang ini?')) return;
    try {
      await Api.thesis.deleteExam(id);
      Toast.info('Jadwal sidang berhasil dihapus.');
      App.handleRouting();
    } catch (err) {
      Toast.error(err.message || 'Gagal menghapus jadwal.');
    }
  },

  // Existing booking actions
  async approveBooking(id) {
    try {
      await Api.bookings.updateStatus(id, 'approve_admin', 'Disetujui oleh Laboran.');
      Toast.success('Peminjaman lab telah disetujui!');
      App.handleRouting();
    } catch (err) {
      Toast.error(err.message || 'Gagal menyetujui peminjaman.');
    }
  },

  async rejectBooking(id) {
    const reason = prompt('Masukkan alasan penolakan:');
    if (reason === null) return;
    try {
      await Api.bookings.updateStatus(id, 'reject_admin', reason || 'Ditolak oleh Laboran.');
      Toast.info('Peminjaman telah ditolak.');
      App.handleRouting();
    } catch (err) {
      Toast.error(err.message || 'Gagal menolak.');
    }
  }
};

window.AdminDashboard = AdminDashboard;
