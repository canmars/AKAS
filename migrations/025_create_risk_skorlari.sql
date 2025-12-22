-- Migration 025: Create Risk Skorlari Table
-- Öğrenci risk skorları ve risk analizi
-- Her öğrenci için tek bir aktif risk skoru kaydı olacak
-- ============================================

-- ============================================
-- OGRENCI RISK SKORLARI TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS public.ogrenci_risk_skorlari (
  risk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ogrenci_id UUID NOT NULL REFERENCES public.ogrenci(ogrenci_id) ON DELETE CASCADE,
  risk_skoru INTEGER NOT NULL CHECK (risk_skoru >= 0 AND risk_skoru <= 100), -- 0-100 arası risk skoru
  risk_seviyesi TEXT NOT NULL CHECK (risk_seviyesi IN ('Dusuk', 'Orta', 'Yuksek', 'Kritik')), -- Risk seviyesi
  risk_faktorleri JSONB, -- Risk faktörleri detayları (JSON formatında)
  tahmini_mezuniyet_tarihi DATE, -- Tahmini mezuniyet tarihi
  azami_sureye_yakinlik_yuzdesi NUMERIC(5,2), -- Azami süreye yakınlık yüzdesi (%75, %90 gibi)
  hesaplama_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(), -- Son hesaplama tarihi
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_ogrenci_risk UNIQUE (ogrenci_id)
);

-- ============================================
-- İNDEKSLER
-- ============================================

-- Öğrenci bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_risk_skorlari_ogrenci ON public.ogrenci_risk_skorlari(ogrenci_id);

-- Risk seviyesi bazlı sorgular için
CREATE INDEX IF NOT EXISTS idx_ogrenci_risk_skorlari_seviye ON public.ogrenci_risk_skorlari(risk_seviyesi);
CREATE INDEX IF NOT EXISTS idx_ogrenci_risk_skorlari_skor ON public.ogrenci_risk_skorlari(risk_skoru);

-- Risk seviyesi ve skor kombinasyonu (filtreleme için)
CREATE INDEX IF NOT EXISTS idx_ogrenci_risk_skorlari_seviye_skor ON public.ogrenci_risk_skorlari(risk_seviyesi, risk_skoru);

-- Yüksek riskli öğrencileri hızlı bulmak için
CREATE INDEX IF NOT EXISTS idx_ogrenci_risk_skorlari_yuksek_risk ON public.ogrenci_risk_skorlari(risk_seviyesi, risk_skoru) 
WHERE risk_seviyesi IN ('Yuksek', 'Kritik');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.ogrenci_risk_skorlari IS 'Öğrenci risk skorları ve risk analizi - Her öğrenci için tek aktif kayıt';
COMMENT ON COLUMN public.ogrenci_risk_skorlari.risk_skoru IS 'Risk skoru (0-100) - 0 = düşük risk, 100 = kritik risk';
COMMENT ON COLUMN public.ogrenci_risk_skorlari.risk_seviyesi IS 'Risk seviyesi: Dusuk (0-25), Orta (26-50), Yuksek (51-75), Kritik (76-100)';
COMMENT ON COLUMN public.ogrenci_risk_skorlari.risk_faktorleri IS 'Risk faktörleri detayları (JSON formatında) - Azami süreye yakınlık, not ortalaması, başarısız ders sayısı, vb.';
COMMENT ON COLUMN public.ogrenci_risk_skorlari.tahmini_mezuniyet_tarihi IS 'Tahmini mezuniyet tarihi - Aşama ilerleme hızına göre hesaplanır';
COMMENT ON COLUMN public.ogrenci_risk_skorlari.azami_sureye_yakinlik_yuzdesi IS 'Azami süreye yakınlık yüzdesi (%75, %90 gibi) - Risk analizi için';

-- ============================================
-- TAMAMLANDI
-- ============================================

-- NOT: Risk skoru hesaplama fonksiyonu 031 migration'da eklenecek
-- Risk faktörleri JSONB formatında:
-- {
--   "azami_sureye_yakinlik": 0.85,
--   "not_ortalamasi": 2.3,
--   "basarisiz_ders_sayisi": 2,
--   "asama_gecikmesi": 1,
--   "basarisizlik_gecmisi": ["Yeterlik Sınavı - 1. deneme"]
-- }

