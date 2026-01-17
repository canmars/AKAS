-- ====== DANISMAN ATAMA MODÜLÜ- SUPABASE RPC FUNCTIONS ======

-- 1. Danışman sayacını artır
CREATE OR REPLACE FUNCTION increment_advisor_count(advisor_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE akademik_personel
    SET mevcut_danismanlik_sayisi = mevcut_danismanlik_sayisi + 1,
        updated_at = NOW()
    WHERE personel_id = advisor_id_param;
END;
$$;

-- 2. Danışman sayacını azalt
CREATE OR REPLACE FUNCTION decrement_advisor_count(advisor_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE akademik_personel
    SET mevcut_danismanlik_sayisi = 
        CASE 
            WHEN mevcut_danismanlik_sayisi > 0 
            THEN mevcut_danismanlik_sayisi - 1 
            ELSE 0 
        END,
        updated_at = NOW()
    WHERE personel_id = advisor_id_param;
END;
$$;
