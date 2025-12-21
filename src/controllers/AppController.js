/**
 * App Controller
 * Ana uygulama controller'ı
 */

import { AppView } from '../views/AppView.js';
import { MainLayout } from '../views/layouts/MainLayout.js';
import { DashboardController } from './DashboardController.js';

export class AppController {
  constructor(containerId) {
    this.containerId = containerId;
    this.view = new AppView(containerId);
    this.mainLayout = null;
    this.dashboardController = null;
    
    this.init();
  }

  init() {
    // Önce login kontrolü yap
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      // Login sayfasını göster
      this.setupRouting();
      this.handleRoute();
      return;
    }

    // MainLayout oluştur
    this.mainLayout = new MainLayout(this.view.container);
    
    // Routing yapısı
    this.setupRouting();
  }

  navigateTo(path) {
    window.location.hash = path;
    this.handleRoute();
  }

  setupRouting() {
    // Hash-based routing
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });

    // İlk yükleme
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/dashboard';
    
    // Login kontrolü
    const authToken = localStorage.getItem('auth_token');
    if (!authToken && hash !== '/login') {
      this.showLogin();
      return;
    }

    // Route pattern matching
    if (hash === '/login') {
      this.showLogin();
    } else if (hash === '/dashboard') {
      this.showDashboard();
    } else if (hash.startsWith('/ogrenci/')) {
      const ogrenciId = hash.split('/')[2];
      this.showOgrenciDetay(ogrenciId);
    } else if (hash.startsWith('/risk-analizi')) {
      this.showRiskAnalizi();
    } else if (hash.startsWith('/what-if')) {
      this.showWhatIf();
    } else if (hash.startsWith('/admin/veri-yukleme')) {
      this.showAdminVeriYukleme();
    } else if (hash.startsWith('/ogrenci/dashboard')) {
      this.showOgrenciDashboard();
    } else if (hash.startsWith('/danisman/dashboard')) {
      this.showDanismanDashboard();
    } else {
      this.showDashboard();
    }
  }

  showLogin() {
    // MainLayout'u gizle, sadece login sayfasını göster
    if (this.mainLayout) {
      this.mainLayout.destroy();
      this.mainLayout = null;
    }
    
    this.view.container.innerHTML = '';
    import('../views/pages/LoginPage.js').then(({ LoginPage }) => {
      new LoginPage(this.view.container);
    });
  }

  showOgrenciDetay(ogrenciId) {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/OgrenciDetayPage.js').then(({ OgrenciDetayPage }) => {
      mainContainer.innerHTML = '';
      new OgrenciDetayPage(mainContainer, ogrenciId);
    });
  }

  showRiskAnalizi() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/RiskAnaliziPage.js').then(({ RiskAnaliziPage }) => {
      mainContainer.innerHTML = '';
      new RiskAnaliziPage(mainContainer);
    });
  }

  showWhatIf() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/WhatIfPage.js').then(({ WhatIfPage }) => {
      mainContainer.innerHTML = '';
      new WhatIfPage(mainContainer);
    });
  }

  showAdminVeriYukleme() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/AdminVeriYuklemePage.js').then(({ AdminVeriYuklemePage }) => {
      mainContainer.innerHTML = '';
      const page = new AdminVeriYuklemePage(mainContainer);
      page.render();
    });
  }

  showOgrenciDashboard() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/OgrenciDashboardPage.js').then(({ OgrenciDashboardPage }) => {
      mainContainer.innerHTML = '';
      const page = new OgrenciDashboardPage(mainContainer);
      page.init();
    });
  }

  showDanismanDashboard() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/DanismanDashboardPage.js').then(({ DanismanDashboardPage }) => {
      mainContainer.innerHTML = '';
      const page = new DanismanDashboardPage(mainContainer);
      page.init();
    });
  }

  showDashboard() {
    // MainLayout'un main container'ını al
    const mainContainer = this.mainLayout.getMainContainer();
    
    if (!mainContainer) {
      console.error('Main container not found');
      return;
    }
    
    // AppView'ı main container ile güncelle
    const dashboardView = {
      container: mainContainer,
      showError: (message) => {
        if (mainContainer) {
          mainContainer.innerHTML = `<div class="error-message">${message}</div>`;
        }
      }
    };
    
    // Her seferinde yeni controller oluştur (temiz başlangıç için)
    if (this.dashboardController) {
      this.dashboardController.destroy();
    }
    this.dashboardController = new DashboardController(dashboardView);
    this.dashboardController.init();
  }

  destroy() {
    if (this.dashboardController) {
      this.dashboardController.destroy();
    }
    if (this.mainLayout) {
      this.mainLayout.destroy();
    }
  }
}
