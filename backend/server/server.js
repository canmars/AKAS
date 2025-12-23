import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dashboardRouter from './routers/dashboard.js';
import stageTrackingRouter from './routers/stageTracking.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/stage-tracking', stageTrackingRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Bir hata oluştu' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

