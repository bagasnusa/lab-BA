const MahasiswaDashboard = {
  activeTab: 'dashboard', // 'dashboard', 'bimbingan', 'ujian'

  async render() {
    const user = Api.getUser() || {
      name: 'Bagas Pratama',
      nim: '22051204001',
      jurusan: 'Sistem Informasi Bisnis',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'
    };

    let supervisorData = null;
    let myExams = [];
    let myBookings = [];

    try {
      const [supRes, examRes, bookRes] = await Promise.allSettled([
        Api.thesis.getMySupervisor(),
        Api.thesis.getMyExam(),
        Api.bookings.getAll({ userId: user.id })
      ]);
      if (supRes.status === 'fulfilled') supervisorData = supRes.value?.data;
      if (examRes.status === 'fulfilled') myExams = examRes.value?.data || [];
      if (bookRes.status === 'fulfilled') myBookings = bookRes.value?.data || [];
    } catch (e) {
      console.warn('Gagal memuat data mahasiswa dashboard:', e);
    }

    const upcomingExam = myExams.find(ex => ex.status === 'mendatang') || myExams[0];

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <!-- Header Profil Sesuai Mockup -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <h1 class="text-3xl font-black text-slate-900 tracking-tight">
                Halo, ${user.name.split(' ')[0]} 👋
              </h1>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                NIM: ${user.nim || '22051204001'}
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">
                <svg class="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                ${user.jurusan || 'Sistem Informasi Bisnis'}
              </span>
            </div>
          </div>

          <!-- User Card -->
          <div class="flex items-center gap-3 bg-slate-50 p-2.5 pr-5 rounded-2xl border border-slate-200">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'}" class="w-12 h-12 rounded-xl object-cover border border-white shadow-2xs">
            <div>
              <div class="font-bold text-slate-900 text-sm">${user.name}</div>
              <div class="text-[11px] text-slate-500 font-medium">Mahasiswa Aktif</div>
            </div>
          </div>
        </div>

        <!-- 2 Kolom Utama Sesuai Mockup Figma -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Kolom Kiri: Pembimbing Saya (5 cols) -->
          <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h3 class="font-bold text-slate-900 text-lg">Pembimbing Saya</h3>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                  supervisorData?.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  supervisorData?.status === 'diajukan' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  supervisorData?.status === 'ditolak' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                }">
                  ${
                    supervisorData?.status === 'aktif' ? 'Disetujui Aktif' :
                    supervisorData?.status === 'diajukan' ? 'Menunggu Dosen' :
                    supervisorData?.status === 'ditolak' ? 'Perlu Diajukan Ulang' : 'Belum Ada'
                  }
                </span>
                <button onclick="MahasiswaDashboard.openApplySupervisorModal()" class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg border border-sky-200 text-[11px] transition">
                  ${supervisorData ? 'Ubah Usulan' : '+ Ajukan'}
                </button>
              </div>
            </div>

            <!-- Judul Skripsi (jika ada) -->
            ${supervisorData?.judul_skripsi ? `
              <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <span class="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Judul Skripsi / Tugas Akhir:</span>
                <p class="font-semibold text-slate-800 leading-snug">"${supervisorData.judul_skripsi}"</p>
              </div>
            ` : ''}

            <!-- Daftar Pembimbing 1 & 2 -->
            <div class="space-y-4 pt-1">
              
              <!-- Pembimbing 1 -->
              <div class="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-3.5">
                <div class="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pembimbing 1</span>
                    ${supervisorData?.status_p1 ? `
                      <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        supervisorData.status_p1 === 'disetujui' ? 'bg-emerald-100 text-emerald-800' :
                        supervisorData.status_p1 === 'menunggu' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }">
                        ${supervisorData.status_p1 === 'disetujui' ? '✓ Disetujui' : supervisorData.status_p1 === 'menunggu' ? '⏳ Menunggu Konfirmasi' : '✕ Ditolak'}
                      </span>
                    ` : ''}
                  </div>
                  <div class="font-bold text-slate-900 text-sm truncate">
                    ${supervisorData?.pembimbing1Name || 'Belum Diajukan'}
                  </div>
                  <div class="text-[11px] text-slate-500 truncate mb-2">
                    ${supervisorData?.pembimbing1Bidang || 'Bidang Komputasi & AI'}
                  </div>
                  ${supervisorData?.pembimbing1Phone || supervisorData?.pembimbing1Email ? `
                    <a href="https://wa.me/${(supervisorData.pembimbing1Phone || '').replace(/[^0-9]/g, '')}?text=Halo%20Bapak/Ibu,%20saya%20${encodeURIComponent(user.name)}" target="_blank" class="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                      Kirim Pesan
                    </a>
                  ` : `
                    <span class="text-xs text-slate-400">Kontak belum tersedia</span>
                  `}
                </div>
              </div>

              <!-- Pembimbing 2 -->
              <div class="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition flex items-start gap-3.5">
                <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pembimbing 2</span>
                    ${supervisorData?.pembimbing2Id && supervisorData?.status_p2 ? `
                      <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        supervisorData.status_p2 === 'disetujui' ? 'bg-emerald-100 text-emerald-800' :
                        supervisorData.status_p2 === 'menunggu' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }">
                        ${supervisorData.status_p2 === 'disetujui' ? '✓ Disetujui' : supervisorData.status_p2 === 'menunggu' ? '⏳ Menunggu Konfirmasi' : '✕ Ditolak'}
                      </span>
                    ` : ''}
                  </div>
                  <div class="font-bold text-slate-900 text-sm truncate">
                    ${supervisorData?.pembimbing2Name || 'Belum Diajukan'}
                  </div>
                  <div class="text-[11px] text-slate-500 truncate mb-2">
                    ${supervisorData?.pembimbing2Bidang || 'Software Engineering'}
                  </div>
                  ${supervisorData?.pembimbing2Phone || supervisorData?.pembimbing2Email ? `
                    <a href="https://wa.me/${(supervisorData.pembimbing2Phone || '').replace(/[^0-9]/g, '')}?text=Halo%20Bapak/Ibu,%20saya%20${encodeURIComponent(user.name)}" target="_blank" class="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                      Kirim Pesan
                    </a>
                  ` : `
                    <span class="text-xs text-slate-400">Kontak belum tersedia</span>
                  `}
                </div>
              </div>

            </div>

          </div>

          <!-- Kolom Kanan: Jadwal Ujian Saya (7 cols) -->
          <div class="lg:col-span-7 space-y-6">
            <div class="bg-white p-6 sm:p-7 rounded-3xl border-2 border-sky-400/40 shadow-sm relative overflow-hidden space-y-5">
              
              <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 class="font-bold text-slate-900 text-lg">Jadwal Ujian Saya</h3>
                </div>
                ${upcomingExam ? `
                  <span class="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-wider rounded-full border border-rose-200">
                    ${upcomingExam.status}
                  </span>
                ` : `
                  <span class="text-xs text-slate-400">Tidak ada jadwal</span>
                `}
              </div>

              ${upcomingExam ? `
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <!-- Info Waktu & Ruang (7 cols) -->
                  <div class="md:col-span-7 space-y-4">
                    <div>
                      <h4 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        ${upcomingExam.jenisLabel || 'Sidang Proposal Skripsi'}
                      </h4>
                      <p class="text-xs text-slate-500 mt-1">Laboratorium Jurusan Teknologi Informasi</p>
                    </div>

                    <div class="space-y-2.5 text-xs text-slate-700">
                      <div class="flex items-center gap-2.5 font-medium">
                        <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span>${upcomingExam.tanggalFormatted || upcomingExam.tanggal}</span>
                      </div>
                      <div class="flex items-center gap-2.5 font-medium">
                        <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>${upcomingExam.jamMulai} - ${upcomingExam.jamSelesai} WIB</span>
                      </div>
                      <div class="flex items-center gap-2.5 font-medium">
                        <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span class="font-bold text-sky-700">${upcomingExam.ruangan}</span>
                      </div>
                    </div>

                    ${upcomingExam.catatan ? `
                      <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                        <span class="font-bold">Catatan:</span> ${upcomingExam.catatan}
                      </div>
                    ` : ''}
                  </div>

                  <!-- Box Dosen Penguji (5 cols) -->
                  <div class="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dosen Penguji:</div>
                    <div class="space-y-2">
                      ${upcomingExam.penguji && upcomingExam.penguji.length > 0 ? upcomingExam.penguji.map((p, idx) => `
                        <div class="flex items-start gap-2 text-xs">
                          <div class="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                          <div class="min-w-0">
                            <div class="font-bold text-slate-800 leading-tight">${p.dosenName}</div>
                            <div class="text-[10px] text-slate-500 truncate">${p.dosenBidang || 'Penguji ' + (idx + 1)}</div>
                          </div>
                        </div>
                      `).join('') : `
                        <div class="text-xs text-slate-400 italic">Penguji belum ditugaskan oleh admin.</div>
                      `}
                    </div>
                  </div>
                </div>

                <!-- Tombol Unduh Surat Tugas Sesuai Mockup -->
                <div class="pt-3 border-t border-slate-100 flex justify-end">
                  <button onclick="MahasiswaDashboard.cetakSuratTugas('${upcomingExam.id}')" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2">
                    <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Unduh Surat Tugas
                  </button>
                </div>
              ` : `
                <div class="text-center py-8 text-slate-400 space-y-2">
                  <p class="text-sm">Belum ada jadwal sidang ujian skripsi yang terdaftar untuk Anda.</p>
                  <p class="text-xs">Hubungi Admin Jurusan atau pantau pengumuman terbaru.</p>
                </div>
              `}

            </div>

            <!-- Quick Action: Booking Lab Baru -->
            <div class="bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-5 rounded-2xl flex items-center justify-between shadow-md">
              <div>
                <h4 class="font-bold text-sm">Butuh Ruangan Lab untuk Riset / Gladi Bersih?</h4>
                <p class="text-xs text-sky-100">Pinjam fasilitas lab komputer Polinema secara online.</p>
              </div>
              <button onclick="App.navigate('booking')" class="px-4 py-2 bg-white text-slate-900 hover:bg-sky-50 font-bold text-xs rounded-xl transition shrink-0 shadow-2xs">
                Ajukan Pinjam Lab
              </button>
            </div>

          </div>

        </div>

        <!-- Section Riwayat Peminjaman Lab (Tetap Ada) -->
        <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900">Riwayat Peminjaman Lab Anda</h3>
              <p class="text-xs text-slate-500">Daftar booking ruangan lab yang pernah diajukan</p>
            </div>
            <span class="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full">${myBookings.length} Total</span>
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
                ${myBookings.length > 0 ? myBookings.map(b => `
                  <tr class="hover:bg-slate-50 text-xs border-b border-slate-100">
                    <td class="px-4 py-3 font-mono font-bold text-sky-700">${b.bookingCode || b.id}</td>
                    <td class="px-4 py-3 font-semibold text-slate-800">${b.labName}</td>
                    <td class="px-4 py-3 text-slate-600">${b.date} • ${b.timeSlot}</td>
                    <td class="px-4 py-3 text-slate-600 max-w-xs truncate" title="${b.purpose}">${b.purpose}</td>
                    <td class="px-4 py-3">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        b.status === 'disetujui_admin' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'menunggu_admin' ? 'bg-sky-100 text-sky-800' :
                        b.status === 'menunggu_dosen' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }">${b.status.replace('_', ' ')}</span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button onclick="QRModal.renderModal(${JSON.stringify(b).replace(/"/g, '&quot;')})" class="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg border border-sky-200 text-[11px]">
                        Surat Izin
                      </button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="6" class="text-center py-6 text-xs text-slate-400">Belum ada riwayat peminjaman.</td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  cetakSuratTugas(examId) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Tugas Ujian Skripsi</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; }
          .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 25px; }
          .title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 20px; text-decoration: underline; }
          .content { font-size: 13px; line-height: 1.6; }
          table { width: 100%; margin: 15px 0; border-collapse: collapse; font-size: 13px; }
          td { padding: 6px; }
          .footer { margin-top: 40px; display: flex; justify-content: flex-end; }
          .sign { text-align: center; width: 220px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h3 style="margin:0;">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</h3>
          <h2 style="margin:4px 0;">POLITEKNIK NEGERI MALANG</h2>
          <h4 style="margin:0;">JURUSAN TEKNOLOGI INFORMASI</h4>
          <p style="margin:2px 0; font-size:11px;">Jl. Soekarno Hatta No.9, Jatimulyo, Lowokwaru, Kota Malang, Jawa Timur 65141</p>
        </div>
        <div class="title">SURAT TUGAS PELAKSANAAN UJIAN SKRIPSI</div>
        <div class="content">
          <p>Ketua Jurusan Teknologi Informasi Politeknik Negeri Malang menugaskan mahasiswa dan dewan penguji yang tercantum di bawah ini untuk melaksanakan kegiatan Ujian Skripsi / Sidang Tugas Akhir.</p>
          <table>
            <tr><td width="30%"><strong>ID Ujian</strong></td><td>: ${examId}</td></tr>
            <tr><td><strong>Status</strong></td><td>: Terjadwal Resmi di Laboratorium TI</td></tr>
            <tr><td><strong>Waktu & Ruangan</strong></td><td>: Sesuai Sistem Informasi Akademik Lab BA Portal</td></tr>
          </table>
          <p>Demikian surat tugas ini diterbitkan agar dapat dipergunakan sebagaimana mestinya.</p>
        </div>
        <div class="footer">
          <div class="sign">
            <p>Malang, ${new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
            <p>Ketua Jurusan Teknologi Informasi</p>
            <br><br><br>
            <p><strong>Dr. Eng. Rosa Andrie Asmara, S.T., M.T.</strong><br>NIP. 198010102005011001</p>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  },

  async openApplySupervisorModal() {
    let lecturers = [];
    try {
      const res = await Api.thesis.getLecturers();
      lecturers = res.data || [];
    } catch (e) {
      console.warn('Gagal memuat daftar dosen:', e);
    }

    const modalHtml = `
      <div id="modal-apply-supervisor" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in border border-slate-100">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-lg">Ajukan Dosen Pembimbing Skripsi</h3>
              <p class="text-xs text-slate-500">Pilih calon Pembimbing 1 dan Pembimbing 2 untuk ditinjau oleh dosen</p>
            </div>
            <button onclick="document.getElementById('modal-apply-supervisor').remove()" class="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">✕</button>
          </div>

          <form id="form-apply-sup" onsubmit="MahasiswaDashboard.submitApplySupervisor(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Judul / Rencana Topik Skripsi *</label>
              <textarea name="judulSkripsi" required rows="3" placeholder="Contoh: Rancang Bangun Sistem Klasifikasi Kualitas Biji Kopi Menggunakan Convolutional Neural Network..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"></textarea>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Usulan Dosen Pembimbing 1 *</label>
              <select name="pembimbing1Id" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden">
                <option value="">-- Pilih Dosen Pembimbing Utama --</option>
                ${lecturers.map(d => `<option value="${d.id}">${d.name} (${d.bidang || 'Dosen TI'})</option>`).join('')}
              </select>
              <p class="text-[10px] text-slate-400 mt-1">Dosen akan menerima notifikasi permintaan bimbingan Anda.</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Usulan Dosen Pembimbing 2 (Opsional)</label>
              <select name="pembimbing2Id" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden">
                <option value="">-- Tanpa Pembimbing 2 / Usulkan Nanti --</option>
                ${lecturers.map(d => `<option value="${d.id}">${d.name} (${d.bidang || 'Dosen TI'})</option>`).join('')}
              </select>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="document.getElementById('modal-apply-supervisor').remove()" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl">Batal</button>
              <button type="submit" class="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md">Kirim Pengajuan</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async submitApplySupervisor(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      pembimbing1Id: form.pembimbing1Id.value,
      pembimbing2Id: form.pembimbing2Id.value || null,
      judulSkripsi: form.judulSkripsi.value
    };
    try {
      const res = await Api.thesis.applySupervisor(data);
      Toast.success(res.message || 'Pengajuan pembimbing berhasil dikirim!');
      document.getElementById('modal-apply-supervisor')?.remove();
      App.handleRouting();
    } catch (err) {
      Toast.error(err.message || 'Gagal mengajukan pembimbing.');
    }
  },

  postRender() {}
};


window.MahasiswaDashboard = MahasiswaDashboard;
