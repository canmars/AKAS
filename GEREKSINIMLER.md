# AKAS - Akademik Karar Analiz Sistemi
## Veritabanı Tasarımı ve Gereksinimler Dokümantasyonu

---

## 📋 BÖLÜM BAŞKANININ VERECEĞİ KARARLAR (ÖZET)

### 1. **DANİŞMAN ATAMA KARARLARI**
- Yeni öğrencilere hangi danışmanı atayacağım?
- Danışman değişikliği yapmalı mıyım?
- Danışman yük dağılımını nasıl optimize edebilirim?

### 2. **RİSK ALTINDAKİ ÖĞRENCİLERE MÜDAHALE KARARLARI**
- Hangi öğrencilere acil destek sağlamalıyım?
- Hangi aşamalarda müdahale etmeliyim?
- Önleyici tedbirler neler olmalı?

### 3. **PROGRAM KONTENJAN VE KAYNAK PLANLAMA KARARLARI**
- Her program için kaç öğrenci alabilirim?
- Danışman kapasitesi yeterli mi?
- Hangi programlara öncelik vermeliyim?

### 4. **AŞAMA TAKİBİ VE GECİKME YÖNETİMİ KARARLARI**
- Hangi öğrenciler hangi aşamada takılı kalmış?
- Gecikme nedenleri neler?
- Müdahale stratejileri ne olmalı?

### 5. **PERFORMANS ANALİZİ VE TAHMİN KARARLARI**
- Öğrenciler ne zaman mezun olacak?
- Başarısızlık riski yüksek olan öğrenciler kimler?
- Danışman performansları nasıl?
- Gelecek dönem planlaması nasıl olmalı?

### 6. **DERS BAŞARISI VE NOT YIĞILMASI ANALİZİ KARARLARI**
- Hangi derslerde en çok başarısızlık var?
- Hangi derslerde not yığılması (ortalama düşük) var?
- Hangi derslerde öğrenciler zorlanıyor?
- Ders içeriklerinde veya öğretim yöntemlerinde iyileştirme gerekli mi?

---

## 🎯 KARARLAR VE ÇÖZÜMLER

### 1. DANİŞMAN ATAMA KARARLARI

**Karar:** Yeni öğrencilere danışman ataması, danışman değişikliği, yük dağılımı optimizasyonu

**Gerekli Bilgiler:**
- Danışman kapasite durumu (mevcut öğrenci sayısı, maksimum kapasite, kullanım %)
- Danışman uzmanlık alanları
- Danışman performans metrikleri (mezuniyet oranı, ortalama süre)
- Öğrenci profili (program, anabilim dalı, kabul türü, mevcut aşama)

**Çözüm:**
- **View:** `danisman_yuk_view` - Danışman kapasite analizi (mevcut öğrenci sayısı, kullanım %, kullanılabilir kapasite)
- **Tablo:** `akademik_personel` - `maksimum_kapasite`, `sert_limit`, `yumusak_limit`, `rol`, `anabilim_dali_baskani_mi`
- **Tablo:** `akademik_personel_uzmanlik` - Uzmanlık alanları
- **Tablo:** `ogrenci` - `danisman_id`, `program_turu_id`, `kabul_turu`
- **Tablo:** `danisman_gecmisi` - Atama geçmişi
- **Tablo:** `ogrenci_asamalari` - Mevcut aşama bilgisi

**Kullanım Örnekleri:**
```sql
-- Danışman yük analizi
SELECT * FROM danisman_yuk_view 
WHERE kapasite_kullanim_yuzdesi > 80
ORDER BY kapasite_kullanim_yuzdesi DESC;

-- Uzmanlık alanına göre danışman bulma
SELECT ap.*, apu.uzmanlik_alani
FROM akademik_personel ap
JOIN akademik_personel_uzmanlik apu ON ap.personel_id = apu.personel_id
WHERE ap.rol = 'Danisman' 
  AND ap.aktif_mi = true
  AND apu.uzmanlik_alani = 'Yönetim Bilişim Sistemleri';
```

---

### 2. RİSK ALTINDAKİ ÖĞRENCİLERE MÜDAHALE KARARLARI

**Karar:** Hangi öğrencilere ek destek sağlanmalı? Hangi aşamalarda müdahale gerekli?

**Gerekli Bilgiler:**
- Risk skorları (düşük/orta/yüksek/kritik)
- Aşama gecikme analizi (hangi aşamada ne kadar gecikmiş)
- Başarı trendleri (not ortalaması, ders başarısızlıkları)
- Azami süreye yakınlık

**Çözüm:**
- **Tablo:** `ogrenci_risk_skorlari` - Risk skoru (0-100), risk seviyesi, risk faktörleri (JSONB), azami süreye yakınlık yüzdesi, tahmini mezuniyet tarihi
- **Tablo:** `ogrenci_asamalari` - `gecikme_yariyil`, `durum`, `baslangic_tarihi`, `bitis_tarihi`
- **Tablo:** `ogrenci_dersleri` - Not ortalaması hesaplanabilir
- **Tablo:** `ogrenci_akademik_durum` - `not_ortalamasi`, `tamamlanan_akts`
- **Fonksiyon:** `hesapla_risk_skoru(p_ogrenci_id)` - Risk skoru hesaplama
- **Fonksiyon:** `hesapla_risk_seviyesi(p_risk_skoru)` - Risk seviyesi belirleme

**Kullanım Örnekleri:**
```sql
-- Yüksek riskli öğrenciler
SELECT o.*, ors.risk_skoru, ors.risk_seviyesi, ors.risk_faktorleri
FROM ogrenci o
JOIN ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
WHERE ors.risk_seviyesi IN ('Yuksek', 'Kritik')
ORDER BY ors.risk_skoru DESC;

-- Aşama gecikmesi olan öğrenciler
SELECT o.*, oa.gecikme_yariyil, at.asama_adi
FROM ogrenci o
JOIN ogrenci_asamalari oa ON o.ogrenci_id = oa.ogrenci_id
JOIN asama_tanimlari at ON oa.asama_tanimi_id = at.asama_tanimi_id
WHERE oa.durum = 'Devam_Ediyor' AND oa.gecikme_yariyil > 0;
```

---

### 3. PROGRAM KONTENJAN VE KAYNAK PLANLAMA KARARLARI

**Karar:** Her program için optimal öğrenci sayısı, danışman kapasite planlaması, kaynak tahsisi

**Gerekli Bilgiler:**
- Program bazlı istatistikler (mevcut öğrenci sayısı, mezuniyet oranı, ortalama süre)
- Danışman kapasite analizi (toplam, kullanılan, boş kapasite)
- Tarihsel trendler (geçmiş dönemlerdeki öğrenci sayıları, mezuniyet oranları)
- Risk analizi (hangi programlarda kritik durum)

**Çözüm:**
- **Tablo:** `program_turleri` - Program bilgileri, `maksimum_sure_yil`, `maksimum_sure_yariyil`
- **Tablo:** `ogrenci` - Program bazlı öğrenci sayısı hesaplanabilir
- **Tablo:** `ogrenci_asamalari` - Aşama bazlı ilerleme takibi
- **View:** `danisman_yuk_view` - Danışman kapasite analizi
- **Tablo:** `ogrenci_risk_skorlari` - Risk analizi

**Kullanım Örnekleri:**
```sql
-- Program bazlı öğrenci sayıları
SELECT pt.program_adi, COUNT(*) as ogrenci_sayisi
FROM ogrenci o
JOIN program_turleri pt ON o.program_turu_id = pt.program_turu_id
WHERE o.durum_id IN (SELECT durum_id FROM durum_turleri WHERE durum_kodu = 'Aktif')
GROUP BY pt.program_adi;

-- Toplam danışman kapasitesi
SELECT 
  SUM(maksimum_kapasite) as toplam_kapasite,
  SUM(mevcut_ogrenci_sayisi) as kullanilan_kapasite,
  SUM(kullanilabilir_kapasite) as bos_kapasite
FROM danisman_yuk_view;
```

---

### 4. AŞAMA TAKİBİ VE GECİKME YÖNETİMİ KARARLARI

**Karar:** Hangi öğrenciler hangi aşamada ne kadar gecikmiş? Müdahale stratejileri

**Gerekli Bilgiler:**
- Aşama bazlı öğrenci dağılımı
- Aşama geçiş analizi (geçiş oranları, süreleri)
- Aşama gecikme analizi (hangi öğrenciler ne kadar gecikmiş)
- Aşama bazlı risk haritası

**Çözüm:**
- **Tablo:** `asama_tanimlari` - Program bazlı aşama tanımları, azami süreler, geçiş koşulları (JSONB)
- **Tablo:** `ogrenci_asamalari` - Her öğrencinin aşama geçmişi, gecikme bilgisi (`gecikme_yariyil`)
- **View:** `ogrenci_mevcut_asama` - Mevcut aktif aşamalar
- **Tablo:** `yeterlik_sinavlari`, `tez_onerileri`, `tik_toplantilari`, `tez_savunmalari` - Kritik aşamalar
- **Trigger:** `handle_asama_gecisi()` - Aşama geçişlerini otomatik yönetir

**Kullanım Örnekleri:**
```sql
-- Mevcut aşamalar
SELECT * FROM ogrenci_mevcut_asama
WHERE gecikme_yariyil > 0
ORDER BY gecikme_yariyil DESC;

-- Aşama bazlı öğrenci dağılımı
SELECT at.asama_adi, COUNT(*) as ogrenci_sayisi
FROM ogrenci_asamalari oa
JOIN asama_tanimlari at ON oa.asama_tanimi_id = at.asama_tanimi_id
WHERE oa.durum = 'Devam_Ediyor'
GROUP BY at.asama_adi;
```

---

### 5. PERFORMANS ANALİZİ VE TAHMİN KARARLARI

**Karar:** Mezuniyet tahmini, başarısızlık riski, danışman performansı, trend analizleri

**Gerekli Bilgiler:**
- Mezuniyet tahmini (öğrenci bazlı, program bazlı)
- Başarısızlık riski tahmini
- Danışman performans metrikleri (mezuniyet oranı, ortalama süre)
- Trend analizleri (yıllar içindeki değişimler)

**Çözüm:**
- **Tablo:** `ogrenci_risk_skorlari` - `tahmini_mezuniyet_tarihi`, risk skoru, risk seviyesi
- **Tablo:** `ogrenci_asamalari` - Aşama ilerleme hızı (tahmin için)
- **Tablo:** `ogrenci` - `kayit_tarihi`, `durum_id` (mezuniyet için)
- **Tablo:** `danisman_gecmisi` - Danışman-öğrenci ilişkisi (performans için)
- **View:** `ogrenci_ders_performans_ozeti` - Öğrenci performans özeti

**Kullanım Örnekleri:**
```sql
-- Mezuniyet tahmini
SELECT o.*, ors.tahmini_mezuniyet_tarihi, ors.risk_seviyesi
FROM ogrenci o
JOIN ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
WHERE ors.tahmini_mezuniyet_tarihi IS NOT NULL
ORDER BY ors.tahmini_mezuniyet_tarihi;

-- Danışman performansı (mezuniyet oranı)
SELECT 
  ap.ad || ' ' || ap.soyad as danisman_adi,
  COUNT(DISTINCT o.ogrenci_id) as toplam_ogrenci,
  COUNT(DISTINCT CASE WHEN dt.durum_kodu = 'Mezun' THEN o.ogrenci_id END) as mezun_sayisi,
  ROUND(COUNT(DISTINCT CASE WHEN dt.durum_kodu = 'Mezun' THEN o.ogrenci_id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT o.ogrenci_id), 0) * 100, 2) as mezuniyet_orani
FROM akademik_personel ap
LEFT JOIN ogrenci o ON ap.personel_id = o.danisman_id
LEFT JOIN durum_turleri dt ON o.durum_id = dt.durum_id
WHERE ap.rol = 'Danisman'
GROUP BY ap.personel_id, ap.ad, ap.soyad;
```

---

### 6. DERS BAŞARISI VE NOT YIĞILMASI ANALİZİ KARARLARI

**Karar:** Hangi derslerde başarısızlık var? Hangi derslerde not yığılması var? Ders içeriklerinde iyileştirme gerekli mi?

**Gerekli Bilgiler:**
- Ders bazlı başarısızlık oranları
- Ders bazlı ortalama notlar
- Hangi derslerde not yığılması var (ortalama düşük)
- Hangi derslerde öğrenciler en çok zorlanıyor
- Tekrar alınan dersler (hangi dersler en çok tekrar alınıyor)

**Çözüm:**
- **Tablo:** `ogrenci_dersleri` - Tüm ders notları, tekrar sayıları (`ts`), not kodları
- **Tablo:** `dersler` - Ders katalog bilgileri, `program_turu_id`, `akts`
- **View:** `ders_basarisizlik_analizi` - Ders bazlı başarısızlık oranları, ortalama notlar, tekrar alınma sayıları
- **View:** `ogrenci_ders_performans_ozeti` - Öğrenci bazlı zorlandığı dersler

**Kullanım Örnekleri:**
```sql
-- En çok başarısızlık olan dersler
SELECT * FROM ders_basarisizlik_analizi
WHERE basarisizlik_orani > 30
ORDER BY basarisizlik_orani DESC;

-- Not yığılması olan dersler (ortalama düşük)
SELECT * FROM ders_basarisizlik_analizi
WHERE ortalama_not < 2.5
ORDER BY ortalama_not ASC;

-- En çok tekrar alınan dersler
SELECT * FROM ders_basarisizlik_analizi
WHERE tekrar_alinma_sayisi > 5
ORDER BY tekrar_alinma_sayisi DESC;
```

---

## 🗄️ VERİTABANI YAPISI

### TEMEL TABLOLAR

#### 1. **ogrenci** (Öğrenci Bilgileri)
- `ogrenci_id` (UUID, PK)
- `program_turu_id` (UUID, FK → program_turleri)
- `durum_id` (UUID, FK → durum_turleri)
- `danisman_id` (UUID, FK → akademik_personel)
- `tc_kimlik_no` (TEXT, UNIQUE)
- `ad`, `soyad` (TEXT)
- `dogum_tarihi` (DATE)
- `cinsiyet` (TEXT: 'E', 'K')
- `email`, `telefon` (TEXT)
- `kayit_tarihi`, `kabul_tarihi` (DATE)
- `kabul_turu` (TEXT: 'Lisans', 'Yuksek_Lisans')
- `ogrenci_no` (TEXT, UNIQUE)
- `soft_delete` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

#### 2. **akademik_personel** (Akademik Personel)
- `personel_id` (UUID, PK)
- `anabilim_dali_id` (UUID, FK → anabilim_dallari)
- `unvan` (TEXT: 'Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi', 'Araş. Gör.', 'Araş. Gör. Dr.')
- `ad`, `soyad` (TEXT)
- `email` (TEXT, UNIQUE)
- `telefon` (TEXT)
- `rol` (TEXT: 'Bolum_Baskani', 'Danisman')
- `anabilim_dali_baskani_mi` (BOOLEAN) - Anabilim dalı başkanı mı?
- `maksimum_kapasite` (INT) - Maksimum öğrenci sayısı
- `sert_limit` (INT) - Sert limit (aşılamaz)
- `yumusak_limit` (INT) - Yumuşak limit (uyarı verilir)
- `aktif_mi` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

#### 3. **adminler** (Admin Kullanıcıları)
- `admin_id` (UUID, PK)
- `ad`, `soyad` (TEXT)
- `email` (TEXT, UNIQUE)
- `telefon` (TEXT)
- `aktif_mi` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### REFERANS TABLOLAR

#### 4. **program_turleri** (Program Türleri)
- `program_turu_id` (UUID, PK)
- `program_kodu` (TEXT, UNIQUE) - 'DOKTORA', 'TEZLI_YL', 'TEZSIZ_IO', 'TEZSIZ_UZAKTAN'
- `program_adi` (TEXT, UNIQUE)
- `maksimum_sure_yil` (INT)
- `maksimum_sure_yariyil` (INT)
- `aktif_mi` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

#### 5. **anabilim_dallari** (Anabilim Dalları)
- `anabilim_dali_id` (UUID, PK)
- `anabilim_dali_kodu` (TEXT, UNIQUE) - 'CBS', 'ET'
- `anabilim_dali_adi` (TEXT, UNIQUE)
- `aktif_mi` (BOOLEAN)
- `created_at` (TIMESTAMP)

#### 6. **durum_turleri** (Durum Türleri)
- `durum_id` (UUID, PK)
- `durum_kodu` (TEXT, UNIQUE) - 'Aktif', 'Dondurdu', 'Pasif', 'Mezun', 'Ilisik_Kesildi'
- `durum_adi` (TEXT, UNIQUE)
- `sira_no` (INT, NOT NULL)
- `aciklama` (TEXT)

#### 7. **dersler** (Ders Katalog)
- `ders_kodu` (TEXT, PK)
- `ders_adi` (TEXT)
- `ders_turu` (TEXT: 'Seminer', 'Zorunlu', 'Seçmeli', 'Tez', 'Proje')
- `akts` (INT)
- `program_turu_id` (UUID, FK → program_turleri) - Dersin okutulduğu program
- `kritik_darbogaz_mi` (BOOLEAN)
- `aktif_mi` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

### İLİŞKİ TABLOLAR

#### 8. **ogrenci_akademik_durum** (Öğrenci Akademik Durum)
- `ogrenci_id` (UUID, PK, FK → ogrenci)
- `mevcut_asama_id` (UUID, FK → ogrenci_asamalari) - Mevcut aktif aşama
- `mevcut_yariyil` (INT) - Mevcut yarıyıl
- `not_ortalamasi` (NUMERIC) - Genel not ortalaması
- `tamamlanan_akts` (INT) - Tamamlanan AKTS
- `guncelleme_tarihi` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)

#### 9. **ogrenci_dersleri** (Öğrenci Ders Kayıtları)
- `ders_kayit_id` (UUID, PK)
- `ogrenci_id` (UUID, FK → ogrenci)
- `ders_kodu` (TEXT, FK → dersler)
- `ders_adi` (TEXT)
- `yariyil` (INT)
- `akademik_yil` (INT)
- `not_kodu` (TEXT: 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF')
- `ts` (INT) - Tekrar sayısı (1 = ilk alış)
- `akts` (INT)
- `vize_notu`, `final_notu`, `butunleme_notu` (NUMERIC)
- `created_at`, `updated_at` (TIMESTAMP)
- UNIQUE: `(ogrenci_id, ders_kodu, yariyil, akademik_yil, ts)`

#### 10. **ogrenci_asamalari** (Öğrenci Aşama Geçmişi)
- `asama_id` (UUID, PK)
- `ogrenci_id` (UUID, FK → ogrenci)
- `asama_tanimi_id` (UUID, FK → asama_tanimlari)
- `baslangic_tarihi` (DATE)
- `bitis_tarihi` (DATE, NULL)
- `durum` (TEXT: 'Devam_Ediyor', 'Tamamlandi', 'Basarisiz', 'Iptal')
- `gecikme_yariyil` (INT) - Planlanan süreden ne kadar gecikmiş
- `tamamlanma_nedeni` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### 11. **asama_tanimlari** (Aşama Tanımları)
- `asama_tanimi_id` (UUID, PK)
- `program_turu_id` (UUID, FK → program_turleri)
- `asama_kodu` (TEXT) - 'DERS_DONEMI', 'YETERLIK_SINAVI', 'TEZ_ONERISI', vb.
- `asama_adi` (TEXT)
- `sira_no` (INT) - Aşama sırası
- `azami_sure_yariyil` (INT) - Azami süre (yarıyıl)
- `azami_sure_yil` (NUMERIC) - Azami süre (yıl)
- `gecis_kosullari` (JSONB) - Geçiş koşulları
- `kontrol_verileri` (TEXT[]) - Kontrol edilecek veriler
- `aciklama` (TEXT)
- UNIQUE: `(program_turu_id, asama_kodu)`

#### 12. **ogrenci_risk_skorlari** (Risk Skorları)
- `risk_id` (UUID, PK)
- `ogrenci_id` (UUID, FK → ogrenci, UNIQUE)
- `risk_skoru` (INT, 0-100)
- `risk_seviyesi` (TEXT: 'Dusuk', 'Orta', 'Yuksek', 'Kritik')
- `risk_faktorleri` (JSONB) - Risk faktörleri detayları
- `tahmini_mezuniyet_tarihi` (DATE)
- `azami_sureye_yakinlik_yuzdesi` (NUMERIC) - Azami süreye yakınlık %
- `hesaplama_tarihi` (TIMESTAMP)
- `created_at`, `updated_at` (TIMESTAMP)

#### 13. **danisman_gecmisi** (Danışman Atama Geçmişi)
- `gecmis_id` (UUID, PK)
- `ogrenci_id` (UUID, FK → ogrenci)
- `danisman_id` (UUID, FK → akademik_personel)
- `atama_tarihi` (DATE)
- `ayrilma_tarihi` (DATE, NULL)
- `aktif_mi` (BOOLEAN) - Aktif danışman mı?
- `degisiklik_nedeni` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)
- UNIQUE: `(ogrenci_id)` WHERE `aktif_mi = true`

#### 14. **akademik_personel_uzmanlik** (Uzmanlık Alanları)
- `personel_uzmanlik_id` (UUID, PK)
- `personel_id` (UUID, FK → akademik_personel)
- `uzmanlik_alani` (TEXT)
- `ana_uzmanlik_mi` (BOOLEAN)
- `created_at` (TIMESTAMP)
- UNIQUE: `(personel_id, uzmanlik_alani)`

### KRİTİK AŞAMA TABLOLAR

#### 15. **yeterlik_sinavlari** (Yeterlik Sınavları)
- `sinav_id` (UUID, PK)
- `ogrenci_id` (UUID, FK → ogrenci)
- `sinav_tarihi` (DATE)
- `deneme_no` (INT) - 1. deneme, 2. deneme
- `sonuc` (TEXT: 'Basarili', 'Basarisiz')
- `notu` (NUMERIC) - Sınav notu (100 üzerinden)
- `aciklama` (TEXT)
- `created_at` (TIMESTAMP)
- UNIQUE: `(ogrenci_id, deneme_no)`

#### 16. **tez_onerileri** (Tez Önerileri)
- `oneri_id` (UUID, PK)
- `ogrenci_id` (UUID, FK → ogrenci)
- `oneri_tarihi` (DATE)
- `sonuc` (TEXT: 'Kabul', 'Ret', 'Revizyon_Gerekli')
- `revizyon_tarihi` (DATE, NULL)
- `nihai_sonuc` (TEXT: 'Kabul', 'Ret')
- `tez_konusu` (TEXT)
- `aciklama` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### 17. **tez_savunmalari** (Tez Savunmaları)
- `savunma_id` (UUID, PK)
- `ogrenci_id` (UUID, FK → ogrenci)
- `savunma_tarihi` (DATE)
- `sonuc` (TEXT: 'Kabul', 'Duzeltme_Gerekli', 'Red')
- `duzeltme_tarihi` (DATE, NULL)
- `nihai_sonuc` (TEXT: 'Kabul', 'Red')
- `jüri_uyeleri` (TEXT[]) - Jüri üyeleri array
- `aciklama` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### 18. **tik_toplantilari** (TİK Toplantıları)
- `toplanti_id` (UUID, PK)
- `ogrenci_id` (UUID, FK → ogrenci)
- `toplanti_tarihi` (DATE)
- `toplanti_no` (INT) - 1., 2., 3. toplantı
- `sonuc` (TEXT: 'Basarili', 'Basarisiz', 'Yetersiz')
- `degerlendirme` (TEXT)
- `katilim_durumu` (TEXT: 'Katildi', 'Katilmadi', 'Raporlu', 'Mazeretli')
- `rapor_verildi_mi` (BOOLEAN)
- `rapor_tarihi` (DATE)
- `rapor_icerigi` (TEXT)
- `uyari_gonderildi_mi` (BOOLEAN)
- `uyari_tarihi` (DATE)
- `created_at`, `updated_at` (TIMESTAMP)

#### 19. **ogrenci_durum_gecmisi** (Durum Geçmişi)
- `gecmis_id` (UUID, PK)
- `ogrenci_id` (UUID, FK → ogrenci)
- `eski_durum_id` (UUID, FK → durum_turleri)
- `yeni_durum_id` (UUID, FK → durum_turleri)
- `degisiklik_nedeni` (TEXT)
- `degistiren_admin_id` (UUID, FK → adminler)
- `degistiren_personel_id` (UUID, FK → akademik_personel)
- `otomatik_mi` (BOOLEAN)
- `degisiklik_tarihi` (TIMESTAMP)
- `created_at` (TIMESTAMP)

---

## 📊 VIEW'LER (Hesaplanan Değerler)

### 1. **ogrenci_mevcut_asama** (Mevcut Aktif Aşamalar)
Öğrencilerin mevcut aktif aşamalarını gösterir.

**Kolonlar:**
- `ogrenci_id`, `ogrenci_adi`
- `program_adi`, `program_kodu`
- `asama_kodu`, `asama_adi`
- `baslangic_tarihi`, `bitis_tarihi`
- `gecikme_yariyil`
- `durum`, `tamamlanma_nedeni`

**Kullanım:**
```sql
SELECT * FROM ogrenci_mevcut_asama
WHERE gecikme_yariyil > 0;
```

### 2. **danisman_yuk_view** (Danışman Yük Analizi)
Danışman kapasite kullanımını gösterir.

**Kolonlar:**
- `personel_id`, `danisman_adi`, `unvan`, `rol`
- `maksimum_kapasite`
- `mevcut_ogrenci_sayisi`
- `kapasite_kullanim_yuzdesi`
- `kullanilabilir_kapasite`

**Kullanım:**
```sql
SELECT * FROM danisman_yuk_view
WHERE kapasite_kullanim_yuzdesi > 80
ORDER BY kapasite_kullanim_yuzdesi DESC;
```

### 3. **ogrenci_ders_performans_ozeti** (Öğrenci Ders Performans Özeti)
Öğrenci bazlı ders performans özeti.

**Kolonlar:**
- `ogrenci_id`, `ogrenci_adi`, `program_adi`
- `toplam_ders_sayisi`
- `basarili_ders_sayisi`
- `basarisiz_ders_sayisi`
- `tekrar_alinan_ders_sayisi`
- `ortalama_not`
- `toplam_akts`
- `zorlandigi_dersler` (STRING_AGG)

**Kullanım:**
```sql
SELECT * FROM ogrenci_ders_performans_ozeti
WHERE basarisiz_ders_sayisi > 3
ORDER BY basarisiz_ders_sayisi DESC;
```

### 4. **ders_basarisizlik_analizi** (Ders Başarısızlık Analizi)
Ders bazlı başarısızlık analizi.

**Kolonlar:**
- `ders_kodu`, `ders_adi`, `ders_turu`, `akts`
- `toplam_ogrenci_sayisi`
- `basarisiz_ogrenci_sayisi`
- `basarisizlik_orani` (%)
- `tekrar_alinma_sayisi`
- `ortalama_not`

**Kullanım:**
```sql
SELECT * FROM ders_basarisizlik_analizi
WHERE basarisizlik_orani > 30
ORDER BY basarisizlik_orani DESC;
```

---

## ⚙️ FONKSİYONLAR VE TRİGGER'LAR

### FONKSİYONLAR

#### 1. **hesapla_risk_skoru(p_ogrenci_id UUID)**
Öğrenci risk skorunu hesaplar (0-100 arası).

**Hesaplama Yöntemi:**
- Azami süreye yakınlık: %40 ağırlık (0-40 puan)
- Not ortalaması: %30 ağırlık (0-30 puan)
- Başarısız ders sayısı: %20 ağırlık (0-20 puan)
- Aşama gecikmesi: %10 ağırlık (0-10 puan)

**Kullanım:**
```sql
SELECT hesapla_risk_skoru('ogrenci-uuid-here');
```

#### 2. **hesapla_risk_seviyesi(p_risk_skoru INTEGER)**
Risk skoruna göre risk seviyesini belirler.

**Seviyeler:**
- 0-25: Dusuk
- 26-50: Orta
- 51-75: Yuksek
- 76-100: Kritik

**Kullanım:**
```sql
SELECT hesapla_risk_seviyesi(65); -- 'Yuksek'
```

#### 3. **turkce_karakterleri_duzelt(text_value TEXT)**
Email adreslerindeki Türkçe karakterleri İngilizce karakterlere çevirir.

**Dönüşümler:**
- ı → i, İ → I
- ş → s, Ş → S
- ğ → g, Ğ → G
- ü → u, Ü → U
- ö → o, Ö → O
- ç → c, Ç → C

### TRİGGER'LAR

#### 1. **trigger_update_ogrenci_akademik_durum**
`ogrenci_dersleri` tablosuna INSERT/UPDATE olduğunda çalışır.

**Yaptığı İşlemler:**
- Not ortalamasını günceller
- Tamamlanan AKTS'yi günceller

#### 2. **trigger_handle_asama_gecisi**
`ogrenci_asamalari` tablosuna INSERT/UPDATE olduğunda çalışır.

**Yaptığı İşlemler:**
- Eski aktif aşamayı tamamlandı olarak işaretler
- Yeni aktif aşamayı `ogrenci_akademik_durum.mevcut_asama_id`'ye atar

#### 3. **trigger_update_risk_skoru**
`ogrenci_akademik_durum` tablosuna UPDATE olduğunda çalışır.

**Yaptığı İşlemler:**
- Risk skorunu hesaplar
- Risk seviyesini belirler
- `ogrenci_risk_skorlari` tablosunu günceller

---

## 🔗 İLİŞKİLER (Foreign Keys)

### Ana İlişkiler:
- `ogrenci.program_turu_id` → `program_turleri.program_turu_id`
- `ogrenci.durum_id` → `durum_turleri.durum_id`
- `ogrenci.danisman_id` → `akademik_personel.personel_id`
- `akademik_personel.anabilim_dali_id` → `anabilim_dallari.anabilim_dali_id`
- `ogrenci_akademik_durum.ogrenci_id` → `ogrenci.ogrenci_id`
- `ogrenci_akademik_durum.mevcut_asama_id` → `ogrenci_asamalari.asama_id`
- `ogrenci_asamalari.ogrenci_id` → `ogrenci.ogrenci_id`
- `ogrenci_asamalari.asama_tanimi_id` → `asama_tanimlari.asama_tanimi_id`
- `ogrenci_dersleri.ogrenci_id` → `ogrenci.ogrenci_id`
- `ogrenci_dersleri.ders_kodu` → `dersler.ders_kodu`
- `ogrenci_risk_skorlari.ogrenci_id` → `ogrenci.ogrenci_id`
- `danisman_gecmisi.ogrenci_id` → `ogrenci.ogrenci_id`
- `danisman_gecmisi.danisman_id` → `akademik_personel.personel_id`
- `akademik_personel_uzmanlik.personel_id` → `akademik_personel.personel_id`
- `yeterlik_sinavlari.ogrenci_id` → `ogrenci.ogrenci_id`
- `tez_onerileri.ogrenci_id` → `ogrenci.ogrenci_id`
- `tez_savunmalari.ogrenci_id` → `ogrenci.ogrenci_id`
- `tik_toplantilari.ogrenci_id` → `ogrenci.ogrenci_id`
- `ogrenci_durum_gecmisi.ogrenci_id` → `ogrenci.ogrenci_id`
- `ogrenci_durum_gecmisi.degistiren_admin_id` → `adminler.admin_id`
- `ogrenci_durum_gecmisi.degistiren_personel_id` → `akademik_personel.personel_id`
- `dersler.program_turu_id` → `program_turleri.program_turu_id`

---

## 📈 ANALİZ MİMARİSİ

### Veritabanı (PostgreSQL/Supabase) ile Yapılacaklar:
- ✅ Basit aggregasyonlar (COUNT, SUM, AVG)
- ✅ View'ler (hesaplanan değerler, performans için)
- ✅ Basit risk skoru fonksiyonu (ağırlıklı toplam)
- ✅ Program bazlı metrikler
- ✅ Danışman kapasite hesaplamaları
- ✅ Ders başarısızlık analizi

### Node.js Backend ile Yapılacaklar:
- 📊 İstatistiksel regresyon (mezuniyet tahmini)
- 📊 Logistic regression (başarısızlık riski)
- 📊 What-if simülasyonları (danışman atama, kapasite planlama)
- 📊 Trend analizleri (zaman serisi)
- 📊 Korelasyon analizleri
- 📊 Güven aralığı hesaplamaları

### Uygulama Stratejisi:
- **Faz 1 (MVP):** Veritabanı odaklı (view'ler ve fonksiyonlar) ✅
- **Faz 2:** Node.js analiz servisleri eklenecek
- **Faz 3:** Machine learning modelleri (gelecek)

---

## 📝 MOCK VERİ YAPISI

### Mevcut Mock Veri:
- **50 Öğrenci:**
  - 8 Doktora
  - 10 Tezli Yüksek Lisans
  - 15 Tezsiz Yüksek Lisans (İÖ)
  - 17 Tezsiz Yüksek Lisans (Uzaktan)
- **8 Akademik Personel** (JSON'dan)
- **3 Admin**
- **Tüm Dersler** (JSON'dan, program bazlı)
- **Aşama Tanımları** (Her program için)
- **Öğrenci Dersleri ve Notları** (Risk seviyesine göre dağılım)
- **Öğrenci Aşamaları** (Geçmiş ve aktif)
- **Risk Skorları** (Her öğrenci için)
- **Kritik Aşama Kayıtları** (Yeterlik, tez önerisi, tez savunma, TİK)

---

## 🚀 SONRAKİ AŞAMALAR

### Model Geliştirme:
1. **Frontend Modelleri:**
   - Öğrenci modeli
   - Akademik personel modeli
   - Aşama modeli
   - Risk skoru modeli
   - Ders modeli

2. **Backend API Endpoints:**
   - `/api/ogrenciler` - Öğrenci listesi, detay, filtreleme
   - `/api/danismanlar` - Danışman listesi, yük analizi
   - `/api/asamalar` - Aşama takibi
   - `/api/risk-analizi` - Risk skorları
   - `/api/ders-analizi` - Ders başarısızlık analizi
   - `/api/dashboard` - Bölüm başkanı dashboard verileri

3. **Analiz Servisleri (Node.js):**
   - Mezuniyet tahmini servisi
   - Risk analizi servisi
   - What-if simülasyon servisi
   - Trend analizi servisi

---

## 📚 ÖNEMLİ NOTLAR

1. **Login Mekanizması:** Kaldırıldı. Roller `akademik_personel.rol` ve `adminler` tablosu ile yönetiliyor.

2. **Email Formatı:** Türkçe karakterler İngilizce karakterlere çevrildi (034 migration).

3. **Risk Skoru Hesaplama:** Otomatik trigger ile güncelleniyor. Manuel hesaplama için `hesapla_risk_skoru()` fonksiyonu kullanılabilir.

4. **Aşama Geçişleri:** Trigger ile otomatik yönetiliyor. `ogrenci_akademik_durum.mevcut_asama_id` otomatik güncelleniyor.

5. **Ders Program İlişkisi:** Her ders `program_turu_id` ile bir programa bağlı. NULL ise tüm programlarda okutulur.

6. **Anabilim Dalı Başkanı:** `akademik_personel.anabilim_dali_baskani_mi` kolonu ile belirtiliyor. Bir kişi hem bölüm başkanı hem anabilim dalı başkanı olabilir.

---

## 🔍 HIZLI REFERANS

### En Çok Kullanılan Sorgular:

```sql
-- Yüksek riskli öğrenciler
SELECT o.*, ors.risk_skoru, ors.risk_seviyesi
FROM ogrenci o
JOIN ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
WHERE ors.risk_seviyesi IN ('Yuksek', 'Kritik')
ORDER BY ors.risk_skoru DESC;

-- Danışman yük analizi
SELECT * FROM danisman_yuk_view
ORDER BY kapasite_kullanim_yuzdesi DESC;

-- Aşama gecikmesi olan öğrenciler
SELECT * FROM ogrenci_mevcut_asama
WHERE gecikme_yariyil > 0
ORDER BY gecikme_yariyil DESC;

-- En çok başarısızlık olan dersler
SELECT * FROM ders_basarisizlik_analizi
WHERE basarisizlik_orani > 30
ORDER BY basarisizlik_orani DESC;

-- Program bazlı öğrenci sayıları
SELECT pt.program_adi, COUNT(*) as ogrenci_sayisi
FROM ogrenci o
JOIN program_turleri pt ON o.program_turu_id = pt.program_turu_id
WHERE o.durum_id IN (SELECT durum_id FROM durum_turleri WHERE durum_kodu = 'Aktif')
GROUP BY pt.program_adi;
```

---

**Son Güncelleme:** Migration 034 tamamlandı
**Veritabanı Durumu:** ✅ Tüm migration'lar başarıyla çalıştırıldı
**Mock Veri:** ✅ 50 öğrenci, 8 akademik personel, tüm referans veriler eklendi

