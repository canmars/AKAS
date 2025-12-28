-- SQL Function: Danışman Uzmanlık Dağılımı
-- Bu fonksiyon uzmanlık alanlarına göre danışman dağılımını döndürür

CREATE OR REPLACE FUNCTION public.get_advisor_expertise_distribution(
    filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
    uzmanlik_alani TEXT,
    danisman_sayisi INTEGER,
    danisman_listesi JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH uzmanlik_gruplari AS (
        SELECT 
            apu.uzmanlik_alani,
            COUNT(DISTINCT ap.personel_id)::INTEGER as sayi,
            jsonb_agg(
                jsonb_build_object(
                    'personel_id', ap.personel_id,
                    'ad_soyad', ap.unvan || ' ' || ap.ad || ' ' || ap.soyad,
                    'unvan', ap.unvan
                )
            ) as danismanlar
        FROM public.akademik_personel_uzmanlik apu
        INNER JOIN public.akademik_personel ap ON apu.personel_id = ap.personel_id
        WHERE ap.aktif_mi = true
            AND ap.unvan IN ('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi')
            AND (
                filter_category IS NULL 
                OR filter_category = 'Genel'
                OR (filter_category = 'Yapay Zeka' AND (
                    apu.uzmanlik_alani ILIKE '%yapay zeka%' 
                    OR apu.uzmanlik_alani ILIKE '%artificial intelligence%'
                    OR apu.uzmanlik_alani ILIKE '%machine learning%'
                    OR apu.uzmanlik_alani ILIKE '%makine öğrenmesi%'
                ))
                OR (filter_category = 'Veri Bilimi' AND (
                    apu.uzmanlik_alani ILIKE '%veri bilimi%'
                    OR apu.uzmanlik_alani ILIKE '%data science%'
                    OR apu.uzmanlik_alani ILIKE '%veri madenciliği%'
                    OR apu.uzmanlik_alani ILIKE '%data mining%'
                    OR apu.uzmanlik_alani ILIKE '%big data%'
                ))
            )
        GROUP BY apu.uzmanlik_alani
    )
    SELECT 
        ug.uzmanlik_alani,
        ug.sayi as danisman_sayisi,
        ug.danismanlar as danisman_listesi
    FROM uzmanlik_gruplari ug
    ORDER BY ug.sayi DESC, ug.uzmanlik_alani
    LIMIT 20; -- En çok danışmana sahip 20 uzmanlık alanı
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanım örnekleri:
-- SELECT * FROM get_advisor_expertise_distribution(NULL); -- Tümü
-- SELECT * FROM get_advisor_expertise_distribution('Genel');
-- SELECT * FROM get_advisor_expertise_distribution('Yapay Zeka');
-- SELECT * FROM get_advisor_expertise_distribution('Veri Bilimi');

