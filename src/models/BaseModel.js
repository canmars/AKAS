/**
 * Base Model - Temel Model Sınıfı
 * 
 * Bu sınıf, Supabase kullanan tüm modeller için temel sınıftır.
 * Ortak veritabanı işlemlerini burada tanımlarız.
 * 
 * Yeni bir model oluştururken bu sınıftan türetirsiniz:
 * 
 * class KullaniciModel extends BaseModel {
 *   constructor() {
 *     super('kullanicilar'); // Tablo adı
 *   }
 * }
 */

// "import" = Başka bir dosyadan bir şeyi al (içe aktar)
// "SupabaseService" = Supabase veritabanı servisi
// "../services/SupabaseService.js" = services klasöründeki SupabaseService.js dosyasından
import { SupabaseService } from '../services/SupabaseService.js';

// "export class" = Bu sınıfı başka dosyalarda kullanabilmek için dışa aktarıyoruz
// "BaseModel" = Sınıfımızın adı (Temel Model)
export class BaseModel {
  // "constructor" = Sınıf oluşturulduğunda otomatik çalışan özel bir fonksiyon
  // "tableName" = Veritabanındaki tablo adı (örn: 'kullanicilar', 'urunler')
  constructor(tableName) {
    // "this.tableName" = Bu sınıfın içindeki tableName değişkenine, gönderilen değeri kaydet
    // Bu değer, hangi veritabanı tablosu ile çalışacağımızı belirler
    this.tableName = tableName;
    
    // Supabase servisini oluştur
    // "new SupabaseService()" = SupabaseService sınıfından yeni bir nesne oluştur
    // "this.supabase" = Oluşturulan nesneyi bu sınıfın içinde sakla
    // Bu nesne, veritabanı işlemlerini yapmak için kullanılacak
    this.supabase = new SupabaseService();
  }

  /**
   * Tüm kayıtları getirir
   * @param {Object} options - Seçenekler (filtreleme, sıralama vb.)
   * @returns {Promise<Array>} Kayıtların listesi
   */
  // "async" = Asenkron fonksiyon (veritabanı işlemi zaman alabilir)
  // "getAll" = Tümünü getir
  // "options = {}" = Eğer options verilmezse, varsayılan olarak boş obje kullan
  async getAll(options = {}) {
    // "await" = Asenkron işlemin bitmesini bekle
    // "this.supabase.getAll" = SupabaseService'in getAll fonksiyonunu çağır
    // "this.tableName" = Hangi tablodan veri çekileceği
    // "options" = Filtreleme, sıralama gibi seçenekler
    // "return await" = Sonucu döndür
    return await this.supabase.getAll(this.tableName, options);
  }

  /**
   * Tek bir kayıt getirir
   * @param {string} column - Arama yapılacak sütun
   * @param {any} value - Aranacak değer
   * @returns {Promise<Object|null>} Bulunan kayıt veya null
   */
  // "async" = Asenkron fonksiyon
  // "getOne" = Tek bir kayıt getir
  // "column" = Arama yapılacak sütun adı (örn: 'id', 'email')
  // "value" = Aranacak değer (örn: 1, 'ahmet@example.com')
  async getOne(column, value) {
    // "await" = Asenkron işlemin bitmesini bekle
    // "this.supabase.getOne" = SupabaseService'in getOne fonksiyonunu çağır
    // "this.tableName" = Hangi tablodan veri çekileceği
    // "column" = Hangi sütunda arama yapılacağı
    // "value" = Aranacak değer
    return await this.supabase.getOne(this.tableName, column, value);
  }

  /**
   * Yeni kayıt ekler
   * @param {Object} data - Eklenecek veri
   * @returns {Promise<Object>} Eklenen kayıt
   */
  // "async" = Asenkron fonksiyon
  // "create" = Oluştur (yeni kayıt ekle)
  // "data" = Eklenecek veri (obje olarak)
  // Örnek: {ad: 'Ahmet', email: 'ahmet@example.com'}
  async create(data) {
    // "await" = Asenkron işlemin bitmesini bekle
    // "this.supabase.create" = SupabaseService'in create fonksiyonunu çağır
    // "this.tableName" = Hangi tabloya veri ekleneceği
    // "data" = Eklenecek veri
    return await this.supabase.create(this.tableName, data);
  }

  /**
   * Kayıt günceller
   * @param {string} column - Arama yapılacak sütun
   * @param {any} value - Aranacak değer
   * @param {Object} data - Güncellenecek veri
   * @returns {Promise<Object>} Güncellenen kayıt
   */
  // "async" = Asenkron fonksiyon
  // "update" = Güncelle
  // "column" = Hangi sütunda arama yapılacağı (genellikle 'id')
  // "value" = Aranacak değer (hangi kaydın güncelleneceği)
  // "data" = Güncellenecek veri (obje olarak)
  // Örnek: update('id', 1, {ad: 'Mehmet'}) → ID'si 1 olan kaydın adını 'Mehmet' yap
  async update(column, value, data) {
    // "await" = Asenkron işlemin bitmesini bekle
    // "this.supabase.update" = SupabaseService'in update fonksiyonunu çağır
    // "this.tableName" = Hangi tablodaki kayıt güncelleneceği
    // "column" = Hangi sütunda arama yapılacağı
    // "value" = Aranacak değer
    // "data" = Güncellenecek veri
    return await this.supabase.update(this.tableName, column, value, data);
  }

  /**
   * Kayıt siler
   * @param {string} column - Arama yapılacak sütun
   * @param {any} value - Aranacak değer
   * @returns {Promise<boolean>} Başarılı ise true
   */
  // "async" = Asenkron fonksiyon
  // "delete" = Sil
  // "column" = Hangi sütunda arama yapılacağı (genellikle 'id')
  // "value" = Aranacak değer (hangi kaydın silineceği)
  // Örnek: delete('id', 1) → ID'si 1 olan kaydı sil
  async delete(column, value) {
    // "await" = Asenkron işlemin bitmesini bekle
    // "this.supabase.delete" = SupabaseService'in delete fonksiyonunu çağır
    // "this.tableName" = Hangi tablodaki kayıt silineceği
    // "column" = Hangi sütunda arama yapılacağı
    // "value" = Aranacak değer
    return await this.supabase.delete(this.tableName, column, value);
  }
}
