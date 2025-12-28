-- =============================================
-- Author: AKAS Agent
-- Date: 2025-12-28
-- Description: Detailed Advisor Workload Distribution V2
-- Logic:
-- 1. Only Faculty Members (Prof, Assoc Prof, Asst Prof) - No Research Assistants
-- 2. Weighted Load: Thesis=3 pts, Course=1 pt
-- 3. Returns flat JSON structure for UI
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
            (ap.unvan || ' ' || ap.ad || ' ' || ap.soyad) as ad_soyad,
            ap.unvan,
            ap.tezli_kotasi as kota,
            
            -- Ders Aşamasındaki Öğrenci Sayısı
            (
                SELECT COUNT(*)
                FROM ogrenci o
                LEFT JOIN ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
                WHERE o.danisman_id = ap.personel_id 
                  AND o.aktif_mi = true
                  AND (oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL)
            ) as ders_ogrencisi_sayisi,

            -- Tez Aşamasındaki Öğrenci Sayısı
            (
                SELECT COUNT(*)
                FROM ogrenci o
                JOIN ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
                WHERE o.danisman_id = ap.personel_id 
                  AND o.aktif_mi = true
                  AND oad.ders_tamamlandi_mi = true
            ) as tez_ogrencisi_sayisi,

            -- Toplam Öğrenci
            (
                SELECT COUNT(*)
                FROM ogrenci o
                WHERE o.danisman_id = ap.personel_id
                  AND o.aktif_mi = true
            ) as toplam_ogrenci,

            -- Doluluk Yüzdesi
            ROUND(
                (
                    (SELECT COUNT(*) FROM ogrenci o WHERE o.danisman_id = ap.personel_id AND o.aktif_mi = true)::numeric 
                    / 
                    NULLIF(ap.tezli_kotasi, 0)::numeric
                ) * 100
            , 0) as doluluk_yuzdesi,
            
            -- Toplam Yük Puanı (Ders=1, Tez=3)
            (
                (
                    SELECT COUNT(*)
                    FROM ogrenci o
                    LEFT JOIN ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
                    WHERE o.danisman_id = ap.personel_id 
                      AND o.aktif_mi = true
                      AND (oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL)
                ) * 1 -- Ders katsayısı
                +
                (
                    SELECT COUNT(*)
                    FROM ogrenci o
                    JOIN ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
                    WHERE o.danisman_id = ap.personel_id 
                      AND o.aktif_mi = true
                      AND oad.ders_tamamlandi_mi = true
                ) * 3 -- Tez katsayısı
            ) as toplam_yuk_puani

        FROM akademik_personel ap
        WHERE ap.aktif_danisman_mi = true
          AND ap.rol IN ('Danisman', 'Bolum_Baskani')
          -- Sadece öğretim üyeleri (Arş. Gör. vs hariç)
          AND ap.unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi')
        
        -- Sıralama: Toplam Yük Puanına Göre (Ağırlıklı)
        ORDER BY toplam_yuk_puani DESC, doluluk_yuzdesi DESC
            
    ) t;

    -- Return empty array instead of null
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;
