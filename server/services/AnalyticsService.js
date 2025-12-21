/**
 * Analytics Service
 * Akademik kopuş, darboğaz, kapasite adaleti ve What-If analizleri
 */

import { supabaseAdmin } from '../db/connection.js';

export class AnalyticsService {
  /**
   * Akademik kopuş analizi
   * 180 gün kuralı + pasiflik analizi + Engagement score hesaplama
   * @param {string} ogrenciId - Öğrenci ID (opsiyonel, tüm öğrenciler için null)
   * @returns {Promise<Object>} Kopuş analizi sonuçları
   */
  async analyzeDisengagement(ogrenciId = null) {
    try {
      let query = supabaseAdmin
        .from('ogrenci')
        .select(`
          ogrenci_id,
          ad,
          soyad,
          son_login,
          kayit_tarihi,
          program_turleri(program_adi, program_kodu),
          ogrenci_risk_analizi!inner(risk_skoru, hayalet_ogrenci_mi)
        `)
        .eq('soft_delete', false);

      if (ogrenciId) {
        query = query.eq('ogrenci_id', ogrenciId);
      }

      const { data: ogrenciler, error } = await query;

      if (error) throw error;

      const now = new Date();
      const yuzSeksenGunOnce = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

      const analiz = ogrenciler.map(ogrenci => {
        const sonLogin = ogrenci.son_login ? new Date(ogrenci.son_login) : null;
        const loginGunSayisi = sonLogin 
          ? Math.floor((now - sonLogin) / (1000 * 60 * 60 * 24))
          : 999;

        // Engagement score hesaplama (0-100)
        let engagementScore = 100;
        
        // Son login gün sayısına göre puan düşür
        if (loginGunSayisi > 180) {
          engagementScore -= 50; // Hayalet öğrenci
        } else if (loginGunSayisi > 90) {
          engagementScore -= 30; // Pasif
        } else if (loginGunSayisi > 30) {
          engagementScore -= 15; // Az aktif
        }

        // Risk skoruna göre puan düşür
        const riskSkoru = ogrenci.ogrenci_risk_analizi?.[0]?.risk_skoru || 0;
        engagementScore -= riskSkoru * 0.3; // Risk skorunun %30'u engagement'ı etkiler

        engagementScore = Math.max(0, Math.min(100, engagementScore));

        return {
          ogrenci_id: ogrenci.ogrenci_id,
          ad: ogrenci.ad,
          soyad: ogrenci.soyad,
          program_adi: ogrenci.program_turleri?.program_adi,
          son_login: ogrenci.son_login,
          login_olmayan_gun_sayisi: loginGunSayisi,
          risk_skoru: riskSkoru,
          hayalet_ogrenci_mi: loginGunSayisi > 180,
          engagement_score: Math.round(engagementScore),
          kopus_seviyesi: engagementScore < 30 ? 'Yuksek' : 
                         engagementScore < 50 ? 'Orta' : 'Dusuk'
        };
      });

      return {
        toplamOgrenci: analiz.length,
        hayaletOgrenciSayisi: analiz.filter(a => a.hayalet_ogrenci_mi).length,
        yuksekKopusSayisi: analiz.filter(a => a.kopus_seviyesi === 'Yuksek').length,
        ortalamaEngagementScore: analiz.reduce((sum, a) => sum + a.engagement_score, 0) / analiz.length,
        detay: analiz
      };
    } catch (error) {
      console.error('Kopuş analizi hatası:', error);
      throw error;
    }
  }

  /**
   * Süreç darboğaz tespiti
   * 4. yarıyıl Seminer tıkanıklığı, milestone gecikme analizi, aşama bazlı ortalama süre
   * @returns {Promise<Object>} Darboğaz analizi sonuçları
   */
  async detectBottlenecks() {
    try {
      // Seminer darboğaz analizi
      const { data: seminerDarbogaz, error: seminerError } = await supabaseAdmin
        .from('ogrenci_seminer_darbogaz_view')
        .select('*')
        .eq('kritik_darbogaz_mi', true);

      if (seminerError) throw seminerError;

      // Milestone gecikme analizi
      const { data: gecikmisMilestones, error: milestoneError } = await supabaseAdmin
        .from('akademik_milestone')
        .select(`
          *,
          ogrenci!inner(ogrenci_id, ad, soyad, program_turleri(program_adi))
        `)
        .eq('durum', 'Beklemede')
        .lt('hedef_tarih', new Date().toISOString());

      if (milestoneError) throw milestoneError;

      // Aşama bazlı ortalama süre hesaplama
      const asamaSureleri = await this.hesaplaAsamaSureleri();

      // 4. yarıyıl Seminer tıkanıklığı
      const dortYariyilSeminer = seminerDarbogaz.filter(s => s.mevcut_yariyil === 4);

      return {
        seminerDarbogaz: {
          toplam: seminerDarbogaz.length,
          dortYariyil: dortYariyilSeminer.length,
          detay: seminerDarbogaz
        },
        milestoneGecikme: {
          toplam: gecikmisMilestones.length,
          detay: gecikmisMilestones
        },
        asamaSureleri,
        kritikDarbogazlar: [
          ...(dortYariyilSeminer.length > 0 ? [{
            tur: 'Seminer_4_Yariyil',
            sayi: dortYariyilSeminer.length,
            oncelik: 'Yuksek',
            mesaj: `${dortYariyilSeminer.length} öğrenci 4. yarıyılda Seminer darboğazında`
          }] : []),
          ...(gecikmisMilestones.length > 0 ? [{
            tur: 'Milestone_Gecikme',
            sayi: gecikmisMilestones.length,
            oncelik: 'Orta',
            mesaj: `${gecikmisMilestones.length} milestone gecikmiş durumda`
          }] : [])
        ]
      };
    } catch (error) {
      console.error('Darboğaz tespiti hatası:', error);
      throw error;
    }
  }

  /**
   * Kapasite adaleti analizi
   * Gini katsayısı, standart sapma, önerilen yeniden dağılım
   * @returns {Promise<Object>} Kapasite adaleti analizi
   */
  async analyzeCapacityFairness() {
    try {
      // Tüm danışmanların yük bilgilerini al
      const { data: danismanlar, error } = await supabaseAdmin
        .from('akademik_personel_yuk_view')
        .select('*')
        .eq('aktif_mi', true);

      if (error) throw error;

      if (danismanlar.length === 0) {
        return {
          giniKatsayisi: 0,
          standartSapma: 0,
          dengesizlikSeviyesi: 'Dengeli',
          oneriler: []
        };
      }

      // Kapasite kullanım yüzdelerini al
      const kullanimYuzdeleri = danismanlar.map(d => d.kapasite_kullanim_yuzdesi || 0);

      // Gini katsayısı hesaplama
      const giniKatsayisi = this.hesaplaGiniKatsayisi(kullanimYuzdeleri);

      // Standart sapma
      const ortalama = kullanimYuzdeleri.reduce((a, b) => a + b, 0) / kullanimYuzdeleri.length;
      const varyans = kullanimYuzdeleri.reduce((sum, val) => sum + Math.pow(val - ortalama, 2), 0) / kullanimYuzdeleri.length;
      const standartSapma = Math.sqrt(varyans);

      // En yüksek ve en düşük yüklü danışmanlar
      const enYuklu = danismanlar
        .sort((a, b) => (b.kapasite_kullanim_yuzdesi || 0) - (a.kapasite_kullanim_yuzdesi || 0))
        .slice(0, 5);

      const enAzYuklu = danismanlar
        .sort((a, b) => (a.kapasite_kullanim_yuzdesi || 0) - (b.kapasite_kullanim_yuzdesi || 0))
        .slice(0, 5);

      // Önerilen yeniden dağılım
      const onerilenDagilim = this.onerYenidenDagilim(danismanlar);

      return {
        giniKatsayisi: Math.round(giniKatsayisi * 100) / 100,
        standartSapma: Math.round(standartSapma * 100) / 100,
        ortalamaKullanim: Math.round(ortalama * 100) / 100,
        dengesizlikSeviyesi: giniKatsayisi > 0.3 ? 'Yuksek' :
                            giniKatsayisi > 0.2 ? 'Orta' : 'Dusuk',
        enYukluDanismanlar: enYuklu,
        enAzYukluDanismanlar: enAzYuklu,
        onerilenDagilim
      };
    } catch (error) {
      console.error('Kapasite adaleti analizi hatası:', error);
      throw error;
    }
  }

  /**
   * What-If senaryo motoru
   * Kontenjan değişikliği, mevzuat değişikliği, 2 yıllık matematiksel modelleme
   * @param {Object} scenario - Senaryo parametreleri
   * @returns {Promise<Object>} Senaryo sonuçları
   */
  async runWhatIfScenario(scenario) {
    try {
      const {
        kontenjanDegisikligi = null, // { program_turu_id: yeni_kontenjan }
        mevzuatDegisikligi = null,    // { maksimum_sure_yariyil: yeni_sure }
        simulasyonYili = 2
      } = scenario;

      const sonuclar = {
        mevcutDurum: await this.getMevcutDurum(),
        senaryo: scenario,
        projeksiyon: []
      };

      // Her yıl için simülasyon
      for (let yil = 1; yil <= simulasyonYili; yil++) {
        const yilSonucu = {
          yil,
          kontenjanEtkisi: null,
          mevzuatEtkisi: null,
          tahminiOgrenciSayisi: null,
          tahminiMezunSayisi: null
        };

        // Kontenjan değişikliği etkisi
        if (kontenjanDegisikligi) {
          yilSonucu.kontenjanEtkisi = await this.hesaplaKontenjanEtkisi(
            kontenjanDegisikligi,
            yil
          );
        }

        // Mevzuat değişikliği etkisi
        if (mevzuatDegisikligi) {
          yilSonucu.mevzuatEtkisi = await this.hesaplaMevzuatEtkisi(
            mevzuatDegisikligi,
            yil
          );
        }

        sonuclar.projeksiyon.push(yilSonucu);
      }

      // Öneriler
      sonuclar.oneriler = this.ureWhatIfOneriler(sonuclar);

      return sonuclar;
    } catch (error) {
      console.error('What-If senaryo hatası:', error);
      throw error;
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  async hesaplaAsamaSureleri() {
    // Her aşama için ortalama süre hesapla
    const asamalar = ['Ders', 'Yeterlik', 'Tez_Onersi', 'TIK', 'Tez', 'Tamamlandi'];
    const sureler = {};

    for (const asama of asamalar) {
      const { data, error } = await supabaseAdmin
        .from('ogrenci_akademik_durum')
        .select('ogrenci_id, mevcut_yariyil')
        .eq('mevcut_asinama', asama);

      if (!error && data && data.length > 0) {
        const ortalamaYariyil = data.reduce((sum, d) => sum + (d.mevcut_yariyil || 0), 0) / data.length;
        sureler[asama] = {
          ortalamaYariyil: Math.round(ortalamaYariyil * 10) / 10,
          ogrenciSayisi: data.length
        };
      }
    }

    return sureler;
  }

  hesaplaGiniKatsayisi(values) {
    // Gini katsayısı hesaplama (0-1 arası, 0 = tam eşitlik, 1 = tam eşitsizlik)
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((a, b) => a + b, 0) / n;

    if (mean === 0) return 0;

    let numerator = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        numerator += Math.abs(sorted[i] - sorted[j]);
      }
    }

    return numerator / (2 * n * n * mean);
  }

  onerYenidenDagilim(danismanlar) {
    // Basit bir yeniden dağılım önerisi
    const toplamYuk = danismanlar.reduce((sum, d) => sum + (d.mevcut_yuk || 0), 0);
    const toplamKapasite = danismanlar.reduce((sum, d) => sum + (d.maksimum_kapasite || 0), 0);
    const hedefKullanim = (toplamYuk / toplamKapasite) * 100;

    const oneriler = [];

    danismanlar.forEach(danisman => {
      const mevcutKullanim = danisman.kapasite_kullanim_yuzdesi || 0;
      const hedefYuk = Math.round((danisman.maksimum_kapasite * hedefKullanim) / 100);
      const fark = hedefYuk - danisman.mevcut_yuk;

      if (Math.abs(fark) > 2) { // 2'den fazla fark varsa öner
        oneriler.push({
          danisman_id: danisman.personel_id,
          danisman_adi: `${danisman.ad} ${danisman.soyad}`,
          mevcut_yuk: danisman.mevcut_yuk,
          hedef_yuk: hedefYuk,
          onerilen_transfer: fark > 0 ? `+${fark} öğrenci al` : `${Math.abs(fark)} öğrenci ver`
        });
      }
    });

    return oneriler;
  }

  async hesaplaKontenjanEtkisi(kontenjanDegisikligi, yil) {
    // Basit bir kontenjan etkisi hesaplama
    // Gerçek implementasyonda daha karmaşık model kullanılabilir
    return {
      etkilenenProgramSayisi: Object.keys(kontenjanDegisikligi).length,
      toplamYeniKontenjan: Object.values(kontenjanDegisikligi).reduce((a, b) => a + b, 0),
      mesaj: `${yil}. yılda kontenjan değişikliği uygulanacak`
    };
  }

  async hesaplaMevzuatEtkisi(mevzuatDegisikligi, yil) {
    // Mevzuat değişikliği etkisi
    return {
      etkilenenOgrenciSayisi: 0, // Hesaplanacak
      mesaj: `${yil}. yılda mevzuat değişikliği uygulanacak`
    };
  }

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

  ureWhatIfOneriler(sonuclar) {
    const oneriler = [];

    // Projeksiyon analizi
    sonuclar.projeksiyon.forEach(yil => {
      if (yil.kontenjanEtkisi && yil.kontenjanEtkisi.toplamYeniKontenjan > 50) {
        oneriler.push({
          oncelik: 'Yuksek',
          baslik: 'Kontenjan Artışı',
          mesaj: `${yil.yil}. yılda ${yil.kontenjanEtkisi.toplamYeniKontenjan} yeni kontenjan açılacak. Kapasite planlaması yapılmalı.`
        });
      }
    });

    return oneriler;
  }
}

