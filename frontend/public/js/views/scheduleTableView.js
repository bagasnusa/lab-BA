const ScheduleTableView = {
  currentFilterLab: 'all',
  currentFilterStatus: 'all',
  currentSearch: '',

  async render() {
    const user = Api.getUser();
    let bookings = [];
    let labs = [];

    try {
      const [bookingsRes, labsRes] = await Promise.all([
        Api.bookings.getAll({
          labId: this.currentFilterLab,
          status: this.currentFilterStatus,
          search: this.currentSearch
        }),
        Api.labs.getAll()
      ]);
      bookings = bookingsRes.data || [];
      labs = labsRes.data || [];
    } catch (e) {
      console.error('Error loading schedule table data:', e);
    }

    const labOptions = labs.map(l => `
      <option value="${l.id}" ${this.currentFilterLab === l.id ? 'selected' : ''}>${l.name}</option>
    `).join('');

    const rowsHtml = bookings.length > 0 ? bookings.map(b => {
      let statusBadge = '';
      if (b.status === 'disetujui_admin') {
        statusBadge = '<span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">Disetujui Admin</span>';
      } else if (b.status === 'menunggu_dosen') {
        statusBadge = '<span class="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold">Menunggu Dosen</span>';
      } else if (b.status === 'menunggu_admin') {
        statusBadge = '<span class="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full text-[11px] font-bold">Menunggu Admin</span>';
      } else if (b.status === 'sedang_berlangsung') {
        statusBadge = '<span class="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-[11px] font-bold">Sedang Berlangsung</span>';
      } else if (b.status === 'selesai') {
        statusBadge = '<span class="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[11px] font-bold">Selesai</span>';
      } else if (b.status.includes('ditolak')) {
        statusBadge = `<span class="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[11px] font-bold">${b.status.replace('_', ' ')}</span>`;
      } else {
        statusBadge = `<span class="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[11px] font-bold">${b.status}</span>`;
      }

      return `
        <tr class="hover:bg-slate-50/80 transition text-xs border-b border-slate-100">
          <td class="px-4 py-3.5 font-mono font-bold text-sky-700">${b.bookingCode || b.id}</td>
          <td class="px-4 py-3.5">
            <div class="font-bold text-slate-900">${b.userName}</div>
            <div class="text-[11px] text-slate-500 font-mono">${b.userNim}</div>
          </td>
          <td class="px-4 py-3.5">
            <div class="font-semibold text-slate-800">${b.labName}</div>
          </td>
          <td class="px-4 py-3.5">
            <div class="font-medium text-slate-800">${b.date}</div>
            <div class="text-[11px] text-slate-500">${b.timeSlot}</div>
          </td>
          <td class="px-4 py-3.5 max-w-xs truncate text-slate-600" title="${b.purpose}">
            ${b.purpose}
          </td>
          <td class="px-4 py-3.5">
            <span class="text-slate-700">${b.dosenName || '-'}</span>
          </td>
          <td class="px-4 py-3.5 text-center">
            ${statusBadge}
          </td>
          <td class="px-4 py-3.5 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="ScheduleTableView.viewTicket('${b.id}')" class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg transition border border-sky-200" title="Buka E-Ticket Digital">
                🎫 E-Ticket
              </button>
              ${user?.role === 'admin' ? `
                <button onclick="ScheduleTableView.openAdminActions('${b.id}')" class="p-1 text-slate-400 hover:text-slate-800 rounded">
                  ⚙️
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('') : `
      <tr>
        <td colspan="8" class="text-center py-10 text-xs text-slate-400">
          Tidak ditemukan data peminjaman yang cocok dengan filter.
        </td>
      </tr>
    `;

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <!-- Top Title & Action Bar (Figma Matched) -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Pusat Data & Penjadwalan</div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen & Jadwal Peminjaman Lab</h1>
            <p class="text-xs text-slate-500 mt-1">Daftar lengkap seluruh agenda pemakaian laboratorium komputer fakultas.</p>
          </div>

          <div class="flex items-center gap-2.5">
            <button onclick="ScheduleTableView.exportCSV()" class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition flex items-center gap-1.5">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Ekspor CSV
            </button>
            <button onclick="App.navigate('booking')" class="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              + Buat Peminjaman Baru
            </button>
          </div>
        </div>

        <!-- Filter & Search Controls (Figma Matched) -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          <!-- Search Bar -->
          <div class="w-full md:w-80 relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input type="text" id="search-table-input" value="${this.currentSearch}" placeholder="Cari nama peminjam / NIM / keperluan..." onkeyup="ScheduleTableView.handleSearch(event)" class="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none">
          </div>

          <!-- Filter Dropdowns -->
          <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            <!-- Lab Filter -->
            <div class="flex items-center gap-1.5 text-xs">
              <span class="text-slate-500 font-medium">Lab:</span>
              <select id="filter-lab-select" onchange="ScheduleTableView.handleLabFilter(this.value)" class="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none">
                <option value="all">Semua Laboratorium</option>
                ${labOptions}
              </select>
            </div>

            <!-- Status Filter -->
            <div class="flex items-center gap-1.5 text-xs">
              <span class="text-slate-500 font-medium">Status:</span>
              <select id="filter-status-select" onchange="ScheduleTableView.handleStatusFilter(this.value)" class="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none">
                <option value="all" ${this.currentFilterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
                <option value="menunggu_dosen" ${this.currentFilterStatus === 'menunggu_dosen' ? 'selected' : ''}>Menunggu Dosen</option>
                <option value="menunggu_admin" ${this.currentFilterStatus === 'menunggu_admin' ? 'selected' : ''}>Menunggu Admin</option>
                <option value="disetujui_admin" ${this.currentFilterStatus === 'disetujui_admin' ? 'selected' : ''}>Disetujui Admin</option>
                <option value="sedang_berlangsung" ${this.currentFilterStatus === 'sedang_berlangsung' ? 'selected' : ''}>Sedang Berlangsung</option>
                <option value="selesai" ${this.currentFilterStatus === 'selesai' ? 'selected' : ''}>Selesai</option>
              </select>
            </div>

          </div>

        </div>

        <!-- Rich Data Table (Figma Matched) -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <th class="px-4 py-3.5">ID / Kode</th>
                  <th class="px-4 py-3.5">Peminjam</th>
                  <th class="px-4 py-3.5">Laboratorium</th>
                  <th class="px-4 py-3.5">Tanggal & Sesi</th>
                  <th class="px-4 py-3.5">Tujuan / Riset</th>
                  <th class="px-4 py-3.5">Dosen Pembimbing</th>
                  <th class="px-4 py-3.5 text-center">Status</th>
                  <th class="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>Menampilkan <strong>${bookings.length}</strong> data peminjaman</div>
            <div class="font-mono text-[11px]">LAB ILKOM Real-Time Database</div>
          </div>
        </div>

      </div>
    `;
  },

  handleSearch(e) {
    this.currentSearch = e.target.value.trim();
    if (e.key === 'Enter' || this.currentSearch === '') {
      App.refreshCurrentView();
    }
  },

  handleLabFilter(labId) {
    this.currentFilterLab = labId;
    App.refreshCurrentView();
  },

  handleStatusFilter(status) {
    this.currentFilterStatus = status;
    App.refreshCurrentView();
  },

  async viewTicket(id) {
    try {
      const res = await Api.bookings.getById(id);
      if (res.data) {
        QRModal.renderModal(res.data);
      }
    } catch (err) {
      Toast.error('Gagal memuat tiket: ' + err.message);
    }
  },

  openAdminActions(id) {
    const action = prompt('Pilih Aksi Admin (ketik salah satu): \n1. selesai (Tandai Selesai)\n2. check_in (Tandai Check-in)\n3. approve_admin (Setujui)\n4. hapus (Hapus Data)');
    if (!action) return;

    if (action === 'selesai' || action === 'check_in' || action === 'approve_admin') {
      Api.bookings.updateStatus(id, action).then(() => {
        Toast.success('Status peminjaman diperbarui.');
        App.refreshCurrentView();
      }).catch(err => Toast.error(err.message));
    } else if (action === 'hapus') {
      if (confirm('Yakin ingin menghapus peminjaman ini?')) {
        Api.bookings.delete(id).then(() => {
          Toast.success('Data peminjaman dihapus.');
          App.refreshCurrentView();
        }).catch(err => Toast.error(err.message));
      }
    }
  },

  async exportCSV() {
    try {
      const res = await Api.bookings.getAll({ status: 'all' });
      const data = res.data || [];
      if (data.length === 0) return Toast.info('Tidak ada data untuk diekspor.');

      let csv = 'Kode Booking,Peminjam,NIM,Laboratorium,Tanggal,Sesi,Keperluan,Dosen Pembimbing,Status\n';
      data.forEach(b => {
        csv += `"${b.bookingCode || b.id}","${b.userName}","${b.userNim}","${b.labName}","${b.date}","${b.timeSlot}","${b.purpose.replace(/"/g, '""')}","${b.dosenName || ''}","${b.status}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Jadwal_Peminjaman_Lab_Ilkom_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      Toast.success('File CSV berhasil diunduh!');
    } catch (e) {
      Toast.error('Gagal ekspor: ' + e.message);
    }
  }
};

window.ScheduleTableView = ScheduleTableView;
