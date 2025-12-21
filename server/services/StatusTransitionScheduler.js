/**
 * Durum Geçiş Kontrol Scheduler
 * Günlük olarak durum geçiş kontrolleri (maksimum süre aşımı, dondurma süresi)
 */

import { supabaseAdmin } from '../db/connection.js';
import cron from 'node-cron';

export class StatusTransitionScheduler {
  /**
   * Tüm durum geçiş kontrollerini çalıştır
   */
  static async checkAllStatusTransitions() {
    try {
      console.log('[StatusTransitionScheduler] Durum geçiş kontrolleri başlatıldı...');
      
      // Maksimum süre aşımı kontrolü (trigger ile otomatik yapılıyor, burada sadece kontrol)
      await this.checkMaximumSureAsimi();
      
      // TİK katılım kontrolü (üst üste 2 kez katılmama)
      await this.checkTikKatilim();
      
      console.log('[StatusTransitionScheduler] Durum geçiş kontrolleri tamamlandı.');
    } catch (error) {
      console.error('[StatusTransitionScheduler] Genel hata:', error);
    }
  }

  /**
   * Maksimum süre aşımı kontrolü
   */
  static async checkMaximumSureAsimi() {
    try {
      // Bu kontrol trigger ile otomatik yapılıyor (check_maximum_sure_asimi)
      // Burada sadece loglama yapılıyor
      const { data: ogrenciler, error } = await supabaseAdmin
        .from('ogrenci')
        .select(`
          ogrenci_id,
          kayit_tarihi,
          program_turleri!inner(maksimum_sure_yariyil)
        `)
        .eq('soft_delete', false);

      if (error) {
        console.error('[StatusTransitionScheduler] Maksimum süre kontrolü hatası:', error);
        return;
      }

      // Yarıyıl hesapla ve kontrol et
      for (const ogrenci of ogrenciler || []) {
        const { data: yariyil } = await supabaseAdmin.rpc('calculate_yariyil', {
          p_kayit_tarihi: ogrenci.kayit_tarihi,
          p_bugun_tarihi: new Date().toISOString().split('T')[0]
        });

        if (yariyil >= ogrenci.program_turleri.maksimum_sure_yariyil) {
          console.log(`[StatusTransitionScheduler] Öğrenci ${ogrenci.ogrenci_id} maksimum süreyi aştı. Yarıyıl: ${yariyil}, Maksimum: ${ogrenci.program_turleri.maksimum_sure_yariyil}`);
        }
      }
    } catch (error) {
      console.error('[StatusTransitionScheduler] Maksimum süre kontrolü hatası:', error);
    }
  }

  /**
   * TİK katılım kontrolü (üst üste 2 kez katılmama)
   */
  static async checkTikKatilim() {
    try {
      // Bu kontrol trigger ile otomatik yapılıyor (check_tik_katilim_pasif)
      // Burada sadece loglama yapılıyor
      const { data, error } = await supabaseAdmin.rpc('check_tik_katilim_durumu', {
        p_ogrenci_id: null // Tüm öğrenciler için kontrol
      });

      if (error) {
        console.error('[StatusTransitionScheduler] TİK katılım kontrolü hatası:', error);
      } else {
        console.log('[StatusTransitionScheduler] TİK katılım kontrolleri tamamlandı.');
      }
    } catch (error) {
      console.error('[StatusTransitionScheduler] TİK katılım kontrolü hatası:', error);
    }
  }

  /**
   * Scheduler'ı başlat
   * Her gün saat 04:00'de çalışır
   */
  static start() {
    // Her gün saat 04:00'de çalış
    cron.schedule('0 4 * * *', () => {
      this.checkAllStatusTransitions();
    });

    console.log('[StatusTransitionScheduler] Scheduler başlatıldı. Her gün saat 04:00\'de çalışacak.');
  }
}

