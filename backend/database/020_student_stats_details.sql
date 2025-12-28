-- SQL Functions: Öğrenci Analizi İstatistik Kartları Detay Fonksiyonları
-- Her istatistik kartı için detaylı öğrenci listesi döndüren fonksiyonlar

-- 1. Toplam Öğrenci Detayı
CREATE OR REPLACE FUNCTION public.get_all_students_detail(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    ogrenci_id UUID,
    ogrenci_no TEXT,
    ad_soyad TEXT,
    program_adi TEXT,
    guncel_asama TEXT,
    kayit_tarihi DATE,
    gno NUMERIC,
    risk_seviyesi TEXT,
    risk_skoru INTEGER,
    danisman_adi TEXT,
    total_count BIGINT
) AS $$
DECLARE
    offset_val INTEGER;
BEGIN
    offset_val := (page_num - 1) * page_size;
    
    RETURN QUERY
    WITH ogrenci_listesi AS (
        SELECT 
            o.ogrenci_id,
            o.ogrenci_no,
            CONCAT(o.ad, ' ', o.soyad) AS ad_soyad,
            pt.program_adi,
            CASE 
                WHEN oad.ders_tamamlandi_mi = true THEN 'Tez Aşamasında'
                WHEN oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL THEN 'Ders Aşamasında'
                ELSE dt.durum_adi
            END as guncel_asama,
            o.kayit_tarihi,
            o.gno,
            COALESCE(ors.risk_seviyesi, 'Dusuk') as risk_seviyesi,
            COALESCE(ors.risk_skoru, 0) as risk_skoru,
            CONCAT(COALESCE(ap.unvan, ''), ' ', ap.ad, ' ', ap.soyad) as danisman_adi
        FROM public.ogrenci o
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
        LEFT JOIN public.akademik_personel ap ON o.danisman_id = ap.personel_id
        LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
        LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        WHERE o.aktif_mi = true 
            AND o.deleted_at IS NULL
    ),
    total AS (
        SELECT COUNT(*)::BIGINT as cnt FROM ogrenci_listesi
    )
    SELECT 
        ol.ogrenci_id,
        ol.ogrenci_no,
        ol.ad_soyad,
        ol.program_adi,
        ol.guncel_asama,
        ol.kayit_tarihi,
        ol.gno,
        ol.risk_seviyesi,
        ol.risk_skoru,
        ol.danisman_adi,
        t.cnt as total_count
    FROM ogrenci_listesi ol
    CROSS JOIN total t
    ORDER BY ol.ogrenci_no
    LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Tez Aşamasındaki Öğrenciler Detayı
CREATE OR REPLACE FUNCTION public.get_thesis_stage_students_detail(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    ogrenci_id UUID,
    ogrenci_no TEXT,
    ad_soyad TEXT,
    program_adi TEXT,
    kayit_tarihi DATE,
    gno NUMERIC,
    risk_seviyesi TEXT,
    risk_skoru INTEGER,
    danisman_adi TEXT,
    tez_basligi TEXT,
    tez_durumu TEXT,
    total_count BIGINT
) AS $$
DECLARE
    offset_val INTEGER;
BEGIN
    offset_val := (page_num - 1) * page_size;
    
    RETURN QUERY
    WITH tez_ogrencileri AS (
        SELECT 
            o.ogrenci_id,
            o.ogrenci_no,
            CONCAT(o.ad, ' ', o.soyad) AS ad_soyad,
            pt.program_adi,
            o.kayit_tarihi,
            o.gno,
            COALESCE(ors.risk_seviyesi, 'Dusuk') as risk_seviyesi,
            COALESCE(ors.risk_skoru, 0) as risk_skoru,
            CONCAT(COALESCE(ap.unvan, ''), ' ', ap.ad, ' ', ap.soyad) as danisman_adi,
            t.baslik as tez_basligi,
            t.durum as tez_durumu
        FROM public.ogrenci o
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN public.akademik_personel ap ON o.danisman_id = ap.personel_id
        LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
        LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        LEFT JOIN public.tezler t ON o.ogrenci_id = t.ogrenci_id AND t.deleted_at IS NULL
        WHERE o.aktif_mi = true 
            AND o.deleted_at IS NULL
            AND oad.ders_tamamlandi_mi = true
    ),
    total AS (
        SELECT COUNT(*)::BIGINT as cnt FROM tez_ogrencileri
    )
    SELECT 
        to_.ogrenci_id,
        to_.ogrenci_no,
        to_.ad_soyad,
        to_.program_adi,
        to_.kayit_tarihi,
        to_.gno,
        to_.risk_seviyesi,
        to_.risk_skoru,
        to_.danisman_adi,
        to_.tez_basligi,
        to_.tez_durumu,
        t.cnt as total_count
    FROM tez_ogrencileri to_
    CROSS JOIN total t
    ORDER BY to_.ogrenci_no
    LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. İzlenmesi Gereken Öğrenciler Detayı (Orta ve Yüksek Risk)
CREATE OR REPLACE FUNCTION public.get_monitoring_students_detail(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    ogrenci_id UUID,
    ogrenci_no TEXT,
    ad_soyad TEXT,
    program_adi TEXT,
    guncel_asama TEXT,
    kayit_tarihi DATE,
    gno NUMERIC,
    risk_seviyesi TEXT,
    risk_skoru INTEGER,
    danisman_adi TEXT,
    risk_faktorleri JSONB,
    total_count BIGINT
) AS $$
DECLARE
    offset_val INTEGER;
BEGIN
    offset_val := (page_num - 1) * page_size;
    
    RETURN QUERY
    WITH izlenmesi_gerekenler AS (
        SELECT 
            o.ogrenci_id,
            o.ogrenci_no,
            CONCAT(o.ad, ' ', o.soyad) AS ad_soyad,
            pt.program_adi,
            CASE 
                WHEN oad.ders_tamamlandi_mi = true THEN 'Tez Aşamasında'
                WHEN oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL THEN 'Ders Aşamasında'
                ELSE dt.durum_adi
            END as guncel_asama,
            o.kayit_tarihi,
            o.gno,
            COALESCE(ors.risk_seviyesi, 'Dusuk') as risk_seviyesi,
            COALESCE(ors.risk_skoru, 0) as risk_skoru,
            CONCAT(COALESCE(ap.unvan, ''), ' ', ap.ad, ' ', ap.soyad) as danisman_adi,
            jsonb_build_object(
                'gno_dusuk', CASE WHEN o.gno < 2.5 THEN true ELSE false END,
                'ders_tekrari', (
                    SELECT COUNT(*) 
                    FROM public.ogrenci_dersleri od 
                    WHERE od.ogrenci_id = o.ogrenci_id 
                        AND od.not_kodu IN ('FF', 'FD')
                ),
                'tez_gecikmesi', CASE 
                    WHEN oad.ders_tamamlandi_mi = true AND t.baslangic_tarihi IS NOT NULL 
                        AND (CURRENT_DATE - t.baslangic_tarihi) > 730 THEN true 
                    ELSE false 
                END
            ) as risk_faktorleri
        FROM public.ogrenci o
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
        LEFT JOIN public.akademik_personel ap ON o.danisman_id = ap.personel_id
        LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
        LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        LEFT JOIN public.tezler t ON o.ogrenci_id = t.ogrenci_id AND t.deleted_at IS NULL
        WHERE o.aktif_mi = true 
            AND o.deleted_at IS NULL
            AND COALESCE(ors.risk_seviyesi, 'Dusuk') IN ('Orta', 'Yuksek')
    ),
    total AS (
        SELECT COUNT(*)::BIGINT as cnt FROM izlenmesi_gerekenler
    )
    SELECT 
        ig.ogrenci_id,
        ig.ogrenci_no,
        ig.ad_soyad,
        ig.program_adi,
        ig.guncel_asama,
        ig.kayit_tarihi,
        ig.gno,
        ig.risk_seviyesi,
        ig.risk_skoru,
        ig.danisman_adi,
        ig.risk_faktorleri,
        t.cnt as total_count
    FROM izlenmesi_gerekenler ig
    CROSS JOIN total t
    ORDER BY ig.risk_skoru DESC, ig.ogrenci_no
    LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Yüksek Riskli Öğrenciler Detayı (Kritik ve Yüksek Risk)
CREATE OR REPLACE FUNCTION public.get_high_risk_students_detail(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    ogrenci_id UUID,
    ogrenci_no TEXT,
    ad_soyad TEXT,
    program_adi TEXT,
    guncel_asama TEXT,
    kayit_tarihi DATE,
    gno NUMERIC,
    risk_seviyesi TEXT,
    risk_skoru INTEGER,
    danisman_adi TEXT,
    risk_faktorleri JSONB,
    acil_aksiyon TEXT,
    total_count BIGINT
) AS $$
DECLARE
    offset_val INTEGER;
BEGIN
    offset_val := (page_num - 1) * page_size;
    
    RETURN QUERY
    WITH yuksek_riskliler AS (
        SELECT 
            o.ogrenci_id,
            o.ogrenci_no,
            CONCAT(o.ad, ' ', o.soyad) AS ad_soyad,
            pt.program_adi,
            CASE 
                WHEN oad.ders_tamamlandi_mi = true THEN 'Tez Aşamasında'
                WHEN oad.ders_tamamlandi_mi = false OR oad.ders_tamamlandi_mi IS NULL THEN 'Ders Aşamasında'
                ELSE dt.durum_adi
            END as guncel_asama,
            o.kayit_tarihi,
            o.gno,
            COALESCE(ors.risk_seviyesi, 'Dusuk') as risk_seviyesi,
            COALESCE(ors.risk_skoru, 0) as risk_skoru,
            CONCAT(COALESCE(ap.unvan, ''), ' ', ap.ad, ' ', ap.soyad) as danisman_adi,
            jsonb_build_object(
                'gno_dusuk', CASE WHEN o.gno < 2.0 THEN true ELSE false END,
                'ders_tekrari', (
                    SELECT COUNT(*) 
                    FROM public.ogrenci_dersleri od 
                    WHERE od.ogrenci_id = o.ogrenci_id 
                        AND od.not_kodu IN ('FF', 'FD')
                ),
                'tez_gecikmesi', CASE 
                    WHEN oad.ders_tamamlandi_mi = true AND t.baslangic_tarihi IS NOT NULL 
                        AND (CURRENT_DATE - t.baslangic_tarihi) > 730 THEN true 
                    ELSE false 
                END,
                'devamsizlik', false -- Bu alan ileride eklenebilir
            ) as risk_faktorleri,
            CASE 
                WHEN o.gno < 2.0 THEN 'GNO düşüklüğü nedeniyle akademik destek gerekli'
                WHEN (
                    SELECT COUNT(*) 
                    FROM public.ogrenci_dersleri od 
                    WHERE od.ogrenci_id = o.ogrenci_id 
                        AND od.not_kodu IN ('FF', 'FD')
                ) > 2 THEN 'Çoklu ders tekrarı - danışman görüşmesi acil'
                WHEN oad.ders_tamamlandi_mi = true AND t.baslangic_tarihi IS NOT NULL 
                    AND (CURRENT_DATE - t.baslangic_tarihi) > 730 THEN 'Tez süresi uzaması - TİK toplantısı gerekli'
                ELSE 'Genel risk faktörleri mevcut'
            END as acil_aksiyon
        FROM public.ogrenci o
        LEFT JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
        LEFT JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
        LEFT JOIN public.akademik_personel ap ON o.danisman_id = ap.personel_id
        LEFT JOIN public.ogrenci_risk_skorlari ors ON o.ogrenci_id = ors.ogrenci_id
        LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
        LEFT JOIN public.tezler t ON o.ogrenci_id = t.ogrenci_id AND t.deleted_at IS NULL
        WHERE o.aktif_mi = true 
            AND o.deleted_at IS NULL
            AND COALESCE(ors.risk_seviyesi, 'Dusuk') IN ('Kritik', 'Yuksek')
    ),
    total AS (
        SELECT COUNT(*)::BIGINT as cnt FROM yuksek_riskliler
    )
    SELECT 
        yr.ogrenci_id,
        yr.ogrenci_no,
        yr.ad_soyad,
        yr.program_adi,
        yr.guncel_asama,
        yr.kayit_tarihi,
        yr.gno,
        yr.risk_seviyesi,
        yr.risk_skoru,
        yr.danisman_adi,
        yr.risk_faktorleri,
        yr.acil_aksiyon,
        t.cnt as total_count
    FROM yuksek_riskliler yr
    CROSS JOIN total t
    ORDER BY yr.risk_skoru DESC, yr.ogrenci_no
    LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanım örnekleri:
-- SELECT * FROM get_all_students_detail(1, 20);
-- SELECT * FROM get_thesis_stage_students_detail(1, 20);
-- SELECT * FROM get_monitoring_students_detail(1, 20);
-- SELECT * FROM get_high_risk_students_detail(1, 20);

