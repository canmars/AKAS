-- Migration 001: Initial Schema
-- Temel tablolar: kullanicilar, akademik_personel, ogrenci

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- KULLANICILAR TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.kullanicilar (
  kullanici_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  akademik_personel_id UUID,
  rol TEXT NOT NULL CHECK (rol IN ('Admin', 'Bolum_Baskani', 'Danisman')),
  email TEXT NOT NULL UNIQUE,
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  aktif_mi BOOLEAN DEFAULT true,
  son_giris_tarihi TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- AKADEMIK PERSONEL TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.akademik_personel (
  personel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kullanici_id UUID REFERENCES public.kullanicilar(kullanici_id),
  anabilim_dali_id UUID,
  unvan TEXT NOT NULL CHECK (unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi', 'Araş. Gör.', 'Araş. Gör. Dr.')),
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefon TEXT,
  maksimum_kapasite INT NOT NULL DEFAULT 10,
  -- Kapasite Yönetimi: Unvan bazlı sert ve yumuşak limitler
  sert_limit INT, -- Sert limit (aşılamaz) - Unvan bazlı varsayılan değerler trigger ile atanacak
  yumusak_limit INT, -- Yumuşak limit (uyarı verilir) - Unvan bazlı varsayılan değerler trigger ile atanacak
  -- mevcut_yuk kaldırıldı - view ile hesaplanacak (akademik_personel_yuk_view)
  aktif_mi BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- OGRENCI TABLOSU (BCNF Normalizasyonu)
-- Demografik bilgiler, akademik statü ve program türü bazında optimize edilmiş
-- ============================================
CREATE TABLE IF NOT EXISTS public.ogrenci (
  ogrenci_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kullanici_id UUID REFERENCES public.kullanicilar(kullanici_id),
  -- Program ve Durum Bilgileri
  program_turu_id UUID NOT NULL,
  durum_id UUID NOT NULL,
  -- Demografik Bilgiler
  tc_kimlik_no TEXT UNIQUE, -- TC Kimlik No (opsiyonel, gizlilik nedeniyle)
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  dogum_tarihi DATE,
  cinsiyet TEXT CHECK (cinsiyet IN ('E', 'K')),
  email TEXT,
  telefon TEXT,
  adres TEXT,
  -- Akademik Statü Bilgileri
  kayit_tarihi DATE NOT NULL,
  kabul_tarihi DATE,
  kabul_turu TEXT CHECK (kabul_turu IN ('Lisans', 'Yuksek_Lisans')),
  ogrenci_no TEXT UNIQUE, -- Öğrenci numarası (DEBİS'ten gelebilir)
  -- Kapasite Yönetimi: Danışman ataması
  danisman_id UUID REFERENCES public.akademik_personel(personel_id), -- Öğrencinin danışmanı
  -- Hayalet Takibi: Son giriş tarihi (performans için denormalize edildi, ogrenci_son_login tablosu da var)
  son_login TIMESTAMP WITH TIME ZONE, -- Öğrencinin son giriş tarihi (180 gün geçmişse hayalet öğrenci)
  -- Normalizasyon: Aşağıdaki alanlar ayrı tablolara taşındı:
  -- mevcut_asinama -> ogrenci_akademik_durum tablosuna taşındı
  -- mevcut_yariyil -> ogrenci_akademik_durum tablosuna taşındı (view ile hesaplanır)
  -- ders_tamamlandi_mi -> ogrenci_akademik_durum tablosuna taşındı
  -- tamamlanan_ders_sayisi -> ogrenci_akademik_durum tablosuna taşındı
  -- son_login -> ogrenci_son_login tablosuna da taşındı (normalizasyon için), burada performans için denormalize edildi
  -- mevcut_risk_skoru -> ogrenci_risk_analizi tablosunda zaten var
  -- risk_skoru_hesaplama_tarihi -> ogrenci_risk_analizi tablosunda zaten var
  -- Ders bilgileri -> ogrenci_dersleri tablosuna taşındı
  -- Soft Delete
  soft_delete BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.kullanicilar IS 'Sistem kullanıcıları (Admin, Bölüm Başkanı, Danışman)';
COMMENT ON TABLE public.akademik_personel IS 'Akademik personel bilgileri';
COMMENT ON TABLE public.ogrenci IS 'Öğrenci bilgileri ve akademik durumları - BCNF normalizasyonu uyumlu';
COMMENT ON COLUMN public.ogrenci.danisman_id IS 'Öğrencinin danışmanı - Kapasite yönetimi için';
COMMENT ON COLUMN public.ogrenci.son_login IS 'Öğrencinin son giriş tarihi - Hayalet takibi için (180 gün geçmişse hayalet öğrenci)';

