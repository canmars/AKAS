/**
 * Stage Tracking Controller
 * Aşama takibi iş mantığı
 */

import * as stageTrackingQueries from '../db/queries/stageTracking.js';

export const stageTrackingController = {
  /**
   * Aşama takibi özet verileri
   */
  async getSummary(req, res) {
    try {
      const summary = await stageTrackingQueries.getStageTrackingSummary();
      res.json(summary);
    } catch (error) {
      console.error('Stage tracking summary error:', error);
      res.status(500).json({ error: 'Aşama takibi özet verileri alınamadı' });
    }
  },

  /**
   * Aşama bazlı dağılım (detaylı)
   */
  async getStageDistribution(req, res) {
    try {
      const distribution = await stageTrackingQueries.getStageDistributionDetailed();
      res.json(distribution);
    } catch (error) {
      console.error('Stage distribution error:', error);
      res.status(500).json({ error: 'Aşama dağılımı alınamadı' });
    }
  },

  /**
   * Süre analizi
   */
  async getDurationAnalysis(req, res) {
    try {
      const analysis = await stageTrackingQueries.getDurationAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error('Duration analysis error:', error);
      res.status(500).json({ error: 'Süre analizi alınamadı' });
    }
  },

  /**
   * Gecikme analizi ve riskli öğrenciler
   */
  async getDelayedStudents(req, res) {
    try {
      const filters = {
        programId: req.query.programId,
        advisorId: req.query.advisorId,
        semester: req.query.semester,
      };
      const students = await stageTrackingQueries.getDelayedStudents(filters);
      res.json(students);
    } catch (error) {
      console.error('Delayed students error:', error);
      res.status(500).json({ error: 'Gecikme analizi alınamadı' });
    }
  },
};

