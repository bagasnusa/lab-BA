const AuthView = {
  activeTab: 'login', // 'login' or 'register'

  render() {
    return `
      <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div class="w-full max-w-md space-y-6">
          
          <!-- Brand header (Figma Screen 2) -->
          <div class="text-center space-y-2">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white font-black text-2xl shadow-md mb-2">
              L
            </div>
            <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">
              Masuk ke Akun Anda
            </h2>
            <p class="text-xs text-slate-500 max-w-xs mx-auto">
              Sistem Informasi Manajemen & Peminjaman Laboratorium Ilmu Komputer
            </p>
          </div>

          <!-- Auth Card (Figma Screen 2) -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200">
            
            <!-- Tabs -->
            <div class="flex border-b border-slate-100 mb-6 pb-2 gap-4">
              <button onclick="AuthView.switchTab('login')" id="tab-btn-login" class="text-sm font-bold pb-2 border-b-2 border-sky-600 text-sky-600 transition">
                Masuk
              </button>
              <button onclick="AuthView.switchTab('register')" id="tab-btn-register" class="text-sm font-bold pb-2 border-b-2 border-transparent text-slate-400 hover:text-slate-700 transition">
                Daftar Akun Baru
              </button>
            </div>

            <!-- Login Form -->
            <form id="auth-login-form" onsubmit="AuthView.handleLogin(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  NIM / NIP / Email
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <input type="text" id="login-identifier" required placeholder="Contoh: 22051204001 atau bagas@mhs.ilkom.ac.id" class="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none transition">
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kata Sandi
                  </label>
                  <a href="#" onclick="Toast.info('Password default demo: mhs123 / dosen123 / admin123'); return false;" class="text-[11px] text-sky-600 hover:underline">
                    Lupa sandi?
                  </a>
                </div>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <input type="password" id="login-password" required placeholder="••••••••" class="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none transition">
                  <button type="button" onclick="AuthView.togglePassword('login-password')" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </button>
                </div>
              </div>

              <div class="flex items-center">
                <input id="remember-me" type="checkbox" checked class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded">
                <label for="remember-me" class="ml-2 block text-xs text-slate-600">
                  Ingat sesi saya di perangkat ini
                </label>
              </div>

              <button type="submit" id="btn-submit-login" class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2">
                <span>Masuk ke Akun</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </form>

            <!-- Register Form (Initially Hidden) -->
            <form id="auth-register-form" onsubmit="AuthView.handleRegister(event)" class="space-y-4 hidden">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input type="text" id="reg-name" required placeholder="Bagas Pratama" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nomor Induk Mahasiswa (NIM)</label>
                <input type="text" id="reg-nim" required placeholder="22051204001" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Mahasiswa</label>
                <input type="email" id="reg-email" required placeholder="bagas@mhs.ilkom.ac.id" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Program Studi</label>
                <select id="reg-jurusan" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none">
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Teknik Komputer">Teknik Komputer</option>
                  <option value="Sains Data">Sains Data</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kata Sandi</label>
                <input type="password" id="reg-password" required placeholder="Minimal 6 karakter" class="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none">
              </div>

              <button type="submit" class="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition">
                Daftar Akun Mahasiswa
              </button>
            </form>

            <!-- Subtle Demo Helper Box -->
            <div class="mt-6 pt-4 border-t border-slate-100">
              <details class="text-[11px] text-slate-500 cursor-pointer">
                <summary class="font-semibold text-sky-700 hover:underline">
                  💡 Butuh akun contoh untuk login demo? Klik di sini
                </summary>
                <div class="mt-2.5 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div class="flex justify-between items-center cursor-pointer hover:bg-sky-50 p-1 rounded" onclick="AuthView.fillDemo('mahasiswa')">
                    <span><strong>Mahasiswa:</strong> 22051204001</span>
                    <span class="text-sky-600 font-bold">Gunakan ini &rarr;</span>
                  </div>
                  <div class="flex justify-between items-center cursor-pointer hover:bg-indigo-50 p-1 rounded" onclick="AuthView.fillDemo('dosen')">
                    <span><strong>Dosen:</strong> 197805122003121001</span>
                    <span class="text-indigo-600 font-bold">Gunakan ini &rarr;</span>
                  </div>
                  <div class="flex justify-between items-center cursor-pointer hover:bg-amber-50 p-1 rounded" onclick="AuthView.fillDemo('admin')">
                    <span><strong>Admin:</strong> admin@ilkom.ac.id</span>
                    <span class="text-amber-600 font-bold">Gunakan ini &rarr;</span>
                  </div>
                </div>
              </details>
            </div>

          </div>

          <div class="text-center text-xs text-slate-400">
            Butuh bantuan akses laboratorium? Hubungi <span class="text-slate-600 font-semibold">laboran@ilkom.ac.id</span>
          </div>

        </div>
      </div>
    `;
  },

  switchTab(tab) {
    this.activeTab = tab;
    const loginForm = document.getElementById('auth-login-form');
    const regForm = document.getElementById('auth-register-form');
    const tabLogin = document.getElementById('tab-btn-login');
    const tabReg = document.getElementById('tab-btn-register');

    if (tab === 'login') {
      loginForm.classList.remove('hidden');
      regForm.classList.add('hidden');
      tabLogin.className = 'text-sm font-bold pb-2 border-b-2 border-sky-600 text-sky-600 transition';
      tabReg.className = 'text-sm font-bold pb-2 border-b-2 border-transparent text-slate-400 hover:text-slate-700 transition';
    } else {
      loginForm.classList.add('hidden');
      regForm.classList.remove('hidden');
      tabReg.className = 'text-sm font-bold pb-2 border-b-2 border-sky-600 text-sky-600 transition';
      tabLogin.className = 'text-sm font-bold pb-2 border-b-2 border-transparent text-slate-400 hover:text-slate-700 transition';
    }
  },

  togglePassword(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.type = el.type === 'password' ? 'text' : 'password';
  },

  fillDemo(role) {
    this.switchTab('login');
    const idEl = document.getElementById('login-identifier');
    const pwEl = document.getElementById('login-password');

    if (role === 'mahasiswa') {
      idEl.value = '22051204001';
      pwEl.value = 'mhs123';
    } else if (role === 'dosen') {
      idEl.value = '197805122003121001';
      pwEl.value = 'dosen123';
    } else if (role === 'admin') {
      idEl.value = 'admin@ilkom.ac.id';
      pwEl.value = 'admin123';
    }

    Toast.info(`Kredensial ${role.toUpperCase()} terisi. Klik 'Masuk ke Akun'.`);
  },

  async handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-submit-login');

    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      <span>Memverifikasi...</span>
    `;

    try {
      const res = await Api.auth.login(identifier, password);
      Toast.success(res.message || 'Login berhasil!');
      setTimeout(() => {
        App.navigateToDashboard();
      }, 300);
    } catch (err) {
      Toast.error(err.message || 'Gagal masuk akun');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>Masuk ke Akun</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`;
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const nim = document.getElementById('reg-nim').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const jurusan = document.getElementById('reg-jurusan').value;
    const password = document.getElementById('reg-password').value;

    try {
      const res = await Api.auth.register({ name, nim, email, jurusan, password });
      Toast.success(res.message || 'Pendaftaran berhasil!');
      setTimeout(() => {
        App.navigateToDashboard();
      }, 300);
    } catch (err) {
      Toast.error(err.message || 'Gagal mendaftar');
    }
  }
};

window.AuthView = AuthView;
