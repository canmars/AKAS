-- Migration 016: Performance Optimization
-- Materialized views, index optimizasyonu ve query performans iyileştirmeleri

-- ============================================
-- MATERIALIZED VIEW: Öğrenci Risk Cache
-- Risk skoru hesaplama performansı için cache
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.ogrenci_risk_cache AS
SELECT 
  ogrenci_id,
  fn_hesapla_ogrenci_riski(ogrenci_id) as risk_skoru,
  CURRENT_TIMESTAMP as cache_tarihi
FROM public.ogrenci
WHERE soft_delete = false;

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_risk_cache_skoru ON public.ogrenci_risk_cache(risk_skoru);
CREATE INDEX IF NOT EXISTS idx_risk_cache_tarihi ON public.ogrenci_risk_cache(cache_tarihi);
CREATE INDEX IF NOT EXISTS idx_risk_cache_ogrenci ON public.ogrenci_risk_cache(ogrenci_id);

COMMENT ON MATERIALIZED VIEW public.ogrenci_risk_cache IS 'Öğrenci risk skorları için performans cache';

-- ============================================
-- FONKSIYON: Risk Cache Refresh
-- ============================================
CREATE OR REPLACE FUNCTION refresh_risk_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.ogrenci_risk_cache;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_risk_cache IS 'Risk cache materialized view''i yeniler';

-- ============================================
-- MATERIALIZED VIEW: Danışman Yük Cache
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.danisman_yuk_cache AS
SELECT 
  apyv.personel_id,
  apyv.mevcut_yuk,
  apyv.maksimum_kapasite,
  apyv.kapasite_kullanim_yuzdesi,
  COALESCE(ap.sert_limit, 
    CASE ap.unvan
      WHEN 'Prof. Dr.' THEN 15
      WHEN 'Doç. Dr.' THEN 12
      WHEN 'Dr. Öğr. Üyesi' THEN 10
      WHEN 'Araş. Gör.' THEN 5
      WHEN 'Araş. Gör. Dr.' THEN 5
      ELSE 10
    END
  ) as sert_limit,
  COALESCE(ap.yumusak_limit,
    CASE ap.unvan
      WHEN 'Prof. Dr.' THEN 12
      WHEN 'Doç. Dr.' THEN 10
      WHEN 'Dr. Öğr. Üyesi' THEN 8
      WHEN 'Araş. Gör.' THEN 4
      WHEN 'Araş. Gör. Dr.' THEN 4
      ELSE 8
    END
  ) as yumusak_limit,
  CURRENT_TIMESTAMP as cache_tarihi
FROM public.akademik_personel_yuk_view apyv
JOIN public.akademik_personel ap ON apyv.personel_id = ap.personel_id;

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_yuk_cache_personel ON public.danisman_yuk_cache(personel_id);
CREATE INDEX IF NOT EXISTS idx_yuk_cache_kullanim ON public.danisman_yuk_cache(kapasite_kullanim_yuzdesi);

COMMENT ON MATERIALIZED VIEW public.danisman_yuk_cache IS 'Danışman yük bilgileri için performans cache';

-- ============================================
-- FONKSIYON: Danışman Yük Cache Refresh
-- ============================================
CREATE OR REPLACE FUNCTION refresh_danisman_yuk_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.danisman_yuk_cache;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_danisman_yuk_cache IS 'Danışman yük cache materialized view''i yeniler';

-- ============================================
-- INDEX OPTIMIZASYONLARI
-- ============================================

-- Öğrenci tablosu için ek index'ler
CREATE INDEX IF NOT EXISTS idx_ogrenci_danisman_soft_delete ON public.ogrenci(danisman_id, soft_delete) WHERE soft_delete = false;
CREATE INDEX IF NOT EXISTS idx_ogrenci_program_durum ON public.ogrenci(program_turu_id, durum_id);
CREATE INDEX IF NOT EXISTS idx_ogrenci_kayit_tarihi ON public.ogrenci(kayit_tarihi) WHERE soft_delete = false;

-- Öğrenci dersleri için performans index'leri
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_ogrenci_ders ON public.ogrenci_dersleri(ogrenci_id, ders_kodu);
CREATE INDEX IF NOT EXISTS idx_ogrenci_dersleri_not_kodu ON public.ogrenci_dersleri(not_kodu) WHERE not_kodu IN ('FF', 'FD', 'DD', 'DC');

-- Akademik milestone için index'ler
-- Not: akademik_milestone tablosunda danisman_id kolonu yok, sadece ogrenci_id var
CREATE INDEX IF NOT EXISTS idx_milestone_ogrenci_durum ON public.akademik_milestone(ogrenci_id, durum);
CREATE INDEX IF NOT EXISTS idx_milestone_hedef_tarih ON public.akademik_milestone(hedef_tarih) WHERE durum = 'Beklemede';

-- Risk analizi için index'ler
CREATE INDEX IF NOT EXISTS idx_risk_analizi_ogrenci_tarih ON public.ogrenci_risk_analizi(ogrenci_id, hesaplama_tarihi DESC);
CREATE INDEX IF NOT EXISTS idx_risk_analizi_risk_skoru ON public.ogrenci_risk_analizi(risk_skoru DESC) WHERE risk_skoru >= 50;

-- Veri değişiklik logu için index'ler
CREATE INDEX IF NOT EXISTS idx_degisiklik_log_tablo_kayit_tarih ON public.veri_degisiklik_logu(tablo_adi, kayit_id, degisiklik_tarihi DESC);

-- ============================================
-- QUERY PERFORMANS İYİLEŞTİRMELERİ
-- ============================================

-- Not: View'ler üzerinde index oluşturulamaz. 
-- ogrenci_mevcut_durum_view bir view olduğu için index oluşturulamaz.
-- Risk skoru için performans iyileştirmesi zaten ogrenci_risk_analizi tablosunda yapıldı (idx_risk_analizi_risk_skoru).

-- Hayalet öğrenci için index (ogrenci tablosu üzerinde)
-- Not: CURRENT_DATE immutable olmadığı için index predicate'inde kullanılamaz.
-- Bu yüzden sadece son_login NULL olanlar için partial index oluşturuyoruz.
-- 180 gün kontrolü sorgu sırasında yapılacak.
CREATE INDEX IF NOT EXISTS idx_hayalet_ogrenci_son_login_null ON public.ogrenci(son_login) 
WHERE son_login IS NULL;

-- ============================================
-- BATCH REFRESH FONKSIYONU
-- Tüm cache'leri yeniler
-- ============================================
CREATE OR REPLACE FUNCTION refresh_all_caches()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.ogrenci_risk_cache;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.danisman_yuk_cache;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_all_caches IS 'Tüm materialized view cache''lerini yeniler';

-- ============================================
-- TRIGGER: Otomatik Cache Refresh (Opsiyonel)
-- Risk skoru hesaplandığında cache'i yenile
-- ============================================
-- Not: Bu trigger performans sorunlarına yol açabilir, 
-- bunun yerine periyodik (cron) job kullanılması önerilir

-- ============================================
-- ANALİZ VE İSTATİSTİK GÜNCELLEME
-- ============================================
ANALYZE public.ogrenci;
ANALYZE public.ogrenci_dersleri;
ANALYZE public.akademik_personel;
ANALYZE public.akademik_milestone;
ANALYZE public.ogrenci_risk_analizi;

