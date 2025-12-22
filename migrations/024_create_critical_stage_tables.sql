-- Migration 024: Create Critical Stage Tables
-- Kritik aşamalar için ayrı tablolar (yeterlik, tez önerisi, tez savunma)
-- TİK toplantıları tablosu güncellenecek
-- ============================================

-- ============================================
-- YETERLIK SINAVLARI TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS public.yeterlik_sinavlari (
  sinav_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID NOT NULL REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE,
  sinav_tarihi DATE NOT NULL, -- Sınav tarihi
  deneme_no INTEGER NOT NULL DEFAULT 1, -- 1. deneme, 2. deneme
  sonuc TEXT NOT NULL CHECK (sonuc IN ('Basarili', 'Basarisiz')),
  notu NUMERIC(5,2), -- Varsa not (100 üzerinden)
  aciklama TEXT, -- Sınav açıklaması
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_ogrenci_deneme UNIQUE (ogrenci_id, deneme_no)
);

-- ============================================
-- TEZ ONERILERI TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS public.tez_onerileri (
  oneri_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID NOT NULL REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE,
  oneri_tarihi DATE NOT NULL, -- Tez önerisi sunum tarihi
  sonuc TEXT NOT NULL CHECK (sonuc IN ('Kabul', 'Ret', 'Revizyon_Gerekli')),
  revizyon_tarihi DATE, -- Revizyon için yeni tarih
  nihai_sonuc TEXT CHECK (nihai_sonuc IN ('Kabul', 'Ret')), -- Revizyon sonrası nihai sonuç
  tez_konusu TEXT, -- Tez konusu
  aciklama TEXT, -- Açıklama
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- TEZ SAVUNMALARI TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS public.tez_savunmalari (
  savunma_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID NOT NULL REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE,
  savunma_tarihi DATE NOT NULL, -- Tez savunma tarihi
  sonuc TEXT NOT NULL CHECK (sonuc IN ('Kabul', 'Duzeltme_Gerekli', 'Red')),
  duzeltme_tarihi DATE, -- Düzeltme için yeni tarih
  nihai_sonuc TEXT CHECK (nihai_sonuc IN ('Kabul', 'Red')), -- Düzeltme sonrası nihai sonuç
  jüri_uyeleri TEXT[], -- Jüri üyeleri (array)
  aciklama TEXT, -- Açıklama
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- TİK TOPLANTILARI TABLOSU GÜNCELLEMESİ
-- ============================================

-- Mevcut tik_toplantilari tablosuna yeni kolonlar ekle
ALTER TABLE IF EXISTS public.tik_toplantilari
    ADD COLUMN IF NOT EXISTS toplanti_no INTEGER, -- 1., 2., 3. toplantı
    ADD COLUMN IF NOT EXISTS sonuc TEXT CHECK (sonuc IN ('Basarili', 'Basarisiz', 'Yetersiz')), -- Toplantı sonucu
    ADD COLUMN IF NOT EXISTS degerlendirme TEXT; -- Detaylı değerlendirme

-- ============================================
-- İNDEKSLER
-- ============================================

-- Yeterlik Sınavları
CREATE INDEX IF NOT EXISTS idx_yeterlik_sinavlari_ogrenci ON public.yeterlik_sinavlari(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_yeterlik_sinavlari_sonuc ON public.yeterlik_sinavlari(sonuc);
CREATE INDEX IF NOT EXISTS idx_yeterlik_sinavlari_tarih ON public.yeterlik_sinavlari(sinav_tarihi);

-- Tez Önerileri
CREATE INDEX IF NOT EXISTS idx_tez_onerileri_ogrenci ON public.tez_onerileri(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_tez_onerileri_sonuc ON public.tez_onerileri(sonuc);
CREATE INDEX IF NOT EXISTS idx_tez_onerileri_tarih ON public.tez_onerileri(oneri_tarihi);

-- Tez Savunmaları
CREATE INDEX IF NOT EXISTS idx_tez_savunmalari_ogrenci ON public.tez_savunmalari(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_tez_savunmalari_sonuc ON public.tez_savunmalari(sonuc);
CREATE INDEX IF NOT EXISTS idx_tez_savunmalari_tarih ON public.tez_savunmalari(savunma_tarihi);

-- TİK Toplantıları
CREATE INDEX IF NOT EXISTS idx_tik_toplantilari_ogrenci ON public.tik_toplantilari(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_tik_toplantilari_sonuc ON public.tik_toplantilari(sonuc) WHERE sonuc IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tik_toplantilari_toplanti_no ON public.tik_toplantilari(ogrenci_id, toplanti_no) WHERE toplanti_no IS NOT NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.yeterlik_sinavlari IS 'Yeterlik sınavı kayıtları - Doktora ve Tezsiz programlar için';
COMMENT ON COLUMN public.yeterlik_sinavlari.deneme_no IS 'Deneme numarası (1. deneme, 2. deneme) - 2. denemede başarısız olursa ilişik kesilir';
COMMENT ON COLUMN public.yeterlik_sinavlari.notu IS 'Sınav notu (100 üzerinden) - Doktora için minimum 75';

COMMENT ON TABLE public.tez_onerileri IS 'Tez önerisi kayıtları - Doktora ve Tezli YL için';
COMMENT ON COLUMN public.tez_onerileri.sonuc IS 'Tez önerisi sonucu: Kabul, Ret, Revizyon_Gerekli';
COMMENT ON COLUMN public.tez_onerileri.nihai_sonuc IS 'Revizyon sonrası nihai sonuç';

COMMENT ON TABLE public.tez_savunmalari IS 'Tez savunma kayıtları - Doktora ve Tezli YL için';
COMMENT ON COLUMN public.tez_savunmalari.sonuc IS 'Tez savunma sonucu: Kabul, Duzeltme_Gerekli, Red';
COMMENT ON COLUMN public.tez_savunmalari.jüri_uyeleri IS 'Jüri üyeleri (array)';

COMMENT ON TABLE public.tik_toplantilari IS 'TİK (Tez İzleme Komitesi) toplantı kayıtları - Sadece Doktora için';
COMMENT ON COLUMN public.tik_toplantilari.toplanti_no IS 'Toplantı numarası (1., 2., 3. toplantı)';
COMMENT ON COLUMN public.tik_toplantilari.sonuc IS 'Toplantı sonucu: Basarili, Basarisiz, Yetersiz';
COMMENT ON COLUMN public.tik_toplantilari.degerlendirme IS 'Detaylı değerlendirme';

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Oluşturulan tablolar:
-- 1. yeterlik_sinavlari
-- 2. tez_onerileri
-- 3. tez_savunmalari

-- Güncellenen tablolar:
-- 1. tik_toplantilari (toplanti_no, sonuc, degerlendirme kolonları eklendi)

