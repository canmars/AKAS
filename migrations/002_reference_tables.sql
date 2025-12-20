-- Migration 002: Reference Tables
-- Referans tabloları: program_turleri, durum_turleri, bildirim_turleri, anabilim_dallari

-- ============================================
-- PROGRAM TURLERI TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.program_turleri (
  program_turu_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_adi TEXT NOT NULL UNIQUE,
  program_kodu TEXT NOT NULL UNIQUE,
  maksimum_sure_yil INT NOT NULL,
  maksimum_sure_yariyil INT NOT NULL,
  aktif_mi BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- ANABILIM DALLARI TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.anabilim_dallari (
  anabilim_dali_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anabilim_dali_adi TEXT NOT NULL UNIQUE,
  anabilim_dali_kodu TEXT NOT NULL UNIQUE,
  aktif_mi BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- DURUM TURLERI TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.durum_turleri (
  durum_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  durum_adi TEXT NOT NULL UNIQUE,
  durum_kodu TEXT NOT NULL UNIQUE,
  sira_no INT NOT NULL,
  aciklama TEXT
);

-- ============================================
-- BILDIRIM TURLERI TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.bildirim_turleri (
  bildirim_turu_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bildirim_turu_adi TEXT NOT NULL UNIQUE,
  bildirim_turu_kodu TEXT NOT NULL UNIQUE,
  varsayilan_oncelik TEXT NOT NULL CHECK (varsayilan_oncelik IN ('Dusuk', 'Orta', 'Yuksek', 'Kritik')),
  varsayilan_alici_roller TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- DERSLER TABLOSU
-- Seminer tespiti ve kritik darboğaz işaretleme için
-- ============================================
CREATE TABLE IF NOT EXISTS public.dersler (
  ders_kodu TEXT PRIMARY KEY, -- Ders kodu (örn: YBS501, YBS502)
  ders_adi TEXT NOT NULL, -- Ders adı
  ders_turu TEXT NOT NULL CHECK (ders_turu IN ('Seminer', 'Zorunlu', 'Secmeli')), -- Ders türü
  akts INT NOT NULL DEFAULT 0, -- AKTS kredisi (ders katalog bilgisi)
  kritik_darbogaz_mi BOOLEAN DEFAULT false, -- Kritik darboğaz mı? (Seminer için true)
  aktif_mi BOOLEAN DEFAULT true, -- Aktif ders mi?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================
-- Constraint'leri güvenli bir şekilde ekle (zaten varsa hata vermez)

-- Akademik personel -> anabilim dallari
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_akademik_personel_anabilim_dali'
  ) THEN
    ALTER TABLE public.akademik_personel
    ADD CONSTRAINT fk_akademik_personel_anabilim_dali
    FOREIGN KEY (anabilim_dali_id) REFERENCES public.anabilim_dallari(anabilim_dali_id);
  END IF;
END $$;

-- Ogrenci -> program turleri
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_ogrenci_program_turu'
  ) THEN
    ALTER TABLE public.ogrenci
    ADD CONSTRAINT fk_ogrenci_program_turu
    FOREIGN KEY (program_turu_id) REFERENCES public.program_turleri(program_turu_id);
  END IF;
END $$;

-- Ogrenci -> durum turleri
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_ogrenci_durum'
  ) THEN
    ALTER TABLE public.ogrenci
    ADD CONSTRAINT fk_ogrenci_durum
    FOREIGN KEY (durum_id) REFERENCES public.durum_turleri(durum_id);
  END IF;
END $$;

-- Ogrenci -> akademik personel (danisman)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_ogrenci_danisman'
  ) THEN
    ALTER TABLE public.ogrenci
    ADD CONSTRAINT fk_ogrenci_danisman
    FOREIGN KEY (danisman_id) REFERENCES public.akademik_personel(personel_id);
  END IF;
END $$;

-- NOT: ogrenci_dersleri tablosuna foreign key constraint 003_relationships.sql dosyasında eklenecek
-- (ogrenci_dersleri tablosu 003_relationships.sql'de oluşturulduğu için)

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.program_turleri IS 'Lisansüstü program türleri (Doktora, Tezli YL, vb.)';
COMMENT ON TABLE public.anabilim_dallari IS 'Anabilim dalları (CBS, ET)';
COMMENT ON TABLE public.durum_turleri IS 'Öğrenci durum türleri (Aktif, Dondurdu, Pasif)';
COMMENT ON TABLE public.bildirim_turleri IS 'Bildirim türleri ve varsayılan ayarları';
COMMENT ON TABLE public.dersler IS 'Ders katalog bilgileri - Seminer tespiti ve kritik darboğaz işaretleme için';
COMMENT ON COLUMN public.dersler.ders_turu IS 'Ders türü (Seminer, Zorunlu, Seçmeli) - 7 ders + Seminer + 60 AKTS kuralı için';
COMMENT ON COLUMN public.dersler.kritik_darbogaz_mi IS 'Kritik darboğaz mı? (Seminer için true) - ACİL_EYLEM statüsü için';

