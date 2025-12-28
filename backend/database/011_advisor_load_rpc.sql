-- =============================================
-- Author: AKAS Agent
-- Date: 2025-12-28
-- Description: Advisor Workload Metrics (Dashboard)
-- Fetches active advisors and their real-time student counts
-- =============================================

CREATE OR REPLACE FUNCTION get_advisor_load_metrics()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            ap.personel_id,
            ap.ad,
            ap.soyad,
            ap.unvan,
            ap.tezli_kotasi,
            (
                SELECT COUNT(*)
                FROM ogrenci o
                WHERE o.danisman_id = ap.personel_id
                  AND o.aktif_mi = true
            ) as ogrenci_sayisi
        FROM akademik_personel ap
        WHERE ap.aktif_danisman_mi = true
          AND ap.rol IN ('Danisman', 'Bolum_Baskani')
        ORDER BY ogrenci_sayisi DESC, ap.tezli_kotasi DESC
        LIMIT 10 -- Top 10 busiest advisors
    ) t;

    -- Return empty array instead of null if no data
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;
