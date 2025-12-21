/**
 * Main Layout
 * Modern SaaS Layout - Fixed Sidebar + Main Content
 * Tailwind CSS ile profesyonel tasarım
 */

export class MainLayout {
  constructor(container) {
    this.container = container;
    this.currentRoute = null;
    this.sidebarOpen = false;
    this.userRole = null;
    this.render();
    this.loadUserRole();
    this.setupNavigation();
    this.setupMobileMenu();
  }

  async loadUserRole() {
    // Kullanıcı rolünü localStorage'dan veya API'den al
    try {
      const storedRole = localStorage.getItem('user_role');
      if (storedRole) {
        this.userRole = storedRole;
      } else {
        // API'den rol al (opsiyonel) - şimdilik varsayılan
        this.userRole = 'Bolum_Baskani'; // Varsayılan
        localStorage.setItem('user_role', this.userRole);
      }
      this.updateNavigation();
    } catch (error) {
      console.error('Kullanıcı rolü yüklenemedi:', error);
      this.userRole = 'Bolum_Baskani'; // Varsayılan
      this.updateNavigation();
    }
  }

  updateNavigation() {
    const navContainer = document.getElementById('main-navigation');
    if (!navContainer) return;

    let menuItems = [];

    // Bölüm Başkanı ve Admin menüleri
    if (this.userRole === 'Bolum_Baskani' || this.userRole === 'Admin') {
      menuItems.push(
        { route: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { route: '/admin/veri-yukleme', label: 'Veri Yükleme', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12', roles: ['Admin', 'Bolum_Baskani'] },
        { route: '/what-if', label: 'What-If Analizi', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { route: '/risk-analizi', label: 'Risk Analizi', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
      );
    }

    // Danışman menüleri
    if (this.userRole === 'Danisman' || this.userRole === 'Bolum_Baskani' || this.userRole === 'Admin') {
      menuItems.push(
        { route: '/danisman/dashboard', label: 'Danışman Paneli', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
      );
    }

    // Öğrenci menüleri
    if (this.userRole === 'Ogrenci') {
      menuItems.push(
        { route: '/ogrenci/dashboard', label: 'Öğrenci Paneli', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
      );
    }

    // Menü öğelerini render et
    navContainer.innerHTML = menuItems.map(item => `
      <a href="#${item.route}" class="nav-item flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-slate-900 transition-all duration-200 group" data-route="${item.route}">
        <svg class="w-5 h-5 text-slate-500 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}" />
        </svg>
        <span class="font-medium">${item.label}</span>
      </a>
    `).join('');

    // Menü event listener'larını yeniden bağla
    this.setupNavigation();
  }

  render() {
    this.container.innerHTML = `
      <div class="flex h-screen bg-slate-50">
        <!-- Mobile Overlay -->
        <div id="mobile-overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"></div>
        
        <!-- Sidebar -->
        <aside id="sidebar" class="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white text-slate-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 -translate-x-full lg:translate-x-0 flex flex-col border-r border-slate-200">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h1 class="text-xl font-bold text-slate-900">DEÜ KDS</h1>
              <p class="text-sm text-slate-600 mt-1">Karar Destek Sistemi</p>
            </div>
            <!-- Mobile Close Button -->
            <button id="mobile-close-btn" class="lg:hidden text-slate-500 hover:text-slate-900 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Navigation -->
          <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto" id="main-navigation">
            <!-- Rol bazlı menü buraya dinamik olarak eklenecek -->
            <div class="text-center py-8 text-slate-500">Yükleniyor...</div>
          </nav>
          
          <!-- Sidebar Profile -->
          <div class="p-6 border-t border-slate-200 bg-slate-50">
            <div class="flex items-center gap-3">
              <!-- Avatar Circle -->
              <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" id="user-avatar">
                U
              </div>
              <!-- User Info -->
              <div class="flex-1 min-w-0" id="user-info">
                <p class="text-sm font-semibold text-slate-900 whitespace-normal break-words leading-snug">Kullanıcı</p>
                <p class="text-xs text-slate-600 whitespace-normal break-words leading-snug" id="user-role">Yükleniyor...</p>
              </div>
              <!-- Logout Icon -->
              <button 
                id="logout-button"
                class="text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0" 
                title="Çıkış Yap"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <!-- Mobile Header -->
          <header class="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <button id="mobile-menu-btn" class="text-slate-600 hover:text-slate-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 class="text-lg font-bold text-slate-900">YİANS</h1>
            <div class="w-6"></div>
          </header>
          
          <!-- Main Content Area -->
          <main class="flex-1 overflow-y-auto bg-slate-50" id="main-content-container">
            <!-- Dashboard içeriği buraya render edilecek -->
          </main>
        </div>
      </div>
    `;
  }

  setupNavigation() {
    // Hash değişikliklerini dinle
    window.addEventListener('hashchange', () => {
      this.updateActiveMenu();
    });

    // İlk yüklemede aktif menüyü belirle
    this.updateActiveMenu();

    // Menü tıklamalarını dinle
    const navItems = this.container.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.getAttribute('data-route');
        window.location.hash = route;
        this.updateActiveMenu();
        // Mobilde menüyü kapat
        if (window.innerWidth < 1024) {
          this.closeSidebar();
        }
      });
    });
  }

  setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const sidebar = document.getElementById('sidebar');
    const logoutButton = document.getElementById('logout-button');

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        this.openSidebar();
      });
    }

    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', () => {
        this.closeSidebar();
      });
    }

    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', () => {
        this.closeSidebar();
      });
    }

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        this.handleLogout();
      });
    }

    // Kullanıcı bilgilerini güncelle
    this.updateUserInfo();

    // Ekran boyutu değiştiğinde sidebar'ı kontrol et
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        this.closeSidebar();
      }
    });
  }

  updateUserInfo() {
    const userRole = localStorage.getItem('user_role') || 'Kullanıcı';
    const userEmail = localStorage.getItem('user_email') || 'kullanici@deu.edu.tr';
    
    const roleLabels = {
      'Bolum_Baskani': 'Bölüm Başkanı',
      'Admin': 'Admin',
      'Danisman': 'Danışman',
      'Ogrenci': 'Öğrenci'
    };

    const userInfoDiv = document.getElementById('user-info');
    const userRoleDiv = document.getElementById('user-role');
    const userAvatar = document.getElementById('user-avatar');

    if (userInfoDiv) {
      userInfoDiv.querySelector('p').textContent = userEmail.split('@')[0];
    }

    if (userRoleDiv) {
      userRoleDiv.textContent = roleLabels[userRole] || userRole;
    }

    if (userAvatar) {
      const initials = userEmail.split('@')[0].substring(0, 2).toUpperCase();
      userAvatar.textContent = initials;
    }
  }

  handleLogout() {
    // LocalStorage'ı temizle
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');

    // Login sayfasına yönlendir
    window.location.hash = '/login';
    window.location.reload();
  }

  openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (sidebar && overlay) {
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
      this.sidebarOpen = true;
    }
  }

  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (sidebar && overlay) {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
      this.sidebarOpen = false;
    }
  }

  updateActiveMenu() {
    const currentHash = window.location.hash.slice(1) || '/dashboard';
    
    // Tüm nav-item'lardan active sınıfını kaldır
    const navItems = this.container.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active', 'bg-blue-50', 'text-blue-700', 'border-l-2', 'border-blue-600');
      item.classList.add('text-slate-600');
    });

    // Mevcut route'a göre aktif menüyü bul
    navItems.forEach(item => {
      const route = item.getAttribute('data-route');
      if (currentHash === route || currentHash.startsWith(route + '/')) {
        item.classList.add('active', 'bg-blue-50', 'text-blue-700', 'border-l-2', 'border-blue-600');
        item.classList.remove('text-slate-600');
      }
    });

    this.currentRoute = currentHash;
  }

  getMainContainer() {
    return document.getElementById('main-content-container');
  }

  destroy() {
    this.container.innerHTML = '';
  }
}
