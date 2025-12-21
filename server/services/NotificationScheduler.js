/**
 * Bildirim Kontrol Scheduler
 * Günlük olarak bildirim kontrolleri (TİK uyarıları, süre aşımı uyarıları)
 */

import { supabaseAdmin } from '../db/connection.js';
import cron from 'node-cron';

export class NotificationScheduler {
  /**
   * Tüm bildirim kontrollerini çalıştır
   */
  static async checkAllNotifications() {
    try {
      console.log('[NotificationScheduler] Bildirim kontrolleri başlatıldı...');
      
      // TİK uyarıları
      await this.checkTikNotifications();
      
      // Tez önerisi uyarıları
      await this.checkTezOnersiNotifications();
      
      // Gecikmiş milestone uyarıları
      await this.checkGecikmisMilestoneNotifications();
      
      // Hayalet öğrenci uyarıları
      await this.checkHayaletOgrenciNotifications();
      
      console.log('[NotificationScheduler] Bildirim kontrolleri tamamlandı.');
    } catch (error) {
      console.error('[NotificationScheduler] Genel hata:', error);
    }
  }

  /**
   * TİK uyarı bildirimleri kontrolü
   */
  static async checkTikNotifications() {
    try {
      const { data, error } = await supabaseAdmin.rpc('check_tik_notifications');
      
      if (error) {
        console.error('[NotificationScheduler] TİK uyarı kontrolü hatası:', error);
      } else {
        console.log('[NotificationScheduler] TİK uyarı kontrolleri tamamlandı.');
      }
    } catch (error) {
      console.error('[NotificationScheduler] TİK uyarı kontrolü hatası:', error);
    }
  }

  /**
   * Tez önerisi süre uyarı bildirimleri kontrolü
   */
  static async checkTezOnersiNotifications() {
    try {
      const { data, error } = await supabaseAdmin.rpc('check_tez_onersi_notifications');
      
      if (error) {
        console.error('[NotificationScheduler] Tez önerisi uyarı kontrolü hatası:', error);
      } else {
        console.log('[NotificationScheduler] Tez önerisi uyarı kontrolleri tamamlandı.');
      }
    } catch (error) {
      console.error('[NotificationScheduler] Tez önerisi uyarı kontrolü hatası:', error);
    }
  }

  /**
   * Gecikmiş milestone bildirimleri kontrolü
   */
  static async checkGecikmisMilestoneNotifications() {
    try {
      const { data, error } = await supabaseAdmin.rpc('check_gecikmis_milestone_notifications');
      
      if (error) {
        console.error('[NotificationScheduler] Gecikmiş milestone kontrolü hatası:', error);
      } else {
        console.log('[NotificationScheduler] Gecikmiş milestone kontrolleri tamamlandı.');
      }
    } catch (error) {
      console.error('[NotificationScheduler] Gecikmiş milestone kontrolü hatası:', error);
    }
  }

  /**
   * Hayalet öğrenci bildirimleri kontrolü
   */
  static async checkHayaletOgrenciNotifications() {
    try {
      const { data, error } = await supabaseAdmin.rpc('check_hayalet_ogrenci_notifications');
      
      if (error) {
        console.error('[NotificationScheduler] Hayalet öğrenci kontrolü hatası:', error);
      } else {
        console.log('[NotificationScheduler] Hayalet öğrenci kontrolleri tamamlandı.');
      }
    } catch (error) {
      console.error('[NotificationScheduler] Hayalet öğrenci kontrolü hatası:', error);
    }
  }

  /**
   * Scheduler'ı başlat
   * Her gün saat 03:00'de çalışır
   */
  static start() {
    // Her gün saat 03:00'de çalış
    cron.schedule('0 3 * * *', () => {
      this.checkAllNotifications();
    });

    console.log('[NotificationScheduler] Scheduler başlatıldı. Her gün saat 03:00\'de çalışacak.');
  }
}

