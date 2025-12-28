-- 1. ADIM: Fonksiyonun Kendisi
CREATE OR REPLACE FUNCTION hesapla_ogrenci_riski_detayli() RETURNS TRIGGER AS $$
DECLARE
    rec_ogrenci RECORD;
    v_ogrenci_id UUID;
    v_risk_skoru INT := 0;
    v_risk_seviyesi TEXT;
    v_faktorler JSONB := '{}'::JSONB; 
    
    -- Değişkenler
    v_basarisiz_ders INT;
    v_ders_puani INT; -- Ders puanını limitlemek için yeni değişken
    v_tik_basarisiz INT;
    v_max_sure INT;
    v_mevcut_yariyil INT; -- Gerçek yarıyıl verisi
BEGIN
    -- Tetikleyici hangi tablodan geldiyse doğru ID'yi yakala
    IF TG_TABLE_NAME = 'ogrenci' THEN v_ogrenci_id := NEW.ogrenci_id;
    ELSIF TG_TABLE_NAME = 'ogrenci_dersleri' THEN v_ogrenci_id := NEW.ogrenci_id;
    ELSIF TG_TABLE_NAME = 'tik_toplantilari' THEN v_ogrenci_id := NEW.ogrenci_id;
    ELSE v_ogrenci_id := NEW.ogrenci_id; 
    END IF;

    -- Öğrenci Temel Bilgilerini Çek
    SELECT * INTO rec_ogrenci FROM public.ogrenci WHERE ogrenci_id = v_ogrenci_id;
    
    -- Gerçek Yarıyıl Bilgisini Çek (Tahmin Yok!)
    SELECT mevcut_yariyil INTO v_mevcut_yariyil 
    FROM public.ogrenci_akademik_durum WHERE ogrenci_id = v_ogrenci_id;
    
    -- Eğer veri yoksa varsayılan 1. dönem kabul et
    IF v_mevcut_yariyil IS NULL THEN v_mevcut_yariyil := 1; END IF;

    -- ============================================================
    -- KURAL 1: Akademik Başarı (GNO) Kontrolü
    -- ============================================================
    IF rec_ogrenci.gno < 2.50 THEN
        v_risk_skoru := v_risk_skoru + 20;
        v_faktorler := jsonb_insert(v_faktorler, '{akademik_basari}', to_jsonb('GNO Kritik Sınırın Altında (2.50)'::text));
    END IF;

    -- ============================================================
    -- KURAL 2: Başarısız Ders Sayısı (SİGORTALI SİSTEM)
    -- ============================================================
    SELECT COUNT(*) INTO v_basarisiz_ders FROM public.ogrenci_dersleri 
    WHERE ogrenci_id = v_ogrenci_id AND basarili_mi = false;
    
    IF v_basarisiz_ders > 0 THEN
        -- Her ders 5 puan ama TOPLAMDA 30 PUANI GEÇEMEZ (Sigorta)
        v_ders_puani := v_basarisiz_ders * 5;
        IF v_ders_puani > 30 THEN v_ders_puani := 30; END IF;
        
        v_risk_skoru := v_risk_skoru + v_ders_puani;
        -- JSON'a detaylı açıklama yazıyoruz
        v_faktorler := jsonb_insert(v_faktorler, '{ders_durumu}', to_jsonb(v_basarisiz_ders || ' adet başarısız ders'));
    END IF;

    -- ============================================================
    -- KURAL 3: TİK (Tez İzleme Komitesi) Durumu (EN KRİTİK)
    -- ============================================================
    SELECT COUNT(*) INTO v_tik_basarisiz FROM public.tik_toplantilari 
    WHERE ogrenci_id = v_ogrenci_id AND sonuc IN ('Basarisiz', 'Yetersiz');
    
    IF v_tik_basarisiz >= 1 THEN
        v_risk_skoru := v_risk_skoru + 30;
        v_faktorler := jsonb_insert(v_faktorler, '{tik_durumu}', to_jsonb('TİK Başarısızlığı Mevcut'::text));
    END IF;
    
    IF v_tik_basarisiz >= 2 THEN
        v_risk_skoru := 100; -- 2 başarısızlık direkt atılma sebebidir
        v_faktorler := jsonb_insert(v_faktorler, '{kritik_uyari}', to_jsonb('2 Kez TİK Başarısızlığı (Atılma Riski)'::text));
    END IF;

    -- ============================================================
    -- KURAL 4: Zaman Baskısı (Azami Süre Kontrolü)
    -- ============================================================
    SELECT COALESCE(maksimum_sure_yariyil, 8) INTO v_max_sure 
    FROM public.program_turleri WHERE program_turu_id = rec_ogrenci.program_turu_id;

    -- Eğer (Max Süre - Mevcut Süre) <= 0 ise süre dolmuştur.
    IF (v_max_sure - v_mevcut_yariyil) <= 0 THEN
        v_risk_skoru := v_risk_skoru + 30; 
        v_faktorler := jsonb_insert(v_faktorler, '{zaman_baskisi}', to_jsonb('Azami süre doldu'::text));
    ELSIF (v_max_sure - v_mevcut_yariyil) <= 1 THEN
        v_risk_skoru := v_risk_skoru + 15;
        v_faktorler := jsonb_insert(v_faktorler, '{zaman_baskisi}', to_jsonb('Azami süreye son 1 dönem'::text));
    END IF;

    -- ============================================================
    -- SONUÇLARI BAĞLA
    -- ============================================================
    -- Skor 100'ü geçemez
    IF v_risk_skoru > 100 THEN v_risk_skoru := 100; END IF;

    -- Seviyeyi Belirle
    IF v_risk_skoru < 30 THEN v_risk_seviyesi := 'Dusuk';
    ELSIF v_risk_skoru < 60 THEN v_risk_seviyesi := 'Orta';
    ELSIF v_risk_skoru < 80 THEN v_risk_seviyesi := 'Yuksek';
    ELSE v_risk_seviyesi := 'Kritik';
    END IF;

    -- Tabloyu Güncelle (Upsert)
    INSERT INTO public.ogrenci_risk_skorlari (ogrenci_id, risk_skoru, risk_seviyesi, risk_faktorleri, hesaplama_tarihi)
    VALUES (v_ogrenci_id, v_risk_skoru, v_risk_seviyesi, v_faktorler, now())
    ON CONFLICT (ogrenci_id) 
    DO UPDATE SET 
        risk_skoru = EXCLUDED.risk_skoru,
        risk_seviyesi = EXCLUDED.risk_seviyesi,
        risk_faktorleri = EXCLUDED.risk_faktorleri,
        hesaplama_tarihi = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. ADIM: Tetikleyicileri (Triggers) Tanımla
-- (Eğer daha önce tanımladıysanız hata vermemesi için önce siliyoruz)

DROP TRIGGER IF EXISTS trg_ogrenci_risk ON public.ogrenci;
CREATE TRIGGER trg_ogrenci_risk
AFTER UPDATE OF gno, durum_id ON public.ogrenci
FOR EACH ROW EXECUTE FUNCTION hesapla_ogrenci_riski_detayli();

DROP TRIGGER IF EXISTS trg_ders_risk ON public.ogrenci_dersleri;
CREATE TRIGGER trg_ders_risk
AFTER INSERT OR UPDATE OF basarili_mi, final_notu ON public.ogrenci_dersleri
FOR EACH ROW EXECUTE FUNCTION hesapla_ogrenci_riski_detayli();

DROP TRIGGER IF EXISTS trg_tik_risk ON public.tik_toplantilari;
CREATE TRIGGER trg_tik_risk
AFTER INSERT OR UPDATE OF sonuc ON public.tik_toplantilari
FOR EACH ROW EXECUTE FUNCTION hesapla_ogrenci_riski_detayli();