/**
 * Simple Router
 * Hash-based routing sistemi
 */

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.init();
  }

  init() {
    // Hash değişikliklerini dinle
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Sayfa yüklendiğinde route'u kontrol et
    window.addEventListener('load', () => this.handleRoute());
  }

  /**
   * Route tanımla
   * @param {string} path - Route path (örn: '/dashboard')
   * @param {Function} handler - Route handler fonksiyonu
   * @param {Object} options - Route seçenekleri (requiresRole, etc.)
   */
  route(path, handler, options = {}) {
    this.routes.set(path, { handler, options });
  }

  /**
   * Mevcut route'u işle
   */
  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const route = this.routes.get(hash);

    if (route) {
      // Rol kontrolü
      if (route.options.requiresRole) {
        const userRole = localStorage.getItem('userRole');
        if (!userRole || !route.options.requiresRole.includes(userRole)) {
          // Rol uygun değilse rol seçim ekranına yönlendir
          this.navigate('/');
          return;
        }
      }

      // Route handler'ı çalıştır
      this.currentRoute = hash;
      route.handler();
    } else {
      // Route bulunamadı, 404 sayfası göster
      this.show404();
    }
  }

  /**
   * Yeni route'a git
   * @param {string} path - Route path
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * 404 sayfası göster
   */
  show404() {
    const app = document.querySelector('#app');
    if (app) {
      app.innerHTML = `
        <div class="min-h-screen bg-base-200 flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-6xl font-bold mb-4">404</h1>
            <p class="text-xl mb-4">Sayfa bulunamadı</p>
            <button class="btn btn-primary" onclick="window.location.hash = '/'">Ana Sayfaya Dön</button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Mevcut route'u döndür
   */
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Singleton instance
export const router = new Router();

