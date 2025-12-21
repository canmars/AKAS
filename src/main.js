/**
 * Main Entry Point
 * Uygulama giriş noktası
 */

// Tailwind CSS ve Global Styles
import './styles/global.css';

import { AppController } from './controllers/AppController.js';
import { APP_CONFIG } from './utils/constants.js';

// Uygulamayı başlat
const app = new AppController(APP_CONFIG.CONTAINER_ID);

// Hata yakalama
window.addEventListener('error', (event) => {
  console.error('Uygulama hatası:', event.error);
});

// Sayfa kapatılırken temizlik yap
window.addEventListener('beforeunload', () => {
  if (app) {
    app.destroy();
  }
});
