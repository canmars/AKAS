/**
 * App Controller
 * Ana uygulama controller'ı
 */

import { AppView } from '../views/AppView.js';
import { DashboardController } from './DashboardController.js';

export class AppController {
  constructor(containerId) {
    this.containerId = containerId;
    this.view = new AppView(containerId);
    this.dashboardController = null;
    
    this.init();
  }

  init() {
    // Routing yapısı
    this.setupRouting();
    
    // İlk sayfayı yükle
    this.navigateTo('/dashboard');
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
    import('../views/pages/OgrenciDetayPage.js').then(({ OgrenciDetayPage }) => {
      this.view.clear();
      new OgrenciDetayPage(this.view.container, ogrenciId);
    });
  }

  showRiskAnalizi() {
    import('../views/pages/RiskAnaliziPage.js').then(({ RiskAnaliziPage }) => {
      this.view.clear();
      new RiskAnaliziPage(this.view.container);
    });
  }

  showWhatIf() {
    import('../views/pages/WhatIfPage.js').then(({ WhatIfPage }) => {
      this.view.clear();
      new WhatIfPage(this.view.container);
    });
  }

  showDashboard() {
    if (!this.dashboardController) {
      this.dashboardController = new DashboardController(this.view);
    }
    this.dashboardController.init();
  }

  destroy() {
    if (this.dashboardController) {
      this.dashboardController.destroy();
    }
  }
}
