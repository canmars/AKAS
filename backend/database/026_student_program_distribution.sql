-- SQL Function: Öğrenci Program Dağılımı
-- Bu fonksiyon program tipine göre öğrenci dağılımını döndürür

CREATE OR REPLACE FUNCTION public.get_student_program_distribution()
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
        WITH program_gruplari AS (
            SELECT 
                -- Program kodlarına veya adlarına göre grupla
                CASE 
                    WHEN pt.program_kodu = 'TEZLI_YL' OR pt.program_adi ILIKE '%tezli%yl%' OR pt.program_adi ILIKE '%tezli%yüksek%lisans%' THEN 'Tezli YL'
                    WHEN pt.program_kodu = 'TEZSIZ_YL_UZAKTAN' OR pt.program_adi ILIKE '%uzaktan%' THEN 'Tezsiz YL (Uzaktan)'
                    WHEN pt.program_kodu = 'TEZSIZ_YL_IO' OR pt.program_adi ILIKE '%ikinci%öğretim%' OR pt.program_adi ILIKE '%İÖ%' THEN 'Tezsiz YL (İÖ)'
                    WHEN pt.program_kodu = 'TEZSIZ_YL' OR pt.program_adi ILIKE '%tezsiz%yl%' OR pt.program_adi ILIKE '%tezsiz%yüksek%lisans%' THEN 'Tezsiz YL'
                    WHEN pt.program_kodu = 'DOKTORA' OR pt.program_adi ILIKE '%doktora%' THEN 'Doktora'
                    ELSE pt.program_adi
                END as program_tipi,
                COUNT(DISTINCT o.ogrenci_id)::INTEGER as ogrenci_sayisi
            FROM public.ogrenci o
            INNER JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
            WHERE o.aktif_mi = true 
                AND o.deleted_at IS NULL
            GROUP BY 1
        )
        SELECT 
            pg.program_tipi,
            pg.ogrenci_sayisi,
            CASE 
                WHEN toplam_ogrenci > 0 
                THEN ROUND((pg.ogrenci_sayisi::numeric / toplam_ogrenci::numeric) * 100, 1)
                ELSE 0
            END::NUMERIC as yuzde
        FROM program_gruplari pg
        ORDER BY pg.ogrenci_sayisi DESC
    ) t;

    -- Return empty array instead of null
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;
