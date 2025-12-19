/**
 * Supabase Service - Veritabanı Servisi
 * 
 * Bu sınıf, Supabase veritabanı ile iletişim kurmak için kullanılır.
 * Supabase, PostgreSQL tabanlı bir veritabanı hizmetidir.
 * 
 * Bu servis, veritabanı işlemlerini (ekleme, okuma, güncelleme, silme) yönetir.
 * 
 * ÖNEMLİ: Supabase'i kullanmadan önce:
 * 1. Supabase hesabı oluşturun: https://supabase.com
 * 2. Yeni bir proje oluşturun
 * 3. .env dosyasına SUPABASE_URL ve SUPABASE_ANON_KEY değerlerini ekleyin
 * 
 * Örnek kullanım:
 * const supabase = new SupabaseService();
 * const veriler = await supabase.getAll('tablo_adi');
 */
import { createClient } from '@supabase/supabase-js';

export class SupabaseService {
  constructor() {
    // Supabase URL ve anahtarını environment variables'dan al
    // Bu değerler .env dosyasında saklanır (güvenlik için)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Eğer değerler tanımlı değilse hata ver
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase yapılandırması eksik! ' +
        'Lütfen .env dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.'
      );
    }

    // Supabase istemcisini oluştur
    // Bu istemci, veritabanı ile iletişim kurmak için kullanılır
    this.client = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Veritabanından tüm kayıtları getirir
   * @param {string} tableName - Tablo adı
   * @param {Object} options - Seçenekler (filtreleme, sıralama vb.)
   * @returns {Promise<Array>} Kayıtların listesi
   * 
   * Örnek:
   * const kullanicilar = await supabase.getAll('kullanicilar');
   */
  async getAll(tableName, options = {}) {
    try {
      let query = this.client.from(tableName).select('*');

      // Eğer filtreleme varsa uygula
      if (options.filter) {
        query = query.eq(options.filter.column, options.filter.value);
      }

      // Eğer sıralama varsa uygula
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending !== false
        });
      }

      // Eğer limit varsa uygula
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Veri okuma hatası (${tableName}):`, error);
      throw error;
    }
  }

  /**
   * Veritabanından tek bir kayıt getirir
   * @param {string} tableName - Tablo adı
   * @param {string} column - Arama yapılacak sütun
   * @param {any} value - Aranacak değer
   * @returns {Promise<Object|null>} Bulunan kayıt veya null
   * 
   * Örnek:
   * const kullanici = await supabase.getOne('kullanicilar', 'id', 1);
   */
  async getOne(tableName, column, value) {
    try {
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .eq(column, value)
        .single();

      if (error) {
        // Eğer kayıt bulunamadıysa null döndür (hata değil)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Tek kayıt okuma hatası (${tableName}):`, error);
      throw error;
    }
  }

  /**
   * Veritabanına yeni kayıt ekler
   * @param {string} tableName - Tablo adı
   * @param {Object} data - Eklenecek veri
   * @returns {Promise<Object>} Eklenen kayıt
   * 
   * Örnek:
   * const yeniKullanici = await supabase.create('kullanicilar', {
   *   ad: 'Ahmet',
   *   email: 'ahmet@example.com'
   * });
   */
  async create(tableName, data) {
    try {
      const { data: insertedData, error } = await this.client
        .from(tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return insertedData;
    } catch (error) {
      console.error(`Veri ekleme hatası (${tableName}):`, error);
      throw error;
    }
  }

  /**
   * Veritabanındaki bir kaydı günceller
   * @param {string} tableName - Tablo adı
   * @param {string} column - Arama yapılacak sütun (genellikle 'id')
   * @param {any} value - Aranacak değer
   * @param {Object} data - Güncellenecek veri
   * @returns {Promise<Object>} Güncellenen kayıt
   * 
   * Örnek:
   * const guncellenmis = await supabase.update('kullanicilar', 'id', 1, {
   *   ad: 'Mehmet'
   * });
   */
  async update(tableName, column, value, data) {
    try {
      const { data: updatedData, error } = await this.client
        .from(tableName)
        .update(data)
        .eq(column, value)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedData;
    } catch (error) {
      console.error(`Veri güncelleme hatası (${tableName}):`, error);
      throw error;
    }
  }

  /**
   * Veritabanından bir kaydı siler
   * @param {string} tableName - Tablo adı
   * @param {string} column - Arama yapılacak sütun (genellikle 'id')
   * @param {any} value - Aranacak değer
   * @returns {Promise<boolean>} Başarılı ise true
   * 
   * Örnek:
   * await supabase.delete('kullanicilar', 'id', 1);
   */
  async delete(tableName, column, value) {
    try {
      const { error } = await this.client
        .from(tableName)
        .delete()
        .eq(column, value);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error(`Veri silme hatası (${tableName}):`, error);
      throw error;
    }
  }

  /**
   * Supabase istemcisini döndürür (gelişmiş kullanım için)
   * @returns {Object} Supabase istemci objesi
   * 
   * Eğer yukarıdaki hazır fonksiyonlar yeterli değilse,
   * bu fonksiyon ile Supabase'in tüm özelliklerine erişebilirsiniz.
   */
  getClient() {
    return this.client;
  }
}

