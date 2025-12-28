-- =============================================
-- Author: AKAS Agent
-- Date: 2025-12-28 (Revized: V4 - Ultra Detailed)
-- Description: Advisor Workload Distribution - TEZLİ/TEZSİZ ALT KIRILIMLI VERSİYON
-- 
-- GERÇEK HAYAT KURALLARI:
-- 1. KİMLER DANIŞMAN OLABİLİR?
--    - SADECE: 'Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi'
--    - ASLA: 'Arş. Gör.' ve 'Öğr. Gör.' danışman olamaz
-- 
-- 2. DETAYLI KOTA AYRIMI (4 Alt Kategori):
--    A) TEZLİ GRUBU (Kotası: 14)
--       - tezli_ders: Tezli programda olup ders_tamamlandi_mi = false
--       - tezli_tez: Tezli programda olup ders_tamamlandi_mi = true
--    
--    B) TEZSİZ GRUBU (Kotası: 16)
--       - tezsiz_uzaktan: Program adında 'Uzaktan' veya 'Remote' geçenler
--       - tezsiz_io: Program adında 'İkinci Öğretim', 'İÖ' veya 'Secondary' geçenler
-- 
-- 3. ÇIKTI FORMATI:
--    Frontend'in detaylı görüntülemesi için iç içe JSON yapısı
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
            
            -- TEZLİ GRUBU (Kota: 14)
            json_build_object(
                'kota', 14,
                'dolu', (
                    COUNT(o.ogrenci_id) FILTER (
                        WHERE o.ogrenci_id IS NOT NULL 
                        AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
                    )
                ),
                'detay', json_build_object(
                    'ders', COUNT(o.ogrenci_id) FILTER (
                        WHERE o.ogrenci_id IS NOT NULL
                        AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
                        AND (oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL)
                    ),
                    'tez', COUNT(o.ogrenci_id) FILTER (
                        WHERE o.ogrenci_id IS NOT NULL
                        AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
                        AND oad.ders_tamamlandi_mi = true
                    )
                )
            ) as tezli_data,

            -- TEZSIZ GRUBU (Kota: 16)
            json_build_object(
                'kota', 16,
                'dolu', (
                    COUNT(o.ogrenci_id) FILTER (
                        WHERE o.ogrenci_id IS NOT NULL
                        AND (pt.program_kodu LIKE 'TEZSIZ%' OR pt.program_adi ILIKE '%tezsiz%')
                    )
                ),
                'detay', json_build_object(
                    'uzaktan', COUNT(o.ogrenci_id) FILTER (
                        WHERE o.ogrenci_id IS NOT NULL
                        AND (pt.program_kodu LIKE 'TEZSIZ%' OR pt.program_adi ILIKE '%tezsiz%')
                        AND (
                            pt.program_adi ILIKE '%uzaktan%' 
                            OR pt.program_adi ILIKE '%remote%'
                            OR pt.program_kodu ILIKE '%UZK%'
                        )
                    ),
                    'io', COUNT(o.ogrenci_id) FILTER (
                        WHERE o.ogrenci_id IS NOT NULL
                        AND (pt.program_kodu LIKE 'TEZSIZ%' OR pt.program_adi ILIKE '%tezsiz%')
                        AND (
                            pt.program_adi ILIKE '%ikinci öğretim%' 
                            OR pt.program_adi ILIKE '%secondary%'
                            OR pt.program_adi ILIKE '%İÖ%'
                            OR pt.program_adi ILIKE '%2. öğretim%'
                        )
                    )
                )
            ) as tezsiz_data,
            
            -- TOPLAM ÖĞRENCİ SAYISI
            COUNT(o.ogrenci_id) FILTER (WHERE o.ogrenci_id IS NOT NULL) as toplam_ogrenci,
            
            -- Toplam Yük Yüzdesi (Tezli doluluk bazlı, kotası 14'e göre)
            CASE 
                WHEN 14 > 0 THEN 
                    ROUND((
                        COUNT(o.ogrenci_id) FILTER (
                            WHERE o.ogrenci_id IS NOT NULL
                            AND (pt.program_kodu NOT LIKE 'TEZSIZ%' AND pt.program_adi NOT ILIKE '%tezsiz%')
                        )::numeric / 14::numeric
                    ) * 100)
                ELSE 0 
            END as tezli_yuk_yuzdesi,
            
            -- Tezsiz Yük Yüzdesi (Kotası 16'ya göre)
            CASE 
                WHEN 16 > 0 THEN 
                    ROUND((
                        COUNT(o.ogrenci_id) FILTER (
                            WHERE o.ogrenci_id IS NOT NULL
                            AND (pt.program_kodu LIKE 'TEZSIZ%' OR pt.program_adi ILIKE '%tezsiz%')
                        )::numeric / 16::numeric
                    ) * 100)
                ELSE 0 
            END as tezsiz_yuk_yuzdesi

        FROM akademik_personel ap
        LEFT JOIN ogrenci o ON o.danisman_id = ap.personel_id 
            AND o.aktif_mi = true 
            AND o.deleted_at IS NULL
        LEFT JOIN program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        
        WHERE ap.aktif_mi = true
          -- SADECE belirtilen unvanlar danışman olabilir
          AND ap.unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi')
          
        GROUP BY ap.personel_id, ap.unvan, ap.ad, ap.soyad
        
        -- Sıralama: Toplam öğrenci sayısına göre (yüksekten düşüğe)
        ORDER BY toplam_ogrenci DESC
    ) t;

    -- Return empty array instead of null
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;

-- Test Query (Opsiyonel)
-- SELECT * FROM get_advisor_workload_distribution();

