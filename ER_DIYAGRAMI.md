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
