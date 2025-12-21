/**
 * Risk Skoru Hesaplama Scheduler
 * Günlük olarak tüm öğrenciler için risk skoru hesaplama
 */

import { supabaseAdmin } from '../db/connection.js';
import cron from 'node-cron';

export class RiskScoreScheduler {
  /**
   * Tüm öğrenciler için risk skoru hesapla
   */
  static async calculateAllRiskScores() {
    try {
      console.log('[RiskScoreScheduler] Risk skoru hesaplama başlatıldı...');
      
      // Tüm aktif öğrencileri al
      const { data: ogrenciler, error: ogrenciError } = await supabaseAdmin
        .from('ogrenci')
        .select('ogrenci_id')
        .eq('soft_delete', false);

      if (ogrenciError) {
        console.error('[RiskScoreScheduler] Öğrenci listesi alınamadı:', ogrenciError);
        return;
      }

      if (!ogrenciler || ogrenciler.length === 0) {
        console.log('[RiskScoreScheduler] Hesaplanacak öğrenci bulunamadı.');
        return;
      }

      let basarili = 0;
      let hatali = 0;

      // Her öğrenci için risk skoru hesapla
      for (const ogrenci of ogrenciler) {
        try {
          const { data: riskSkoru, error: riskError } = await supabaseAdmin.rpc('hesapla_risk_skoru', {
            p_ogrenci_id: ogrenci.ogrenci_id
          });

          if (riskError) {
            console.error(`[RiskScoreScheduler] Öğrenci ${ogrenci.ogrenci_id} için risk skoru hesaplanamadı:`, riskError);
            hatali++;
            continue;
          }

          // Risk seviyesini belirle
          const riskSeviyesi = 
            riskSkoru >= 85 ? 'Kritik' :
            riskSkoru >= 70 ? 'Yuksek' :
            riskSkoru >= 40 ? 'Orta' : 'Dusuk';

          // Hayalet öğrenci kontrolü
          const { data: sonLogin } = await supabaseAdmin
            .from('ogrenci_son_login')
            .select('son_login')
            .eq('ogrenci_id', ogrenci.ogrenci_id)
            .single();

          const hayaletOgrenciMi = !sonLogin?.son_login || 
            new Date(sonLogin.son_login) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

          // Risk analizi tablosuna kaydet
          const { error: insertError } = await supabaseAdmin
            .from('ogrenci_risk_analizi')
            .insert({
              ogrenci_id: ogrenci.ogrenci_id,
              risk_skoru: riskSkoru,
              risk_seviyesi: riskSeviyesi,
              tehlike_turu: 'Genel',
              hayalet_ogrenci_mi: hayaletOgrenciMi,
              hesaplama_tarihi: new Date().toISOString()
            });

          if (insertError && insertError.code !== '23505') { // Unique constraint violation is OK
            console.error(`[RiskScoreScheduler] Öğrenci ${ogrenci.ogrenci_id} için risk analizi kaydedilemedi:`, insertError);
            hatali++;
          } else {
            basarili++;
          }
        } catch (error) {
          console.error(`[RiskScoreScheduler] Öğrenci ${ogrenci.ogrenci_id} için hata:`, error);
          hatali++;
        }
      }

      console.log(`[RiskScoreScheduler] Risk skoru hesaplama tamamlandı. Başarılı: ${basarili}, Hatalı: ${hatali}`);
    } catch (error) {
      console.error('[RiskScoreScheduler] Genel hata:', error);
    }
  }

  /**
   * Scheduler'ı başlat
   * Her gün saat 02:00'de çalışır
   */
  static start() {
    // Her gün saat 02:00'de çalış
    cron.schedule('0 2 * * *', () => {
      this.calculateAllRiskScores();
    });

    console.log('[RiskScoreScheduler] Scheduler başlatıldı. Her gün saat 02:00\'de çalışacak.');
  }
}

