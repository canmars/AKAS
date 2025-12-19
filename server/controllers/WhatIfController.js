/**
 * What-If Controller
 * What-If simülasyon iş mantığı
 */

import { supabaseAdmin } from '../db/connection.js';
import { akademikPersonelQueries } from '../db/queries/akademikPersonelQueries.js';

export class WhatIfController {
  /**
   * Simülasyon çalıştır
   */
  static async runSimulation(req, res, next) {
    try {
      const { hedef_yeni_ogrenci_sayisi, program_turu_dagilimi } = req.body;

      // Mevcut danışman yüklerini al
      const personel = await akademikPersonelQueries.getAll();

      // Simülasyon sonucu hesapla
      const simulasyonSonucu = {
        mevcutDurum: personel.map(p => ({
          personel_id: p.personel_id,
          ad: p.ad,
          soyad: p.soyad,
          unvan: p.unvan,
          mevcut_yuk: p.mevcut_yuk,
          maksimum_kapasite: p.maksimum_kapasite,
          kalan_kapasite: p.maksimum_kapasite - p.mevcut_yuk
        })),
        yeniOgrenciSayisi: hedef_yeni_ogrenci_sayisi,
        programTuruDagilimi: program_turu_dagilimi,
        onerilenDagilim: this._calculateOptimalDistribution(personel, hedef_yeni_ogrenci_sayisi)
      };

      // Simülasyon sonucunu kaydet
      const { data, error } = await supabaseAdmin
        .from('simulasyon_senaryolari')
        .insert({
          senaryo_adi: `Simülasyon - ${new Date().toISOString()}`,
          hedef_yeni_ogrenci_sayisi,
          program_turu_dagilimi,
          simulasyon_sonucu: simulasyonSonucu,
          olusturan_kullanici_id: req.user.id
        })
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: simulasyonSonucu
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Simülasyon geçmişi
   */
  static async getHistory(req, res, next) {
    try {
      const { data, error } = await supabaseAdmin
        .from('simulasyon_senaryolari')
        .select('*')
        .eq('olusturan_kullanici_id', req.user.id)
        .order('olusturma_tarihi', { ascending: false })
        .limit(20);

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Optimal dağılım hesapla
   */
  static _calculateOptimalDistribution(personel, yeniOgrenciSayisi) {
    // Basit bir dağılım algoritması
    // Gerçek implementasyonda daha karmaşık algoritma kullanılabilir
    
    const dagilim = [];
    let kalanOgrenci = yeniOgrenciSayisi;

    // Kapasitesi olan personel listesi
    const uygunPersonel = personel
      .filter(p => p.mevcut_yuk < p.maksimum_kapasite)
      .sort((a, b) => {
        // Önce kapasitesi daha fazla olan, sonra yükü daha az olan
        const aKalan = a.maksimum_kapasite - a.mevcut_yuk;
        const bKalan = b.maksimum_kapasite - b.mevcut_yuk;
        if (aKalan !== bKalan) return bKalan - aKalan;
        return a.mevcut_yuk - b.mevcut_yuk;
      });

    for (const p of uygunPersonel) {
      if (kalanOgrenci <= 0) break;

      const kalanKapasite = p.maksimum_kapasite - p.mevcut_yuk;
      const atanacak = Math.min(kalanOgrenci, kalanKapasite);

      dagilim.push({
        personel_id: p.personel_id,
        ad: p.ad,
        soyad: p.soyad,
        unvan: p.unvan,
        mevcut_yuk: p.mevcut_yuk,
        maksimum_kapasite: p.maksimum_kapasite,
        onerilen_yeni_ogrenci: atanacak,
        yeni_toplam_yuk: p.mevcut_yuk + atanacak
      });

      kalanOgrenci -= atanacak;
    }

    return {
      dagilim,
      kalanOgrenci: kalanOgrenci > 0 ? kalanOgrenci : 0,
      uyari: kalanOgrenci > 0 ? 'Yeterli kapasite yok!' : null
    };
  }
}

