const LandingView = {
  async render() {
    let labs = [];
    let stats = null;
    try {
      const labRes = await Api.labs.getAll();
      labs = labRes.data || [];
      const statsRes = await Api.stats.getDashboard();
      stats = statsRes.data?.overview;
    } catch (e) {
      console.warn('Failed to load live data for landing:', e);
    }

    const labCardsHtml = labs.map(lab => `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
        <div class="relative h-48 overflow-hidden bg-slate-100">
          <img src="${lab.image}" alt="${lab.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute top-3 left-3">
            <span class="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold rounded-lg font-mono">
              ${lab.code}
            </span>
          </div>
          <div class="absolute top-3 right-3">
            <span class="px-3 py-1 ${lab.status === 'Tersedia' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'} text-[11px] font-bold rounded-full shadow-xs flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              ${lab.status}
            </span>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div class="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-1">${lab.category}</div>
            <h3 class="font-bold text-slate-900 text-base leading-snug group-hover:text-sky-600 transition">
              ${lab.name}
            </h3>
            <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              ${lab.location}
            </p>
            <p class="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              ${lab.specs}
            </p>
          </div>

          <div>
            <div class="flex items-center justify-between text-xs text-slate-600 pb-3 border-b border-slate-100">
              <span class="flex items-center gap-1.5 font-medium">
                <svg class="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Kapasitas: <strong class="text-slate-800">${lab.capacity} PC</strong>
              </span>
              <span class="text-emerald-600 font-semibold">Siap Digunakan</span>
            </div>

            <div class="mt-3 flex gap-2">
              <button onclick="App.startBookingWithLab('${lab.id}')" class="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs">
                <span>Ajukan Peminjaman</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="min-h-screen flex flex-col bg-slate-50">
        
        <!-- Hero Section (Figma Matched) -->
        <section class="gradient-hero-bg py-16 lg:py-20 border-b border-sky-100 relative overflow-hidden">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <!-- Left Column Text -->
              <div class="lg:col-span-7 space-y-6">
                
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sky-100/80 border border-sky-200 text-sky-800 rounded-full text-xs font-bold tracking-wide uppercase">
                  <span class="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                  Pusat Pembelajaran, Penelitian, dan Pengembangan
                </div>

                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Fasilitas Laboratorium Modern untuk <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">Inovasi Digital</span> Masa Depan.
                </h1>

                <p class="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Sistem otomasi peminjaman ruang laboratorium komputer, server GPU AI, perlengkapan IoT, dan studio multimedia dengan persetujuan bertingkat dan E-Ticket QR Code real-time.
                </p>

                <!-- CTA Action Buttons -->
                <div class="flex flex-wrap items-center gap-3.5 pt-2">
                  <button onclick="App.startBookingWithLab('LAB-01')" class="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2">
                    <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Pinjam Lab Sekarang
                  </button>

                  <button onclick="App.navigate('jadwal')" class="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-xs transition flex items-center gap-2">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    Lihat Jadwal Terisi
                  </button>
                </div>

                <!-- Live Quick Stats -->
                <div class="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80">
                  <div>
                    <div class="text-2xl font-extrabold text-slate-900">${stats?.totalLabs || 5}</div>
                    <div class="text-xs text-slate-500 font-medium">Laboratorium Komputer</div>
                  </div>
                  <div>
                    <div class="text-2xl font-extrabold text-sky-600">${stats?.totalEquipments || 60}+</div>
                    <div class="text-xs text-slate-500 font-medium">Inventaris & Sensor</div>
                  </div>
                  <div>
                    <div class="text-2xl font-extrabold text-emerald-600">100%</div>
                    <div class="text-xs text-slate-500 font-medium">Digital E-Ticket QR</div>
                  </div>
                </div>

              </div>

              <!-- Right Column Image Card (Figma Style) -->
              <div class="lg:col-span-5">
                <div class="relative">
                  <div class="absolute -inset-2 bg-gradient-to-r from-sky-400 to-cyan-300 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
                  <div class="relative bg-white p-3 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1000&q=80" alt="Lab Modern" class="rounded-2xl w-full h-80 object-cover">
                    
                    <div class="p-4 bg-white space-y-3">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                          <span class="text-xs font-bold text-slate-800">Status Operasional Lab: Aktif</span>
                        </div>
                        <span class="text-[11px] text-slate-500 font-mono">08:00 - 21:00 WIB</span>
                      </div>
                      <div class="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span class="text-slate-600">Sistem Peminjaman Terkini:</span>
                        <span class="font-bold text-sky-600">Online & Terverifikasi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- Section: Keunggulan Lab Kami (Figma Matched) -->
        <section class="py-16 bg-white border-b border-slate-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-2xl mx-auto mb-12">
              <h2 class="text-xs uppercase font-bold text-sky-600 tracking-wider mb-2">Keunggulan Layanan</h2>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Kenapa Menggunakan LAB ILKOM?</h3>
              <p class="text-sm text-slate-500 mt-2">Dukungan infrastruktur terbaik untuk mendukung produktivitas praktikum, penelitian dosen, dan skripsi mahasiswa.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <!-- Card 1 -->
              <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-sky-300 hover:shadow-lg transition-all duration-300">
                <div class="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <h4 class="font-bold text-base text-slate-900 mb-2">Fasilitas Lengkap & Modern</h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Workstation spesifikasi tinggi (RTX 4080/4070, Core i9/i7, 64GB RAM), display grafis Wacom Cintiq, cluster GPU server, dan koneksi Gigabit LAN berkecepatan tinggi.
                </p>
              </div>

              <!-- Card 2 -->
              <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-sky-300 hover:shadow-lg transition-all duration-300">
                <div class="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h4 class="font-bold text-base text-slate-900 mb-2">Akses Cepat & Terjadwal</h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Booking ruang dan alat langsung dari website. Verifikasi dosen pembimbing dan admin terintegrasi tanpa perlu surat fisik, langsung terbit QR Code E-Ticket.
                </p>
              </div>

              <!-- Card 3 -->
              <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-sky-300 hover:shadow-lg transition-all duration-300">
                <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <h4 class="font-bold text-base text-slate-900 mb-2">Pendampingan Teknisi & Asisten</h4>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Dukungan tim laboran profesional dan asisten laboratorium yang siap membantu konfigurasi alat, troubleshooting jaringan, dan alokasi perangkat riset.
                </p>
              </div>

            </div>
          </div>
        </section>

        <!-- Section: Daftar Laboratorium Komputer (Figma Matched) -->
        <section class="py-16 bg-slate-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <h2 class="text-xs uppercase font-bold text-sky-600 tracking-wider mb-2">Fasilitas Laboratorium</h2>
                <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900">Pilih Laboratorium Komputer</h3>
                <p class="text-sm text-slate-500 mt-1">Laboratorium dengan peruntukan bidang komputasi dan riset spesifik.</p>
              </div>
              <button onclick="App.navigate('jadwal')" class="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 self-start md:self-auto">
                Lihat Kalender Pemakaian Lengkap &rarr;
              </button>
            </div>

            <!-- Lab Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${labCardsHtml}
            </div>

          </div>
        </section>

        <!-- Footer (Dark Navy - Figma Matched) -->
        <footer class="bg-slate-950 text-white mt-auto border-t border-slate-800">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              <!-- Col 1 -->
              <div class="space-y-3 md:col-span-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-black text-white">L</div>
                  <span class="font-extrabold text-lg text-white">LAB <span class="text-sky-400">ILKOM</span></span>
                </div>
                <p class="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Sistem Informasi Manajemen Laboratorium Jurusan Teknologi Informasi untuk mendukung tridharma perguruan tinggi di bidang pendidikan, penelitian, dan pengabdian masyarakat.
                </p>
                <div class="text-xs text-slate-500">
                  © 2026 Laboratorium Jurusan Teknologi Informasi, Politeknik Negeri Malang. All rights reserved.
                </div>
              </div>

              <!-- Col 2 -->
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Tautan Cepat</h4>
                <ul class="space-y-2 text-xs text-slate-400">
                  <li><a href="#landing" onclick="App.navigate('landing'); return false;" class="hover:text-sky-400 transition">Beranda</a></li>
                  <li><a href="#booking" onclick="App.navigate('booking'); return false;" class="hover:text-sky-400 transition">Pengajuan Peminjaman</a></li>
                  <li><a href="#jadwal" onclick="App.navigate('jadwal'); return false;" class="hover:text-sky-400 transition">Jadwal Penggunaan Ruang</a></li>
                  <li><a href="#login" onclick="App.navigate('login'); return false;" class="hover:text-sky-400 transition">Portal Masuk Akun</a></li>
                </ul>
              </div>

              <!-- Col 3 -->
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Jam Operasional</h4>
                <div class="text-xs text-slate-400 space-y-1.5 leading-relaxed">
                  <p><strong class="text-slate-200">Senin - Jumat:</strong> 08:00 - 21:00 WIB</p>
                  <p><strong class="text-slate-200">Sabtu:</strong> 08:00 - 17:00 WIB</p>
                  <p><strong class="text-slate-200">Minggu & Hari Libur:</strong> Tutup (Kecuali Izin Khusus)</p>
                  <p class="pt-2 text-sky-400 font-medium">Gedung Teknologi Informasi, Politeknik Negeri Malang</p>
                </div>
              </div>

            </div>
          </div>
        </footer>

      </div>
    `;
  }
};

window.LandingView = LandingView;
