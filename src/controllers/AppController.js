/**
 * App Controller
 * Minimal uygulama controller'ı - sadece "merhaba" gösterir
 */

import { AppView } from '../views/AppView.js';

export class AppController {
  constructor(containerId) {
    this.containerId = containerId;
    this.view = new AppView(containerId);
    
    this.init();
  }

  init() {
    // Sadece "merhaba" mesajını göster
    this.view.container.innerHTML = '<h1>Merhaba</h1>';
  }

  destroy() {
    // Temizlik yapılabilir
  }
}
