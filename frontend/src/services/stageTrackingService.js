/**
 * Stage Tracking Service
 * Aşama takibi verilerini çekmek için servis
 */

import { ApiClient } from './api.js';

export class StageTrackingService {
  /**
   * Aşama takibi özet verilerini çek
   */
  static async getSummary() {
    return ApiClient.get('/stage-tracking/summary');
  }

  /**
   * Aşama bazlı dağılımı çek (detaylı)
   */
  static async getStageDistribution() {
    return ApiClient.get('/stage-tracking/stage-distribution');
  }

  /**
   * Süre analizini çek
   */
  static async getDurationAnalysis() {
    return ApiClient.get('/stage-tracking/duration-analysis');
  }

  /**
   * Gecikme analizi ve riskli öğrencileri çek
   */
  static async getDelayedStudents(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.programId) queryParams.append('programId', filters.programId);
    if (filters.advisorId) queryParams.append('advisorId', filters.advisorId);
    if (filters.semester) queryParams.append('semester', filters.semester);
    
    const queryString = queryParams.toString();
    return ApiClient.get(`/stage-tracking/delayed-students${queryString ? '?' + queryString : ''}`);
  }
}

export default StageTrackingService;

