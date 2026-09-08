const MahasiswaDashboard = {
  async render() {
    const user = Api.getUser() || { name: 'Bagas Pratama', nim: '22051204001', jurusan: 'Teknik Informatika' };
    let myBookings = [];

    try {
      const res = await Api.bookings.getAll({ userId: user.id });
      myBookings = res.data || [];
    } catch (e) {
      console.error('Error loading mahasiswa dashboard data:', e);
    }

    const activeBooking = myBookings.find(b => ['disetujui_admin', 'sedang_berlangsung', 'menunggu_admin', 'menunggu_dosen'].includes(b.status)) || myBookings[0] || null;

    let ticketSectionHtml = '';

    if (activeBooking) {
      let statusStep1 = 'bg-emerald-500 text-white';
      let statusStep2 = 'bg-slate-200 text-slate-500';
      let statusStep3 = 'bg-slate-200 text-slate-500';
      let statusStep4 = 'bg-slate-200 text-slate-500';

      if (activeBooking.status === 'menunggu_dosen') {
        statusStep2 = 'bg-amber-500 text-white animate-pulse';
      } else if (activeBooking.status === 'menunggu_admin') {
        statusStep2 = 'bg-emerald-500 text-white';
        statusStep3 = 'bg-sky-500 text-white animate-pulse';
      } else if (activeBooking.status === 'disetujui_admin') {
        statusStep2 = 'bg-emerald-500 text-white';
        statusStep3 = 'bg-emerald-500 text-white';
        statusStep4 = 'bg-sky-600 text-white animate-pulse';
      } else if (activeBooking.status === 'sedang_berlangsung') {
        statusStep2 = 'bg-emerald-500 text-white';
        statusStep3 = 'bg-emerald-500 text-white';
        statusStep4 = 'bg-emerald-500 text-white';
      }

      ticketSectionHtml = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          <!-- Timeline Tracker Card (5 cols) -->
          <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-sm text-slate-900">Status Proses Izin Lab</h3>
                <span class="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">${activeBooking.bookingCode || activeBooking.id}</span>
              </div>

              <!-- Steps -->
              <div class="space-y-4 relative pl-3 border-l-2 border-slate-100 ml-3 text-xs">
                
                <div class="relative pl-5">
                  <div class="absolute -left-[19px] top-0 w-6 h-6 rounded-full ${statusStep1} flex items-center justify-center font-bold text-[10px]">1</div>
                  <div class="font-bold text-slate-800">Pengajuan Terkirim</div>
                  <p class="text-[11px] text-slate-500">Formulir berhasil diterima sistem</p>
                </div>

                <div class="relative pl-5">
                  <div class="absolute -left-[19px] top-0 w-6 h-6 rounded-full ${statusStep2} flex items-center justify-center font-bold text-[10px]">2</div>
                  <div class="font-bold text-slate-800">Validasi Dosen Pembimbing</div>
                  <p class="text-[11px] text-slate-500">${activeBooking.dosenName || 'Tanpa Pembimbing'}</p>
                </div>

                <div class="relative pl-5">
                  <div class="absolute -left-[19px] top-0 w-6 h-6 rounded-full ${statusStep3} flex items-center justify-center font-bold text-[10px]">3</div>
                  <div class="font-bold text-slate-800">Verifikasi Admin Laboran</div>
                  <p class="text-[11px] text-slate-500">Alokasi ruang & inventaris alat</p>
                </div>

                <div class="relative pl-5">
                  <div class="absolute -left-[19px] top-0 w-6 h-6 rounded-full ${statusStep4} flex items-center justify-center font-bold text-[10px]">4</div>
                  <div class="font-bold text-slate-800">Check-in & Masuk Lab</div>
                  <p class="text-[11px] text-slate-500">Tunjukkan QR E-Ticket di meja Laboran</p>
                </div>

              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500">Status Saat Ini:</span>
              <span class="font-bold ${activeBooking.status === 'disetujui_admin' ? 'text-emerald-600' : 'text-sky-600'} uppercase">${activeBooking.status.replace('_', ' ')}</span>
            </div>
          </div>

          <!-- Digital E-Ticket Card (7 cols - Figma Screen 7 Showcase) -->
          <div class="lg:col-span-7 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden border border-slate-800">
            
            <div class="absolute -right-12 -top-12 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              <div class="flex items-center justify-between pb-4 border-b border-slate-800">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-black text-white text-sm">L</div>
                  <div>
                    <div class="font-extrabold text-sm text-white tracking-wider">LAB TI POLINEMA</div>
                    <p class="text-[10px] text-sky-400 font-mono">Gedung Teknologi Informasi, Politeknik Negeri Malang</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  ${activeBooking.status === 'disetujui_admin' ? 'VALID & AKTIF' : 'DALAM PROSES'}
                </span>
              </div>

              <!-- Ticket Info Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center mt-5">
                
                <!-- Left Details (7 cols) -->
                <div class="sm:col-span-7 space-y-3">
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Laboratorium:</div>
                    <h3 class="font-extrabold text-base text-sky-300">${activeBooking.labName}</h3>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div class="text-[10px] text-slate-400">Tanggal:</div>
                      <div class="font-bold text-slate-200">${activeBooking.date}</div>
                    </div>
                    <div>
                      <div class="text-[10px] text-slate-400">Sesi Waktu:</div>
                      <div class="font-bold text-slate-200">${activeBooking.timeSlot}</div>
                    </div>
                  </div>

                  <div>
                    <div class="text-[10px] text-slate-400">Tujuan:</div>
                    <p class="text-xs text-slate-300 line-clamp-2">${activeBooking.purpose}</p>
                  </div>
                </div>

                <!-- Right QR Code (5 cols) -->
                <div class="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white text-slate-900 rounded-2xl shadow-md">
                  <div id="mhs-qr-preview" class="w-28 h-28 flex items-center justify-center">
                    <!-- QR inserted dynamically -->
                  </div>
                  <div class="font-mono text-[9px] font-bold text-slate-600 mt-1.5 text-center">
                    ${activeBooking.bookingCode || activeBooking.id}
                  </div>
                </div>

              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p class="text-[11px] text-slate-400 text-center sm:text-left">
                Tunjukkan barcode / QR ini kepada Laboran di pintu masuk.
              </p>
              <button onclick="QRModal.renderModal(${JSON.stringify(activeBooking).replace(/"/g, '&quot;')})" class="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                Buka & Cetak Surat Izin
              </button>
            </div>

          </div>

        </div>
      `;
    } else {
      ticketSectionHtml = `
        <div class="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
          <div class="w-16 h-16 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto text-3xl">
            🎓
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-800">Belum Ada Pengajuan Peminjaman Lab Aktif</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Ajukan peminjaman ruang lab atau peralatan riset untuk tugas akhir, praktikum, atau kompetisi.</p>
          </div>
          <button onclick="App.navigate('booking')" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm transition">
            + Buat Pengajuan Peminjaman Sekarang
          </button>
        </div>
      `;
    }

    const historyRows = myBookings.map(b => {
      let statusBadge = '';
      if (b.status === 'disetujui_admin') statusBadge = '<span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">Disetujui Admin</span>';
      else if (b.status === 'menunggu_dosen') statusBadge = '<span class="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">Menunggu Dosen</span>';
      else if (b.status === 'menunggu_admin') statusBadge = '<span class="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full text-[10px] font-bold">Menunggu Admin</span>';
      else if (b.status === 'sedang_berlangsung') statusBadge = '<span class="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">Sedang Berlangsung</span>';
      else if (b.status === 'selesai') statusBadge = '<span class="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">Selesai</span>';
      else statusBadge = `<span class="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">${b.status}</span>`;

      return `
        <tr class="hover:bg-slate-50 text-xs border-b border-slate-100">
          <td class="px-4 py-3.5 font-mono font-bold text-sky-700">${b.bookingCode || b.id}</td>
          <td class="px-4 py-3.5 font-semibold text-slate-800">${b.labName}</td>
          <td class="px-4 py-3.5 text-slate-600">${b.date} • ${b.timeSlot}</td>
          <td class="px-4 py-3.5 text-slate-600 max-w-xs truncate" title="${b.purpose}">${b.purpose}</td>
          <td class="px-4 py-3.5">${statusBadge}</td>
          <td class="px-4 py-3.5 text-right">
            <button onclick="QRModal.renderModal(${JSON.stringify(b).replace(/"/g, '&quot;')})" class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg border border-sky-200 text-[11px]">
              E-Ticket
            </button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Welcome Banner (Figma Screen 7 Header) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
          <div class="flex items-center gap-4">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'}" class="w-16 h-16 rounded-2xl object-cover border-2 border-white/50 shadow-md">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
                🎓 Mahasiswa Aktif
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Halo, ${user.name} 👋
              </h1>
              <p class="text-xs sm:text-sm text-sky-100 font-mono">
                NIM: ${user.nim || '22051204001'} • ${user.jurusan || 'Teknik Informatika'}
              </p>
            </div>
          </div>

          <div>
            <button onclick="App.navigate('booking')" class="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2">
              <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              + Ajukan Peminjaman Baru
            </button>
          </div>
        </div>

        <!-- Active Ticket & Stepper Section -->
        <div>
          ${ticketSectionHtml}
        </div>

        <!-- History of Bookings Table -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900">Riwayat Pengajuan Peminjaman Lab Anda</h3>
            <span class="text-xs text-slate-500">Total ${myBookings.length} Pengajuan</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <th class="px-4 py-3">No. Booking</th>
                  <th class="px-4 py-3">Laboratorium</th>
                  <th class="px-4 py-3">Jadwal Sesi</th>
                  <th class="px-4 py-3">Keperluan</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${historyRows || '<tr><td colspan="6" class="text-center py-6 text-xs text-slate-400">Belum ada data riwayat</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  postRender() {
    const user = Api.getUser() || { id: 'usr_mhs1' };
    Api.bookings.getAll({ userId: user.id }).then(res => {
      const activeBooking = (res.data || []).find(b => ['disetujui_admin', 'sedang_berlangsung', 'menunggu_admin', 'menunggu_dosen'].includes(b.status)) || res.data?.[0];
      if (activeBooking) {
        const container = document.getElementById('mhs-qr-preview');
        if (container) {
          container.innerHTML = '';
          if (typeof QRCode !== 'undefined') {
            new QRCode(container, {
              text: activeBooking.qrCodeData || activeBooking.bookingCode || activeBooking.id,
              width: 100,
              height: 100,
              colorDark: '#0f172a',
              colorLight: '#ffffff',
              correctLevel: QRCode.CorrectLevel.M
            });
          }
        }
      }
    }).catch(console.warn);
  }
};

window.MahasiswaDashboard = MahasiswaDashboard;
