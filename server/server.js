/**
 * Backend Server Entry Point
 * Express server yapılandırması ve route tanımları
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './middlewares/logger.js';
import router from './routers/index.js';
import { RiskScoreScheduler } from './services/RiskScoreScheduler.js';
import { NotificationScheduler } from './services/NotificationScheduler.js';
import { YariyilScheduler } from './services/YariyilScheduler.js';
import { StatusTransitionScheduler } from './services/StatusTransitionScheduler.js';

// Environment variables yükle
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware'ler
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', router);

// Error handling middleware (en sonda olmalı)
app.use(errorHandler);

// Server'ı başlat
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  
  // Scheduler'ları başlat (sadece production'da veya NODE_ENV=production ise)
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SCHEDULERS === 'true') {
    console.log('⏰ Scheduler\'lar başlatılıyor...');
    RiskScoreScheduler.start();
    NotificationScheduler.start();
    YariyilScheduler.start();
    StatusTransitionScheduler.start();
    console.log('✅ Scheduler\'lar başlatıldı.');
  } else {
    console.log('ℹ️  Scheduler\'lar dev modunda devre dışı. Aktif etmek için NODE_ENV=production veya ENABLE_SCHEDULERS=true ayarlayın.');
  }
});

export default app;

