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
    
    // Route pattern matching
    if (hash === '/dashboard') {
      this.showDashboard();
    } else if (hash.startsWith('/ogrenci/')) {
      const ogrenciId = hash.split('/')[2];
      this.showOgrenciDetay(ogrenciId);
    } else if (hash.startsWith('/risk-analizi')) {
      this.showRiskAnalizi();
    } else if (hash.startsWith('/what-if')) {
      this.showWhatIf();
    } else {
      this.showDashboard();
    }
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
