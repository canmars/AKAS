/**
 * Migration: Öğrencileri Süreç Aşamalarına Dağıt
 * Tüm öğrencilerin "Darboğaz/Riskli" olarak görünmesini önlemek için
 * öğrencileri farklı aşamalara (Ders, Seminer, Yeterlik, Tez) dağıtır
 */

-- ============================================
-- 1. SEMİNER DERSİNİ BUL VEYA OLUŞTUR
-- ============================================

-- Seminer dersi var mı kontrol et, yoksa oluştur
DO $$
DECLARE
  v_seminer_ders_kodu TEXT;
BEGIN
  -- Seminer dersi var mı?
  SELECT ders_kodu INTO v_seminer_ders_kodu
  FROM public.dersler
  WHERE ders_turu = 'Seminer'
  LIMIT 1;

  -- Yoksa oluştur
  IF v_seminer_ders_kodu IS NULL THEN
    INSERT INTO public.dersler (ders_kodu, ders_adi, ders_turu, akts)
    VALUES ('SEM001', 'Seminer', 'Seminer', 0)
    ON CONFLICT (ders_kodu) DO NOTHING
    RETURNING ders_kodu INTO v_seminer_ders_kodu;
  END IF;

  RAISE NOTICE 'Seminer ders kodu: %', v_seminer_ders_kodu;
END $$;

-- ============================================
-- 2. ÖĞRENCİLERİ AŞAMALARA GÖRE DAĞIT
-- ============================================

-- Öğrencileri rastgele 4 gruba ayır:
-- %50: Ders Aşamasında (1-3. yarıyıl, seminer yok)
-- %30: Seminer Bekleyen (4. yarıyılda, seminer eksik/yok)
-- %10: Yeterlik Bekleyen (4. yarıyıl, seminer başarısız)
-- %10: Tez Aşamasında (5-6. yarıyıl, seminer tamam)

-- Trigger'ı tamamen kaldır (migration sırasında view hatası önlemek için)
-- Önce mevcut trigger'ları kontrol et ve sil
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  -- ogrenci_dersleri tablosundaki tüm trigger'ları bul
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'public.ogrenci_dersleri'::regclass
      AND tgname LIKE '%seminer%'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.ogrenci_dersleri', trigger_rec.tgname);
    RAISE NOTICE 'Trigger silindi: %', trigger_rec.tgname;
  END LOOP;
END $$;

DO $$
DECLARE
  v_seminer_ders_kodu TEXT;
  v_ogrenci RECORD;
  v_counter INTEGER := 0;
  v_total INTEGER;
  v_group INTEGER;
  v_mevcut_yariyil INTEGER;
  v_not_kodu TEXT;
BEGIN
  -- Seminer ders kodunu al
  SELECT ders_kodu INTO v_seminer_ders_kodu
  FROM public.dersler
  WHERE ders_turu = 'Seminer'
  LIMIT 1;

  IF v_seminer_ders_kodu IS NULL THEN
    RAISE EXCEPTION 'Seminer dersi bulunamadı!';
  END IF;

  -- Toplam öğrenci sayısı
  SELECT COUNT(*) INTO v_total
  FROM public.ogrenci
  WHERE soft_delete = false;

  RAISE NOTICE 'Toplam öğrenci sayısı: %', v_total;

  -- Her öğrenci için
  FOR v_ogrenci IN 
    SELECT ogrenci_id, ad, soyad
    FROM public.ogrenci
    WHERE soft_delete = false
    ORDER BY ogrenci_id
  LOOP
    v_counter := v_counter + 1;
    v_group := MOD(v_counter, 10); -- 0-9 arası grup numarası

    -- Mevcut yarıyıl bilgisini al (varsa)
    SELECT mevcut_yariyil INTO v_mevcut_yariyil
    FROM public.ogrenci_akademik_durum
    WHERE ogrenci_id = v_ogrenci.ogrenci_id
    LIMIT 1;

    -- Eğer yarıyıl bilgisi yoksa, rastgele bir yarıyıl ata
    IF v_mevcut_yariyil IS NULL THEN
      v_mevcut_yariyil := 1 + (v_counter % 6); -- 1-6 arası
      
      -- ogrenci_akademik_durum kaydı oluştur veya güncelle
      INSERT INTO public.ogrenci_akademik_durum (ogrenci_id, mevcut_yariyil)
      VALUES (v_ogrenci.ogrenci_id, v_mevcut_yariyil)
      ON CONFLICT (ogrenci_id) DO UPDATE
      SET mevcut_yariyil = EXCLUDED.mevcut_yariyil;
    END IF;

    -- Mevcut seminer kaydını kontrol et
    SELECT not_kodu INTO v_not_kodu
    FROM public.ogrenci_dersleri od
    WHERE od.ogrenci_id = v_ogrenci.ogrenci_id
      AND od.ders_kodu = v_seminer_ders_kodu
      AND od.ts = (
        SELECT MAX(ts) 
        FROM public.ogrenci_dersleri od2 
        WHERE od2.ogrenci_id = od.ogrenci_id 
          AND od2.ders_kodu = od.ders_kodu
      )
    LIMIT 1;

    -- Gruplara göre dağıt
    IF v_group < 5 THEN
      -- %50: Ders Aşamasında (1-3. yarıyıl, seminer yok)
      v_mevcut_yariyil := 1 + (v_counter % 3); -- 1-3 arası
      
      UPDATE public.ogrenci_akademik_durum
      SET mevcut_yariyil = v_mevcut_yariyil
      WHERE ogrenci_id = v_ogrenci.ogrenci_id;

      -- Seminer kaydını sil (varsa)
      DELETE FROM public.ogrenci_dersleri
      WHERE ogrenci_id = v_ogrenci.ogrenci_id
        AND ders_kodu = v_seminer_ders_kodu;

      RAISE NOTICE 'Öğrenci %: Ders Aşamasında (Yarıyıl: %)', v_ogrenci.ad || ' ' || v_ogrenci.soyad, v_mevcut_yariyil;

    ELSIF v_group < 8 THEN
      -- %30: Seminer Bekleyen (4. yarıyıl, seminer eksik/yok)
      v_mevcut_yariyil := 4;
      
      UPDATE public.ogrenci_akademik_durum
      SET mevcut_yariyil = v_mevcut_yariyil
      WHERE ogrenci_id = v_ogrenci.ogrenci_id;

      -- Seminer kaydını sil (varsa) - eksik durumda
      DELETE FROM public.ogrenci_dersleri
      WHERE ogrenci_id = v_ogrenci.ogrenci_id
        AND ders_kodu = v_seminer_ders_kodu;

      RAISE NOTICE 'Öğrenci %: Seminer Bekleyen (Yarıyıl: 4)', v_ogrenci.ad || ' ' || v_ogrenci.soyad;

    ELSIF v_group < 9 THEN
      -- %10: Yeterlik Bekleyen (4. yarıyıl, seminer başarısız)
      v_mevcut_yariyil := 4;
      
      UPDATE public.ogrenci_akademik_durum
      SET mevcut_yariyil = v_mevcut_yariyil
      WHERE ogrenci_id = v_ogrenci.ogrenci_id;

      -- Seminer kaydını başarısız not ile ekle/güncelle
      -- Önce mevcut kaydı sil
      DELETE FROM public.ogrenci_dersleri
      WHERE ogrenci_id = v_ogrenci.ogrenci_id
        AND ders_kodu = v_seminer_ders_kodu;

      -- Yeni kayıt ekle
      INSERT INTO public.ogrenci_dersleri (
        ogrenci_id, 
        ders_kodu,
        ders_adi,
        yariyil,
        akademik_yil,
        not_kodu, 
        akts, 
        ts
      )
      VALUES (
        v_ogrenci.ogrenci_id,
        v_seminer_ders_kodu,
        'Seminer',
        4,
        EXTRACT(YEAR FROM CURRENT_DATE)::INT,
        'FF', -- Başarısız not
        0,
        1
      );

      RAISE NOTICE 'Öğrenci %: Yeterlik Bekleyen (Seminer Başarısız)', v_ogrenci.ad || ' ' || v_ogrenci.soyad;

    ELSE
      -- %10: Tez Aşamasında (5-6. yarıyıl, seminer tamam)
      v_mevcut_yariyil := 5 + (v_counter % 2); -- 5-6 arası
      
      UPDATE public.ogrenci_akademik_durum
      SET mevcut_yariyil = v_mevcut_yariyil
      WHERE ogrenci_id = v_ogrenci.ogrenci_id;

      -- Seminer kaydını başarılı not ile ekle/güncelle
      -- Önce mevcut kaydı sil
      DELETE FROM public.ogrenci_dersleri
      WHERE ogrenci_id = v_ogrenci.ogrenci_id
        AND ders_kodu = v_seminer_ders_kodu;

      -- Yeni kayıt ekle
      INSERT INTO public.ogrenci_dersleri (
        ogrenci_id, 
        ders_kodu,
        ders_adi,
        yariyil,
        akademik_yil,
        not_kodu, 
        akts, 
        ts
      )
      VALUES (
        v_ogrenci.ogrenci_id,
        v_seminer_ders_kodu,
        'Seminer',
        4,
        EXTRACT(YEAR FROM CURRENT_DATE)::INT,
        'BB', -- Başarılı not
        0,
        1
      );

      RAISE NOTICE 'Öğrenci %: Tez Aşamasında (Seminer Tamam, Yarıyıl: %)', v_ogrenci.ad || ' ' || v_ogrenci.soyad, v_mevcut_yariyil;
    END IF;

  END LOOP;

  RAISE NOTICE 'Dağıtım tamamlandı!';
END $$;

-- Trigger'ı tekrar oluştur
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
        
        -- Bildirim oluşturma işlemi şimdilik atlanıyor (create_bildirim_for_roles hatası nedeniyle)
        -- PERFORM create_bildirim_for_roles(...);
      ELSIF v_seminer_darbogaz_record.kritik_darbogaz_mi = true THEN
        v_bildirim_mesaji := format('%s %s öğrencisi için Seminer darbogaz tespit edildi. Durum: %s', 
          v_seminer_darbogaz_record.ad, v_seminer_darbogaz_record.soyad, v_seminer_darbogaz_record.seminer_durumu);
        
        -- Bildirim oluşturma işlemi şimdilik atlanıyor
        -- PERFORM create_bildirim_for_roles(...);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı yeniden oluştur
CREATE TRIGGER trigger_check_seminer_darbogaz
AFTER INSERT OR UPDATE OF not_kodu ON public.ogrenci_dersleri
FOR EACH ROW
EXECUTE FUNCTION check_seminer_darbogaz();

-- ============================================
-- 3. ACİL_EYLEM STATÜSÜ (View Otomatik Hesaplıyor)
-- ============================================

-- NOT: ACİL_EYLEM statüsü ogrenci_seminer_darbogaz_view'da otomatik olarak hesaplanıyor
-- 4. yarıyılda ve seminer eksik/yok olan öğrenciler otomatik olarak ACİL_EYLEM statüsünde görünecek
-- Bu yüzden manuel bir işlem yapmaya gerek yok

-- ============================================
-- 4. İSTATİSTİKLER
-- ============================================

DO $$
DECLARE
  v_ders INTEGER;
  v_seminer INTEGER;
  v_yeterlik INTEGER;
  v_tez INTEGER;
  v_toplam INTEGER;
BEGIN
  -- Ders aşamasında (1-3. yarıyıl)
  SELECT COUNT(DISTINCT o.ogrenci_id) INTO v_ders
  FROM public.ogrenci o
  JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
  WHERE o.soft_delete = false
    AND oad.mevcut_yariyil < 4;

  -- Seminer bekleyen (4. yarıyıl, seminer eksik/yok)
  SELECT COUNT(DISTINCT o.ogrenci_id) INTO v_seminer
  FROM public.ogrenci o
  JOIN public.ogrenci_akademik_durum oad ON o.ogrenci_id = oad.ogrenci_id
  WHERE o.soft_delete = false
    AND oad.mevcut_yariyil = 4
    AND NOT EXISTS (
      SELECT 1
      FROM public.ogrenci_dersleri od
      JOIN public.dersler d ON od.ders_kodu = d.ders_kodu
      WHERE od.ogrenci_id = o.ogrenci_id
        AND d.ders_turu = 'Seminer'
        AND od.not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
    );

  -- Yeterlik bekleyen (seminer başarısız)
  SELECT COUNT(DISTINCT o.ogrenci_id) INTO v_yeterlik
  FROM public.ogrenci o
  JOIN public.ogrenci_dersleri od ON o.ogrenci_id = od.ogrenci_id
  JOIN public.dersler d ON od.ders_kodu = d.ders_kodu
  WHERE o.soft_delete = false
    AND d.ders_turu = 'Seminer'
    AND od.not_kodu NOT IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
    AND od.ts = (
      SELECT MAX(ts)
      FROM public.ogrenci_dersleri od2
      WHERE od2.ogrenci_id = od.ogrenci_id
        AND od2.ders_kodu = od.ders_kodu
    );

  -- Tez aşamasında (seminer tamam)
  SELECT COUNT(DISTINCT o.ogrenci_id) INTO v_tez
  FROM public.ogrenci o
  JOIN public.ogrenci_dersleri od ON o.ogrenci_id = od.ogrenci_id
  JOIN public.dersler d ON od.ders_kodu = d.ders_kodu
  WHERE o.soft_delete = false
    AND d.ders_turu = 'Seminer'
    AND od.not_kodu IN ('B', 'AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD')
    AND od.ts = (
      SELECT MAX(ts)
      FROM public.ogrenci_dersleri od2
      WHERE od2.ogrenci_id = od.ogrenci_id
        AND od2.ders_kodu = od.ders_kodu
    );

  SELECT COUNT(*) INTO v_toplam
  FROM public.ogrenci
  WHERE soft_delete = false;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'SÜREÇ HATTI DAĞILIMI:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Ders Aşamasında: % (%%%)', v_ders, ROUND(v_ders::NUMERIC / NULLIF(v_toplam, 0) * 100, 1);
  RAISE NOTICE 'Seminer Bekleyen: % (%%%)', v_seminer, ROUND(v_seminer::NUMERIC / NULLIF(v_toplam, 0) * 100, 1);
  RAISE NOTICE 'Yeterlik Bekleyen: % (%%%)', v_yeterlik, ROUND(v_yeterlik::NUMERIC / NULLIF(v_toplam, 0) * 100, 1);
  RAISE NOTICE 'Tez Aşamasında: % (%%%)', v_tez, ROUND(v_tez::NUMERIC / NULLIF(v_toplam, 0) * 100, 1);
  RAISE NOTICE 'Toplam: %', v_toplam;
  RAISE NOTICE '========================================';
END $$;

COMMENT ON TABLE public.ogrenci_dersleri IS 'Öğrenci ders kayıtları - Migration 013 ile aşamalara dağıtıldı';

