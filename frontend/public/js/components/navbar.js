const Navbar = {
  render() {
    const user = Api.getUser();
    const currentRoute = App.currentRoute || 'landing';

    let authSection = '';

    if (user) {
      let roleBadge = '';
      if (user.role === 'admin') roleBadge = '<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>';
      else if (user.role === 'dosen') roleBadge = '<span class="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">DOSEN</span>';
      else roleBadge = '<span class="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">MAHASISWA</span>';

      authSection = `
        <div class="flex items-center gap-3">
          <!-- User Profile Menu -->
          <div class="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200 transition cursor-pointer" onclick="App.navigateToDashboard()">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}" class="w-8 h-8 rounded-full object-cover border-2 border-sky-500 shadow-xs" alt="${user.name}">
            <div class="text-left">
              <div class="text-xs font-bold text-slate-800 flex items-center gap-1.5">${user.name} ${roleBadge}</div>
              <div class="text-[10px] text-slate-500 font-mono">${user.nim || user.nip || user.email}</div>
            </div>
          </div>

          <!-- Logout Button -->
          <button onclick="App.logout()" title="Keluar Akun" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1 text-xs font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span class="hidden sm:inline">Keluar</span>
          </button>
        </div>
      `;
    } else {
      authSection = `
        <div class="flex items-center gap-3">
          <button onclick="App.navigate('login'); AuthView.switchTab('register');" class="hidden sm:inline-block text-xs font-bold text-slate-600 hover:text-slate-900 transition">
            Daftar Akun
          </button>
          <button onclick="App.navigate('login'); AuthView.switchTab('login');" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            <span>Masuk</span>
          </button>
        </div>
      `;
    }

    const navLinks = `
      <a href="#landing" onclick="App.navigate('landing'); return false;" class="px-3 py-2 rounded-lg text-sm font-semibold transition ${currentRoute === 'landing' ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900'}">
        Beranda
      </a>
      <a href="#booking" onclick="App.navigate('booking'); return false;" class="px-3 py-2 rounded-lg text-sm font-semibold transition ${currentRoute === 'booking' ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900'}">
        Pinjam Lab
      </a>
      <a href="#jadwal" onclick="App.navigate('jadwal'); return false;" class="px-3 py-2 rounded-lg text-sm font-semibold transition ${currentRoute === 'jadwal' ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900'}">
        Jadwal & Status
      </a>
      ${user ? `
        <a href="#dashboard" onclick="App.navigateToDashboard(); return false;" class="px-3 py-2 rounded-lg text-sm font-semibold transition ${['admin', 'dosen', 'mahasiswa'].includes(currentRoute) ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900'}">
          Dashboard ${user.role === 'admin' ? 'Admin' : user.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}
        </a>
      ` : ''}
    `;

    return `
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            
            <!-- Brand Logo -->
            <div class="flex items-center gap-3 cursor-pointer" onclick="App.navigate('landing')">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
                L
              </div>
              <div>
                <span class="font-extrabold text-lg tracking-tight text-slate-900">LAB <span class="text-sky-600">ILKOM</span></span>
                <span class="hidden sm:inline-block text-[10px] uppercase font-bold text-slate-400 block tracking-widest leading-none">Sistem Informasi Lab</span>
              </div>
            </div>

            <!-- Desktop Navigation Links -->
            <nav class="hidden md:flex items-center space-x-1">
              ${navLinks}
            </nav>

            <!-- User Auth & Login Section -->
            <div>
              ${authSection}
            </div>

          </div>
        </div>
      </header>
    `;
  }
};

window.Navbar = Navbar;
