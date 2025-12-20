# ER Diyagramı ve Veritabanı Şema Açıklaması

## 1. ER Diyagramı (Mermaid)

```mermaid
erDiagram
    kullanicilar ||--o| akademik_personel : "1:1 (akademik_personel_id)"
    kullanicilar ||--o| ogrenci : "1:1 (ogrenci_id)"
    akademik_personel ||--o{ ogrenci : "danisman"
    akademik_personel }o--|| anabilim_dallari : "N:1"
    ogrenci }o--|| program_turleri : "N:1 (program_turu_id)"
    ogrenci }o--|| program_turleri : "N:1 (program_kabul_turu)"
    ogrenci }o--|| durum_turleri : "N:1"
    ogrenci ||--o{ ogrenci_dersleri : "1:N"
    ogrenci_dersleri }o--|| dersler : "N:1"
    ogrenci ||--o{ ogrenci_akademik_durum : "1:1"
    ogrenci ||--o{ ogrenci_risk_analizi : "1:N"
    ogrenci ||--o{ ogrenci_son_login : "1:1"
    ogrenci ||--o{ danisman_gecmisi : "1:N"
    ogrenci ||--o{ akademik_milestone : "1:N"
    ogrenci ||--o{ tik_toplantilari : "1:N"
    ogrenci ||--o{ tez_donem_kayitlari : "1:N"
    ogrenci ||--o{ bildirimler : "1:N"
    ogrenci ||--o{ ogrenci_durum_gecmisi : "1:N"
    
    kullanicilar {
        UUID kullanici_id PK
        UUID akademik_personel_id FK "akademik_personel.personel_id"
        UUID ogrenci_id FK "ogrenci.ogrenci_id"
        TEXT rol "Admin, Bolum_Baskani, Danisman, Ogrenci"
        TEXT email UK
        TEXT ad
        TEXT soyad
        BOOLEAN aktif_mi
        TIMESTAMP son_giris_tarihi
    }
    
    akademik_personel {
        UUID personel_id PK
        UUID kullanici_id FK
        UUID anabilim_dali_id FK
        TEXT unvan
        TEXT ad
        TEXT soyad
        TEXT email UK
        TEXT telefon
        INT maksimum_kapasite
        INT sert_limit
        INT yumusak_limit
        BOOLEAN aktif_mi
    }
    
    ogrenci {
        UUID ogrenci_id PK
        UUID kullanici_id FK
        UUID program_turu_id FK "program_turleri.program_turu_id"
        UUID durum_id FK
        UUID danisman_id FK
        UUID program_kabul_turu FK "program_turleri.program_turu_id"
        TEXT tc_kimlik_no UK
        TEXT ad
        TEXT soyad
        DATE dogum_tarihi
        TEXT cinsiyet
        TEXT email
        TEXT telefon
        TEXT adres
        DATE kayit_tarihi
        DATE kabul_tarihi
        TEXT ogrenci_no UK
        TIMESTAMP son_login
        BOOLEAN soft_delete
    }
    
    program_turleri {
        UUID program_turu_id PK
        TEXT program_adi UK
        TEXT program_kodu UK
        INT maksimum_sure_yil
        INT maksimum_sure_yariyil
        BOOLEAN aktif_mi
    }
    
    ogrenci_dersleri {
        UUID ders_kayit_id PK
        UUID ogrenci_id FK
        TEXT ders_kodu FK
        TEXT ders_adi
        INT yariyil
        INT akademik_yil
        TEXT not_kodu
        INT ts
        INT akts
        NUMERIC vize_notu
        NUMERIC final_notu
        NUMERIC butunleme_notu
    }
    
    dersler {
        TEXT ders_kodu PK
        TEXT ders_adi
        TEXT ders_turu
        INT akts
        BOOLEAN kritik_darbogaz_mi
        BOOLEAN aktif_mi
    }
    
    ogrenci_risk_analizi {
        UUID analiz_id PK
        UUID ogrenci_id FK
        INT risk_skoru
        TEXT risk_seviyesi
        TEXT tehlike_turu
        BOOLEAN hayalet_ogrenci_mi
        JSONB risk_faktorleri
        TIMESTAMP hesaplama_tarihi
    }
    
    ogrenci_akademik_durum {
        UUID ogrenci_id PK_FK
        TEXT mevcut_asinama
        INT mevcut_yariyil
        BOOLEAN ders_tamamlandi_mi
        INT tamamlanan_ders_sayisi
    }
    
    ogrenci_son_login {
        UUID ogrenci_id PK_FK
        TIMESTAMP son_login
        TEXT son_login_ip
        TEXT son_login_user_agent
    }
```

## 2. BCNF Normalizasyonu Açıklaması

### 2.1. ogrenci Tablosu (BCNF Uyumlu)

**Demografik Bilgiler:**
- `tc_kimlik_no`, `ad`, `soyad`, `dogum_tarihi`, `cinsiyet`, `email`, `telefon`, `adres`

**Akademik Statü Bilgileri:**
- `kayit_tarihi`, `kabul_tarihi`, `program_kabul_turu` (FK → program_turleri), `ogrenci_no`

**Program ve Durum Bilgileri:**
- `program_turu_id` (FK → program_turleri) - Öğrencinin kayıtlı olduğu program
- `program_kabul_turu` (FK → program_turleri) - Öğrencinin hangi programdan mezun olarak bu programa kabul edildiği (Lisans, Tezli_YL, vb.)
- `durum_id` (FK → durum_turleri)

**Kapasite Yönetimi:**
- `danisman_id` (FK → akademik_personel)

**Hayalet Takibi:**
- `son_login` (performans için denormalize edildi, `ogrenci_son_login` tablosu da var)

**Normalizasyon Prensipleri:**
- Hesaplanan değerler (mevcut_yariyil, risk_skoru) ayrı tablolara taşındı:
  - `mevcut_asinama` → `ogrenci_akademik_durum` tablosuna taşındı
  - `mevcut_yariyil` → `ogrenci_akademik_durum` tablosuna taşındı (view ile hesaplanır)
  - `ders_tamamlandi_mi` → `ogrenci_akademik_durum` tablosuna taşındı
  - `tamamlanan_ders_sayisi` → `ogrenci_akademik_durum` tablosuna taşındı
  - `mevcut_risk_skoru` → `ogrenci_risk_analizi` tablosunda zaten var
  - Ders bilgileri → `ogrenci_dersleri` tablosuna taşındı

### 2.2. ogrenci_dersleri Tablosu (BCNF Uyumlu)

**Temel Bilgiler:**
- `ogrenci_id` (FK → ogrenci)
- `ders_kodu` (FK → dersler)
- `ders_adi`, `yariyil`, `akademik_yil`

**Not Bilgileri:**
- `not_kodu` (AA, BA, BB, CB, CC, DC, DD, FD, FF, B, Y, H, M, D, E, K, P, T, Z)
- `ts` (Tekrar Sayısı: 1 = ilk alış, 2+ = tekrar)
- `akts` (AKTS kredisi)
- `vize_notu`, `final_notu`, `butunleme_notu`

**Unique Constraint:**
- `(ogrenci_id, ders_kodu, yariyil, akademik_yil, ts)` - Aynı ders aynı yarıyılda tekrar alınabilir (ts ile ayırt edilir)

**Normalizasyon Prensipleri:**
- Her ders kaydı ayrı satır (BCNF: her ders kaydı ayrı satır)
- Tekrar alınan dersler `ts` ile ayırt edilir
- Ders katalog bilgileri `dersler` tablosunda tutulur (ders_turu, kritik_darbogaz_mi)

### 2.3. dersler Tablosu (YENİ - Seminer Tespiti İçin)

**Temel Bilgiler:**
- `ders_kodu` (PK)
- `ders_adi`
- `ders_turu` (Seminer, Zorunlu, Seçmeli)
- `akts` (ders katalog bilgisi)

**Kritik İşaretler:**
- `kritik_darbogaz_mi` (BOOLEAN) - Seminer için true

**Normalizasyon Prensipleri:**
- Ders katalog bilgileri tek bir tabloda tutulur (BCNF: ders bilgileri tekrar edilmez)

### 2.4. akademik_personel Tablosu (Kapasite Yönetimi)

**Kapasite Limitleri:**
- `sert_limit` (INT) - Sert limit (aşılamaz)
- `yumusak_limit` (INT) - Yumuşak limit (uyarı verilir)

**Unvan Bazlı Varsayılan Değerler:**
- Prof. Dr.: sert_limit = 15, yumusak_limit = 12
- Doç. Dr.: sert_limit = 12, yumusak_limit = 10
- Dr. Öğr. Üyesi: sert_limit = 10, yumusak_limit = 8
- Araş. Gör. / Araş. Gör. Dr.: sert_limit = 5, yumusak_limit = 4

## 3. "7 Ders + Seminer + 60 AKTS" Kuralı (BCNF Uyumlu)

### 3.1. Mantık Açıklaması

**Ders Bilgileri:**
- Ders bilgileri `ogrenci_dersleri` tablosunda tutulur (BCNF: her ders kaydı ayrı satır)
- Her ders kaydı için `not_kodu`, `ts`, `akts` bilgileri tutulur

**Seminer Bilgisi:**
- Seminer bilgisi `dersler` tablosundan alınır (`ders_turu = 'Seminer'`)
- `ogrenci_dersleri` tablosunda Seminer dersinin `not_kodu` kontrol edilir

**Toplam AKTS:**
- `ogrenci_dersleri` tablosundan `SUM(akts)` ile hesaplanır
- Sadece başarılı dersler (not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')) sayılır
- Tekrar alınan derslerin en son başarılı notu alınır (ts bazlı)

**Ders Sayısı:**
- `COUNT(DISTINCT ders_kodu)` ile hesaplanır
- Sadece başarılı dersler sayılır
- Tekrar alınan dersler bir kez sayılır (en son başarılı notu alınır)

**Kontrol Kuralı:**
```sql
(COUNT(DISTINCT ders_kodu) >= 7) 
AND (SUM(akts) >= 60) 
AND (EXISTS Seminer dersi başarılı)
```

### 3.2. SQL Seviyesinde Kontrol

**View: `ogrenci_ders_asamasi_view`**
- Ders aşaması kontrol sonuçlarını gösterir
- `basarili_ders_sayisi`, `toplam_akts`, `seminer_ders_kodu`, `seminer_not_kodu`, `ders_asamasi_tamamlandi` alanlarını içerir

**Function: `fn_kontrol_ders_asamasi(p_ogrenci_id)`**
- Ders aşaması kontrolü yapar
- JSONB formatında sonuç döndürür

## 4. "TS Çarpanlı Risk Formülü" (BCNF Uyumlu)

### 4.1. Mantık Açıklaması

**TS (Tekrar Sayısı):**
- TS (Tekrar Sayısı) `ogrenci_dersleri` tablosunda `ts` alanında tutulur
- Her ders kaydı için `ts` değeri: 1 = ilk alış, 2+ = tekrar
- Aynı ders farklı yarıyıllarda tekrar alınabilir (ts artar)

**Toplam TS Hesaplama:**
- `SUM(ts - 1) WHERE ts > 1` (sadece tekrar alınan dersler)
- Örnek: Bir ders 3 kez alınmışsa (ts = 3), toplam TS'ye 2 eklenir (3 - 1 = 2)

**Risk Formülü:**
```sql
Risk Skoru = (Kalan Süre Oranı * 0.6) 
           + (Aşama Tıkanıklığı * 0.3) 
           + (Toplam TS * 5)
           + Hayalet Öğrenci Bonusu (+30 puan, eğer son_login 180 günü geçmişse)
```

**Formül Bileşenleri:**
1. **Kalan Süre Oranı (0-100, ağırlık: 0.6):**
   - `(Maksimum Yarıyıl - Etkili Yarıyıl) / Maksimum Yarıyıl * 100`
   - Etkili Yarıyıl = Mevcut Yarıyıl - H notu sayısı (H notları azami süre hesabından düşülür)
   - Tersine çevrilir: Kalan süre azaldıkça risk artar

2. **Aşama Tıkanıklığı (0-100, ağırlık: 0.3):**
   - Program türüne göre aşama tıkanıklığı hesaplanır:
     - Doktora: Ders aşamasında takılmış (4+ yarıyıl) → 80 puan
     - Doktora: Yeterlik aşamasında takılmış (6+ yarıyıl) → 90 puan
     - Doktora: Tez önerisi aşamasında takılmış (8+ yarıyıl) → 85 puan
     - Tezli YL: Ders tamamlama süresi aşımı (4+ yarıyıl) → 100 puan
     - Tezsiz YL: Ders sayısı kontrolü (3+ yarıyıl, 10 ders altı) → 100 puan

3. **Toplam TS (ağırlık: 5):**
   - Her tekrar alınan ders için 5 puan eklenir
   - Örnek: 3 ders tekrar alınmışsa → 3 * 5 = 15 puan

4. **Hayalet Öğrenci Bonusu (+30 puan):**
   - `son_login` 180 günü geçmişse veya NULL ise → +30 puan
   - Risk skoruna doğrudan eklenir

### 4.2. SQL Seviyesinde Hesaplama

**Function: `fn_hesapla_ogrenci_riski(p_ogrenci_id)`**
- Risk skoru hesaplama fonksiyonu
- Formül: `(Kalan Süre Oranı * 0.6) + (Aşama Tıkanıklığı * 0.3) + (Toplam TS * 5) + Hayalet Bonusu (+30)`
- Sonuç: 0-100 arası risk skoru (NUMERIC)

**Function: `fn_hesapla_etkili_yariyil(p_ogrenci_id)`**
- H (Hak Dondurma) notu içeren dönemleri azami süre hesabından otomatik düşen fonksiyon
- Mantık: `Etkili Yarıyıl = Mevcut Yarıyıl - COUNT(DISTINCT yariyil WHERE not_kodu = 'H')`

## 5. Kapasite Yönetimi

### 5.1. Danışman Ataması

**ogrenci Tablosu:**
- `danisman_id` (FK → akademik_personel) - Öğrencinin danışmanı

**Trigger: `check_capacity`**
- `ogrenci` tablosuna `danisman_id` atandığında/güncellendiğinde çalışır
- Hocanın unvanına göre sert ve yumuşak limitleri kontrol eder
- Sert limit aşılırsa: HATA fırlatır (RAISE EXCEPTION)
- Yumuşak limit aşılırsa: UYARI bildirimi oluşturur

**Mantık:**
- `COUNT(aktif öğrenciler) > sert_limit` → HATA
- `COUNT(aktif öğrenciler) > yumusak_limit` → UYARI

## 6. Hayalet Takibi

### 6.1. Son Giriş Tarihi

**ogrenci Tablosu:**
- `son_login` (TIMESTAMP WITH TIME ZONE) - Öğrencinin son giriş tarihi
- Performans için denormalize edildi (`ogrenci_son_login` tablosu da var)

**Trigger: `update_ogrenci_son_login`**
- `kullanici_aktiviteleri` tablosuna login kaydı eklendiğinde `ogrenci.son_login` güncellenir
- Mantık: Öğrenci login olduğunda hem `ogrenci_son_login` hem de `ogrenci.son_login` güncellenir

### 6.2. Risk Skoruna Etkisi

**fn_hesapla_ogrenci_riski Fonksiyonu:**
- `son_login` 180 günü geçmişse risk skoruna otomatik +30 puan ekle
- Mantık: `IF (CURRENT_DATE - son_login::DATE) > 180 THEN risk_skoru := risk_skoru + 30`
- Sonuç: Hayalet öğrenciler risk skorunda otomatik olarak yüksek puana sahip olur

## 7. Seminer "Kritik Darbogaz" İşaretleme

### 7.1. dersler Tablosu

**Temel Bilgiler:**
- `ders_kodu` (PK)
- `ders_adi`
- `ders_turu` (Seminer, Zorunlu, Seçmeli)
- `kritik_darbogaz_mi` (BOOLEAN) - Seminer için true

### 7.2. View: `ogrenci_seminer_darbogaz_view`

**Seminer Durumu:**
- `seminer_yok`: Seminer dersi hiç alınmamış
- `seminer_basarisiz`: Seminer dersi başarısız notla alınmış
- `seminer_eksik`: Ders aşaması tamamlanmış ama Seminer eksik (7 ders + 60 AKTS var ama Seminer yok)
- `seminer_tamam`: Seminer dersi başarılı

**Kritik Darbogaz:**
- `kritik_darbogaz_mi`: Herhangi bir darbogaz durumu varsa true

**ACİL_EYLEM Statüsü:**
- `acil_eylem_mi`: Öğrenci 4. yarıyılda ise VE seminer notu 'B' değilse → true
- Mantık: `IF (mevcut_yariyil = 4) AND (seminer_not_kodu != 'B' OR seminer_yok) THEN acil_eylem_mi = true`
- `durum_statüsü`: 'ACİL_EYLEM', 'UYARI', 'NORMAL'

### 7.3. Function: `fn_kontrol_seminer_darbogaz(p_ogrenci_id)`

**Açıklama:**
- Seminer darbogaz kontrolü yapar
- Sonuç: JSONB formatında darbogaz durumu ve detayları

### 7.4. Trigger: `check_seminer_darbogaz`

**Açıklama:**
- `ogrenci_dersleri` tablosuna ders eklendiğinde/güncellendiğinde Seminer darbogaz kontrolü
- ACİL_EYLEM statüsü varsa bildirim oluşturur

## 8. H (Hak Dondurma) Kodu Mantığı

### 8.1. Etkili Yarıyıl Hesaplama

**Function: `fn_hesapla_etkili_yariyil(p_ogrenci_id)`**
- H notları düşüldükten sonraki etkili yarıyılı hesaplar
- Mantık: `Etkili Yarıyıl = Mevcut Yarıyıl - COUNT(DISTINCT yariyil WHERE not_kodu = 'H')`

**Açıklama:**
- H (Hak Dondurma) notu içeren dönemler azami süre hesabından otomatik düşülür
- Örnek: Öğrenci 6. yarıyılda ve 2 yarıyıl H notu varsa → Etkili Yarıyıl = 6 - 2 = 4

### 8.2. Risk Skoruna Etkisi

**fn_hesapla_ogrenci_riski Fonksiyonu:**
- Etkili yarıyıl kullanılarak kalan süre oranı hesaplanır
- H notları sayesinde öğrencinin azami süre hesabından düşülür, risk skoru daha doğru hesaplanır

## 9. Özet

### 9.1. BCNF Normalizasyonu

- Tüm tablolar BCNF (Boyce-Codd Normal Form) kurallarına uygundur
- Hesaplanan değerler ayrı tablolara taşındı
- Tekrar eden veriler normalize edildi
- Foreign key constraint'ler ile referans bütünlüğü sağlandı

### 9.2. KDS (Karar Destek Sistemi) Özellikleri

- Risk skoru hesaplama (TS çarpanlı formül)
- Hayalet öğrenci tespiti (180 gün kontrolü)
- Seminer darbogaz kontrolü (ACİL_EYLEM statüsü)
- Kapasite yönetimi (unvan bazlı limitler)
- H (Hak Dondurma) kodu mantığı (etkili yarıyıl hesaplama)

### 9.3. Performans Optimizasyonları

- Index'ler eklendi (danisman_id, son_login, ders_kodu, program_kabul_turu, ogrenci_id, vb.)
- View'lar oluşturuldu (ogrenci_ders_asamasi_view, ogrenci_seminer_darbogaz_view, akademik_personel_yuk_view)
- Denormalizasyon (ogrenci.son_login - performans için)

### 9.4. Son Değişiklikler

**Migration 009: Program Kabul Türü Normalizasyonu**
- `kabul_turu` (TEXT) sütunu `program_kabul_turu` (UUID FK) olarak değiştirildi
- `program_turleri` tablosuna foreign key ilişkisi eklendi
- Lisans programı `program_turleri` tablosuna eklendi

**Migration 010: Bölüm Başkanı Kullanıcısı**
- Bildirim seeder'ının çalışması için Bölüm Başkanı kullanıcısı oluşturma scripti

**Migration 011: Kullanicilar Foreign Keys**
- `kullanicilar` tablosuna `ogrenci_id` sütunu eklendi
- `akademik_personel_id` için foreign key constraint eklendi
- `ogrenci_id` için foreign key constraint eklendi
- CHECK constraint: Kullanıcı ya akademik personel ya da öğrenci olabilir (ikisi birden olamaz)
- `Ogrenci` rolü eklendi

