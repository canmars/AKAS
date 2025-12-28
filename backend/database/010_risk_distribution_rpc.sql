-- =============================================
-- Author: AKAS Agent
-- Date: 2025-12-28
-- Description: Risk Dağılım İstatistikleri (V2)
-- Fetches count of students per risk level from ogrenci_risk_skorlari table
-- =============================================

CREATE OR REPLACE FUNCTION get_risk_distribution_stats()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    v_dusuk INTEGER := 0;
    v_orta INTEGER := 0;
    v_yuksek INTEGER := 0; -- Merged High + Critical
    v_total INTEGER := 0;
BEGIN
    -- Düşük
    SELECT COUNT(*) INTO v_dusuk FROM ogrenci_risk_skorlari WHERE risk_seviyesi = 'Dusuk';
    
    -- Orta
    SELECT COUNT(*) INTO v_orta FROM ogrenci_risk_skorlari WHERE risk_seviyesi = 'Orta';
    
    -- Yüksek (Yüksek + Kritik) to match the 3-category design
    SELECT COUNT(*) INTO v_yuksek FROM ogrenci_risk_skorlari WHERE risk_seviyesi IN ('Yuksek', 'Kritik');
    
    v_total := v_dusuk + v_orta + v_yuksek;
    
    RETURN json_build_object(
        'low', v_dusuk,
        'medium', v_orta,
        'high', v_yuksek,
        'total', v_total
    );
END;
$$;
