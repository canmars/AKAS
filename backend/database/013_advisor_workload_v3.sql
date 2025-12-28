-- =============================================
-- Author: AKAS Agent
-- Date: 2025-12-28
-- Description: Advisor Workload Metrics V3
-- Logic:
-- 1. Only Faculty (Prof. Dr., Doç. Dr., Dr. Öğr. Üyesi)
-- 2. Breakdown: Tezsiz, Tezli (Ders), Tezli (Tez)
-- 3. Sorting: By total workload
-- =============================================

CREATE OR REPLACE FUNCTION get_advisor_workload_distribution()
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
            (ap.unvan || ' ' || ap.ad || ' ' || ap.soyad) as ad_soyad,
            ap.unvan,
            
            -- TEZLİ DURUM
            json_build_object(
                'kota', ap.tezli_kotasi,
                'toplam_dolu', COUNT(o.ogrenci_id) FILTER (WHERE pt.program_kodu NOT LIKE 'TEZSIZ%'),
                'detay', json_build_object(
                    'ders_asamasi', COUNT(o.ogrenci_id) FILTER (
                        WHERE pt.program_kodu NOT LIKE 'TEZSIZ%' 
                        AND (oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL)
                    ),
                    'tez_asamasi', COUNT(o.ogrenci_id) FILTER (
                        WHERE pt.program_kodu NOT LIKE 'TEZSIZ%' 
                        AND oad.ders_tamamlandi_mi = true
                    )
                )
            ) as tezli_durum,

            -- TEZSIZ DURUM
            json_build_object(
                'kota', ap.tezsiz_kotasi,
                'toplam_dolu', COUNT(o.ogrenci_id) FILTER (WHERE pt.program_kodu LIKE 'TEZSIZ%'),
                'detay', json_build_object(
                    'proje_asamasi', COUNT(o.ogrenci_id) FILTER (WHERE pt.program_kodu LIKE 'TEZSIZ%')
                )
            ) as tezsiz_durum,
            
            -- Toplam Yük Yüzdesi (Tezli doluluk bazlı, kullanıcı isteğine göre)
            CASE 
                WHEN ap.tezli_kotasi > 0 THEN 
                    ROUND((COUNT(o.ogrenci_id) FILTER (WHERE pt.program_kodu NOT LIKE 'TEZSIZ%')::numeric / ap.tezli_kotasi::numeric) * 100)
                ELSE 0 
            END as toplam_yuk_yuzdesi

        FROM akademik_personel ap
        LEFT JOIN ogrenci o ON o.danisman_id = ap.personel_id AND o.aktif_mi = true
        LEFT JOIN program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        
        WHERE ap.aktif_mi = true
          AND ap.unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi')
          
        GROUP BY ap.personel_id, ap.unvan, ap.ad, ap.soyad, ap.tezli_kotasi, ap.tezsiz_kotasi
        
        ORDER BY (COUNT(o.ogrenci_id) FILTER (WHERE pt.program_kodu NOT LIKE 'TEZSIZ%')) DESC
    ) t;

    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;
