-- =============================================
-- Author: AKAS Agent
-- Date: 2025-12-28 (Revized: 2025-01-XX)
-- Description: Advisor Workload Distribution - Akademik Kurallara Uygun Revize
-- 
-- GERÇEK HAYAT KURALLARI:
-- 1. KİMLER DANIŞMAN OLABİLİR?
--    - SADECE: 'Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi'
--    - ASLA: 'Arş. Gör.' ve 'Öğr. Gör.' danışman olamaz
-- 
-- 2. KOTA AYRIMI
--    - Tezli Kotası: tezli_kotasi (genelde 14)
--    - Tezsiz Kotası: tezsiz_kotasi (genelde 16)
--    - Program türü: program_adi veya program_kodu ile belirlenir
-- 
-- 3. YÜKÜN DETAYI (Stage Breakdown)
--    - Ders Aşaması: ders_tamamlandi_mi = false veya NULL
--    - Tez Aşaması: ders_tamamlandi_mi = true
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
            -- Tezli: program_kodu NOT LIKE 'TEZSIZ%' VE program_adi içinde 'Tezsiz' geçmiyorsa
            json_build_object(
                'kota', COALESCE(ap.tezli_kotasi, 0),
                'toplam_dolu', COUNT(o.ogrenci_id) FILTER (
                    WHERE o.ogrenci_id IS NOT NULL 
                    AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
                ),
                'detay', json_build_object(
                    'ders_asamasi', COUNT(o.ogrenci_id) FILTER (
                        WHERE o.ogrenci_id IS NOT NULL
                        AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
                        AND (oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL)
                    ),
                    'tez_asamasi', COUNT(o.ogrenci_id) FILTER (
                        WHERE o.ogrenci_id IS NOT NULL
                        AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
                        AND oad.ders_tamamlandi_mi = true
                    )
                )
            ) as tezli_durum,

            -- TEZSIZ DURUM
            -- Tezsiz: program_kodu LIKE 'TEZSIZ%' VEYA program_adi içinde 'Tezsiz' geçiyorsa
            json_build_object(
                'kota', COALESCE(ap.tezsiz_kotasi, 0),
                'toplam_dolu', COUNT(o.ogrenci_id) FILTER (
                    WHERE o.ogrenci_id IS NOT NULL
                    AND (pt.program_kodu LIKE 'TEZSIZ%' OR pt.program_adi ILIKE '%tezsiz%')
                ),
                'detay', json_build_object(
                    'proje_asamasi', COUNT(o.ogrenci_id) FILTER (
                        WHERE o.ogrenci_id IS NOT NULL
                        AND (pt.program_kodu LIKE 'TEZSIZ%' OR pt.program_adi ILIKE '%tezsiz%')
                    )
                )
            ) as tezsiz_durum,
            
            -- Toplam Yük Yüzdesi (Tezli doluluk bazlı)
            CASE 
                WHEN ap.tezli_kotasi > 0 THEN 
                    ROUND((
                        COUNT(o.ogrenci_id) FILTER (
                            WHERE o.ogrenci_id IS NOT NULL
                            AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
                        )::numeric / ap.tezli_kotasi::numeric
                    ) * 100)
                ELSE 0 
            END as toplam_yuk_yuzdesi

        FROM akademik_personel ap
        LEFT JOIN ogrenci o ON o.danisman_id = ap.personel_id 
            AND o.aktif_mi = true 
            AND o.deleted_at IS NULL
        LEFT JOIN program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        
        WHERE ap.aktif_mi = true
          -- SADECE belirtilen unvanlar danışman olabilir
          AND ap.unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi')
          -- Arş. Gör. ve Öğr. Gör. ASLA danışman olamaz (yukarıdaki IN ile zaten filtreleniyor)
          
        GROUP BY ap.personel_id, ap.unvan, ap.ad, ap.soyad, ap.tezli_kotasi, ap.tezsiz_kotasi
        
        -- Sıralama: Tezli toplam dolu sayısına göre (yüksekten düşüğe)
        ORDER BY (
            COUNT(o.ogrenci_id) FILTER (
                WHERE o.ogrenci_id IS NOT NULL
                AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
            )
        ) DESC
    ) t;

    -- Return empty array instead of null
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;
