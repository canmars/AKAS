/**
 * Dashboard Controller
 * Dashboard iş mantığı
 */

import * as dashboardQueries from '../db/queries/dashboard.js';

export const dashboardController = {
  /**
   * Dashboard özet verileri
   */
  async getSummary(req, res) {
    try {
      const summary = await dashboardQueries.getSummary();
      res.json(summary);
    } catch (error) {
      console.error('Dashboard summary error:', error);
      res.status(500).json({ error: 'Dashboard özet verileri alınamadı' });
    }
  },

  /**
   * Program dağılımı
   */
  async getProgramDistribution(req, res) {
    try {
      const distribution = await dashboardQueries.getProgramDistribution();
      res.json(distribution);
    } catch (error) {
      console.error('Program distribution error:', error);
      res.status(500).json({ error: 'Program dağılımı alınamadı' });
    }
  },

  /**
   * Risk dağılımı
   */
  async getRiskDistribution(req, res) {
    try {
      const distribution = await dashboardQueries.getRiskDistribution();
      res.json(distribution);
    } catch (error) {
      console.error('Risk distribution error:', error);
      res.status(500).json({ error: 'Risk dağılımı alınamadı' });
    }
  },

  /**
   * Danışman yük analizi
   */
  async getAdvisorLoad(req, res) {
    try {
      const load = await dashboardQueries.getAdvisorLoad();
      res.json(load);
    } catch (error) {
      console.error('Advisor load error:', error);
      res.status(500).json({ error: 'Danışman yük analizi alınamadı' });
    }
  },

  /**
   * Aşama dağılımı
   */
  async getStageDistribution(req, res) {
    try {
      const distribution = await dashboardQueries.getStageDistribution();
      res.json(distribution);
    } catch (error) {
      console.error('Stage distribution error:', error);
      res.status(500).json({ error: 'Aşama dağılımı alınamadı' });
    }
  },

  /**
   * Ders başarısızlık analizi
   */
  async getCourseFailure(req, res) {
    try {
      const failure = await dashboardQueries.getCourseFailure();
      res.json(failure);
    } catch (error) {
      console.error('Course failure error:', error);
      res.status(500).json({ error: 'Ders başarısızlık analizi alınamadı' });
    }
  },

  /**
   * Uyarılar
   */
  async getAlerts(req, res) {
    try {
      const alerts = await dashboardQueries.getAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Alerts error:', error);
      res.status(500).json({ error: 'Uyarılar alınamadı' });
    }
  },

  /**
   * Mezuniyet trendleri
   */
  async getGraduationTrends(req, res) {
    try {
      const trends = await dashboardQueries.getGraduationTrends();
      res.json(trends);
    } catch (error) {
      console.error('Graduation trends error:', error);
      res.status(500).json({ error: 'Mezuniyet trendleri alınamadı' });
    }
  },

  /**
   * Yaklaşan son tarihler
   */
  async getUpcomingDeadlines(req, res) {
    try {
      const deadlines = await dashboardQueries.getUpcomingDeadlines();
      res.json(deadlines);
    } catch (error) {
      console.error('Upcoming deadlines error:', error);
      res.status(500).json({ error: 'Yaklaşan son tarihler alınamadı' });
    }
  },
};

