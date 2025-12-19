/**
 * Storage Service - Tarayıcı Depolama Servisi
 * 
 * Bu sınıf, verileri tarayıcının LocalStorage'ında saklamak için kullanılır.
 * LocalStorage, tarayıcı kapatılsa bile verilerin kalıcı olarak saklanmasını sağlar.
 * 
 * Örnek kullanım:
 * const storage = new StorageService();
 * storage.save('kullanici_adi', 'Ahmet'); // Veriyi kaydet
 * const adi = storage.load('kullanici_adi'); // Veriyi oku: 'Ahmet'
 * storage.remove('kullanici_adi'); // Veriyi sil
 */

// "export class" = Bu sınıfı başka dosyalarda kullanabilmek için dışa aktarıyoruz
// "StorageService" = Sınıfımızın adı (Depolama Servisi)
export class StorageService {
  // "constructor" = Sınıf oluşturulduğunda otomatik çalışan özel bir fonksiyon
  // "storageKey = 'app_data'" = Eğer storageKey verilmezse, varsayılan olarak 'app_data' kullan
  constructor(storageKey = 'app_data') {
    // "this.storageKey" = Bu sınıfın içindeki storageKey değişkenine, gönderilen değeri kaydet
    // "storageKey" = LocalStorage'da verilerin saklanacağı anahtar (isim)
    // Tüm veriler bu anahtar altında bir obje olarak saklanır
    // Örnek: Eğer storageKey = 'app_data' ise, LocalStorage'da 'app_data' anahtarı altında veriler saklanır
    this.storageKey = storageKey;
  }

  /**
   * Veriyi tarayıcıya kaydeder
   * @param {string} key - Verinin saklanacağı anahtar (isim)
   * @param {any} data - Kaydedilecek veri (herhangi bir türde olabilir)
   * @returns {boolean} Başarılı ise true, değilse false
   * 
   * Örnek:
   * storage.save('sayac_degeri', 5);
   */
  // "save" = Kaydet (veriyi LocalStorage'a yaz)
  // "key" = Verinin saklanacağı anahtar (isim) - örn: 'kullanici_adi'
  // "data" = Kaydedilecek veri - herhangi bir türde olabilir (string, number, object vb.)
  save(key, data) {
    // "try" = Hata yakalama bloğu başlat
    // Eğer kod içinde bir hata olursa, catch bloğuna gider
    try {
      // Mevcut tüm verileri al
      // "this.getStorage()" = Bu sınıfın getStorage fonksiyonunu çağır
      // Bu fonksiyon, LocalStorage'dan tüm verileri okur ve obje olarak döndürür
      // "const storage" = Okunan verileri "storage" adlı değişkene kaydet
      const storage = this.getStorage();
      
      // Yeni veriyi ekle veya güncelle
      // "storage[key]" = storage objesinde "key" adlı özelliğe eriş
      // "= data" = Bu özelliğe "data" değerini ata
      // Örnek: storage['kullanici_adi'] = 'Ahmet'
      // Eğer bu key zaten varsa, değeri güncellenir; yoksa yeni eklenir
      storage[key] = data;
      
      // Tüm verileri tekrar kaydet
      // "localStorage" = Tarayıcının yerleşik LocalStorage objesi
      // "setItem" = LocalStorage'a veri kaydet
      // "this.storageKey" = Anahtar (örn: 'app_data')
      // "JSON.stringify(storage)" = storage objesini string (metin) formatına çevir
      // Neden? LocalStorage sadece string saklayabilir, obje saklayamaz
      // JSON.stringify() = JavaScript objesini JSON string'ine çevirir
      // Örnek: {kullanici_adi: 'Ahmet'} → '{"kullanici_adi":"Ahmet"}'
      localStorage.setItem(this.storageKey, JSON.stringify(storage));
      
      // "return true" = İşlem başarılı oldu, true döndür
      return true;
    } catch (error) {
      // "catch" = Hata yakalama bloğu
      // Eğer yukarıdaki kodda bir hata olursa, buraya gelir
      // "error" = Hata bilgilerini içeren obje
      
      // "console.error" = Konsola hata mesajı yazdır (kırmızı renkte görünür)
      // "'Veri kaydetme hatası:'" = Mesaj başlığı
      // "error" = Hatanın detayları
      console.error('Veri kaydetme hatası:', error);
      
      // "return false" = İşlem başarısız oldu, false döndür
      return false;
    }
  }

  /**
   * Kaydedilmiş veriyi okur
   * @param {string} key - Okunacak verinin anahtarı
   * @returns {any|null} Veri bulunursa veri, bulunamazsa null
   * 
   * Örnek:
   * const deger = storage.load('sayac_degeri'); // 5 döner
   */
  // "load" = Yükle (veriyi LocalStorage'dan oku)
  // "key" = Okunacak verinin anahtarı (isim)
  load(key) {
    // "try" = Hata yakalama bloğu başlat
    try {
      // Tüm verileri al
      // "this.getStorage()" = Bu sınıfın getStorage fonksiyonunu çağır
      // Bu fonksiyon, LocalStorage'dan tüm verileri okur ve obje olarak döndürür
      // "const storage" = Okunan verileri "storage" adlı değişkene kaydet
      const storage = this.getStorage();
      
      // İstenen veriyi döndür, yoksa null döndür
      // "storage[key]" = storage objesinde "key" adlı özelliğe eriş
      // "|| null" = Eğer bu özellik yoksa (undefined), null döndür
      // Örnek: storage['kullanici_adi'] varsa değerini döndür, yoksa null döndür
      return storage[key] || null;
    } catch (error) {
      // "catch" = Hata yakalama bloğu
      // "console.error" = Konsola hata mesajı yazdır
      console.error('Veri okuma hatası:', error);
      
      // "return null" = Hata oldu, null döndür (veri bulunamadı)
      return null;
    }
  }

  /**
   * Kaydedilmiş veriyi siler
   * @param {string} key - Silinecek verinin anahtarı
   * @returns {boolean} Başarılı ise true, değilse false
   * 
   * Örnek:
   * storage.remove('sayac_degeri');
   */
  // "remove" = Kaldır (veriyi LocalStorage'dan sil)
  // "key" = Silinecek verinin anahtarı (isim)
  remove(key) {
    // "try" = Hata yakalama bloğu başlat
    try {
      // Tüm verileri al
      // "this.getStorage()" = Bu sınıfın getStorage fonksiyonunu çağır
      // "const storage" = Okunan verileri "storage" adlı değişkene kaydet
      const storage = this.getStorage();
      
      // İstenen veriyi sil
      // "delete" = Objeden bir özelliği sil
      // "storage[key]" = storage objesinde "key" adlı özelliği sil
      // Örnek: delete storage['kullanici_adi'] → 'kullanici_adi' özelliği silinir
      delete storage[key];
      
      // Güncellenmiş verileri tekrar kaydet
      // "localStorage.setItem" = LocalStorage'a veri kaydet
      // "this.storageKey" = Anahtar (örn: 'app_data')
      // "JSON.stringify(storage)" = storage objesini string formatına çevir
      // Böylece silinen veri LocalStorage'dan da kaldırılmış olur
      localStorage.setItem(this.storageKey, JSON.stringify(storage));
      
      // "return true" = İşlem başarılı oldu, true döndür
      return true;
    } catch (error) {
      // "catch" = Hata yakalama bloğu
      // "console.error" = Konsola hata mesajı yazdır
      console.error('Veri silme hatası:', error);
      
      // "return false" = İşlem başarısız oldu, false döndür
      return false;
    }
  }

  /**
   * Tüm kaydedilmiş verileri temizler
   * @returns {boolean} Başarılı ise true, değilse false
   * 
   * Örnek:
   * storage.clear(); // Tüm veriler silinir
   */
  // "clear" = Temizle (tüm verileri sil)
  clear() {
    // "try" = Hata yakalama bloğu başlat
    try {
      // "localStorage.removeItem" = LocalStorage'dan bir anahtarı ve tüm içeriğini sil
      // "this.storageKey" = Silinecek anahtar (örn: 'app_data')
      // Bu işlem, bu anahtar altındaki TÜM verileri siler
      localStorage.removeItem(this.storageKey);
      
      // "return true" = İşlem başarılı oldu, true döndür
      return true;
    } catch (error) {
      // "catch" = Hata yakalama bloğu
      // "console.error" = Konsola hata mesajı yazdır
      console.error('Veri temizleme hatası:', error);
      
      // "return false" = İşlem başarısız oldu, false döndür
      return false;
    }
  }

  /**
   * LocalStorage'dan tüm verileri okur
   * @returns {Object} Tüm kaydedilmiş veriler (obje olarak)
   * 
   * Bu fonksiyon, LocalStorage'dan veriyi okur ve JavaScript objesine çevirir.
   */
  // "getStorage" = Depolamayı getir (LocalStorage'dan tüm verileri oku)
  getStorage() {
    // "try" = Hata yakalama bloğu başlat
    try {
      // LocalStorage'dan veriyi oku (string olarak gelir)
      // "localStorage.getItem" = LocalStorage'dan bir anahtara ait veriyi oku
      // "this.storageKey" = Okunacak anahtar (örn: 'app_data')
      // "const data" = Okunan veriyi "data" adlı değişkene kaydet
      // Not: LocalStorage'dan okunan veri her zaman string (metin) formatındadır
      const data = localStorage.getItem(this.storageKey);
      
      // String'i JavaScript objesine çevir, yoksa boş obje döndür
      // "data ? ... : ..." = Ternary operator (üçlü operatör)
      //   Eğer data varsa (null değilse): JSON.parse(data) çalıştır
      //   Eğer data yoksa (null ise): {} (boş obje) döndür
      // "JSON.parse" = JSON string'ini JavaScript objesine çevirir
      // Örnek: '{"kullanici_adi":"Ahmet"}' → {kullanici_adi: 'Ahmet'}
      // "{}" = Boş obje (hiçbir özellik yok)
      return data ? JSON.parse(data) : {};
    } catch (error) {
      // "catch" = Hata yakalama bloğu
      // "console.error" = Konsola hata mesajı yazdır
      console.error('Veri okuma hatası:', error);
      
      // "return {}" = Hata oldu, boş obje döndür
      return {};
    }
  }
}
