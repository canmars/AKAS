-- Migration 024: Business Logic Triggers (Plan Faz 2.4)
-- İş mantığı trigger'ları: TİK takvimi, tez önerisi başarısız durum, vb.

-- ============================================
-- TİK TAKVİMİ OLUŞTURMA FONKSİYONLARI
-- ============================================

-- TİK Toplantı Tarihi Hesaplama (07_TIK_TOPLANTI_TAKVIMI.md'ye göre)
CREATE OR REPLACE FUNCTION hesapla_tik_toplanti_tarihi(
  p_tez_onersi_onay_tarihi DATE,
  p_topanti_sirasi INT
)
RETURNS DATE AS $$
DECLARE
  v_ilk_topanti_tarihi DATE;
  v_topanti_tarihi DATE;
BEGIN
  -- İlk toplantı tarihi: Tez önerisi onay tarihinden 6 ay sonra
  v_ilk_topanti_tarihi := p_tez_onersi_onay_tarihi + INTERVAL '6 months';
  
  -- Toplantı sırasına göre tarih hesapla
  -- 1. toplantı: +0 ay, 2. toplantı: +6 ay, 3. toplantı: +12 ay, vb.
  v_topanti_tarihi := v_ilk_topanti_tarihi + ((p_topanti_sirasi - 1) * INTERVAL '6 months');
  
  RETURN v_topanti_tarihi;
END;
$$ LANGUAGE plpgsql;

-- TİK Takvimi Oluşturma
CREATE OR REPLACE FUNCTION olustur_tik_takvimi(
  p_ogrenci_id UUID,
  p_tez_onersi_onay_tarihi DATE,
  p_topanti_sayisi INT DEFAULT 10 -- 5 yıl için 10 toplantı
)
RETURNS void AS $$
DECLARE
  v_topanti_sirasi INT;
  v_topanti_tarihi DATE;
BEGIN
  -- Mevcut toplantıları kontrol et
  IF EXISTS (
    SELECT 1 FROM public.tik_toplantilari
    WHERE ogrenci_id = p_ogrenci_id
  ) THEN
    -- Zaten takvim oluşturulmuş, hata verme, sadece return
    RETURN;
  END IF;
  
  -- Her toplantı için tarih hesapla ve kaydet
  FOR v_topanti_sirasi IN 1..p_topanti_sayisi LOOP
    v_topanti_tarihi := hesapla_tik_toplanti_tarihi(
      p_tez_onersi_onay_tarihi,
      v_topanti_sirasi
    );
    
    -- Toplantıyı kaydet
    INSERT INTO public.tik_toplantilari (
      ogrenci_id,
      toplanti_tarihi,
      katilim_durumu,
      rapor_verildi_mi,
      uyari_gonderildi_mi
    ) VALUES (
      p_ogrenci_id,
      v_topanti_tarihi,
      NULL, -- Henüz gerçekleşmedi
      false,
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Tez Önerisi Onaylandığında TİK Takvimi Oluşturma Trigger'ı
CREATE OR REPLACE FUNCTION create_tik_calendar_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_tez_onersi_onay_tarihi DATE;
BEGIN
  -- Sadece tez önerisi milestone'ları için çalış
  IF NEW.milestone_turu = 'Tez_Onersi' AND NEW.savunma_sonucu = 'Onaylandi' THEN
    -- Tez önerisi onay tarihini al
    v_tez_onersi_onay_tarihi := COALESCE(NEW.gerceklesme_tarihi, CURRENT_DATE);
    
    -- TİK takvimini oluştur
    PERFORM olustur_tik_takvimi(
      NEW.ogrenci_id,
      v_tez_onersi_onay_tarihi
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_tik_calendar ON public.akademik_milestone;
CREATE TRIGGER trigger_create_tik_calendar
AFTER UPDATE ON public.akademik_milestone
FOR EACH ROW
WHEN (NEW.milestone_turu = 'Tez_Onersi' AND NEW.savunma_sonucu = 'Onaylandi' AND (OLD.savunma_sonucu IS NULL OR OLD.savunma_sonucu != 'Onaylandi'))
EXECUTE FUNCTION create_tik_calendar_on_approval();

-- ============================================
-- TEZ ÖNERİSİ BAŞARISIZ DURUM FONKSİYONLARI
-- ============================================

-- Ek Süre Hesaplama (05_TEZ_ONERISI_BASARISIZ_DURUM.md'ye göre)
CREATE OR REPLACE FUNCTION hesapla_tez_onersi_ek_sure(
  p_ogrenci_id UUID,
  p_savunma_sonucu TEXT
)
RETURNS INT AS $$
DECLARE
  v_ek_sure_ay INT := 0;
BEGIN
  -- Savunma sonucuna göre ek süre hesapla
  CASE p_savunma_sonucu
    WHEN 'Revizyon_Gerekli' THEN
      v_ek_sure_ay := 3;
    WHEN 'Red' THEN
      v_ek_sure_ay := 6;
    WHEN 'Onaylandi' THEN
      v_ek_sure_ay := 0;
    ELSE
      v_ek_sure_ay := 0;
  END CASE;
  
  RETURN v_ek_sure_ay;
END;
$$ LANGUAGE plpgsql;

-- Yeni Hedef Tarih Hesaplama
CREATE OR REPLACE FUNCTION hesapla_yeni_hedef_tarih(
  p_ilk_savunma_tarihi DATE,
  p_savunma_sonucu TEXT
)
RETURNS DATE AS $$
DECLARE
  v_ek_sure_ay INT;
  v_yeni_hedef_tarih DATE;
BEGIN
  -- Ek süreyi hesapla
  v_ek_sure_ay := hesapla_tez_onersi_ek_sure(NULL::UUID, p_savunma_sonucu);
  
  -- Yeni hedef tarihi hesapla
  IF v_ek_sure_ay > 0 THEN
    v_yeni_hedef_tarih := p_ilk_savunma_tarihi + (v_ek_sure_ay || ' months')::INTERVAL;
  ELSE
    v_yeni_hedef_tarih := NULL;
  END IF;
  
  RETURN v_yeni_hedef_tarih;
END;
$$ LANGUAGE plpgsql;

-- Tez Önerisi Milestone Güncelleme Trigger'ı
CREATE OR REPLACE FUNCTION update_tez_onersi_milestone()
RETURNS TRIGGER AS $$
DECLARE
  v_ek_sure_ay INT;
  v_yeni_hedef_tarih DATE;
BEGIN
  -- Sadece tez önerisi milestone'ları için çalış
  IF NEW.milestone_turu = 'Tez_Onersi' THEN
    -- Savunma sonucu değiştiyse
    IF NEW.savunma_sonucu IS NOT NULL AND 
       (OLD.savunma_sonucu IS NULL OR OLD.savunma_sonucu != NEW.savunma_sonucu) THEN
      
      -- Ek süreyi hesapla
      v_ek_sure_ay := hesapla_tez_onersi_ek_sure(NEW.ogrenci_id, NEW.savunma_sonucu);
      
      -- Yeni hedef tarihi hesapla
      IF NEW.gerceklesme_tarihi IS NOT NULL THEN
        v_yeni_hedef_tarih := hesapla_yeni_hedef_tarih(NEW.gerceklesme_tarihi, NEW.savunma_sonucu);
      END IF;
      
      -- Milestone'u güncelle
      NEW.ek_sure_ay := v_ek_sure_ay;
      NEW.yeni_hedef_tarih := v_yeni_hedef_tarih;
      
      -- Durumu güncelle
      IF NEW.savunma_sonucu = 'Onaylandi' THEN
        NEW.durum := 'Tamamlandi';
      ELSIF NEW.savunma_sonucu IN ('Revizyon_Gerekli', 'Red') THEN
        NEW.durum := 'Beklemede';
        -- Yeni hedef tarih varsa güncelle
        IF v_yeni_hedef_tarih IS NOT NULL THEN
          NEW.hedef_tarih := v_yeni_hedef_tarih;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tez_onersi_milestone ON public.akademik_milestone;
CREATE TRIGGER trigger_update_tez_onersi_milestone
BEFORE UPDATE ON public.akademik_milestone
FOR EACH ROW
WHEN (NEW.milestone_turu = 'Tez_Onersi' AND NEW.savunma_sonucu IS NOT NULL)
EXECUTE FUNCTION update_tez_onersi_milestone();

-- ============================================
-- DERS TAMAMLAMA KONTROLÜ
-- ============================================

-- Ders Tamamlama Süresi Kontrolü (Tezli YL: 4 yarıyıl)
CREATE OR REPLACE FUNCTION check_ders_tamamlama()
RETURNS TRIGGER AS $$
DECLARE
  v_mevcut_yariyil INT;
  v_program_kodu TEXT;
  v_kayit_tarihi DATE;
BEGIN
  -- Öğrenci bilgilerini al
  SELECT o.kayit_tarihi, pt.program_kodu
  INTO v_kayit_tarihi, v_program_kodu
  FROM public.ogrenci o
  JOIN public.program_turleri pt ON o.program_turu_id = pt.program_turu_id
  WHERE o.ogrenci_id = NEW.ogrenci_id;
  
  -- Sadece Tezli YL için kontrol et
  IF v_program_kodu = 'Tezli_YL' THEN
    -- Mevcut yarıyılı hesapla
    v_mevcut_yariyil := public.calculate_yariyil(v_kayit_tarihi, CURRENT_DATE::DATE);
    
    -- 4 yarıyıl geçmiş ve dersler tamamlanmamışsa uyarı
    IF v_mevcut_yariyil >= 4 AND NOT EXISTS (
      SELECT 1 FROM public.ogrenci_akademik_durum
      WHERE ogrenci_id = NEW.ogrenci_id
        AND ders_tamamlandi_mi = true
    ) THEN
      -- Bildirim oluştur (opsiyonel)
      -- PERFORM create_bildirim_for_roles(...);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONDURMA SÜRESİ KONTROLÜ
-- ============================================

-- Dondurma Süresi Kontrolü (06_OGRENCI_DURUM_GECIS_KURALLARI.md'ye göre)
CREATE OR REPLACE FUNCTION check_dondurma_suresi()
RETURNS TRIGGER AS $$
DECLARE
  v_dondurma_tarihi DATE;
  v_gecen_ay INT;
BEGIN
  -- Sadece durum değişikliği kontrolü
  IF NEW.durum_id != OLD.durum_id THEN
    -- Dondurma durumuna geçildiyse
    IF EXISTS (
      SELECT 1 FROM public.durum_turleri
      WHERE durum_id = NEW.durum_id
        AND durum_kodu = 'Dondurdu'
    ) THEN
      -- Dondurma tarihini kaydet (durum geçmişinden alınabilir)
      -- Burada sadece kontrol yapılır, otomatik işlem yok
      -- Maksimum dondurma süresi kontrolü yapılabilir
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION hesapla_tik_toplanti_tarihi IS 'TİK toplantı tarihi hesaplama (07_TIK_TOPLANTI_TAKVIMI.md)';
COMMENT ON FUNCTION olustur_tik_takvimi IS 'TİK takvimi oluşturma (10 toplantı, 5 yıl)';
COMMENT ON FUNCTION create_tik_calendar_on_approval IS 'Tez önerisi onaylandığında TİK takvimi oluşturma trigger fonksiyonu';
COMMENT ON FUNCTION hesapla_tez_onersi_ek_sure IS 'Tez önerisi ek süre hesaplama (05_TEZ_ONERISI_BASARISIZ_DURUM.md)';
COMMENT ON FUNCTION hesapla_yeni_hedef_tarih IS 'Yeni hedef tarih hesaplama (Revizyon: +3 ay, Red: +6 ay)';
COMMENT ON FUNCTION update_tez_onersi_milestone IS 'Tez önerisi milestone güncelleme trigger fonksiyonu';
COMMENT ON FUNCTION check_ders_tamamlama IS 'Ders tamamlama süresi kontrolü (Tezli YL: 4 yarıyıl)';
COMMENT ON FUNCTION check_dondurma_suresi IS 'Dondurma süresi kontrolü';

