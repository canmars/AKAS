-- =============================================
-- Author: AKAS Agent
-- Date: 2025-01-XX
-- Description: Ders Risk Analizi Metrikleri
-- 
-- ANALİZ MANTIĞI:
-- 1. Son 2 yılın verilerini baz al (Aktif dönemler)
-- 2. Her ders için risk metrikleri hesapla
-- 3. Risk skoru hesapla: (Başarısızlık Oranı * 0.6) + ((4.0 - Ortalama Not) * 20 * 0.4)
-- 4. Sadece en az 5 öğrencinin aldığı dersleri listele
-- =============================================

CREATE OR REPLACE FUNCTION get_course_risk_metrics()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
    current_year integer;
BEGIN
    -- Mevcut akademik yılı al (örnek: 2025)
    SELECT EXTRACT(YEAR FROM CURRENT_DATE)::integer INTO current_year;
    
    WITH course_metrics AS (
        SELECT 
            od.ders_kodu,
            od.ders_adi,
            -- Öğretim Üyesi Bilgisi (En son açılan dersin hocası - MAX kullanarak bir hocayı seç)
            COALESCE(
                MAX(ap.unvan || ' ' || ap.ad || ' ' || ap.soyad) FILTER (WHERE ap.personel_id IS NOT NULL),
                'Atanmamış'
            ) as ogretim_uyesi,
            
            -- METRİKLER
            COUNT(DISTINCT od.ogrenci_id) as toplam_kayit,
            COUNT(*) FILTER (WHERE od.basarili_mi = false) as kalan_sayisi,
            
            -- Başarısızlık Oranı (%)
            (COUNT(*) FILTER (WHERE od.basarili_mi = false)::numeric / 
             NULLIF(COUNT(*), 0)::numeric) * 100 as basarisizlik_orani_raw,
            
            -- Ortalama Not (4'lük sistem)
            COALESCE(
                AVG(od.basari_katsayisi) FILTER (WHERE od.basari_katsayisi IS NOT NULL), 
                0
            ) as ortalama_not_raw,
            
            -- Tekrar Oranı (%)
            (COUNT(*) FILTER (WHERE od.tekrar_sayisi > 1)::numeric / 
             NULLIF(COUNT(*), 0)::numeric) * 100 as tekrar_orani_raw
            
        FROM public.ogrenci_dersleri od
        LEFT JOIN public.acilan_dersler ad ON od.acilan_ders_id = ad.acilan_ders_id
        LEFT JOIN public.akademik_personel ap ON ad.ogretim_uyesi_id = ap.personel_id
        
        WHERE 
            -- Son 2 yılın verilerini filtrele
            od.akademik_yil >= (current_year - 2)
            -- Aktif öğrencilerin derslerini baz al (Hayalet kayıt temizliği)
            AND EXISTS (
                SELECT 1 
                FROM public.ogrenci o 
                WHERE o.ogrenci_id = od.ogrenci_id 
                AND o.aktif_mi = true
                AND o.deleted_at IS NULL
            )
        
        GROUP BY od.ders_kodu, od.ders_adi
        
        -- Sadece en az 5 öğrencinin aldığı dersleri listele
        HAVING COUNT(DISTINCT od.ogrenci_id) >= 5
    )
    SELECT json_agg(row_to_json(t))
    INTO result
    FROM (
        SELECT 
            ders_kodu,
            ders_adi,
            ogretim_uyesi,
            
            -- METRİKLER (Yuvarlanmış)
            toplam_kayit,
            kalan_sayisi,
            ROUND(basarisizlik_orani_raw, 1) as basarisizlik_orani,
            ROUND(ortalama_not_raw, 2) as ortalama_not,
            ROUND(tekrar_orani_raw, 1) as tekrar_orani,
            
            -- RİSK SKORU (Ağırlıklı Puan)
            -- Risk Skoru = (Başarısızlık Oranı * 0.6) + ((4.0 - Ortalama Not) * 20 * 0.4)
            ROUND(
                (basarisizlik_orani_raw * 0.6) + ((4.0 - ortalama_not_raw) * 20 * 0.4),
                0
            ) as risk_skoru,
            
            -- Risk Kategorisi
            CASE 
                WHEN (basarisizlik_orani_raw * 0.6) + ((4.0 - ortalama_not_raw) * 20 * 0.4) > 70 
                    THEN 'Kritik Darboğaz'
                WHEN (basarisizlik_orani_raw * 0.6) + ((4.0 - ortalama_not_raw) * 20 * 0.4) >= 40 
                    THEN 'Orta Risk'
                ELSE 'Düşük Risk'
            END as risk_kategorisi,
            
            -- Frontend için X ve Y eksenleri
            -- X ekseni: Başarısızlık Oranı (Yüzde)
            ROUND(basarisizlik_orani_raw, 1) as x_ekseni_basarisizlik,
            
            -- Y ekseni: Etki (Toplam Kayıt Sayısı - Balonun büyüklüğü)
            toplam_kayit as y_ekseni_etki
            
        FROM course_metrics
        
        -- Risk skoruna göre sırala (Yüksekten düşüğe)
        ORDER BY risk_skoru DESC, toplam_kayit DESC
        
    ) t;

    -- Return empty array instead of null
    IF result IS NULL THEN
        result := '[]'::json;
    END IF;

    RETURN result;
END;
$$;

