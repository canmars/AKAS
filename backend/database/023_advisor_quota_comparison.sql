-- SQL Function: Tezli/Tezsiz Kota ve Yük Karşılaştırması (Unvan Bazında)
-- Bu fonksiyon unvan bazında kota doluluk oranlarını döndürür

CREATE OR REPLACE FUNCTION public.get_advisor_quota_comparison()
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
        WITH danisman_kotalari AS (
            -- Her danışmanın kotasını al (her danışman sadece bir kez)
            SELECT 
                ap.personel_id,
                ap.unvan,
                COALESCE(ap.tezli_kotasi, 14) as tezli_kotasi,  -- Default 14
                COALESCE(ap.tezsiz_kotasi, 16) as tezsiz_kotasi  -- Default 16
            FROM public.akademik_personel ap
            WHERE ap.aktif_mi = true
                AND ap.unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi', 'Öğr. Gör.')
        ),
        unvan_bazli_kotalar AS (
            -- Unvan bazında toplam kotayı hesapla (danışman sayısı x kota)
            SELECT 
                unvan,
                COUNT(*)::INTEGER as danisman_sayisi,
                SUM(tezli_kotasi)::INTEGER as toplam_tezli_kota,
                SUM(tezsiz_kotasi)::INTEGER as toplam_tezsiz_kota
            FROM danisman_kotalari
            GROUP BY unvan
        ),
        unvan_bazli_ogrenci_sayilari AS (
            -- Unvan bazında öğrenci sayılarını hesapla
            SELECT 
                ap.unvan,
                COUNT(DISTINCT o.ogrenci_id) FILTER (
                    WHERE o.ogrenci_id IS NOT NULL 
                    AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
                )::INTEGER as dolu_tezli,
                COUNT(DISTINCT o.ogrenci_id) FILTER (
                    WHERE o.ogrenci_id IS NOT NULL 
                    AND (pt.program_kodu LIKE 'TEZSIZ%' OR pt.program_adi ILIKE '%tezsiz%')
                )::INTEGER as dolu_tezsiz
            FROM public.akademik_personel ap
            LEFT JOIN public.ogrenci o ON o.danisman_id = ap.personel_id 
                AND o.aktif_mi = true 
                AND o.deleted_at IS NULL
            LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
            WHERE ap.aktif_mi = true
                AND ap.unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi', 'Öğr. Gör.')
            GROUP BY ap.unvan
        ),
        unvan_bazli_yukler AS (
            SELECT 
                uk.unvan,
                uk.danisman_sayisi,
                uk.toplam_tezli_kota,
                uk.toplam_tezsiz_kota,
                COALESCE(uos.dolu_tezli, 0)::INTEGER as dolu_tezli,
                COALESCE(uos.dolu_tezsiz, 0)::INTEGER as dolu_tezsiz
            FROM unvan_bazli_kotalar uk
            LEFT JOIN unvan_bazli_ogrenci_sayilari uos ON uk.unvan = uos.unvan
        )
        SELECT 
            uby.unvan,
            uby.toplam_tezli_kota as toplam_kota_tezli,
            uby.dolu_tezli as dolu_kota_tezli,
            GREATEST(0, uby.toplam_tezli_kota - uby.dolu_tezli) as bos_kota_tezli,
            uby.toplam_tezsiz_kota as toplam_kota_tezsiz,
            uby.dolu_tezsiz as dolu_kota_tezsiz,
            GREATEST(0, uby.toplam_tezsiz_kota - uby.dolu_tezsiz) as bos_kota_tezsiz,
            (uby.toplam_tezli_kota + uby.toplam_tezsiz_kota) as toplam_kota,
            (uby.dolu_tezli + uby.dolu_tezsiz) as toplam_dolu,
            GREATEST(0, (uby.toplam_tezli_kota + uby.toplam_tezsiz_kota) - (uby.dolu_tezli + uby.dolu_tezsiz)) as toplam_bos
        FROM unvan_bazli_yukler uby
        ORDER BY 
            CASE uby.unvan
                WHEN 'Prof. Dr.' THEN 1
                WHEN 'Doç. Dr.' THEN 2
                WHEN 'Dr. Öğr. Üyesi' THEN 3
                WHEN 'Öğr. Gör.' THEN 4
                ELSE 5
            END
    ) t;

    -- Return empty array instead of null
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;

-- Kullanım örneği:
-- SELECT * FROM get_advisor_quota_comparison();

