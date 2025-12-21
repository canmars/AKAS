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
      const parts = hash.split('/');
      if (parts.length >= 3 && parts[2] !== 'dashboard') {
        const ogrenciId = parts[2];
        this.showOgrenciDetay(ogrenciId);
      } else {
        this.showOgrenciDashboard();
      }
    } else if (hash.startsWith('/risk-analizi')) {
      this.showRiskAnaliziTableau();
    } else if (hash.startsWith('/what-if')) {
      this.showWhatIf();
    } else if (hash.startsWith('/admin/veri-yukleme')) {
      this.showAdminVeriYukleme();
    } else if (hash.startsWith('/ogrenci/dashboard')) {
      this.showOgrenciDashboard();
    } else if (hash.startsWith('/danisman/dashboard') || hash.startsWith('/akademisyen-yuku')) {
      this.showAkademisyenYuku();
    } else if (hash.startsWith('/stratejik-analiz')) {
      this.showStratejikAnaliz();
    } else if (hash.startsWith('/performans-raporlari')) {
      this.showPerformansRaporlari();
    } else if (hash.startsWith('/veri-kalitesi')) {
      this.showVeriKalitesi();
    } else if (hash.startsWith('/akademik-takvim')) {
      this.showAkademikTakvim();
    } else if (hash.startsWith('/milestone/tik')) {
      this.showTikToplantiTakvimi();
    } else if (hash.startsWith('/milestone')) {
      this.showMilestoneYonetim();
    } else if (hash.startsWith('/ogrenci') && !hash.startsWith('/ogrenci/') && !hash.startsWith('/ogrenci/dashboard')) {
      this.showOgrenciTakibi();
    } else if (hash.startsWith('/basvurular')) {
      this.showBasvurular();
    } else if (hash.startsWith('/ayarlar')) {
      this.showAyarlar();
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
    // Tableau style öğrenci detay sayfası
    import('../views/pages/OgrenciDetayPageTableau.js').then(({ OgrenciDetayPageTableau }) => {
      mainContainer.innerHTML = '';
      new OgrenciDetayPageTableau(mainContainer, ogrenciId);
    });
  }

  showRiskAnalizi() {
    this.showRiskAnaliziTableau();
  }

  showRiskAnaliziTableau() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/RiskAnaliziPageTableau.js').then(({ RiskAnaliziPageTableau }) => {
      mainContainer.innerHTML = '';
      new RiskAnaliziPageTableau(mainContainer);
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
    // Tableau style dashboard kullan
    import('../views/pages/DanismanDashboardPageTableau.js').then(({ DanismanDashboardPageTableau }) => {
      mainContainer.innerHTML = '';
      const page = new DanismanDashboardPageTableau(mainContainer);
      page.init();
    });
  }

  showAkademisyenYuku() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/AkademisyenYukuPage.js').then(({ AkademisyenYukuPage }) => {
      mainContainer.innerHTML = '';
      const page = new AkademisyenYukuPage(mainContainer);
      page.init();
    });
  }

  showStratejikAnaliz() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/StratejikAnalizPage.js').then(({ StratejikAnalizPage }) => {
      mainContainer.innerHTML = '';
      const page = new StratejikAnalizPage(mainContainer);
      page.init();
    });
  }

  showPerformansRaporlari() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/PerformansRaporlariPage.js').then(({ PerformansRaporlariPage }) => {
      mainContainer.innerHTML = '';
      const page = new PerformansRaporlariPage(mainContainer);
      page.init();
    });
  }

  showVeriKalitesi() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/VeriKalitesiPage.js').then(({ VeriKalitesiPage }) => {
      mainContainer.innerHTML = '';
      const page = new VeriKalitesiPage(mainContainer);
      page.init();
    });
  }

  showAkademikTakvim() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/AkademikTakvimPage.js').then(({ AkademikTakvimPage }) => {
      mainContainer.innerHTML = '';
      const page = new AkademikTakvimPage(mainContainer);
      page.init();
    });
  }

  showTikToplantiTakvimi() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/TikToplantiTakvimiPage.js').then(({ TikToplantiTakvimiPage }) => {
      mainContainer.innerHTML = '';
      new TikToplantiTakvimiPage(mainContainer);
    });
  }

  showMilestoneYonetim() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/MilestoneYonetimPage.js').then(({ MilestoneYonetimPage }) => {
      mainContainer.innerHTML = '';
      const page = new MilestoneYonetimPage(mainContainer);
      page.init();
    });
  }

  showOgrenciTakibi() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/OgrenciTakibiPage.js').then(({ OgrenciTakibiPage }) => {
      mainContainer.innerHTML = '';
      const page = new OgrenciTakibiPage(mainContainer);
      page.init();
    });
  }

  showBasvurular() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/BasvurularPage.js').then(({ BasvurularPage }) => {
      mainContainer.innerHTML = '';
      const page = new BasvurularPage(mainContainer);
      page.init();
    });
  }

  showAyarlar() {
    const mainContainer = this.mainLayout.getMainContainer();
    import('../views/pages/AyarlarPage.js').then(({ AyarlarPage }) => {
      mainContainer.innerHTML = '';
      const page = new AyarlarPage(mainContainer);
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
    
    // Kullanıcı rolüne göre dashboard sayfasını seç
    const userRole = localStorage.getItem('user_role') || 'Bolum_Baskani';
    
    // Rol bazlı dashboard routing
    if (userRole === 'Bolum_Baskani' || userRole === 'Admin') {
      // Bölüm Başkanı Dashboard (Tableau Style)
      import('../views/pages/BolumBaskaniDashboardPage.js').then(({ BolumBaskaniDashboardPage }) => {
        mainContainer.innerHTML = '';
        const page = new BolumBaskaniDashboardPage(mainContainer);
        page.init();
      });
    } else if (userRole === 'Danisman') {
      // Danışman Dashboard
      this.showDanismanDashboard();
    } else if (userRole === 'Ogrenci') {
      // Öğrenci Dashboard
      this.showOgrenciDashboard();
    } else {
      // Varsayılan: Bölüm Başkanı Dashboard
      import('../views/pages/BolumBaskaniDashboardPage.js').then(({ BolumBaskaniDashboardPage }) => {
        mainContainer.innerHTML = '';
        const page = new BolumBaskaniDashboardPage(mainContainer);
        page.init();
      });
    }
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
