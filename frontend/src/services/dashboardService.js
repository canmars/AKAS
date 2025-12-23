/**
 * Dashboard Service
 * Dashboard verilerini çekmek için servis
 */

import { ApiClient } from './api.js';

export class DashboardService {
  /**
   * Dashboard özet verilerini çek
   */
  static async getSummary() {
    return ApiClient.get('/dashboard/summary');
  }

  /**
   * Program dağılımını çek
   */
  static async getProgramDistribution() {
    return ApiClient.get('/dashboard/program-distribution');
  }

  /**
   * Risk dağılımını çek
   */
  static async getRiskDistribution() {
    return ApiClient.get('/dashboard/risk-distribution');
  }

  /**
   * Danışman yük analizini çek
   */
  static async getAdvisorLoad() {
    return ApiClient.get('/dashboard/advisor-load');
  }

  /**
   * Aşama dağılımını çek
   */
  static async getStageDistribution() {
    return ApiClient.get('/dashboard/stage-distribution');
  }

  /**
   * Ders başarısızlık analizini çek
   */
  static async getCourseFailure() {
    return ApiClient.get('/dashboard/course-failure');
  }

  /**
   * Uyarıları çek
   */
  static async getAlerts() {
    return ApiClient.get('/dashboard/alerts');
  }

  /**
   * Mezuniyet trendlerini çek
   */
  static async getGraduationTrends() {
    return ApiClient.get('/dashboard/graduation-trends');
  }

  /**
   * Yaklaşan son tarihleri çek
   */
  static async getUpcomingDeadlines() {
    return ApiClient.get('/dashboard/upcoming-deadlines');
  }
}

export default DashboardService;

