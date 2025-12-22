-- Migration 029: Create Views
-- Hesaplanan değerler için view'ler (performans optimizasyonu)
-- ============================================

-- ============================================
-- 1. OGRENCI MEVCUT ASAMA VIEW'İ
-- ============================================

CREATE OR REPLACE VIEW public.ogrenci_mevcut_asama AS
SELECT 
  o.ogrenci_id,
  o.ad || ' ' || o.soyad AS ogrenci_adi,
  pt.program_adi,
  pt.program_kodu,
  at.asama_kodu,
  at.asama_adi,
  oa.baslangic_tarihi,
  oa.bitis_tarihi,
  oa.gecikme_yariyil,
  oa.durum,
  oa.tamamlanma_nedeni
FROM public.ogrenci o
JOIN public.ogrenci_asamalari oa ON o.ogrenci_id = oa.ogrenci_id
JOIN public.asama_tanimlari at ON oa.asama_tanimi_id = at.asama_tanimi_id
JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
WHERE oa.durum = 'Devam_Ediyor';

-- ============================================
-- 2. DANISMAN YÜK VIEW'İ
-- ============================================

CREATE OR REPLACE VIEW public.danisman_yuk_view AS
SELECT 
  ap.personel_id,
  ap.ad || ' ' || ap.soyad AS danisman_adi,
  ap.unvan,
  ap.rol,
  ap.maksimum_kapasite,
  COUNT(DISTINCT o.ogrenci_id) AS mevcut_ogrenci_sayisi,
  ROUND(COUNT(DISTINCT o.ogrenci_id)::NUMERIC / NULLIF(ap.maksimum_kapasite, 0) * 100, 2) AS kapasite_kullanim_yuzdesi,
  ap.maksimum_kapasite - COUNT(DISTINCT o.ogrenci_id) AS kullanilabilir_kapasite
FROM public.akademik_personel ap
LEFT JOIN public.ogrenci o ON ap.personel_id = o.danisman_id AND o.durum_id IN (
  SELECT durum_id FROM public.durum_turleri WHERE durum_kodu IN ('Aktif', 'Dondurdu')
)
WHERE ap.aktif_mi = true
  AND ap.rol = 'Danisman'
GROUP BY ap.personel_id, ap.ad, ap.soyad, ap.unvan, ap.rol, ap.maksimum_kapasite;

-- ============================================
-- 3. OGRENCI DERS PERFORMANS ÖZETİ VIEW'İ
-- ============================================

CREATE OR REPLACE VIEW public.ogrenci_ders_performans_ozeti AS
SELECT 
  o.ogrenci_id,
  o.ad || ' ' || o.soyad AS ogrenci_adi,
  pt.program_adi,
  COUNT(DISTINCT od.ders_kodu) AS toplam_ders_sayisi,
  COUNT(CASE WHEN od.not_kodu IN ('AA', 'BA', 'BB', 'CB', 'CC') THEN 1 END) AS basarili_ders_sayisi,
  COUNT(CASE WHEN od.not_kodu IN ('DC', 'DD', 'FD', 'FF') THEN 1 END) AS basarisiz_ders_sayisi,
  COUNT(CASE WHEN od.ts > 1 THEN 1 END) AS tekrar_alinan_ders_sayisi,
  AVG(CASE 
    WHEN od.not_kodu = 'AA' THEN 4.0
    WHEN od.not_kodu = 'BA' THEN 3.5
    WHEN od.not_kodu = 'BB' THEN 3.0
    WHEN od.not_kodu = 'CB' THEN 2.5
    WHEN od.not_kodu = 'CC' THEN 2.0
    WHEN od.not_kodu = 'DC' THEN 1.5
    WHEN od.not_kodu = 'DD' THEN 1.0
    WHEN od.not_kodu = 'FD' THEN 0.5
    WHEN od.not_kodu = 'FF' THEN 0.0
    ELSE NULL
  END) AS ortalama_not,
  SUM(od.akts) AS toplam_akts,
  STRING_AGG(DISTINCT CASE WHEN od.not_kodu IN ('DC', 'DD', 'FD', 'FF') THEN od.ders_adi END, ', ') AS zorlandigi_dersler
FROM public.ogrenci o
LEFT JOIN public.ogrenci_dersleri od ON o.ogrenci_id = od.ogrenci_id
LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
GROUP BY o.ogrenci_id, o.ad, o.soyad, pt.program_adi;

-- ============================================
-- 4. DERS BAŞARISIZLIK ANALİZİ VIEW'İ
-- ============================================

CREATE OR REPLACE VIEW public.ders_basarisizlik_analizi AS
SELECT 
  d.ders_kodu,
  d.ders_adi,
  d.ders_turu,
  d.akts,
  COUNT(DISTINCT od.ogrenci_id) AS toplam_ogrenci_sayisi,
  COUNT(CASE WHEN od.not_kodu IN ('DC', 'DD', 'FD', 'FF') THEN 1 END) AS basarisiz_ogrenci_sayisi,
  ROUND(COUNT(CASE WHEN od.not_kodu IN ('DC', 'DD', 'FD', 'FF') THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT od.ogrenci_id), 0) * 100, 2) AS basarisizlik_orani,
  COUNT(CASE WHEN od.ts > 1 THEN 1 END) AS tekrar_alinma_sayisi,
  AVG(CASE 
    WHEN od.not_kodu = 'AA' THEN 4.0
    WHEN od.not_kodu = 'BA' THEN 3.5
    WHEN od.not_kodu = 'BB' THEN 3.0
    WHEN od.not_kodu = 'CB' THEN 2.5
    WHEN od.not_kodu = 'CC' THEN 2.0
    WHEN od.not_kodu = 'DC' THEN 1.5
    WHEN od.not_kodu = 'DD' THEN 1.0
    WHEN od.not_kodu = 'FD' THEN 0.5
    WHEN od.not_kodu = 'FF' THEN 0.0
    ELSE NULL
  END) AS ortalama_not
FROM public.dersler d
LEFT JOIN public.ogrenci_dersleri od ON d.ders_kodu = od.ders_kodu
WHERE d.aktif_mi = true
GROUP BY d.ders_kodu, d.ders_adi, d.ders_turu, d.akts
ORDER BY basarisizlik_orani DESC NULLS LAST;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON VIEW public.ogrenci_mevcut_asama IS 'Öğrencilerin mevcut aktif aşamaları - Aşama takibi için';
COMMENT ON VIEW public.danisman_yuk_view IS 'Danışman yük analizi - Kapasite kullanımı ve kullanılabilir kapasite';
COMMENT ON VIEW public.ogrenci_ders_performans_ozeti IS 'Öğrenci ders performans özeti - Başarılı/başarısız ders sayıları, not ortalaması, zorlandığı dersler';
COMMENT ON VIEW public.ders_basarisizlik_analizi IS 'Ders bazlı başarısızlık analizi - Hangi derslerde en çok başarısızlık var, not yığılması analizi';

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Oluşturulan view'ler:
-- 1. ogrenci_mevcut_asama - Mevcut aktif aşamalar
-- 2. danisman_yuk_view - Danışman kapasite analizi
-- 3. ogrenci_ders_performans_ozeti - Öğrenci ders performansı
-- 4. ders_basarisizlik_analizi - Ders başarısızlık analizi

