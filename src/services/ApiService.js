/**
 * API Service
 * Backend API çağrıları
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  /**
   * Generic fetch wrapper
   */
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Auth token varsa ekle
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  static async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  static async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  static async patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  static async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Dashboard API
  // ============================================
  static async getKPIMetrics() {
    return this.get('/dashboard/kpi');
  }

  static async getRiskDagilimi() {
    return this.get('/dashboard/risk-dagilimi');
  }

  static async getProgramDagilimi() {
    return this.get('/dashboard/program-dagilimi');
  }

  static async getKritikOgrenciler(limit = 10) {
    return this.get('/dashboard/kritik-ogrenciler', { limit });
  }

  static async getDanismanYuk() {
    return this.get('/dashboard/danisman-yuk');
  }

  static async getBildirimler(limit = 20) {
    return this.get('/dashboard/bildirimler', { limit });
  }

  static async getAttritionData() {
    return this.get('/dashboard/attrition-data');
  }

  static async getBottleneckData() {
    return this.get('/dashboard/bottleneck-data');
  }

  static async getSurecHatti() {
    return this.get('/dashboard/surec-hatti');
  }

  // ============================================
  // Öğrenci API
  // ============================================
  static async getOgrenciler(filters = {}) {
    return this.get('/ogrenci', filters);
  }

  static async getOgrenciById(id) {
    return this.get(`/ogrenci/${id}`);
  }

  static async getOgrenciRiskAnalizi(id) {
    return this.get(`/ogrenci/${id}/risk-analizi`);
  }

  // ============================================
  // What-If API
  // ============================================
  static async runSimulation(simulationData) {
    return this.post('/what-if/simulasyon', simulationData);
  }
}

export default ApiService;

