const BookingFormView = {
  selectedLabId: 'LAB-02',
  selectedSession: 'pagi',
  selectedEquipments: [],
  preselectedDate: '',

  async render() {
    const user = Api.getUser();
    let labs = [];
    let equipments = [];
    let lecturers = [];

    try {
      const [labsRes, eqRes, lecRes] = await Promise.all([
        Api.labs.getAll(),
        Api.equipments.getAll(),
        Api.auth.getLecturers()
      ]);
      labs = labsRes.data || [];
      equipments = eqRes.data || [];
      lecturers = lecRes.data || [];
    } catch (e) {
      console.error('Error loading booking form data:', e);
    }

    if (this.preselectedLabId && labs.some(l => l.id === this.preselectedLabId)) {
      this.selectedLabId = this.preselectedLabId;
    } else if (!this.selectedLabId && labs.length > 0) {
      this.selectedLabId = labs[0].id;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const defaultDate = this.preselectedDate || todayStr;

    const labOptionsHtml = labs.map(lab => `
      <option value="${lab.id}" ${lab.id === this.selectedLabId ? 'selected' : ''}>
        ${lab.name} (${lab.location} - ${lab.capacity} PC)
      </option>
    `).join('');

    const lecturerOptionsHtml = lecturers.map(lec => `
      <option value="${lec.id}">
        ${lec.name} (${lec.bidang || 'Dosen Ilkom'})
      </option>
    `).join('');

    const equipmentsCheckboxesHtml = equipments.map(eq => `
      <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40 cursor-pointer transition">
        <input type="checkbox" name="booking-equipment" value="${eq.name}" onchange="BookingFormView.updateSummary()" class="mt-0.5 h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded">
        <div class="flex-1 text-xs">
          <div class="font-bold text-slate-800 flex items-center justify-between">
            <span>${eq.name}</span>
            <span class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Sisa ${eq.available} unit</span>
          </div>
          <p class="text-[11px] text-slate-500 mt-0.5">${eq.spec || eq.category}</p>
        </div>
      </label>
    `).join('');

    return `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Breadcrumb & Header -->
        <div class="mb-8">
          <div class="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Pusat Layanan Peminjaman</div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Form Pengajuan Peminjaman Lab & Alat</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">Lengkapi formulir di bawah untuk mengajukan izin riset, praktikum mandiri, atau kegiatan akademik.</p>
        </div>

        <!-- 2-Column Layout (Figma Matched) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left Column: The Form (7 cols) -->
          <div class="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            
            <form id="lab-booking-form" onsubmit="BookingFormView.handleSubmit(event)" class="space-y-6">
              
              <!-- 1. Pilih Ruangan Lab -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">1</span>
                  Pilih Ruangan Laboratorium
                </label>
                <select id="book-lab-id" onchange="BookingFormView.handleLabChange(this.value)" class="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none font-medium text-slate-800">
                  ${labOptionsHtml}
                </select>
              </div>

              <!-- 2. Tanggal & Sesi Waktu -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">2</span>
                    Tanggal Peminjaman
                  </label>
                  <input type="date" id="book-date" value="${defaultDate}" min="${todayStr}" onchange="BookingFormView.updateSummary()" required class="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none font-medium">
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">3</span>
                    Sesi Waktu
                  </label>
                  <select id="book-session" onchange="BookingFormView.handleSessionChange(this.value)" class="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none font-medium">
                    <option value="pagi">08:00 - 11:30 (Sesi Pagi)</option>
                    <option value="siang">13:00 - 16:30 (Sesi Siang)</option>
                    <option value="sore">16:30 - 19:30 (Sesi Sore)</option>
                    <option value="malam">19:30 - 22:00 (Sesi Malam)</option>
                  </select>
                </div>
              </div>

              <!-- 3. Kategori & Keperluan -->
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">4</span>
                    Kategori Peminjaman
                  </label>
                  <select id="book-category" onchange="BookingFormView.updateSummary()" class="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none font-medium">
                    <option value="Riset Skripsi / Tugas Akhir">Riset Skripsi / Tugas Akhir</option>
                    <option value="Praktikum Mandiri">Praktikum Mandiri</option>
                    <option value="Proyek Mata Kuliah">Proyek Mata Kuliah</option>
                    <option value="Kegiatan Komunitas / Kompetisi">Kegiatan Komunitas / Kompetisi (CTF, Hackathon)</option>
                    <option value="Workshop / Pelatihan">Workshop / Pelatihan Akademik</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Deskripsi Tujuan / Keperluan Lengkap
                  </label>
                  <textarea id="book-purpose" rows="3" required placeholder="Jelaskan secara detail agenda penggunaan laboratorium (contoh: Training model deep learning menggunakan cluster GPU, pengujian performa dataset, dsb.)." class="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none leading-relaxed"></textarea>
                </div>
              </div>

              <!-- 4. Dosen Pembimbing -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">5</span>
                  Dosen Pembimbing / Penanggung Jawab
                </label>
                <select id="book-dosen-id" onchange="BookingFormView.updateSummary()" class="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none font-medium">
                  <option value="">-- Tanpa Dosen Pembimbing (Langsung ke Admin Lab) --</option>
                  ${lecturerOptionsHtml}
                </select>
                <p class="text-[11px] text-slate-400 mt-1">Jika memilih dosen pembimbing, pengajuan akan divalidasi oleh dosen terlebih dahulu sebelum disetujui Admin Lab.</p>
              </div>

              <!-- 5. Alat Tambahan -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span class="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">6</span>
                  Peminjaman Inventaris / Alat Tambahan (Opsional)
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                  ${equipmentsCheckboxesHtml}
                </div>
              </div>

              <!-- 6. Jumlah Peserta & Kontak -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Jumlah Peserta (Orang)</label>
                  <input type="number" id="book-participants" min="1" max="50" value="1" class="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">No. WhatsApp Aktif</label>
                  <input type="text" id="book-phone" value="${user?.phone || '082155443322'}" required placeholder="08xxxxxxxxxx" class="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500">
                </div>
              </div>

              <div class="pt-4">
                <button type="submit" id="btn-submit-booking" class="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Kirim Pengajuan Peminjaman Lab
                </button>
              </div>

            </form>

          </div>

          <!-- Right Column: Live Booking Summary (5 cols - Figma Matched) -->
          <div class="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5 sticky top-24">
            
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>📋 Ringkasan Peminjaman</span>
              </h3>
              <span class="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Slot Tersedia
              </span>
            </div>

            <!-- Lab Image & Specs Card -->
            <div id="summary-lab-card" class="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
              <!-- Dynamically updated -->
            </div>

            <!-- Booking Parameters List -->
            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="text-slate-500">Tanggal:</span>
                <span id="summary-date" class="font-bold text-slate-800">${defaultDate}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="text-slate-500">Sesi Waktu:</span>
                <span id="summary-session" class="font-bold text-sky-700">08:00 - 11:30 (Pagi)</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="text-slate-500">Kategori:</span>
                <span id="summary-category" class="font-semibold text-slate-800">Riset Skripsi</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-slate-100">
                <span class="text-slate-500">Dosen Pembimbing:</span>
                <span id="summary-dosen" class="font-semibold text-slate-800">-</span>
              </div>
              <div class="py-1.5">
                <span class="text-slate-500 block mb-1">Alat Tambahan:</span>
                <div id="summary-equipments" class="flex flex-wrap gap-1">
                  <span class="text-slate-400 italic text-[11px]">Belum ada alat dipilih</span>
                </div>
              </div>
            </div>

            <!-- Security & Notice Pill -->
            <div class="p-3.5 bg-sky-50 rounded-2xl border border-sky-100 text-[11px] text-sky-900 leading-relaxed space-y-1">
              <div class="font-bold flex items-center gap-1">
                <span>🛡️ Alur Verifikasi Digital:</span>
              </div>
              <p class="text-sky-800">
                Setelah pengajuan terkirim, status akan diverifikasi oleh Dosen & Admin Lab. E-Ticket QR Code akan otomatis aktif saat disetujui.
              </p>
            </div>

          </div>

        </div>

      </div>
    `;
  },

  handleLabChange(labId) {
    this.selectedLabId = labId;
    this.updateSummary();
  },

  handleSessionChange(session) {
    this.selectedSession = session;
    this.updateSummary();
  },

  async updateSummary() {
    const labId = document.getElementById('book-lab-id')?.value || this.selectedLabId;
    const date = document.getElementById('book-date')?.value;
    const sessionEl = document.getElementById('book-session');
    const category = document.getElementById('book-category')?.value;
    const dosenEl = document.getElementById('book-dosen-id');

    if (document.getElementById('summary-date')) {
      document.getElementById('summary-date').textContent = date || '-';
    }
    if (document.getElementById('summary-session') && sessionEl) {
      document.getElementById('summary-session').textContent = sessionEl.options[sessionEl.selectedIndex]?.text || '-';
    }
    if (document.getElementById('summary-category')) {
      document.getElementById('summary-category').textContent = category || '-';
    }
    if (document.getElementById('summary-dosen') && dosenEl) {
      document.getElementById('summary-dosen').textContent = dosenEl.selectedIndex > 0 ? dosenEl.options[dosenEl.selectedIndex].text : 'Tanpa Pembimbing';
    }

    // Equipments
    const checkedBoxes = Array.from(document.querySelectorAll('input[name="booking-equipment"]:checked'));
    const eqContainer = document.getElementById('summary-equipments');
    if (eqContainer) {
      if (checkedBoxes.length > 0) {
        eqContainer.innerHTML = checkedBoxes.map(cb => `
          <span class="px-2 py-0.5 bg-white text-sky-800 border border-sky-200 rounded-md text-[10px] font-bold">
            ${cb.value}
          </span>
        `).join('');
      } else {
        eqContainer.innerHTML = '<span class="text-slate-400 italic text-[11px]">Belum ada alat dipilih</span>';
      }
    }

    // Update Lab Card
    try {
      const res = await Api.labs.getById(labId);
      const lab = res.data;
      const cardContainer = document.getElementById('summary-lab-card');
      if (cardContainer && lab) {
        cardContainer.innerHTML = `
          <div class="h-28 overflow-hidden relative">
            <img src="${lab.image}" class="w-full h-full object-cover">
            <div class="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-mono text-white font-bold">${lab.code}</div>
          </div>
          <div class="p-3">
            <h4 class="font-bold text-xs text-slate-900">${lab.name}</h4>
            <p class="text-[11px] text-slate-500 mt-0.5">${lab.location} • Kapasitas: <strong>${lab.capacity} PC</strong></p>
          </div>
        `;
      }
    } catch (e) {
      console.warn('Error fetching lab for summary:', e);
    }
  },

  async handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-booking');
    const user = Api.getUser();

    if (!user) {
      Toast.warning('Silakan login terlebih dahulu untuk mengajukan peminjaman.');
      App.navigate('login');
      return;
    }

    const labId = document.getElementById('book-lab-id').value;
    const date = document.getElementById('book-date').value;
    const session = document.getElementById('book-session').value;
    const sessionText = document.getElementById('book-session').options[document.getElementById('book-session').selectedIndex].text;
    const category = document.getElementById('book-category').value;
    const purpose = document.getElementById('book-purpose').value.trim();
    const dosenId = document.getElementById('book-dosen-id').value;
    const participantsCount = document.getElementById('book-participants').value;
    const contactPhone = document.getElementById('book-phone').value.trim();

    const checkedBoxes = Array.from(document.querySelectorAll('input[name="booking-equipment"]:checked'));
    const equipments = checkedBoxes.map(cb => cb.value);

    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      <span>Mengirim Pengajuan...</span>
    `;

    try {
      const res = await Api.bookings.create({
        labId,
        date,
        session,
        timeSlot: sessionText,
        category,
        purpose,
        dosenId: dosenId || null,
        equipments,
        participantsCount,
        contactPhone,
        userName: user.name,
        userNim: user.nim || user.identifier,
        userJurusan: user.jurusan
      });

      Toast.success(res.message || 'Pengajuan peminjaman berhasil dikirim!');

      // If user is mahasiswa, go to mahasiswa dashboard to see the ticket
      setTimeout(() => {
        if (user.role === 'mahasiswa') {
          App.navigate('mahasiswa');
        } else {
          App.navigate('jadwal');
        }
      }, 500);

    } catch (err) {
      Toast.error(err.message || 'Gagal mengirim pengajuan peminjaman');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Kirim Pengajuan Peminjaman Lab
      `;
    }
  }
};

window.BookingFormView = BookingFormView;
