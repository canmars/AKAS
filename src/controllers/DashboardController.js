/**
 * Dashboard Controller
 * Dashboard iş mantığı
 */

import ApiService from '../services/ApiService.js';
import { DashboardPage } from '../views/pages/DashboardPage.js';

export class DashboardController {
  constructor(view) {
    this.view = view;
    this.page = null;
  }

  async init() {
    try {
      // Önceki sayfayı temizle
      if (this.page) {
        this.page.destroy();
      }
      
      // Container'ı temizle
      if (this.view.container) {
        this.view.container.innerHTML = '';
      }
      
      // Dashboard sayfasını oluştur ve verileri yükle
      this.page = new DashboardPage(this.view.container);
      await this.page.init();
    } catch (error) {
      console.error('Dashboard init error:', error);
      if (this.view.container) {
        this.view.container.innerHTML = `<div class="error-message">Dashboard yüklenirken bir hata oluştu: ${error.message}</div>`;
      }
    }
  }

  destroy() {
    if (this.page) {
      this.page.destroy();
    }
  }
}

