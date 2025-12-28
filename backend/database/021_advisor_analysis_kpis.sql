-- SQL Function: Danışman Analizi KPI'ları
-- Bu fonksiyon danışman analizi sayfasındaki KPI kartları için veri döndürür

CREATE OR REPLACE FUNCTION public.get_advisor_analysis_kpis()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
    WITH aktif_danismanlar AS (
        SELECT COUNT(*)::INTEGER as sayi
        FROM public.akademik_personel ap
        WHERE ap.aktif_mi = true
            AND ap.unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi')
    ),
    danisman_yukleri AS (
        SELECT 
            ap.personel_id,
            ap.tezli_kotasi,
            ap.tezsiz_kotasi,
            COUNT(o.ogrenci_id) FILTER (
                WHERE o.ogrenci_id IS NOT NULL 
                AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
            ) as tezli_ogrenci,
            COUNT(o.ogrenci_id) FILTER (
                WHERE o.ogrenci_id IS NOT NULL 
                AND (pt.program_kodu LIKE 'TEZSIZ%' OR pt.program_adi ILIKE '%tezsiz%')
            ) as tezsiz_ogrenci
        FROM public.akademik_personel ap
        LEFT JOIN public.ogrenci o ON o.danisman_id = ap.personel_id 
            AND o.aktif_mi = true 
            AND o.deleted_at IS NULL
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        WHERE ap.aktif_mi = true
            AND ap.unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi')
        GROUP BY ap.personel_id, ap.tezli_kotasi, ap.tezsiz_kotasi
    ),
    doluluk_hesaplari AS (
        SELECT 
            AVG(
                CASE 
                    WHEN tezli_kotasi > 0 THEN (tezli_ogrenci::numeric / tezli_kotasi::numeric) * 100
                    ELSE 0
                END
            ) as ortalama_tezli_doluluk,
            AVG(
                CASE 
                    WHEN tezsiz_kotasi > 0 THEN (tezsiz_ogrenci::numeric / tezsiz_kotasi::numeric) * 100
                    ELSE 0
                END
            ) as ortalama_tezsiz_doluluk
        FROM danisman_yukleri
    ),
    aktif_ogrenciler AS (
        SELECT 
            COUNT(*)::INTEGER as toplam,
            COUNT(*) FILTER (
                WHERE pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%'
            )::INTEGER as tezli,
            COUNT(*) FILTER (
                WHERE pt.program_kodu LIKE 'TEZSIZ%' OR pt.program_adi ILIKE '%tezsiz%'
            )::INTEGER as tezsiz
        FROM public.ogrenci o
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        WHERE o.aktif_mi = true 
            AND o.deleted_at IS NULL
            AND o.danisman_id IS NOT NULL
    ),
    basari_hesaplari AS (
        SELECT 
            COUNT(*) FILTER (WHERE o.mezuniyet_tarihi IS NOT NULL)::numeric as mezun_sayisi,
            COUNT(*)::numeric as toplam_ogrenci_sayisi
        FROM public.ogrenci o
        WHERE o.danisman_id IS NOT NULL
    )
    SELECT 
        (SELECT sayi FROM aktif_danismanlar) as toplam_danisman,
        0::INTEGER as gecen_donem_artis, -- Bu değer ileride hesaplanabilir
        COALESCE(
            ((SELECT ortalama_tezli_doluluk FROM doluluk_hesaplari) + 
             (SELECT ortalama_tezsiz_doluluk FROM doluluk_hesaplari)) / 2,
            0
        )::NUMERIC as ortalama_doluluk,
        0::NUMERIC as ortalama_doluluk_artis, -- Bu değer ileride hesaplanabilir
        (SELECT toplam FROM aktif_ogrenciler) as aktif_ogrenci_toplam,
        (SELECT tezli FROM aktif_ogrenciler) as aktif_ogrenci_tezli,
        (SELECT tezsiz FROM aktif_ogrenciler) as aktif_ogrenci_tezsiz,
        CASE 
            WHEN (SELECT toplam_ogrenci_sayisi FROM basari_hesaplari) > 0 
            THEN ROUND(
                ((SELECT mezun_sayisi FROM basari_hesaplari) / 
                 (SELECT toplam_ogrenci_sayisi FROM basari_hesaplari)) * 100,
                2
            )
            ELSE 0
        END as basari_orani,
        0::NUMERIC as basari_orani_artis -- Bu değer ileride hesaplanabilir
    ) t;

    -- Return empty array instead of null
    IF result IS NULL THEN
        result := '[{}]'::json;
    END IF;

    RETURN result;
END;
$$;

-- Kullanım örneği:
-- SELECT * FROM get_advisor_analysis_kpis();

