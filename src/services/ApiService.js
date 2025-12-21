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
        // 401 Unauthorized hatası için daha açıklayıcı mesaj
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid token');
        }
        throw new Error(data.error?.message || `API request failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      // 401 hatası için console.error yapma (zaten NotificationBell'de handle ediliyor)
      if (!error.message?.includes('Unauthorized')) {
        console.error('API Error:', error);
      }
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

  static async getOgrenci(filters = {}) {
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

  // ============================================
  // Excel Upload API
  // ============================================
  static async uploadExcel(file) {
    const formData = new FormData();
    formData.append('excelFile', file);

    const token = localStorage.getItem('auth_token');
    const url = `${API_BASE_URL}/admin/excel-upload/upload`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Excel yükleme başarısız');
    }

    return data;
  }

  static async getUploadHistory(limit = 20) {
    return this.get('/admin/excel-upload/history', { limit });
  }

  // ============================================
  // Dashboard API (Rol Bazlı)
  // ============================================
  static async getOgrenciDashboard() {
    return this.get('/dashboard/ogrenci');
  }

  static async getDanismanDashboard() {
    return this.get('/dashboard/danisman');
  }

  // ============================================
  // Stratejik Analiz API
  // ============================================
  static async getBasariTrendi(params = {}) {
    return this.get('/stratejik-analiz/basari-trendi', params);
  }

  static async getDanismanPerformans(params = {}) {
    return this.get('/stratejik-analiz/danisman-performans', params);
  }

  static async getSurecDarbogaz(params = {}) {
    return this.get('/stratejik-analiz/darbogaz', params);
  }

  static async getProgramBazliBasari(params = {}) {
    return this.get('/stratejik-analiz/program-basari', params);
  }

  static async getKritikDarbogazlar() {
    return this.get('/stratejik-analiz/kritik-darbogazlar');
  }

  static async getDanismanKarsilastirma(params = {}) {
    return this.get('/stratejik-analiz/danisman-karsilastirma', params);
  }

  // ============================================
  // Performans Raporları API
  // ============================================
  static async getDanismanPerformansRaporu(params = {}) {
    return this.get('/performans-raporlari/danisman', params);
  }

  static async getProgramPerformansRaporu(params = {}) {
    return this.get('/performans-raporlari/program', params);
  }

  static async getDonemBazliPerformans(params = {}) {
    return this.get('/performans-raporlari/donem', params);
  }

  static async getRiskYonetimiSkorlari(params = {}) {
    return this.get('/performans-raporlari/risk-yonetimi', params);
  }

  // ============================================
  // Veri Kalitesi API
  // ============================================
  static async getExcelYuklemeGecmisi(params = {}) {
    return this.get('/veri-kalitesi/excel-yukleme-gecmisi', params);
  }

  static async getDegisiklikLogu(params = {}) {
    return this.get('/veri-kalitesi/degisiklik-logu', params);
  }

  static async getYuklemeIstatistikleri(params = {}) {
    return this.get('/veri-kalitesi/yukleme-istatistikleri', params);
  }

  static async getDegisiklikIstatistikleri(params = {}) {
    return this.get('/veri-kalitesi/degisiklik-istatistikleri', params);
  }

  static async getVeriDogrulamaKontrolu() {
    return this.get('/veri-kalitesi/veri-dogrulama');
  }

  // ============================================
  // Akademik Takvim API
  // ============================================
  static async getAkademikTakvim(params = {}) {
    return this.get('/akademik-takvim', params);
  }

  static async getAktifDonem() {
    return this.get('/akademik-takvim/aktif');
  }

  static async getDonemBazliOgrenciSayilari(params = {}) {
    return this.get('/akademik-takvim/ogrenci-sayilari', params);
  }

  static async getDonemBazliRiskDagilimi(params = {}) {
    return this.get('/akademik-takvim/risk-dagilimi', params);
  }

  // ============================================
  // Milestone API
  // ============================================
  static async getMilestoneListesi(params = {}) {
    return this.get('/milestone', params);
  }

  static async getGecikmisMilestonelar() {
    return this.get('/milestone/gecikmis');
  }

  static async getTikToplantilari(params = {}) {
    return this.get('/milestone/tik', params);
  }

  static async getTikByOgrenciId(ogrenciId) {
    return this.get(`/milestone/tik/${ogrenciId}`);
  }

  static async getYaklasanTikToplantilari() {
    return this.get('/milestone/tik/yaklasan');
  }

  static async createTikToplanti(data) {
    return this.post('/milestone/tik', data);
  }

  static async olusturTikTakvimi(data) {
    return this.post('/milestone/tik/olustur-takvim', data);
  }

  static async getMilestoneByOgrenciId(ogrenciId) {
    return this.get(`/milestone/${ogrenciId}`);
  }

  static async createMilestone(data) {
    return this.post('/milestone', data);
  }

  static async updateMilestone(id, data) {
    return this.patch(`/milestone/${id}`, data);
  }

  // ============================================
  // Risk Analizi API (Güncellenmiş)
  // ============================================
  static async hesaplaRiskSkoru(ogrenciId) {
    return this.post(`/risk-analizi/hesapla/${ogrenciId}`);
  }

  static async getRiskAnalizi(filters = {}) {
    return this.get('/risk-analizi', filters);
  }

  static async getRiskAnaliziByOgrenciId(ogrenciId) {
    return this.get(`/risk-analizi/ogrenci/${ogrenciId}`);
  }

  static async getRiskDrillDown(ogrenciId) {
    return this.get(`/risk-analizi/drill-down/${ogrenciId}`);
  }

  // ============================================
  // Öğrenci API (Güncellenmiş)
  // ============================================
  static async getOgrenciYariyil(ogrenciId) {
    return this.get(`/ogrenci/${ogrenciId}/yariyil`);
  }

  static async updateOgrenciDurum(ogrenciId, data) {
    return this.patch(`/ogrenci/${ogrenciId}/durum`, data);
  }

  static async getOgrenciDurumGecmisi(ogrenciId) {
    return this.get(`/ogrenci/${ogrenciId}/durum-gecmisi`);
  }

  static async getTezDonemKayitlari(ogrenciId) {
    return this.get(`/ogrenci/${ogrenciId}/tez-donem-kayitlari`);
  }

  static async createTezDonemKayit(ogrenciId, data) {
    return this.post(`/ogrenci/${ogrenciId}/tez-donem-kayitlari`, data);
  }

  // ============================================
  // Bildirim API (Güncellenmiş)
  // ============================================
  static async getOkunmamisBildirimSayisi() {
    return this.get('/bildirim/okunmamis-sayisi');
  }

  static async getBildirimler(limit = 20) {
    return this.get('/dashboard/bildirimler', { limit });
  }

  static async markBildirimAsRead(bildirimId) {
    return this.patch(`/bildirim/${bildirimId}/okundu`);
  }

  // ============================================
  // Akademik Personel API (Güncellenmiş)
  // ============================================
  static async getKapasite() {
    return this.get('/akademik-personel/kapasite');
  }

  static async updateKapasite(personelId, data) {
    return this.post(`/akademik-personel/${personelId}/kapasite`, data);
  }

  static async onerDanisman(data) {
    return this.post('/akademik-personel/oner-danisman', data);
  }
}

export default ApiService;

