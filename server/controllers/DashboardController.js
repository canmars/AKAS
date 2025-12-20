/**
 * Dashboard Controller
 * Dashboard iş mantığı
 */

import { dashboardQueries } from '../db/queries/dashboardQueries.js';
import { supabaseAdmin } from '../db/connection.js';

export class DashboardController {
  /**
   * KPI metrikleri
   */
  static async getKPI(req, res, next) {
    try {
      const kpi = await dashboardQueries.getKPIMetrics();
      res.json({ success: true, data: kpi });
    } catch (error) {
      next(error);
    }
  }

  /**
   * KPI metrikleri (alias)
   */
  static async getKPIMetrics(req, res, next) {
    return this.getKPI(req, res, next);
  }

  /**
   * Risk dağılımı
   */
  static async getRiskDagilimi(req, res, next) {
    try {
      const dagilim = await dashboardQueries.getRiskDagilimi();
      res.json({ success: true, data: dagilim });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Program dağılımı
   */
  static async getProgramDagilimi(req, res, next) {
    try {
      const dagilim = await dashboardQueries.getProgramDagilimi();
      res.json({ success: true, data: dagilim });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Danışman yük
   */
  static async getDanismanYuk(req, res, next) {
    try {
      const yuk = await dashboardQueries.getDanismanYuk();
      res.json({ success: true, data: yuk });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Süreç hattı
   */
  static async getSurecHatti(req, res, next) {
    try {
      const hatti = await dashboardQueries.getSurecHattiDagilimi();
      res.json({ success: true, data: hatti });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Öğrenci Dashboard verileri
   * GET /api/dashboard/ogrenci
   */
  static async getOgrenciDashboard(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' }
        });
      }

      // Öğrenci ID'sini kullanıcıdan al
      const { data: kullanici, error: kullaniciError } = await supabaseAdmin
        .from('kullanicilar')
        .select('ogrenci_id')
        .eq('kullanici_id', req.user.id)
        .single();

      if (kullaniciError || !kullanici || !kullanici.ogrenci_id) {
        return res.status(404).json({
          success: false,
          error: { message: 'Öğrenci bulunamadı' }
        });
      }

      // Öğrenci bilgilerini al
      const { data: ogrenci, error: ogrenciError } = await supabaseAdmin
        .from('ogrenci')
        .select(`
          *,
          program_turleri(*),
          durum_turleri(*),
          ogrenci_akademik_durum(*)
        `)
        .eq('ogrenci_id', kullanici.ogrenci_id)
        .single();

      if (ogrenciError) throw ogrenciError;

      // Risk analizini ayrı al (en son)
      const { data: riskAnalizi, error: riskError } = await supabaseAdmin
        .from('ogrenci_risk_analizi')
        .select('risk_skoru, risk_seviyesi, hesaplama_tarihi')
        .eq('ogrenci_id', kullanici.ogrenci_id)
        .order('hesaplama_tarihi', { ascending: false })
        .limit(1)
        .single();

      if (riskAnalizi) {
        ogrenci.ogrenci_risk_analizi = [riskAnalizi];
      }

      if (ogrenciError) throw ogrenciError;

      // Milestone'ları al
      const { data: milestones, error: milestoneError } = await supabaseAdmin
        .from('akademik_milestone')
        .select('*')
        .eq('ogrenci_id', kullanici.ogrenci_id)
        .order('hedef_tarih', { ascending: true });

      if (milestoneError) throw milestoneError;

      // TİK toplantılarını al
      const { data: tikToplantilari, error: tikError } = await supabaseAdmin
        .from('tik_toplantilari')
        .select('*')
        .eq('ogrenci_id', kullanici.ogrenci_id)
        .order('toplanti_tarihi', { ascending: false })
        .limit(5);

      if (tikError) throw tikError;

      res.json({
        success: true,
        data: {
          ogrenci,
          milestones,
          tikToplantilari
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Danışman Dashboard verileri
   * GET /api/dashboard/danisman
   */
  static async getDanismanDashboard(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' }
        });
      }

      // Danışman ID'sini kullanıcıdan al
      const { data: kullanici, error: kullaniciError } = await supabaseAdmin
        .from('kullanicilar')
        .select('akademik_personel_id')
        .eq('kullanici_id', req.user.id)
        .single();

      if (kullaniciError || !kullanici || !kullanici.akademik_personel_id) {
        return res.status(404).json({
          success: false,
          error: { message: 'Danışman bulunamadı' }
        });
      }

      const danismanId = kullanici.akademik_personel_id;

      // Danışman bilgilerini al
      const { data: danisman, error: danismanError } = await supabaseAdmin
        .from('akademik_personel')
        .select('*')
        .eq('personel_id', danismanId)
        .single();

      if (danismanError) throw danismanError;

      // Yük bilgisini al
      const { data: yukData, error: yukError } = await supabaseAdmin
        .from('akademik_personel_yuk_view')
        .select('*')
        .eq('personel_id', danismanId)
        .single();

      if (yukError) throw yukError;

      // Onay bekleyen milestone'ları al
      const { data: onayBekleyenMilestones, error: milestoneError } = await supabaseAdmin
        .from('akademik_milestone')
        .select(`
          *,
          ogrenci!inner(ogrenci_id, ad, soyad, program_turleri(program_adi))
        `)
        .eq('danisman_id', danismanId)
        .eq('durum', 'Beklemede')
        .order('hedef_tarih', { ascending: true });

      if (milestoneError) throw milestoneError;

      // Riskli öğrencileri al (risk skoru >= 50)
      // Önce danışmanın öğrencilerini al
      const { data: danismanOgrencileri, error: ogrenciError2 } = await supabaseAdmin
        .from('ogrenci')
        .select('ogrenci_id, ad, soyad, program_turleri(program_adi)')
        .eq('danisman_id', danismanId)
        .eq('soft_delete', false);

      if (ogrenciError2) throw ogrenciError2;

      // Sonra risk skorlarını al
      const ogrenciIds = danismanOgrencileri.map(o => o.ogrenci_id);
      let riskliOgrenciler = [];

      if (ogrenciIds.length > 0) {
        const { data: riskData, error: riskError } = await supabaseAdmin
          .from('ogrenci_mevcut_durum_view')
          .select('ogrenci_id, mevcut_risk_skoru, mevcut_asinama')
          .in('ogrenci_id', ogrenciIds)
          .gte('mevcut_risk_skoru', 50)
          .order('mevcut_risk_skoru', { ascending: false })
          .limit(10);

        if (riskError) throw riskError;

        // Öğrenci bilgileriyle birleştir
        riskliOgrenciler = riskData.map(risk => {
          const ogrenci = danismanOgrencileri.find(o => o.ogrenci_id === risk.ogrenci_id);
          return {
            ...risk,
            ogrenci
          };
        });
      }

      if (riskError) throw riskError;

      res.json({
        success: true,
        data: {
          danisman,
          yuk: yukData,
          onayBekleyenMilestones,
          riskliOgrenciler
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Kritik öğrenciler
   */
  static async getKritikOgrenciler(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const ogrenciler = await dashboardQueries.getKritikOgrenciler(limit);
      res.json({ success: true, data: ogrenciler });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bildirimler
   */
  static async getBildirimler(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const kullaniciId = req.user?.id;
      const bildirimler = await dashboardQueries.getBildirimler(kullaniciId, limit);
      res.json({ success: true, data: bildirimler });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Attrition Data
   */
  static async getAttritionData(req, res, next) {
    try {
      const data = await dashboardQueries.getAttritionData();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bottleneck Data
   */
  static async getBottleneckData(req, res, next) {
    try {
      const data = await dashboardQueries.getBottleneckData();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
