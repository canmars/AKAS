/**
 * Main Entry Point
 * Minimal uygulama giriş noktası
 */

// Tailwind CSS ve Global Styles
import './styles/global.css';

import { AppController } from './controllers/AppController.js';

// Uygulamayı başlat
const app = new AppController('#app');
