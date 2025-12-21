/**
 * Yarıyıl Güncelleme Scheduler
 * Günlük olarak tüm öğrencilerin yarıyıl bilgilerini güncelleme
 */

import { supabaseAdmin } from '../db/connection.js';
import cron from 'node-cron';

export class YariyilScheduler {
  /**
   * Tüm öğrencilerin yarıyıl bilgilerini güncelle
   */
  static async updateAllYariyil() {
    try {
      console.log('[YariyilScheduler] Yarıyıl güncelleme başlatıldı...');
      
      // Tüm aktif öğrencileri al
      const { data: ogrenciler, error: ogrenciError } = await supabaseAdmin
        .from('ogrenci')
        .select('ogrenci_id, kayit_tarihi')
        .eq('soft_delete', false);

      if (ogrenciError) {
        console.error('[YariyilScheduler] Öğrenci listesi alınamadı:', ogrenciError);
        return;
      }

      if (!ogrenciler || ogrenciler.length === 0) {
        console.log('[YariyilScheduler] Güncellenecek öğrenci bulunamadı.');
        return;
      }

      let basarili = 0;
      let hatali = 0;

      // Her öğrenci için yarıyıl hesapla ve güncelle
      for (const ogrenci of ogrenciler) {
        try {
          // Yarıyıl hesapla
          const { data: yariyil, error: yariyilError } = await supabaseAdmin.rpc('calculate_yariyil', {
            p_kayit_tarihi: ogrenci.kayit_tarihi,
            p_bugun_tarihi: new Date().toISOString().split('T')[0]
          });

          if (yariyilError) {
            console.error(`[YariyilScheduler] Öğrenci ${ogrenci.ogrenci_id} için yarıyıl hesaplanamadı:`, yariyilError);
            hatali++;
            continue;
          }

          // ogrenci_akademik_durum tablosunu güncelle
          const { error: updateError } = await supabaseAdmin
            .from('ogrenci_akademik_durum')
            .upsert({
              ogrenci_id: ogrenci.ogrenci_id,
              mevcut_yariyil: yariyil,
              guncelleme_tarihi: new Date().toISOString()
            }, {
              onConflict: 'ogrenci_id'
            });

          if (updateError) {
            console.error(`[YariyilScheduler] Öğrenci ${ogrenci.ogrenci_id} için yarıyıl güncellenemedi:`, updateError);
            hatali++;
          } else {
            basarili++;
          }
        } catch (error) {
          console.error(`[YariyilScheduler] Öğrenci ${ogrenci.ogrenci_id} için hata:`, error);
          hatali++;
        }
      }

      console.log(`[YariyilScheduler] Yarıyıl güncelleme tamamlandı. Başarılı: ${basarili}, Hatalı: ${hatali}`);
    } catch (error) {
      console.error('[YariyilScheduler] Genel hata:', error);
    }
  }

  /**
   * Scheduler'ı başlat
   * Her gün saat 01:00'de çalışır
   */
  static start() {
    // Her gün saat 01:00'de çalış
    cron.schedule('0 1 * * *', () => {
      this.updateAllYariyil();
    });

    console.log('[YariyilScheduler] Scheduler başlatıldı. Her gün saat 01:00\'de çalışacak.');
  }
}

