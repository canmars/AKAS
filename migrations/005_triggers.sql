-- Migration 005: Triggers
-- Kapsamlı trigger'lar: Akademik durum, durum geçiş, bildirim, risk analizi, TİK, tez önerisi, aktivite, milestone, danışman, soft delete

-- ============================================
-- UPDATED_AT OTOMATIK GUNCELLEME
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tüm tablolara updated_at trigger'ı ekle
DROP TRIGGER IF EXISTS trigger_updated_at_kullanicilar ON public.kullanicilar;
CREATE TRIGGER trigger_updated_at_kullanicilar
BEFORE UPDATE ON public.kullanicilar
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_akademik_personel ON public.akademik_personel;
CREATE TRIGGER trigger_updated_at_akademik_personel
BEFORE UPDATE ON public.akademik_personel
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_ogrenci ON public.ogrenci;
CREATE TRIGGER trigger_updated_at_ogrenci
BEFORE UPDATE ON public.ogrenci
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_program_turleri ON public.program_turleri;
CREATE TRIGGER trigger_updated_at_program_turleri
BEFORE UPDATE ON public.program_turleri
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_danisman_gecmisi ON public.danisman_gecmisi;
CREATE TRIGGER trigger_updated_at_danisman_gecmisi
BEFORE UPDATE ON public.danisman_gecmisi
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_akademik_milestone ON public.akademik_milestone;
CREATE TRIGGER trigger_updated_at_akademik_milestone
BEFORE UPDATE ON public.akademik_milestone
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_tik_toplantilari ON public.tik_toplantilari;
CREATE TRIGGER trigger_updated_at_tik_toplantilari
BEFORE UPDATE ON public.tik_toplantilari
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_tez_donem_kayitlari ON public.tez_donem_kayitlari;
CREATE TRIGGER trigger_updated_at_tez_donem_kayitlari
BEFORE UPDATE ON public.tez_donem_kayitlari
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_sistem_ayarlari ON public.sistem_ayarlari;
CREATE TRIGGER trigger_updated_at_sistem_ayarlari
BEFORE UPDATE ON public.sistem_ayarlari
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_ogrenci_dersleri ON public.ogrenci_dersleri;
CREATE TRIGGER trigger_updated_at_ogrenci_dersleri
BEFORE UPDATE ON public.ogrenci_dersleri
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_akademik_takvim ON public.akademik_takvim;
CREATE TRIGGER trigger_updated_at_akademik_takvim
BEFORE UPDATE ON public.akademik_takvim
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_ogrenci_akademik_durum ON public.ogrenci_akademik_durum;
CREATE TRIGGER trigger_updated_at_ogrenci_akademik_durum
BEFORE UPDATE ON public.ogrenci_akademik_durum
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_ogrenci_son_login ON public.ogrenci_son_login;
CREATE TRIGGER trigger_updated_at_ogrenci_son_login
BEFORE UPDATE ON public.ogrenci_son_login
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 1. AKADEMIK DURUM GUNCELLEME TRIGGER'LARI
-- ============================================

-- Öğrenci kayıt tarihi değiştiğinde akademik durumu güncelle
CREATE OR REPLACE FUNCTION update_ogrenci_akademik_durum()
RETURNS TRIGGER AS $$
BEGIN
  -- ogrenci_akademik_durum tablosunu güncelle veya oluştur
  INSERT INTO public.ogrenci_akademik_durum (ogrenci_id, guncelleme_tarihi)
  VALUES (NEW.ogrenci_id, CURRENT_TIMESTAMP)
  ON CONFLICT (ogrenci_id) 
  DO UPDATE SET guncelleme_tarihi = CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ogrenci_akademik_durum ON public.ogrenci;
CREATE TRIGGER trigger_update_ogrenci_akademik_durum
AFTER INSERT OR UPDATE OF kayit_tarihi ON public.ogrenci
FOR EACH ROW
EXECUTE FUNCTION update_ogrenci_akademik_durum();

-- ============================================
-- 2. DURUM GECIS TRIGGER'LARI
-- ============================================

-- Maksimum süre aşımında otomatik Pasif yap
CREATE OR REPLACE FUNCTION check_maximum_sure_asimi()
RETURNS TRIGGER AS $$
DECLARE
  v_program_kodu TEXT;
  v_maksimum_yariyil INT;
  v_mevcut_yariyil INT;
  v_pasif_durum_id UUID;
BEGIN
  -- Program türünü al
  SELECT pt.program_kodu, pt.maksimum_sure_yariyil
  INTO v_program_kodu, v_maksimum_yariyil
  FROM public.program_turleri pt
  WHERE pt.program_turu_id = NEW.program_turu_id;
  
  -- Mevcut yarıyılı hesapla (view'den alınacak, şimdilik calculate_yariyil kullan)
  SELECT calculate_yariyil(NEW.kayit_tarihi, CURRENT_DATE)
  INTO v_mevcut_yariyil;
  
  -- Maksimum süre kontrolü
  IF v_mevcut_yariyil > v_maksimum_yariyil THEN
    -- Pasif durum ID'sini al
    SELECT durum_id INTO v_pasif_durum_id
    FROM public.durum_turleri
    WHERE durum_kodu = 'Pasif';
    
    -- Durumu Pasif yap
    NEW.durum_id := v_pasif_durum_id;
    
    -- Durum geçmişine kaydet
    INSERT INTO public.ogrenci_durum_gecmisi (
      ogrenci_id,
      eski_durum_id,
      yeni_durum_id,
      degisiklik_nedeni,
      otomatik_mi
    ) VALUES (
      NEW.ogrenci_id,
      OLD.durum_id,
      NEW.durum_id,
      format('Maksimum süre aşıldı: %s yarıyıl / %s yarıyıl', 
             v_mevcut_yariyil, v_maksimum_yariyil),
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_maximum_sure_asimi ON public.ogrenci;
CREATE TRIGGER trigger_check_maximum_sure_asimi
BEFORE UPDATE OF kayit_tarihi, durum_id ON public.ogrenci
FOR EACH ROW
EXECUTE FUNCTION check_maximum_sure_asimi();

-- Tüm durum değişikliklerini logla
CREATE OR REPLACE FUNCTION log_durum_gecmisi()
RETURNS TRIGGER AS $$
BEGIN
  -- Durum değişikliği varsa logla
  IF OLD.durum_id IS DISTINCT FROM NEW.durum_id THEN
    INSERT INTO public.ogrenci_durum_gecmisi (
      ogrenci_id,
      eski_durum_id,
      yeni_durum_id,
      degisiklik_nedeni,
      degistiren_kullanici_id,
      otomatik_mi
    ) VALUES (
      NEW.ogrenci_id,
      OLD.durum_id,
      NEW.durum_id,
      COALESCE(
        (SELECT degisiklik_nedeni FROM public.ogrenci_durum_gecmisi 
         WHERE ogrenci_id = NEW.ogrenci_id 
         ORDER BY degisiklik_tarihi DESC LIMIT 1),
        'Durum değişikliği'
      ),
      auth.uid(),
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_durum_gecmisi ON public.ogrenci;
CREATE TRIGGER trigger_log_durum_gecmisi
AFTER UPDATE OF durum_id ON public.ogrenci
FOR EACH ROW
WHEN (OLD.durum_id IS DISTINCT FROM NEW.durum_id)
EXECUTE FUNCTION log_durum_gecmisi();

-- ============================================
-- 3. BILDIRIM OLUSTURMA TRIGGER'LARI
-- ============================================

-- Helper function: Rollere göre bildirim oluştur
CREATE OR REPLACE FUNCTION create_bildirim_for_roles(
  p_bildirim_turu_kodu TEXT,
  p_ogrenci_id UUID,
  p_mesaj TEXT,
  p_oncelik TEXT DEFAULT 'Orta'
)
RETURNS void AS $$
DECLARE
  v_bildirim_turu_id UUID;
  v_alici_roller TEXT[];
  v_danisman_id UUID;
  v_bolum_baskani_id UUID;
  v_kullanici_id UUID;
BEGIN
  -- Bildirim türü ID'sini al
  SELECT bildirim_turu_id, varsayilan_alici_roller, varsayilan_oncelik
  INTO v_bildirim_turu_id, v_alici_roller, p_oncelik
  FROM public.bildirim_turleri
  WHERE bildirim_turu_kodu = p_bildirim_turu_kodu;
  
  IF v_bildirim_turu_id IS NULL THEN
    RAISE EXCEPTION 'Bildirim türü bulunamadı: %', p_bildirim_turu_kodu;
  END IF;
  
  -- Danışman bildirimi
  IF 'Danisman' = ANY(v_alici_roller) THEN
    SELECT dg.danisman_id INTO v_danisman_id
    FROM public.danisman_gecmisi dg
    WHERE dg.ogrenci_id = p_ogrenci_id
    AND dg.aktif_mi = true
    LIMIT 1;
    
    IF v_danisman_id IS NOT NULL THEN
      SELECT k.kullanici_id INTO v_kullanici_id
      FROM public.akademik_personel ap
      JOIN public.kullanicilar k ON ap.personel_id = k.akademik_personel_id
      WHERE ap.personel_id = v_danisman_id
      LIMIT 1;
      
      IF v_kullanici_id IS NOT NULL THEN
        INSERT INTO public.bildirimler (
          bildirim_turu_id,
          ogrenci_id,
          alici_kullanici_id,
          alici_rol,
          mesaj,
          bildirim_onceligi,
          bildirim_durumu
        ) VALUES (
          v_bildirim_turu_id,
          p_ogrenci_id,
          v_kullanici_id,
          'Danisman',
          p_mesaj,
          p_oncelik,
          'Olusturuldu'
        );
      END IF;
    END IF;
  END IF;
  
  -- Bölüm Başkanı bildirimi
  IF 'Bolum_Baskani' = ANY(v_alici_roller) THEN
    SELECT k.kullanici_id INTO v_bolum_baskani_id
    FROM public.kullanicilar k
    WHERE k.rol = 'Bolum_Baskani'
    AND k.aktif_mi = true
    LIMIT 1;
    
    IF v_bolum_baskani_id IS NOT NULL THEN
      INSERT INTO public.bildirimler (
        bildirim_turu_id,
        ogrenci_id,
        alici_kullanici_id,
        alici_rol,
        mesaj,
        bildirim_onceligi,
        bildirim_durumu
      ) VALUES (
        v_bildirim_turu_id,
        p_ogrenci_id,
        v_bolum_baskani_id,
        'Bolum_Baskani',
        p_mesaj,
        p_oncelik,
        'Olusturuldu'
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Risk skoru 70+ olduğunda bildirim oluştur
CREATE OR REPLACE FUNCTION create_risk_bildirim()
RETURNS TRIGGER AS $$
DECLARE
  v_ogrenci_id UUID;
  v_risk_skoru INT;
  v_risk_seviyesi TEXT;
  v_ogrenci_adi TEXT;
  v_mesaj TEXT;
  v_oncelik TEXT;
BEGIN
  v_ogrenci_id := NEW.ogrenci_id;
  v_risk_skoru := NEW.risk_skoru;
  v_risk_seviyesi := NEW.risk_seviyesi;
  
  -- Risk skoru 70+ ise bildirim oluştur
  IF v_risk_skoru >= 70 THEN
    -- Öğrenci adını al
    SELECT o.ad || ' ' || o.soyad INTO v_ogrenci_adi
    FROM public.ogrenci o
    WHERE o.ogrenci_id = v_ogrenci_id;
    
    -- Öncelik belirleme
    IF v_risk_skoru >= 85 THEN
      v_oncelik := 'Kritik';
    ELSE
      v_oncelik := 'Yuksek';
    END IF;
    
    -- Mesaj oluştur
    v_mesaj := format('%s için yüksek risk tespit edildi. Risk Skoru: %s (%s).', 
                      v_ogrenci_adi, v_risk_skoru, v_risk_seviyesi);
    
    -- Bildirim oluştur
    PERFORM create_bildirim_for_roles(
      'Risk_Uyari',
      v_ogrenci_id,
      v_mesaj,
      v_oncelik
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_risk_bildirim ON public.ogrenci_risk_analizi;
CREATE TRIGGER trigger_create_risk_bildirim
AFTER INSERT OR UPDATE OF risk_skoru ON public.ogrenci_risk_analizi
FOR EACH ROW
WHEN (NEW.risk_skoru >= 70)
EXECUTE FUNCTION create_risk_bildirim();

-- Hayalet öğrenci tespit edildiğinde bildirim oluştur
CREATE OR REPLACE FUNCTION create_hayalet_ogrenci_bildirim()
RETURNS TRIGGER AS $$
DECLARE
  v_ogrenci_id UUID;
  v_son_login TIMESTAMP WITH TIME ZONE;
  v_ogrenci_adi TEXT;
  v_mesaj TEXT;
BEGIN
  v_ogrenci_id := NEW.ogrenci_id;
  v_son_login := NEW.son_login;
  
  -- 6+ ay login yoksa bildirim oluştur
  IF v_son_login IS NULL OR v_son_login < CURRENT_DATE - INTERVAL '6 months' THEN
    -- Öğrenci adını al
    SELECT o.ad || ' ' || o.soyad INTO v_ogrenci_adi
    FROM public.ogrenci o
    WHERE o.ogrenci_id = v_ogrenci_id;
    
    -- Mesaj oluştur
    v_mesaj := format('%s son 6 aydır sisteme giriş yapmamıştır (Hayalet Öğrenci). Son giriş: %s. İstatistiklerden çıkarılması önerilir.',
                      v_ogrenci_adi, 
                      COALESCE(v_son_login::TEXT, 'Hiç giriş yapılmamış'));
    
    -- Bildirim oluştur
    PERFORM create_bildirim_for_roles(
      'Hayalet_Ogrenci',
      v_ogrenci_id,
      v_mesaj,
      'Kritik'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_hayalet_ogrenci_bildirim ON public.ogrenci_son_login;
CREATE TRIGGER trigger_create_hayalet_ogrenci_bildirim
AFTER INSERT OR UPDATE OF son_login ON public.ogrenci_son_login
FOR EACH ROW
EXECUTE FUNCTION create_hayalet_ogrenci_bildirim();

-- ============================================
-- 4. RISK ANALIZI TRIGGER'LARI
-- ============================================

-- Öğrenci verisi değiştiğinde risk skorunu otomatik hesapla
CREATE OR REPLACE FUNCTION auto_calculate_risk_skoru()
RETURNS TRIGGER AS $$
DECLARE
  v_risk_skoru INT;
BEGIN
  -- Risk skorunu hesapla (function 006'da tanımlı olacak)
  SELECT hesapla_risk_skoru(NEW.ogrenci_id) INTO v_risk_skoru;
  
  -- Risk analizi tablosuna kaydet
  INSERT INTO public.ogrenci_risk_analizi (
    ogrenci_id,
    risk_skoru,
    risk_seviyesi,
    tehlike_turu,
    hayalet_ogrenci_mi,
    hesaplama_tarihi
  )
  SELECT 
    NEW.ogrenci_id,
    v_risk_skoru,
    CASE 
      WHEN v_risk_skoru >= 85 THEN 'Kritik'
      WHEN v_risk_skoru >= 70 THEN 'Yuksek'
      WHEN v_risk_skoru >= 40 THEN 'Orta'
      ELSE 'Dusuk'
    END,
    'Genel',
    COALESCE(
      (SELECT son_login < CURRENT_DATE - INTERVAL '6 months' 
       FROM public.ogrenci_son_login 
       WHERE ogrenci_id = NEW.ogrenci_id),
      false
    ),
    CURRENT_TIMESTAMP
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TIK TOPLANTI TRIGGER'LARI
-- ============================================

-- TİK toplantısı 1 ay öncesinde bildirim oluştur
CREATE OR REPLACE FUNCTION create_tik_uyari()
RETURNS TRIGGER AS $$
DECLARE
  v_ogrenci_adi TEXT;
  v_mesaj TEXT;
BEGIN
  -- Toplantı tarihi 1 ay içindeyse ve uyarı gönderilmemişse
  IF NEW.toplanti_tarihi BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '1 month')
     AND NOT NEW.uyari_gonderildi_mi THEN
    
    -- Öğrenci adını al
    SELECT o.ad || ' ' || o.soyad INTO v_ogrenci_adi
    FROM public.ogrenci o
    WHERE o.ogrenci_id = NEW.ogrenci_id;
    
    -- Mesaj oluştur
    v_mesaj := format('%s için TİK toplantısı %s tarihinde yapılacak. Lütfen toplantıya katılım sağlayın ve raporunuzu hazırlayın.',
                      v_ogrenci_adi, NEW.toplanti_tarihi);
    
    -- Bildirim oluştur
    PERFORM create_bildirim_for_roles(
      'TIK_Uyari',
      NEW.ogrenci_id,
      v_mesaj,
      'Yuksek'
    );
    
    -- Uyarı gönderildi olarak işaretle
    NEW.uyari_gonderildi_mi := true;
    NEW.uyari_tarihi := CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_tik_uyari ON public.tik_toplantilari;
CREATE TRIGGER trigger_create_tik_uyari
BEFORE INSERT OR UPDATE OF toplanti_tarihi ON public.tik_toplantilari
FOR EACH ROW
EXECUTE FUNCTION create_tik_uyari();

-- ============================================
-- 6. AKTIVITE LOGGING TRIGGER'LARI
-- ============================================

-- Öğrenci login olduğunda son login'i güncelle
CREATE OR REPLACE FUNCTION update_ogrenci_son_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Login aktivitesi ise
  IF NEW.aktivite_turu = 'Login' AND NEW.ogrenci_id IS NOT NULL THEN
    INSERT INTO public.ogrenci_son_login (
      ogrenci_id,
      son_login,
      son_login_ip,
      son_login_user_agent,
      guncelleme_tarihi
    )
    VALUES (
      NEW.ogrenci_id,
      NEW.aktivite_tarihi,
      NEW.ip_adresi,
      NEW.user_agent,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (ogrenci_id) 
    DO UPDATE SET 
      son_login = NEW.aktivite_tarihi,
      son_login_ip = NEW.ip_adresi,
      son_login_user_agent = NEW.user_agent,
      guncelleme_tarihi = CURRENT_TIMESTAMP;
    
    -- ogrenci tablosundaki son_login'i de güncelle (performans için denormalize edildi)
    UPDATE public.ogrenci
    SET son_login = NEW.aktivite_tarihi
    WHERE ogrenci_id = NEW.ogrenci_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ogrenci_son_login ON public.kullanici_aktiviteleri;
CREATE TRIGGER trigger_update_ogrenci_son_login
AFTER INSERT ON public.kullanici_aktiviteleri
FOR EACH ROW
WHEN (NEW.aktivite_turu = 'Login' AND NEW.ogrenci_id IS NOT NULL)
EXECUTE FUNCTION update_ogrenci_son_login();

-- ============================================
-- 7. AKADEMIK MILESTONE TRIGGER'LARI
-- ============================================

-- Milestone tamamlandığında akademik durumu güncelle
CREATE OR REPLACE FUNCTION update_akademik_durum_on_milestone()
RETURNS TRIGGER AS $$
BEGIN
  -- Milestone tamamlandıysa
  IF NEW.durum = 'Tamamlandi' AND OLD.durum != 'Tamamlandi' THEN
    -- Akademik durumu güncelle
    UPDATE public.ogrenci_akademik_durum
    SET 
      mevcut_asinama = CASE NEW.milestone_turu
        WHEN 'Yeterlik_Sinavi' THEN 'Tez_Onersi'
        WHEN 'Tez_Onersi' THEN 'TIK'
        WHEN 'Tez_Savunmasi' THEN 'Tamamlandi'
        WHEN 'Donem_Projesi' THEN 'Tamamlandi'
        ELSE mevcut_asinama
      END,
      guncelleme_tarihi = CURRENT_TIMESTAMP
    WHERE ogrenci_id = NEW.ogrenci_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_akademik_durum_on_milestone ON public.akademik_milestone;
CREATE TRIGGER trigger_update_akademik_durum_on_milestone
AFTER UPDATE OF durum ON public.akademik_milestone
FOR EACH ROW
WHEN (NEW.durum = 'Tamamlandi' AND OLD.durum != 'Tamamlandi')
EXECUTE FUNCTION update_akademik_durum_on_milestone();

-- ============================================
-- 8. DANISMAN ATAMA TRIGGER'LARI
-- ============================================

-- Danışman değişikliklerini logla
CREATE OR REPLACE FUNCTION log_danisman_degisikligi()
RETURNS TRIGGER AS $$
BEGIN
  -- Danışman değişikliği varsa logla (danisman_gecmisi tablosunda zaten kayıt var)
  -- Bu trigger sadece ek işlemler için kullanılabilir
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. SOFT DELETE TRIGGER'LARI
-- ============================================

-- Öğrenci silindiğinde soft delete yap
CREATE OR REPLACE FUNCTION soft_delete_ogrenci()
RETURNS TRIGGER AS $$
BEGIN
  -- Soft delete işaretle
  NEW.soft_delete := true;
  NEW.deleted_at := CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION update_updated_at IS 'Tüm tablolarda updated_at alanını otomatik günceller';
COMMENT ON FUNCTION update_ogrenci_akademik_durum IS 'Öğrenci kayıt tarihi değiştiğinde akademik durumu günceller';
COMMENT ON FUNCTION check_maximum_sure_asimi IS 'Maksimum süre aşımında otomatik Pasif yapar';
COMMENT ON FUNCTION log_durum_gecmisi IS 'Tüm durum değişikliklerini loglar';
COMMENT ON FUNCTION create_bildirim_for_roles IS 'Rollere göre bildirim oluşturur (helper function)';
COMMENT ON FUNCTION create_risk_bildirim IS 'Risk skoru 70+ olduğunda bildirim oluşturur';
COMMENT ON FUNCTION create_hayalet_ogrenci_bildirim IS 'Hayalet öğrenci tespit edildiğinde bildirim oluşturur';
COMMENT ON FUNCTION auto_calculate_risk_skoru IS 'Öğrenci verisi değiştiğinde risk skorunu otomatik hesaplar';
COMMENT ON FUNCTION create_tik_uyari IS 'TİK toplantısı 1 ay öncesinde bildirim oluşturur';
COMMENT ON FUNCTION update_ogrenci_son_login IS 'Öğrenci login olduğunda son login''i günceller (ogrenci_son_login ve ogrenci tablolarını günceller)';
COMMENT ON FUNCTION update_akademik_durum_on_milestone IS 'Milestone tamamlandığında akademik durumu günceller';

-- ============================================
-- KAPASİTE YÖNETİMİ: CHECK CAPACITY TRIGGER
-- Unvan bazlı sert ve yumuşak limit kontrolü
-- ============================================
CREATE OR REPLACE FUNCTION check_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_danisman_record RECORD;
  v_mevcut_ogrenci_sayisi INT;
  v_sert_limit INT;
  v_yumusak_limit INT;
  v_unvan TEXT;
BEGIN
  -- Sadece danisman_id değiştiğinde veya yeni kayıt eklendiğinde kontrol et
  IF NEW.danisman_id IS NULL THEN
    RETURN NEW; -- Danışman yoksa kontrol yapma
  END IF;

  -- Danışman bilgilerini al
  SELECT 
    personel_id,
    unvan,
    COALESCE(sert_limit, 
      CASE unvan
        WHEN 'Prof. Dr.' THEN 15
        WHEN 'Doç. Dr.' THEN 12
        WHEN 'Dr. Öğr. Üyesi' THEN 10
        WHEN 'Araş. Gör.' THEN 5
        WHEN 'Araş. Gör. Dr.' THEN 5
        ELSE 10
      END
    ) as sert_limit,
    COALESCE(yumusak_limit,
      CASE unvan
        WHEN 'Prof. Dr.' THEN 12
        WHEN 'Doç. Dr.' THEN 10
        WHEN 'Dr. Öğr. Üyesi' THEN 8
        WHEN 'Araş. Gör.' THEN 4
        WHEN 'Araş. Gör. Dr.' THEN 4
        ELSE 8
      END
    ) as yumusak_limit
  INTO v_danisman_record
  FROM public.akademik_personel
  WHERE personel_id = NEW.danisman_id
  AND aktif_mi = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Danışman bulunamadı veya aktif değil: %', NEW.danisman_id;
  END IF;

  v_sert_limit := v_danisman_record.sert_limit;
  v_yumusak_limit := v_danisman_record.yumusak_limit;
  v_unvan := v_danisman_record.unvan;

  -- Mevcut öğrenci sayısını hesapla (Aktif + Dondurmuş, Pasif hariç)
  SELECT COUNT(*) INTO v_mevcut_ogrenci_sayisi
  FROM public.ogrenci o
  JOIN public.durum_turleri dt ON o.durum_id = dt.durum_id
  WHERE o.danisman_id = NEW.danisman_id
  AND o.soft_delete = false
  AND o.ogrenci_id != COALESCE(NEW.ogrenci_id, '00000000-0000-0000-0000-000000000000'::UUID) -- Yeni kayıt veya güncelleme hariç
  AND dt.durum_kodu IN ('Aktif', 'Dondurdu'); -- Sadece aktif ve dondurmuş öğrenciler

  -- Yeni kayıt eklendiğinde sayıya 1 ekle
  IF TG_OP = 'INSERT' THEN
    v_mevcut_ogrenci_sayisi := v_mevcut_ogrenci_sayisi + 1;
  ELSIF TG_OP = 'UPDATE' AND OLD.danisman_id != NEW.danisman_id THEN
    -- Danışman değiştiyse, yeni danışmanın sayısına 1 ekle
    v_mevcut_ogrenci_sayisi := v_mevcut_ogrenci_sayisi + 1;
  END IF;

  -- Sert limit kontrolü (aşılamaz)
  IF v_mevcut_ogrenci_sayisi > v_sert_limit THEN
    RAISE EXCEPTION 'Kapasite aşıldı! % unvanlı danışmanın sert limiti (%) aşıldı. Mevcut öğrenci sayısı: %, Sert limit: %', 
      v_unvan, v_sert_limit, v_mevcut_ogrenci_sayisi, v_sert_limit;
  END IF;

  -- Yumuşak limit kontrolü (uyarı verilir)
  IF v_mevcut_ogrenci_sayisi > v_yumusak_limit THEN
    -- Uyarı bildirimi oluştur
    PERFORM create_bildirim_for_roles(
      ARRAY['Bolum_Baskani', 'Admin'],
      'Kapasite_Uyari',
      format('%s unvanlı danışmanın yumuşak limiti (%) aşıldı. Mevcut öğrenci sayısı: %, Yumuşak limit: %. Lütfen yeni atamaları gözden geçirin.', 
        v_unvan, v_yumusak_limit, v_mevcut_ogrenci_sayisi, v_yumusak_limit),
      'Yuksek'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: ogrenci tablosuna danisman_id atandığında/güncellendiğinde kapasite kontrolü
DROP TRIGGER IF EXISTS trigger_check_capacity ON public.ogrenci;
CREATE TRIGGER trigger_check_capacity
BEFORE INSERT OR UPDATE OF danisman_id ON public.ogrenci
FOR EACH ROW
WHEN (NEW.danisman_id IS NOT NULL)
EXECUTE FUNCTION check_capacity();

COMMENT ON FUNCTION check_capacity IS 'Unvan bazlı sert ve yumuşak limit kontrolü - Kapasite yönetimi';

-- ============================================
-- SEMİNER DARBOGAZ KONTROLÜ TRIGGER
-- ogrenci_dersleri tablosuna ders eklendiğinde/güncellendiğinde Seminer darbogaz kontrolü
-- ============================================
CREATE OR REPLACE FUNCTION check_seminer_darbogaz()
RETURNS TRIGGER AS $$
DECLARE
  v_seminer_darbogaz_record RECORD;
  v_bildirim_mesaji TEXT;
BEGIN
  -- Seminer dersi eklendiğinde veya güncellendiğinde kontrol et
  IF EXISTS (
    SELECT 1
    FROM public.dersler dk
    WHERE dk.ders_kodu = NEW.ders_kodu
    AND dk.ders_turu = 'Seminer'
  ) THEN
    -- Seminer darbogaz kontrolü yap
    SELECT * INTO v_seminer_darbogaz_record
    FROM public.ogrenci_seminer_darbogaz_view
    WHERE ogrenci_id = NEW.ogrenci_id;
    
    IF FOUND THEN
      -- ACİL_EYLEM statüsü varsa bildirim oluştur
      IF v_seminer_darbogaz_record.acil_eylem_mi = true THEN
        v_bildirim_mesaji := format('%s %s öğrencisi 4. yarıyılda ve Seminer dersi ''B'' notu ile tamamlanmamış. ACİL EYLEM GEREKLİ!', 
          v_seminer_darbogaz_record.ad, v_seminer_darbogaz_record.soyad);
        
        PERFORM create_bildirim_for_roles(
          ARRAY['Bolum_Baskani', 'Danisman'],
          'Seminer_Darbogaz',
          v_bildirim_mesaji,
          'Kritik'
        );
      ELSIF v_seminer_darbogaz_record.kritik_darbogaz_mi = true THEN
        v_bildirim_mesaji := format('%s %s öğrencisi için Seminer darbogaz tespit edildi. Durum: %s', 
          v_seminer_darbogaz_record.ad, v_seminer_darbogaz_record.soyad, v_seminer_darbogaz_record.seminer_durumu);
        
        PERFORM create_bildirim_for_roles(
          ARRAY['Bolum_Baskani', 'Danisman'],
          'Seminer_Darbogaz',
          v_bildirim_mesaji,
          'Yuksek'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: ogrenci_dersleri tablosuna ders eklendiğinde/güncellendiğinde Seminer darbogaz kontrolü
DROP TRIGGER IF EXISTS trigger_check_seminer_darbogaz ON public.ogrenci_dersleri;
CREATE TRIGGER trigger_check_seminer_darbogaz
AFTER INSERT OR UPDATE OF not_kodu ON public.ogrenci_dersleri
FOR EACH ROW
EXECUTE FUNCTION check_seminer_darbogaz();

COMMENT ON FUNCTION check_seminer_darbogaz IS 'Seminer darbogaz kontrolü - ACİL_EYLEM statüsü ile bildirim oluşturur';
