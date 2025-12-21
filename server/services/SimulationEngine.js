/**
 * Simulation Engine
 * Monte Carlo simülasyonu, kapasite optimizasyonu ve risk propagasyon modeli
 */

import { supabaseAdmin } from '../db/connection.js';

export class SimulationEngine {
  /**
   * Monte Carlo simülasyonu ile gelecek projeksiyonu
   * 2 yıllık kontenjan değişikliği etkisini ölçer
   * @param {Object} params - Simülasyon parametreleri
   * @param {number} params.yeniOgrenciSayisi - Yeni alınacak öğrenci sayısı
   * @param {Object} params.programTuruDagilimi - Program türü dağılımı (opsiyonel)
   * @param {number} params.simulasyonYili - Simülasyon yılı (varsayılan: 2)
   * @returns {Promise<Object>} Simülasyon sonuçları
   */
  async monteCarloProjection(params) {
    const {
      yeniOgrenciSayisi,
      programTuruDagilimi = null,
      simulasyonYili = 2
    } = params;

    try {
      // Mevcut durumu al
      const mevcutDurum = await this.getMevcutDurum();

      // Her yıl için simülasyon yap
      const projeksiyon = [];
      let mevcutOgrenciSayisi = mevcutDurum.toplamOgrenci;

      for (let yil = 1; yil <= simulasyonYili; yil++) {
        // Yeni öğrenciler ekle
        mevcutOgrenciSayisi += yeniOgrenciSayisi;

        // Mezuniyet tahmini (Monte Carlo)
        const mezuniyetOrani = await this.hesaplaMezuniyetOrani();
        const tahminiMezunSayisi = Math.floor(mevcutOgrenciSayisi * mezuniyetOrani);

        // Kapasite analizi
        const kapasiteAnalizi = await this.analizEtKapasite(mevcutOgrenciSayisi);

        projeksiyon.push({
          yil,
          toplamOgrenci: mevcutOgrenciSayisi,
          tahminiMezunSayisi,
          netOgrenciArtisi: yeniOgrenciSayisi - tahminiMezunSayisi,
          kapasiteAnalizi
        });

        // Bir sonraki yıl için güncelle
        mevcutOgrenciSayisi -= tahminiMezunSayisi;
      }

      return {
        baslangicDurumu: mevcutDurum,
        projeksiyon,
        oneriler: this.uretoneriler(projeksiyon)
      };
    } catch (error) {
      console.error('Monte Carlo simülasyon hatası:', error);
      throw error;
    }
  }

  /**
   * Kapasite optimizasyon algoritması
   * Greedy algorithm ile optimal öğrenci-dağılımı hesaplar
   * @param {Array} ogrenciListesi - Yeni öğrenci listesi
   * @param {Array} danismanListesi - Danışman listesi
   * @returns {Promise<Object>} Optimal dağılım
   */
  async optimizeCapacityDistribution(ogrenciListesi, danismanListesi) {
    try {
      // Mevcut yükleri al
      const mevcutYukler = await this.getMevcutYukler(danismanListesi);

      // Greedy algorithm: En az yüklü danışmana öğrenci ata
      const dagilim = [];
      const yukler = { ...mevcutYukler };

      // Danışmanları kalan kapasiteye göre sırala
      const danismanlarSirali = danismanListesi
        .map(d => ({
          ...d,
          kalanKapasite: d.maksimum_kapasite - (yukler[d.personel_id] || 0)
        }))
        .filter(d => d.kalanKapasite > 0)
        .sort((a, b) => b.kalanKapasite - a.kalanKapasite);

      let atananOgrenciSayisi = 0;

      for (const ogrenci of ogrenciListesi) {
        // En uygun danışmanı bul
        const uygunDanisman = danismanlarSirali.find(d => 
          (yukler[d.personel_id] || 0) < d.maksimum_kapasite
        );

        if (uygunDanisman) {
          // Öğrenciyi ata
          if (!yukler[uygunDanisman.personel_id]) {
            yukler[uygunDanisman.personel_id] = 0;
          }
          yukler[uygunDanisman.personel_id]++;

          dagilim.push({
            ogrenci_id: ogrenci.ogrenci_id || ogrenci.id,
            danisman_id: uygunDanisman.personel_id,
            danisman_adi: `${uygunDanisman.ad} ${uygunDanisman.soyad}`
          });

          atananOgrenciSayisi++;

          // Sıralamayı güncelle
          const danismanIndex = danismanlarSirali.findIndex(d => 
            d.personel_id === uygunDanisman.personel_id
          );
          if (danismanIndex !== -1) {
            danismanlarSirali[danismanIndex].kalanKapasite--;
            danismanlarSirali.sort((a, b) => b.kalanKapasite - a.kalanKapasite);
          }
        }
      }

      return {
        dagilim,
        atananOgrenciSayisi,
        atanamayanOgrenciSayisi: ogrenciListesi.length - atananOgrenciSayisi,
        yukler,
        uyari: ogrenciListesi.length > atananOgrenciSayisi 
          ? `${ogrenciListesi.length - atananOgrenciSayisi} öğrenci atanamadı. Yeterli kapasite yok.`
          : null
      };
    } catch (error) {
      console.error('Kapasite optimizasyon hatası:', error);
      throw error;
    }
  }

  /**
   * Risk propagasyon modeli
   * Öğrencinin gelecekteki risk skorunu tahmin eder
   * @param {string} ogrenciId - Öğrenci ID
   * @param {number} zamanAraligi - Tahmin edilecek zaman aralığı (ay)
   * @returns {Promise<Object>} Risk propagasyon sonuçları
   */
  async calculateRiskPropagation(ogrenciId, zamanAraligi = 12) {
    try {
      // Mevcut risk faktörlerini al
      const mevcutRisk = await this.getMevcutRiskFaktorleri(ogrenciId);

      // Trend analizi
      const trend = await this.analizEtTrend(ogrenciId);

      // Gelecek risk skorunu hesapla
      const gelecekRiskSkorlari = [];
      let mevcutRiskSkoru = mevcutRisk.risk_skoru || 0;

      for (let ay = 1; ay <= zamanAraligi; ay++) {
        // Trend'e göre risk skorunu güncelle
        const trendEtkisi = trend.aylikDegisim || 0;
        mevcutRiskSkoru += trendEtkisi;

        // Süre aşımı etkisi (zaman geçtikçe risk artar)
        const sureEtkisi = ay * 0.5; // Her ay +0.5 puan
        mevcutRiskSkoru += sureEtkisi;

        // Sınırları kontrol et
        mevcutRiskSkoru = Math.max(0, Math.min(100, mevcutRiskSkoru));

        gelecekRiskSkorlari.push({
          ay,
          tahminiRiskSkoru: Math.round(mevcutRiskSkoru),
          riskSeviyesi: this.getRiskSeviyesi(mevcutRiskSkoru)
        });
      }

      return {
        mevcutRiskSkoru: mevcutRisk.risk_skoru,
        gelecekRiskSkorlari,
        trendAnalizi: trend,
        uyari: mevcutRiskSkoru >= 70 
          ? 'Kritik risk seviyesinde. Acil müdahale önerilir.'
          : mevcutRiskSkoru >= 50
          ? 'Yüksek risk seviyesinde. Dikkatli takip edilmeli.'
          : null
      };
    } catch (error) {
      console.error('Risk propagasyon hatası:', error);
      throw error;
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  async getMevcutDurum() {
    const { count: toplamOgrenci, error } = await supabaseAdmin
      .from('ogrenci')
      .select('*', { count: 'exact', head: true })
      .eq('soft_delete', false);

    if (error) throw error;

    return {
      toplamOgrenci: toplamOgrenci || 0
    };
  }

  async hesaplaMezuniyetOrani() {
    // Basit bir tahmin: Son 2 yıldaki mezuniyet oranını kullan
    // Gerçek implementasyonda daha karmaşık model kullanılabilir
    return 0.15; // %15 yıllık mezuniyet oranı (varsayılan)
  }

  async analizEtKapasite(ogrenciSayisi) {
    const { data: danismanlar, error } = await supabaseAdmin
      .from('akademik_personel_yuk_view')
      .select('*')
      .eq('aktif_mi', true);

    if (error) throw error;

    const toplamKapasite = danismanlar.reduce((sum, d) => sum + d.maksimum_kapasite, 0);
    const mevcutYuk = danismanlar.reduce((sum, d) => sum + d.mevcut_yuk, 0);
    const kalanKapasite = toplamKapasite - mevcutYuk;

    return {
      toplamKapasite,
      mevcutYuk,
      kalanKapasite,
      yeterliKapasiteVarMi: kalanKapasite >= ogrenciSayisi,
      eksikKapasite: Math.max(0, ogrenciSayisi - kalanKapasite)
    };
  }

  async getMevcutYukler(danismanListesi) {
    const yukler = {};

    for (const danisman of danismanListesi) {
      const { data: yukData, error } = await supabaseAdmin
        .from('akademik_personel_yuk_view')
        .select('mevcut_yuk')
        .eq('personel_id', danisman.personel_id)
        .single();

      if (!error && yukData) {
        yukler[danisman.personel_id] = yukData.mevcut_yuk || 0;
      } else {
        yukler[danisman.personel_id] = 0;
      }
    }

    return yukler;
  }

  async getMevcutRiskFaktorleri(ogrenciId) {
    const { data, error } = await supabaseAdmin
      .from('ogrenci_risk_analizi')
      .select('*')
      .eq('ogrenci_id', ogrenciId)
      .order('hesaplama_tarihi', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { risk_skoru: 0 };
    }

    return data;
  }

  async analizEtTrend(ogrenciId) {
    // Son 6 ayın risk skorlarını al
    const { data, error } = await supabaseAdmin
      .from('ogrenci_risk_analizi')
      .select('risk_skoru, hesaplama_tarihi')
      .eq('ogrenci_id', ogrenciId)
      .order('hesaplama_tarihi', { ascending: false })
      .limit(6);

    if (error || !data || data.length < 2) {
      return { aylikDegisim: 0, trend: 'sabit' };
    }

    // Trend hesapla (basit lineer regresyon)
    const skorlar = data.map(d => d.risk_skoru).reverse();
    const n = skorlar.length;
    const ortalama = skorlar.reduce((a, b) => a + b, 0) / n;
    
    // Basit trend: son skor - ilk skor / ay sayısı
    const aylikDegisim = (skorlar[n - 1] - skorlar[0]) / (n - 1);

    return {
      aylikDegisim: aylikDegisim || 0,
      trend: aylikDegisim > 1 ? 'artis' : aylikDegisim < -1 ? 'azalis' : 'sabit',
      ortalamaRiskSkoru: ortalama
    };
  }

  getRiskSeviyesi(riskSkoru) {
    if (riskSkoru >= 70) return 'Kritik';
    if (riskSkoru >= 50) return 'Yuksek';
    if (riskSkoru >= 30) return 'Orta';
    return 'Dusuk';
  }

  uretoneriler(projeksiyon) {
    const oneriler = [];

    // Kapasite kontrolü
    const sonYil = projeksiyon[projeksiyon.length - 1];
    if (sonYil.kapasiteAnalizi && !sonYil.kapasiteAnalizi.yeterliKapasiteVarMi) {
      oneriler.push({
        oncelik: 'Yuksek',
        baslik: 'Kapasite Yetersizliği',
        mesaj: `${sonYil.kapasiteAnalizi.eksikKapasite} öğrenci için yeterli kapasite yok. Yeni danışman ataması veya kapasite artırımı gerekli.`
      });
    }

    // Net öğrenci artışı kontrolü
    if (sonYil.netOgrenciArtisi > 50) {
      oneriler.push({
        oncelik: 'Orta',
        baslik: 'Hızlı Büyüme',
        mesaj: 'Öğrenci sayısı hızlı artıyor. Altyapı ve kaynak planlaması yapılmalı.'
      });
    }

    return oneriler;
  }
}

