const QRModal = {
  renderModal(booking) {
    // Remove existing if any
    const old = document.getElementById('ticket-modal-backdrop');
    if (old) old.remove();

    const equipmentsList = booking.equipments && booking.equipments.length > 0
      ? booking.equipments.map(e => `<li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>${e}</li>`).join('')
      : '<li class="text-slate-400 italic">Tidak ada peralatan tambahan</li>';

    let statusBadge = '';
    if (booking.status === 'disetujui_admin') {
      statusBadge = '<span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider">Disetujui Admin (Valid)</span>';
    } else if (booking.status === 'sedang_berlangsung') {
      statusBadge = '<span class="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold uppercase tracking-wider">Sedang Berlangsung</span>';
    } else if (booking.status === 'selesai') {
      statusBadge = '<span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold uppercase tracking-wider">Selesai</span>';
    } else {
      statusBadge = `<span class="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold uppercase tracking-wider">${booking.status.replace('_', ' ')}</span>`;
    }

    const modalHtml = `
      <div id="ticket-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
        <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
          
          <!-- Modal Header -->
          <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white">L</div>
              <div>
                <h3 class="font-bold text-base">E-Ticket & Surat Izin Lab Digital</h3>
                <p class="text-xs text-slate-300">Jurusan Teknologi Informasi - Politeknik Negeri Malang</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.print()" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                Cetak / Simpan PDF
              </button>
              <button onclick="document.getElementById('ticket-modal-backdrop').remove()" class="text-slate-400 hover:text-white p-1.5 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>

          <!-- Printable Letter Area -->
          <div id="printable-ticket" class="p-6 md:p-8 bg-white text-slate-800">
            
            <!-- Letterhead / Kop Surat -->
            <div class="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-sky-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-sm">
                  JTI
                </div>
                <div>
                  <h2 class="font-extrabold text-lg uppercase tracking-tight text-slate-900">Laboratorium Teknologi Informasi</h2>
                  <p class="text-xs text-slate-500 font-medium">Jurusan Teknologi Informasi - Politeknik Negeri Malang</p>
                  <p class="text-[11px] text-slate-400">Gedung Teknologi Informasi, Politeknik Negeri Malang</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">No. Booking Digital</div>
                <div class="font-mono font-bold text-sky-700 text-sm md:text-base">${booking.bookingCode || booking.id}</div>
                <div class="mt-1">${statusBadge}</div>
              </div>
            </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              <!-- Left 2 Cols: Details -->
              <div class="md:col-span-2 space-y-4 text-sm">
                <div>
                  <h4 class="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Informasi Peminjam</h4>
                  <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <div class="flex justify-between"><span class="text-slate-500">Nama:</span> <span class="font-bold text-slate-800">${booking.userName}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">NIM/NIP:</span> <span class="font-mono font-medium">${booking.userNim}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">Program Studi:</span> <span class="text-slate-700">${booking.userJurusan || 'Teknik Informatika'}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">Kontak:</span> <span class="text-slate-700">${booking.userPhone || '-'}</span></div>
                  </div>
                </div>

                <div>
                  <h4 class="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Detail Peminjaman</h4>
                  <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <div class="flex justify-between"><span class="text-slate-500">Laboratorium:</span> <span class="font-bold text-sky-800">${booking.labName}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">Tanggal:</span> <span class="font-semibold text-slate-800">${booking.date}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">Sesi Waktu:</span> <span class="font-medium text-slate-800">${booking.timeSlot}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">Dosen Pembimbing:</span> <span class="text-slate-700">${booking.dosenName || '-'}</span></div>
                    <div class="flex justify-between"><span class="text-slate-500">Jumlah Peserta:</span> <span class="text-slate-700">${booking.participantsCount} Orang</span></div>
                  </div>
                </div>

                <div>
                  <h4 class="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Tujuan / Keperluan:</h4>
                  <p class="text-xs text-slate-700 bg-sky-50/50 p-3 rounded-lg border border-sky-100 leading-relaxed font-medium">
                    ${booking.purpose}
                  </p>
                </div>

                <div>
                  <h4 class="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Peralatan Dipinjam:</h4>
                  <ul class="text-xs text-slate-700 space-y-1 pl-1">
                    ${equipmentsList}
                  </ul>
                </div>
              </div>

              <!-- Right 1 Col: QR Code Box -->
              <div class="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-sky-50 to-slate-50 rounded-2xl border border-sky-100 text-center">
                <div class="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2">QR Code Check-In</div>
                
                <div id="qrcode-canvas-container" class="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
                  <!-- QR Code will render here -->
                </div>

                <div class="font-mono text-[10px] text-slate-500 mt-2.5 break-all max-w-[170px]">
                  ${booking.qrCodeData || booking.bookingCode}
                </div>

                <div class="mt-4 text-[11px] text-slate-500 leading-tight">
                  📌 Scan QR Code ini di meja Laboran saat memulai sesi penggunaan lab.
                </div>
              </div>

            </div>

            <!-- Signatures / Catatan Resmi -->
            <div class="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
              <div>
                <p class="text-slate-400 mb-12">Dosen Pembimbing / Penanggung Jawab,</p>
                <p class="font-bold text-slate-800 underline">${booking.dosenName || 'Dr. Hendra Gunawan, S.Kom., M.T.'}</p>
                <p class="text-[10px] text-slate-400 font-mono">Disetujui secara digital</p>
              </div>
              <div>
                <p class="text-slate-400 mb-12">Admin & Kepala Laboran Ilkom,</p>
                <p class="font-bold text-slate-800 underline">Admin Laboran Ilkom</p>
                <p class="text-[10px] text-slate-400 font-mono">Terverifikasi sistem LAB ILKOM</p>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end no-print">
            <button onclick="document.getElementById('ticket-modal-backdrop').remove()" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition">
              Tutup E-Ticket
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Generate QR Code
    setTimeout(() => {
      const container = document.getElementById('qrcode-canvas-container');
      if (!container) return;
      container.innerHTML = '';
      if (typeof QRCode !== 'undefined') {
        new QRCode(container, {
          text: booking.qrCodeData || booking.bookingCode || booking.id,
          width: 140,
          height: 140,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      } else {
        // SVG QR fallback
        container.innerHTML = `
          <div class="w-[140px] h-[140px] bg-slate-900 flex flex-col items-center justify-center text-white rounded-lg p-2 text-center">
            <svg class="w-12 h-12 text-sky-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
            <span class="text-[10px] font-mono font-bold text-sky-200">${booking.bookingCode}</span>
          </div>
        `;
      }
    }, 50);
  }
};

window.QRModal = QRModal;
