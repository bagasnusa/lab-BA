const App = {
  currentRoute: 'landing',

  async init() {
    // Check if route hash exists, otherwise default to landing
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();
  },

  async handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'landing';
    this.currentRoute = hash;

    const user = Api.getUser();

    // Route guard for protected dashboards
    if (['admin', 'dosen', 'mahasiswa'].includes(hash) && !user) {
      Toast.warning('Silakan masuk ke akun Anda terlebih dahulu.');
      window.location.hash = 'login';
      return;
    }

    const navbarContainer = document.getElementById('navbar-root');
    const mainContainer = document.getElementById('main-content');

    if (navbarContainer) {
      navbarContainer.innerHTML = Navbar.render();
    }

    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="min-h-[60vh] flex items-center justify-center">
          <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin w-8 h-8 text-sky-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            <span class="text-xs font-semibold text-slate-400">Memuat Halaman...</span>
          </div>
        </div>
      `;

      let viewHtml = '';
      let postRenderFn = null;

      try {
        switch (hash) {
          case 'landing':
            viewHtml = await LandingView.render();
            break;

          case 'login':
            viewHtml = AuthView.render();
            break;

          case 'admin':
            viewHtml = await AdminDashboard.render();
            break;

          case 'dosen':
            viewHtml = await DosenDashboard.render();
            break;

          case 'mahasiswa':
            viewHtml = await MahasiswaDashboard.render();
            postRenderFn = () => MahasiswaDashboard.postRender();
            break;

          case 'booking':
            viewHtml = await BookingFormView.render();
            postRenderFn = () => BookingFormView.updateSummary();
            break;

          case 'jadwal':
            viewHtml = await ScheduleTableView.render();
            break;

          case 'dashboard':
            this.navigateToDashboard();
            return;

          default:
            viewHtml = await LandingView.render();
            break;
        }

        mainContainer.innerHTML = viewHtml;
        if (postRenderFn) setTimeout(postRenderFn, 50);

      } catch (err) {
        console.error('Error rendering route:', err);
        mainContainer.innerHTML = `
          <div class="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4 shadow-sm">
            <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">⚠️</div>
            <h3 class="font-bold text-slate-900">Terjadi Kesalahan Memuat Halaman</h3>
            <p class="text-xs text-slate-500">${err.message}</p>
            <button onclick="App.navigate('landing')" class="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">Kembali ke Beranda</button>
          </div>
        `;
      }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  navigate(route) {
    window.location.hash = route;
  },

  refreshCurrentView() {
    this.handleRouting();
  },

  navigateToDashboard() {
    const user = Api.getUser();
    if (!user) {
      this.navigate('login');
      return;
    }
    if (user.role === 'admin') this.navigate('admin');
    else if (user.role === 'dosen') this.navigate('dosen');
    else this.navigate('mahasiswa');
  },

  startBookingWithLab(labId) {
    const user = Api.getUser();
    if (!user) {
      Toast.info('Silakan masuk ke akun terlebih dahulu untuk meminjam lab.');
      this.navigate('login');
      return;
    }
    BookingFormView.preselectedLabId = labId;
    this.navigate('booking');
  },

  logout() {
    Api.auth.logout();
    Toast.info('Anda telah keluar dari akun.');
    this.navigate('landing');
  }
};

window.App = App;

// Bootstrap on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
