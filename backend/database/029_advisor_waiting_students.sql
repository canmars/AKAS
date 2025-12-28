-- SQL Function: Danışman Bekleyen Öğrenciler Detayı
-- Bu fonksiyon henüz danışman ataması yapılmamış öğrencilerin detaylarını döndürür

CREATE OR REPLACE FUNCTION public.get_advisor_waiting_students_detail(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    offset_val INTEGER;
    total_count INTEGER;
BEGIN
    -- Calculate offset
    offset_val := (page_num - 1) * page_size;

    -- Get total count first
    SELECT COUNT(DISTINCT o.ogrenci_id)::INTEGER INTO total_count
    FROM public.ogrenci o
    WHERE o.aktif_mi = true 
        AND o.deleted_at IS NULL
        AND o.danisman_id IS NULL; -- FIXED: UUID cannot be compared to empty string

    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            o.ogrenci_id,
            o.ogrenci_no,
            CONCAT(o.ad, ' ', o.soyad) as ad_soyad,
            o.gno,
            o.kayit_tarihi,
            pt.program_adi,
            COALESCE(ors.risk_seviyesi, 'Dusuk') as risk_seviyesi,
            COALESCE(oad.mevcut_yariyil, 1) as mevcut_yariyil,
            CASE 
                WHEN oad.ders_tamamlandi_mi = true THEN 'Tez Aşamasında'
                ELSE 'Ders Aşamasında'
            END as guncel_asama,
            total_count
        FROM public.ogrenci o
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
        LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        WHERE o.aktif_mi = true 
            AND o.deleted_at IS NULL
            AND o.danisman_id IS NULL -- FIXED: UUID cannot be compared to empty string
        ORDER BY o.kayit_tarihi ASC -- Önce kayıt olan önce atanmalı
        LIMIT page_size
        OFFSET offset_val
    ) t;

    -- Return empty array instead of null
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;
