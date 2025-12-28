-- =============================================
-- Author: AKAS Agent
-- Date: 2025-12-28
-- Description: Critical Alarms View for Dashboard
-- =============================================

CREATE OR REPLACE VIEW view_kritik_alarmlar AS
SELECT 
    ors.ogrenci_id,
    (o.ad || ' ' || o.soyad) as ad_soyad,
    pt.program_adi,
    COALESCE(oad.mevcut_yariyil, 1) as mevcut_yariyil,
    ors.risk_skoru,
    ors.risk_seviyesi,
    ors.risk_faktorleri as risk_sebepleri,
    CASE 
        WHEN ors.risk_faktorleri ? 'zaman_baskisi' THEN 'Yönetim Kurulu Gündemine Al (Azami Süre)'
        WHEN ors.risk_faktorleri ? 'kritik_uyari' THEN 'İlişik Kesme Süreci Başlat'
        WHEN ors.risk_faktorleri ? 'tik_durumu' THEN 'Danışmanla Görüş (TİK Riski)'
        WHEN ors.risk_faktorleri ? 'ders_durumu' THEN 'Ders Kaydı Kontrolü Yap'
        ELSE 'Genel Akademik İnceleme'
    END as oneri_aksiyon,
    o.email as iletisim_mail
FROM public.ogrenci_risk_skorlari ors
JOIN public.ogrenci o ON ors.ogrenci_id = o.ogrenci_id
JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
LEFT JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
WHERE ors.risk_skoru >= 70
ORDER BY ors.risk_skoru DESC;
