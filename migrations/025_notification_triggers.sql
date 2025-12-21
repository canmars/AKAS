-- Migration 025: Notification Triggers (Plan Faz 2.5)
-- Bildirim tetikleme fonksiyonları

-- ============================================
-- TİK UYARI BİLDİRİMLERİ
-- ============================================

-- TİK Uyarı Kontrolü (Periyodik)
CREATE OR REPLACE FUNCTION check_tik_notifications()
RETURNS void AS $$
DECLARE
  v_tik_record RECORD;
  v_ogrenci_adi TEXT;
  v_mesaj TEXT;
BEGIN
  -- 1 ay içinde TİK toplantısı olan öğrenciler
  FOR v_tik_record IN
    SELECT 
      t.topanti_id,
      t.ogrenci_id,
      t.topanti_tarihi,
      o.ad,
      o.soyad
    FROM public.tik_toplantilari t
    JOIN public.ogrenci o ON t.ogrenci_id = o.ogrenci_id
    WHERE t.topanti_tarihi BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '1 month')
    AND t.uyari_gonderildi_mi = false
    AND o.soft_delete = false
  LOOP
    -- Öğrenci adını al
    v_ogrenci_adi := v_tik_record.ad || ' ' || v_tik_record.soyad;
    
    -- Mesaj oluştur
    v_mesaj := format('%s için TİK toplantısı %s tarihinde yapılacak. Lütfen toplantıya katılım sağlayın ve raporunuzu hazırlayın.',
                      v_ogrenci_adi, v_tik_record.topanti_tarihi);
    
    -- Bildirim oluştur
    PERFORM create_bildirim_for_roles(
      'TIK_Uyari',
      v_tik_record.ogrenci_id,
      v_mesaj,
      'Yuksek'
    );
    
    -- Uyarı gönderildi olarak işaretle
    UPDATE public.tik_toplantilari
    SET uyari_gonderildi_mi = true,
        uyari_tarihi = CURRENT_DATE
    WHERE topanti_id = v_tik_record.topanti_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TEZ ÖNERİSİ SÜRE UYARI BİLDİRİMLERİ
-- ============================================

-- Tez Önerisi Süre Uyarı Kontrolü
CREATE OR REPLACE FUNCTION check_tez_onersi_notifications()
RETURNS void AS $$
DECLARE
  v_milestone_record RECORD;
  v_ogrenci_adi TEXT;
  v_mesaj TEXT;
  v_kalan_gun INT;
BEGIN
  -- 1 ay içinde hedef tarihi olan tez önerileri
  FOR v_milestone_record IN
    SELECT 
      m.milestone_id,
      m.ogrenci_id,
      m.hedef_tarih,
      m.savunma_sonucu,
      o.ad,
      o.soyad
    FROM public.akademik_milestone m
    JOIN public.ogrenci o ON m.ogrenci_id = o.ogrenci_id
    WHERE m.milestone_turu = 'Tez_Onersi'
    AND m.durum = 'Beklemede'
    AND m.hedef_tarih BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '1 month')
    AND o.soft_delete = false
  LOOP
    -- Öğrenci adını al
    v_ogrenci_adi := v_milestone_record.ad || ' ' || v_milestone_record.soyad;
    
    -- Kalan günü hesapla
    v_kalan_gun := v_milestone_record.hedef_tarih - CURRENT_DATE;
    
    -- Mesaj oluştur
    IF v_milestone_record.savunma_sonucu IN ('Revizyon_Gerekli', 'Red') THEN
      v_mesaj := format('%s için tez önerisi savunması %s tarihinde yapılacak (%s gün kaldı). Lütfen hazırlıklarınızı tamamlayın.',
                        v_ogrenci_adi, v_milestone_record.hedef_tarih, v_kalan_gun);
    ELSE
      v_mesaj := format('%s için tez önerisi hedef tarihi %s (%s gün kaldı). Lütfen hazırlıklarınızı tamamlayın.',
                        v_ogrenci_adi, v_milestone_record.hedef_tarih, v_kalan_gun);
    END IF;
    
    -- Bildirim oluştur
    PERFORM create_bildirim_for_roles(
      'Tez_Onersi_Uyari',
      v_milestone_record.ogrenci_id,
      v_mesaj,
      'Yuksek'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MİLESTONE GECİKMİŞ BİLDİRİMLERİ
-- ============================================

-- Gecikmiş Milestone Bildirimi
CREATE OR REPLACE FUNCTION check_gecikmis_milestone_notifications()
RETURNS void AS $$
DECLARE
  v_milestone_record RECORD;
  v_ogrenci_adi TEXT;
  v_mesaj TEXT;
  v_gecikme_gun INT;
BEGIN
  -- Gecikmiş milestone'lar
  FOR v_milestone_record IN
    SELECT 
      m.milestone_id,
      m.ogrenci_id,
      m.milestone_turu,
      m.hedef_tarih,
      o.ad,
      o.soyad
    FROM public.akademik_milestone m
    JOIN public.ogrenci o ON m.ogrenci_id = o.ogrenci_id
    WHERE m.durum = 'Beklemede'
    AND m.hedef_tarih < CURRENT_DATE
    AND o.soft_delete = false
  LOOP
    -- Öğrenci adını al
    v_ogrenci_adi := v_milestone_record.ad || ' ' || v_milestone_record.soyad;
    
    -- Gecikme gününü hesapla
    v_gecikme_gun := CURRENT_DATE - v_milestone_record.hedef_tarih;
    
    -- Milestone türüne göre mesaj oluştur
    v_mesaj := format('%s için %s milestone''u %s gün gecikti. Hedef tarih: %s. Lütfen gerekli işlemleri tamamlayın.',
                      v_ogrenci_adi,
                      CASE v_milestone_record.milestone_turu
                        WHEN 'Yeterlik_Sinavi' THEN 'Yeterlik Sınavı'
                        WHEN 'Tez_Onersi' THEN 'Tez Önerisi'
                        WHEN 'Tez_Savunmasi' THEN 'Tez Savunması'
                        WHEN 'Donem_Projesi' THEN 'Dönem Projesi'
                        ELSE v_milestone_record.milestone_turu
                      END,
                      v_gecikme_gun,
                      v_milestone_record.hedef_tarih);
    
    -- Bildirim oluştur
    PERFORM create_bildirim_for_roles(
      'Milestone_Gecikmis',
      v_milestone_record.ogrenci_id,
      v_mesaj,
      'Kritik'
    );
    
    -- Durumu gecikmiş olarak işaretle
    UPDATE public.akademik_milestone
    SET durum = 'Gecikmis'
    WHERE milestone_id = v_milestone_record.milestone_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HAYALET ÖĞRENCİ BİLDİRİMLERİ
-- ============================================

-- Hayalet Öğrenci Kontrolü (Periyodik)
CREATE OR REPLACE FUNCTION check_hayalet_ogrenci_notifications()
RETURNS void AS $$
DECLARE
  v_ogrenci_record RECORD;
  v_ogrenci_adi TEXT;
  v_mesaj TEXT;
  v_gecen_ay INT;
BEGIN
  -- 6+ ay login olmayan öğrenciler
  FOR v_ogrenci_record IN
    SELECT 
      o.ogrenci_id,
      o.ad,
      o.soyad,
      osl.son_login
    FROM public.ogrenci o
    LEFT JOIN public.ogrenci_son_login osl ON o.ogrenci_id = osl.ogrenci_id
    WHERE o.soft_delete = false
    AND (osl.son_login IS NULL OR osl.son_login < CURRENT_DATE - INTERVAL '6 months')
  LOOP
    -- Öğrenci adını al
    v_ogrenci_adi := v_ogrenci_record.ad || ' ' || v_ogrenci_record.soyad;
    
    -- Geçen ayı hesapla
    IF v_ogrenci_record.son_login IS NULL THEN
      v_mesaj := format('%s son 6 aydır sisteme hiç giriş yapmamıştır (Hayalet Öğrenci). İstatistiklerden çıkarılması önerilir.',
                        v_ogrenci_adi);
    ELSE
      v_gecen_ay := EXTRACT(EPOCH FROM (CURRENT_DATE - v_ogrenci_record.son_login)) / (30 * 24 * 3600);
      v_mesaj := format('%s son %s aydır sisteme giriş yapmamıştır (Hayalet Öğrenci). Son giriş: %s. İstatistiklerden çıkarılması önerilir.',
                        v_ogrenci_adi, 
                        ROUND(v_gecen_ay),
                        v_ogrenci_record.son_login::DATE);
    END IF;
    
    -- Bildirim oluştur (sadece daha önce bildirim gönderilmemişse)
    IF NOT EXISTS (
      SELECT 1 FROM public.bildirimler
      WHERE ogrenci_id = v_ogrenci_record.ogrenci_id
        AND bildirim_turu_id IN (
          SELECT bildirim_turu_id FROM public.bildirim_turleri
          WHERE bildirim_turu_kodu = 'Hayalet_Ogrenci'
        )
        AND olusturma_tarihi >= CURRENT_DATE - INTERVAL '1 month'
    ) THEN
      PERFORM create_bildirim_for_roles(
        'Hayalet_Ogrenci',
        v_ogrenci_record.ogrenci_id,
        v_mesaj,
        'Kritik'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION check_tik_notifications IS 'TİK uyarı bildirimleri kontrolü (1 ay öncesinde)';
COMMENT ON FUNCTION check_tez_onersi_notifications IS 'Tez önerisi süre uyarı bildirimleri kontrolü';
COMMENT ON FUNCTION check_gecikmis_milestone_notifications IS 'Gecikmiş milestone bildirimleri kontrolü';
COMMENT ON FUNCTION check_hayalet_ogrenci_notifications IS 'Hayalet öğrenci bildirimleri kontrolü (6+ ay login yok)';

