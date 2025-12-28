-- SQL Function: Danışman Performans Listesi (Pagination ile)
-- Bu fonksiyon danışman performans tablosu için veri döndürür

CREATE OR REPLACE FUNCTION public.get_advisor_performance_list(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 10,
    unvan_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    personel_id UUID,
    ad_soyad TEXT,
    unvan TEXT,
    uzmanlik_alanlari TEXT[],
    mevcut_yuk_tezli INTEGER,
    mevcut_yuk_tezsiz INTEGER,
    toplam_yuk INTEGER,
    kota_tezli INTEGER,
    kota_tezsiz INTEGER,
    toplam_kota INTEGER,
    doluluk_yuzdesi NUMERIC,
    ogrenci_sayisi INTEGER,
    total_count BIGINT
) AS $$
DECLARE
    offset_val INTEGER;
BEGIN
    offset_val := (page_num - 1) * page_size;
    
    RETURN QUERY
    WITH danisman_yukleri AS (
        SELECT 
            ap.personel_id,
            ap.unvan || ' ' || ap.ad || ' ' || ap.soyad as ad_soyad,
            ap.unvan,
            ap.tezli_kotasi,
            ap.tezsiz_kotasi,
            COUNT(o.ogrenci_id) FILTER (
                WHERE o.ogrenci_id IS NOT NULL 
                AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
            )::INTEGER as tezli_ogrenci,
            COUNT(o.ogrenci_id) FILTER (
                WHERE o.ogrenci_id IS NOT NULL 
                AND (pt.program_kodu LIKE 'TEZSIZ%' OR pt.program_adi ILIKE '%tezsiz%')
            )::INTEGER as tezsiz_ogrenci,
            COUNT(o.ogrenci_id) FILTER (WHERE o.ogrenci_id IS NOT NULL)::INTEGER as toplam_ogrenci
        FROM public.akademik_personel ap
        LEFT JOIN public.ogrenci o ON o.danisman_id = ap.personel_id 
            AND o.aktif_mi = true 
            AND o.deleted_at IS NULL
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        WHERE ap.aktif_mi = true
            AND ap.unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi')
            AND (unvan_filter IS NULL OR ap.unvan = unvan_filter)
        GROUP BY ap.personel_id, ap.unvan, ap.ad, ap.soyad, ap.tezli_kotasi, ap.tezsiz_kotasi
    ),
    uzmanlik_alanlari AS (
        SELECT 
            apu.personel_id,
            ARRAY_AGG(DISTINCT apu.uzmanlik_alani ORDER BY apu.uzmanlik_alani) as uzmanliklar
        FROM public.akademik_personel_uzmanlik apu
        GROUP BY apu.personel_id
    ),
    total AS (
        SELECT COUNT(*)::BIGINT as cnt FROM danisman_yukleri
    )
    SELECT 
        dy.personel_id,
        dy.ad_soyad,
        dy.unvan,
        COALESCE(ua.uzmanliklar, ARRAY[]::TEXT[]) as uzmanlik_alanlari,
        dy.tezli_ogrenci as mevcut_yuk_tezli,
        dy.tezsiz_ogrenci as mevcut_yuk_tezsiz,
        dy.toplam_ogrenci as toplam_yuk,
        dy.tezli_kotasi as kota_tezli,
        dy.tezsiz_kotasi as kota_tezsiz,
        (dy.tezli_kotasi + dy.tezsiz_kotasi) as toplam_kota,
        CASE 
            WHEN (dy.tezli_kotasi + dy.tezsiz_kotasi) > 0 
            THEN ROUND((dy.toplam_ogrenci::numeric / (dy.tezli_kotasi + dy.tezsiz_kotasi)::numeric) * 100, 2)
            ELSE 0
        END as doluluk_yuzdesi,
        dy.toplam_ogrenci as ogrenci_sayisi,
        t.cnt as total_count
    FROM danisman_yukleri dy
    LEFT JOIN uzmanlik_alanlari ua ON dy.personel_id = ua.personel_id
    CROSS JOIN total t
    ORDER BY dy.toplam_ogrenci DESC, dy.ad_soyad
    LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanım örnekleri:
-- SELECT * FROM get_advisor_performance_list(1, 10, NULL); -- Tüm unvanlar
-- SELECT * FROM get_advisor_performance_list(1, 10, 'Prof. Dr.'); -- Sadece Prof. Dr.

