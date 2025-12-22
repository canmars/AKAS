-- Migration 023: Create Ogrenci Asamalari Table
-- Her öğrencinin aşama geçmişi (genel takip)
-- Her aşama geçişi için ayrı kayıt tutulacak
-- ============================================

-- ============================================
-- OGRENCI ASAMALARI TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS public.ogrenci_asamalari (
  asama_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID NOT NULL REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE,
  asama_tanimi_id UUID NOT NULL REFERENCES public.asama_tanimlari(asama_tanimi_id),
  baslangic_tarihi DATE NOT NULL, -- Aşamaya başlangıç tarihi
  bitis_tarihi DATE, -- Aşamayı bitirme tarihi (NULL ise devam ediyor)
  durum TEXT NOT NULL CHECK (durum IN ('Devam_Ediyor', 'Tamamlandi', 'Basarisiz', 'Iptal')),
  tamamlanma_nedeni TEXT, -- Başarılı, Başarısız, İptal nedeni
  gecikme_yariyil INTEGER DEFAULT 0, -- Planlanan süreden ne kadar gecikmiş (yarıyıl)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- İNDEKSLER
-- ============================================

-- Öğrenci bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_ogrenci_id ON public.ogrenci_asamalari(ogrenci_id);
CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_ogrenci_durum ON public.ogrenci_asamalari(ogrenci_id, durum);

-- Aşama bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_asama_tanimi ON public.ogrenci_asamalari(asama_tanimi_id);
CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_asama_durum ON public.ogrenci_asamalari(asama_tanimi_id, durum);

-- Aktif aşamaları hızlı bulmak için
CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_durum_devam ON public.ogrenci_asamalari(ogrenci_id, durum) WHERE durum = 'Devam_Ediyor';

-- Tarih bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_baslangic_tarihi ON public.ogrenci_asamalari(baslangic_tarihi);
CREATE INDEX IF NOT EXISTS idx_ogrenci_asamalari_bitis_tarihi ON public.ogrenci_asamalari(bitis_tarihi) WHERE bitis_tarihi IS NOT NULL;

-- ============================================
-- CONSTRAINTS
-- ============================================

-- Bir öğrencinin aynı anda sadece bir aktif aşaması olabilir
CREATE UNIQUE INDEX IF NOT EXISTS unique_ogrenci_aktif_asama 
ON public.ogrenci_asamalari(ogrenci_id) 
WHERE durum = 'Devam_Ediyor';

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.ogrenci_asamalari IS 'Öğrencinin aşama geçmişi - Her aşama geçişi için ayrı kayıt';
COMMENT ON COLUMN public.ogrenci_asamalari.durum IS 'Aşama durumu: Devam_Ediyor, Tamamlandi, Basarisiz, Iptal';
COMMENT ON COLUMN public.ogrenci_asamalari.gecikme_yariyil IS 'Planlanan süreden ne kadar gecikmiş (yarıyıl) - Risk analizi için';
COMMENT ON COLUMN public.ogrenci_asamalari.tamamlanma_nedeni IS 'Aşama tamamlanma nedeni (Başarılı, Başarısız, İptal nedeni)';

-- ============================================
-- TAMAMLANDI
-- ============================================

-- NOT: Bu tablo genel aşama takibi için kullanılacak
-- Kritik aşamalar (yeterlik, tez önerisi, tez savunma) için ayrı tablolar da var (024 migration)

