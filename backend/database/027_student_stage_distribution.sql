-- SQL Function: Öğrenci Mevcut Aşama Dağılımı
-- Bu fonksiyon durum_kodu bazında öğrenci dağılımını döndürür

CREATE OR REPLACE FUNCTION public.get_student_stage_distribution()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    toplam_ogrenci INTEGER;
BEGIN
    -- Toplam aktif öğrenci sayısını al
    SELECT COUNT(*)::INTEGER INTO toplam_ogrenci
    FROM public.ogrenci o
    WHERE o.aktif_mi = true 
        AND o.deleted_at IS NULL;

    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        WITH asama_dagilimi AS (
            SELECT 
                dt.durum_adi as asama_adi,
                dt.durum_kodu,
                dt.sira_no,
                COUNT(DISTINCT o.ogrenci_id)::INTEGER as ogrenci_sayisi
            FROM public.durum_turleri dt
            INNER JOIN public.ogrenci o ON o.durum_id = dt.durum_id
            WHERE o.aktif_mi = true 
                AND o.deleted_at IS NULL
            GROUP BY dt.durum_adi, dt.durum_kodu, dt.sira_no
            HAVING COUNT(DISTINCT o.ogrenci_id) > 0
        )
        SELECT 
            ad.asama_adi,
            ad.ogrenci_sayisi,
            CASE 
                WHEN toplam_ogrenci > 0 
                THEN ROUND((ad.ogrenci_sayisi::numeric / toplam_ogrenci::numeric) * 100, 1)
                ELSE 0
            END::NUMERIC as yuzde,
            ad.durum_kodu
        FROM asama_dagilimi ad
        ORDER BY ad.sira_no
    ) t;

    -- Return empty array instead of null
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;

-- Kullanım örneği:
-- SELECT * FROM get_student_stage_distribution();

