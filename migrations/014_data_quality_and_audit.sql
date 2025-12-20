-- Migration 014: Data Quality and Audit Trail
-- Veri kalitesi katmanı ve audit trail için tablolar ve fonksiyonlar

-- ============================================
-- VERI YUKLEME GECMISI TABLOSU
-- Excel yükleme işlemlerini takip eder
-- ============================================
CREATE TABLE IF NOT EXISTS public.veri_yukleme_gecmisi (
  yukleme_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dosya_adi TEXT NOT NULL,
  dosya_boyutu_kb INT,
  yuklenen_satir_sayisi INT NOT NULL DEFAULT 0,
  basarili_satir_sayisi INT NOT NULL DEFAULT 0,
  hatali_satir_sayisi INT NOT NULL DEFAULT 0,
  hata_detaylari JSONB DEFAULT '[]'::JSONB,
  yukleyen_kullanici_id UUID REFERENCES public.kullanicilar(kullanici_id),
  yukleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  yukleme_durumu TEXT CHECK (yukleme_durumu IN ('Basarili', 'Kismi_Basarili', 'Basarisiz', 'Iptal_Edildi')),
  islem_suresi_saniye NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_veri_yukleme_kullanici ON public.veri_yukleme_gecmisi(yukleyen_kullanici_id);
CREATE INDEX IF NOT EXISTS idx_veri_yukleme_tarih ON public.veri_yukleme_gecmisi(yukleme_tarihi DESC);

COMMENT ON TABLE public.veri_yukleme_gecmisi IS 'Excel veri yükleme işlemlerinin geçmişi ve sonuçları';

-- ============================================
-- VERI DEGISIKLIK LOGU TABLOSU
-- Tüm veri değişikliklerini audit trail için loglar
-- ============================================
CREATE TABLE IF NOT EXISTS public.veri_degisiklik_logu (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tablo_adi TEXT NOT NULL,
  kayit_id UUID NOT NULL,
  eski_deger JSONB,
  yeni_deger JSONB,
  degisiklik_turu TEXT NOT NULL CHECK (degisiklik_turu IN ('INSERT', 'UPDATE', 'DELETE')),
  degistiren_kullanici_id UUID REFERENCES public.kullanicilar(kullanici_id),
  degisiklik_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_adresi TEXT,
  user_agent TEXT,
  degisiklik_notu TEXT
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_degisiklik_log_tablo_kayit ON public.veri_degisiklik_logu(tablo_adi, kayit_id);
CREATE INDEX IF NOT EXISTS idx_degisiklik_log_kullanici ON public.veri_degisiklik_logu(degistiren_kullanici_id);
CREATE INDEX IF NOT EXISTS idx_degisiklik_log_tarih ON public.veri_degisiklik_logu(degisiklik_tarihi DESC);
CREATE INDEX IF NOT EXISTS idx_degisiklik_log_tur ON public.veri_degisiklik_logu(degisiklik_turu);

COMMENT ON TABLE public.veri_degisiklik_logu IS 'Tüm veri değişikliklerinin audit trail kaydı';

-- ============================================
-- EXCEL ROW VALIDATION FONKSIYONU
-- Excel satırını doğrular ve hata detaylarını döndürür
-- ============================================
CREATE OR REPLACE FUNCTION validate_excel_row(p_row_data JSONB)
RETURNS JSONB AS $$
DECLARE
  v_hatalar TEXT[] := '{}';
  v_tc_kimlik_no TEXT;
  v_email TEXT;
  v_kayit_tarihi TEXT;
  v_program_turu_id UUID;
  v_durum_id UUID;
  v_danisman_id UUID;
  v_validation_result JSONB;
BEGIN
  -- TC Kimlik No validasyonu (11 haneli, sadece rakam)
  v_tc_kimlik_no := p_row_data->>'tc_kimlik_no';
  IF v_tc_kimlik_no IS NOT NULL AND v_tc_kimlik_no != '' THEN
    IF LENGTH(v_tc_kimlik_no) != 11 OR v_tc_kimlik_no !~ '^[0-9]+$' THEN
      v_hatalar := array_append(v_hatalar, 'TC Kimlik No 11 haneli rakam olmalıdır');
    END IF;
  END IF;

  -- Email formatı validasyonu
  v_email := p_row_data->>'email';
  IF v_email IS NOT NULL AND v_email != '' THEN
    IF v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      v_hatalar := array_append(v_hatalar, 'Geçersiz email formatı');
    END IF;
  END IF;

  -- Tarih validasyonu (kayit_tarihi)
  v_kayit_tarihi := p_row_data->>'kayit_tarihi';
  IF v_kayit_tarihi IS NULL OR v_kayit_tarihi = '' THEN
    v_hatalar := array_append(v_hatalar, 'Kayıt tarihi zorunludur');
  ELSE
    BEGIN
      PERFORM v_kayit_tarihi::DATE;
    EXCEPTION WHEN OTHERS THEN
      v_hatalar := array_append(v_hatalar, 'Geçersiz kayıt tarihi formatı (YYYY-MM-DD olmalı)');
    END;
  END IF;

  -- Foreign key validasyonları
  -- Program türü kontrolü
  IF p_row_data->>'program_turu_id' IS NOT NULL THEN
    v_program_turu_id := (p_row_data->>'program_turu_id')::UUID;
    IF NOT EXISTS (SELECT 1 FROM public.program_turleri WHERE program_turu_id = v_program_turu_id AND aktif_mi = true) THEN
      v_hatalar := array_append(v_hatalar, 'Geçersiz program türü ID');
    END IF;
  ELSE
    v_hatalar := array_append(v_hatalar, 'Program türü ID zorunludur');
  END IF;

  -- Durum kontrolü
  IF p_row_data->>'durum_id' IS NOT NULL THEN
    v_durum_id := (p_row_data->>'durum_id')::UUID;
    IF NOT EXISTS (SELECT 1 FROM public.durum_turleri WHERE durum_id = v_durum_id) THEN
      v_hatalar := array_append(v_hatalar, 'Geçersiz durum ID');
    END IF;
  ELSE
    v_hatalar := array_append(v_hatalar, 'Durum ID zorunludur');
  END IF;

  -- Danışman kontrolü (opsiyonel)
  IF p_row_data->>'danisman_id' IS NOT NULL AND p_row_data->>'danisman_id' != '' THEN
    v_danisman_id := (p_row_data->>'danisman_id')::UUID;
    IF NOT EXISTS (SELECT 1 FROM public.akademik_personel WHERE personel_id = v_danisman_id AND aktif_mi = true) THEN
      v_hatalar := array_append(v_hatalar, 'Geçersiz danışman ID');
    END IF;
  END IF;

  -- Zorunlu alanlar kontrolü
  IF p_row_data->>'ad' IS NULL OR p_row_data->>'ad' = '' THEN
    v_hatalar := array_append(v_hatalar, 'Ad zorunludur');
  END IF;

  IF p_row_data->>'soyad' IS NULL OR p_row_data->>'soyad' = '' THEN
    v_hatalar := array_append(v_hatalar, 'Soyad zorunludur');
  END IF;

  -- Sonuç oluştur
  v_validation_result := jsonb_build_object(
    'gecerli', array_length(v_hatalar, 1) IS NULL,
    'hatalar', v_hatalar,
    'hata_sayisi', COALESCE(array_length(v_hatalar, 1), 0)
  );

  RETURN v_validation_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_excel_row IS 'Excel satırını doğrular ve validasyon hatalarını döndürür';

-- ============================================
-- EXCEL DATA CLEANSING FONKSIYONU
-- Excel verisini temizler ve standardize eder
-- ============================================
CREATE OR REPLACE FUNCTION cleanse_excel_data(p_raw_data JSONB)
RETURNS JSONB AS $$
DECLARE
  v_cleaned_data JSONB;
  v_temp_text TEXT;
BEGIN
  v_cleaned_data := p_raw_data;

  -- Ad ve Soyad: Başlangıç/bitiş boşluklarını temizle, ilk harfleri büyük yap
  IF v_cleaned_data ? 'ad' THEN
    v_temp_text := TRIM(v_cleaned_data->>'ad');
    IF v_temp_text != '' THEN
      v_temp_text := INITCAP(LOWER(v_temp_text));
      v_cleaned_data := jsonb_set(v_cleaned_data, '{ad}', to_jsonb(v_temp_text));
    END IF;
  END IF;

  IF v_cleaned_data ? 'soyad' THEN
    v_temp_text := TRIM(v_cleaned_data->>'soyad');
    IF v_temp_text != '' THEN
      v_temp_text := INITCAP(LOWER(v_temp_text));
      v_cleaned_data := jsonb_set(v_cleaned_data, '{soyad}', to_jsonb(v_temp_text));
    END IF;
  END IF;

  -- Email: Küçük harfe çevir, boşlukları temizle
  IF v_cleaned_data ? 'email' THEN
    v_temp_text := TRIM(LOWER(v_cleaned_data->>'email'));
    IF v_temp_text != '' THEN
      v_cleaned_data := jsonb_set(v_cleaned_data, '{email}', to_jsonb(v_temp_text));
    END IF;
  END IF;

  -- TC Kimlik No: Sadece rakamları al, boşlukları temizle
  IF v_cleaned_data ? 'tc_kimlik_no' THEN
    v_temp_text := REGEXP_REPLACE(v_cleaned_data->>'tc_kimlik_no', '[^0-9]', '', 'g');
    IF v_temp_text != '' THEN
      v_cleaned_data := jsonb_set(v_cleaned_data, '{tc_kimlik_no}', to_jsonb(v_temp_text));
    END IF;
  END IF;

  -- Telefon: Sadece rakamları al, boşlukları temizle
  IF v_cleaned_data ? 'telefon' THEN
    v_temp_text := REGEXP_REPLACE(v_cleaned_data->>'telefon', '[^0-9]', '', 'g');
    IF v_temp_text != '' THEN
      v_cleaned_data := jsonb_set(v_cleaned_data, '{telefon}', to_jsonb(v_temp_text));
    END IF;
  END IF;

  -- Tarih formatı standardizasyonu (YYYY-MM-DD)
  IF v_cleaned_data ? 'kayit_tarihi' THEN
    v_temp_text := v_cleaned_data->>'kayit_tarihi';
    IF v_temp_text IS NOT NULL AND v_temp_text != '' THEN
      BEGIN
        -- Farklı tarih formatlarını dene
        v_temp_text := CASE
          WHEN v_temp_text ~ '^\d{4}-\d{2}-\d{2}$' THEN v_temp_text
          WHEN v_temp_text ~ '^\d{2}\.\d{2}\.\d{4}$' THEN TO_CHAR(TO_DATE(v_temp_text, 'DD.MM.YYYY'), 'YYYY-MM-DD')
          WHEN v_temp_text ~ '^\d{2}/\d{2}/\d{4}$' THEN TO_CHAR(TO_DATE(v_temp_text, 'DD/MM/YYYY'), 'YYYY-MM-DD')
          ELSE v_temp_text
        END;
        -- Tarih geçerliliğini kontrol et
        PERFORM v_temp_text::DATE;
        v_cleaned_data := jsonb_set(v_cleaned_data, '{kayit_tarihi}', to_jsonb(v_temp_text));
      EXCEPTION WHEN OTHERS THEN
        -- Tarih formatı geçersizse olduğu gibi bırak (validation'da yakalanacak)
        NULL;
      END;
    END IF;
  END IF;

  -- Kabul tarihi (aynı işlem)
  IF v_cleaned_data ? 'kabul_tarihi' THEN
    v_temp_text := v_cleaned_data->>'kabul_tarihi';
    IF v_temp_text IS NOT NULL AND v_temp_text != '' THEN
      BEGIN
        v_temp_text := CASE
          WHEN v_temp_text ~ '^\d{4}-\d{2}-\d{2}$' THEN v_temp_text
          WHEN v_temp_text ~ '^\d{2}\.\d{2}\.\d{4}$' THEN TO_CHAR(TO_DATE(v_temp_text, 'DD.MM.YYYY'), 'YYYY-MM-DD')
          WHEN v_temp_text ~ '^\d{2}/\d{2}/\d{4}$' THEN TO_CHAR(TO_DATE(v_temp_text, 'DD/MM/YYYY'), 'YYYY-MM-DD')
          ELSE v_temp_text
        END;
        PERFORM v_temp_text::DATE;
        v_cleaned_data := jsonb_set(v_cleaned_data, '{kabul_tarihi}', to_jsonb(v_temp_text));
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
  END IF;

  -- Boş string'leri NULL'a çevir
  v_cleaned_data := (
    SELECT jsonb_object_agg(key, CASE WHEN value::text = '""' OR value::text = '' THEN 'null'::jsonb ELSE value END)
    FROM jsonb_each(v_cleaned_data)
  );

  RETURN v_cleaned_data;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanse_excel_data IS 'Excel verisini temizler ve standardize eder (boşluk temizleme, format düzeltme, tarih standardizasyonu)';

-- ============================================
-- DATA CHANGES LOGGING FONKSIYONU
-- Trigger fonksiyonu: Veri değişikliklerini loglar
-- ============================================
CREATE OR REPLACE FUNCTION log_data_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_eski_deger JSONB;
  v_yeni_deger JSONB;
  v_kullanici_id UUID;
  v_kayit_id UUID;
BEGIN
  -- Kullanıcı ID'sini al (auth.uid() veya current_setting ile)
  BEGIN
    v_kullanici_id := current_setting('app.current_user_id', true)::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_kullanici_id := NULL;
  END;

  -- Primary key alanını dinamik olarak bul
  IF TG_OP = 'DELETE' THEN
    -- Silme işlemi
    v_eski_deger := row_to_json(OLD)::JSONB;
    
    -- Tablo adına göre primary key alanını belirle
    IF TG_TABLE_NAME = 'ogrenci' THEN
      v_kayit_id := OLD.ogrenci_id;
    ELSIF TG_TABLE_NAME = 'akademik_personel' THEN
      v_kayit_id := OLD.personel_id;
    ELSIF TG_TABLE_NAME = 'kullanicilar' THEN
      v_kayit_id := OLD.kullanici_id;
    ELSE
      -- Genel fallback: id veya tablo_adi_id formatını dene
      BEGIN
        EXECUTE format('SELECT ($1.%I)::UUID', TG_TABLE_NAME || '_id') USING OLD INTO v_kayit_id;
      EXCEPTION WHEN OTHERS THEN
        BEGIN
          EXECUTE format('SELECT ($1.id)::UUID') USING OLD INTO v_kayit_id;
        EXCEPTION WHEN OTHERS THEN
          v_kayit_id := NULL;
        END;
      END;
    END IF;

    INSERT INTO public.veri_degisiklik_logu (
      tablo_adi,
      kayit_id,
      eski_deger,
      yeni_deger,
      degisiklik_turu,
      degistiren_kullanici_id
    ) VALUES (
      TG_TABLE_NAME,
      v_kayit_id,
      v_eski_deger,
      NULL,
      'DELETE',
      v_kullanici_id
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Güncelleme işlemi
    v_eski_deger := row_to_json(OLD)::JSONB;
    v_yeni_deger := row_to_json(NEW)::JSONB;
    
    -- Tablo adına göre primary key alanını belirle
    IF TG_TABLE_NAME = 'ogrenci' THEN
      v_kayit_id := NEW.ogrenci_id;
    ELSIF TG_TABLE_NAME = 'akademik_personel' THEN
      v_kayit_id := NEW.personel_id;
    ELSIF TG_TABLE_NAME = 'kullanicilar' THEN
      v_kayit_id := NEW.kullanici_id;
    ELSE
      BEGIN
        EXECUTE format('SELECT ($1.%I)::UUID', TG_TABLE_NAME || '_id') USING NEW INTO v_kayit_id;
      EXCEPTION WHEN OTHERS THEN
        BEGIN
          EXECUTE format('SELECT ($1.id)::UUID') USING NEW INTO v_kayit_id;
        EXCEPTION WHEN OTHERS THEN
          v_kayit_id := NULL;
        END;
      END;
    END IF;
    
    -- Sadece değişen alanları logla (performans için)
    IF v_eski_deger != v_yeni_deger THEN
      INSERT INTO public.veri_degisiklik_logu (
        tablo_adi,
        kayit_id,
        eski_deger,
        yeni_deger,
        degisiklik_turu,
        degistiren_kullanici_id
      ) VALUES (
        TG_TABLE_NAME,
        v_kayit_id,
        v_eski_deger,
        v_yeni_deger,
        'UPDATE',
        v_kullanici_id
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    -- Ekleme işlemi
    v_yeni_deger := row_to_json(NEW)::JSONB;
    
    -- Tablo adına göre primary key alanını belirle
    IF TG_TABLE_NAME = 'ogrenci' THEN
      v_kayit_id := NEW.ogrenci_id;
    ELSIF TG_TABLE_NAME = 'akademik_personel' THEN
      v_kayit_id := NEW.personel_id;
    ELSIF TG_TABLE_NAME = 'kullanicilar' THEN
      v_kayit_id := NEW.kullanici_id;
    ELSE
      BEGIN
        EXECUTE format('SELECT ($1.%I)::UUID', TG_TABLE_NAME || '_id') USING NEW INTO v_kayit_id;
      EXCEPTION WHEN OTHERS THEN
        BEGIN
          EXECUTE format('SELECT ($1.id)::UUID') USING NEW INTO v_kayit_id;
        EXCEPTION WHEN OTHERS THEN
          v_kayit_id := NULL;
        END;
      END;
    END IF;

    INSERT INTO public.veri_degisiklik_logu (
      tablo_adi,
      kayit_id,
      eski_deger,
      yeni_deger,
      degisiklik_turu,
      degistiren_kullanici_id
    ) VALUES (
      TG_TABLE_NAME,
      v_kayit_id,
      NULL,
      v_yeni_deger,
      'INSERT',
      v_kullanici_id
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_data_changes IS 'Veri değişikliklerini otomatik olarak veri_degisiklik_logu tablosuna kaydeder';

-- ============================================
-- TRIGGER'LAR
-- Öğrenci tablosu için audit trail
-- ============================================
-- Öğrenci tablosu için trigger (ogrenci_id primary key)
DROP TRIGGER IF EXISTS log_ogrenci_changes ON public.ogrenci;
CREATE TRIGGER log_ogrenci_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.ogrenci
  FOR EACH ROW
  EXECUTE FUNCTION log_data_changes();

-- Akademik personel tablosu için trigger
DROP TRIGGER IF EXISTS log_akademik_personel_changes ON public.akademik_personel;
CREATE TRIGGER log_akademik_personel_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.akademik_personel
  FOR EACH ROW
  EXECUTE FUNCTION log_data_changes();

-- ============================================
-- HELPER FONKSIYON: Yükleme geçmişi kaydet
-- ============================================
CREATE OR REPLACE FUNCTION kaydet_yukleme_gecmisi(
  p_dosya_adi TEXT,
  p_dosya_boyutu_kb INT,
  p_yuklenen_satir_sayisi INT,
  p_basarili_satir_sayisi INT,
  p_hatali_satir_sayisi INT,
  p_hata_detaylari JSONB,
  p_yukleyen_kullanici_id UUID,
  p_yukleme_durumu TEXT,
  p_islem_suresi_saniye NUMERIC
)
RETURNS UUID AS $$
DECLARE
  v_yukleme_id UUID;
BEGIN
  INSERT INTO public.veri_yukleme_gecmisi (
    dosya_adi,
    dosya_boyutu_kb,
    yuklenen_satir_sayisi,
    basarili_satir_sayisi,
    hatali_satir_sayisi,
    hata_detaylari,
    yukleyen_kullanici_id,
    yukleme_durumu,
    islem_suresi_saniye
  ) VALUES (
    p_dosya_adi,
    p_dosya_boyutu_kb,
    p_yuklenen_satir_sayisi,
    p_basarili_satir_sayisi,
    p_hatali_satir_sayisi,
    p_hata_detaylari,
    p_yukleyen_kullanici_id,
    p_yukleme_durumu,
    p_islem_suresi_saniye
  )
  RETURNING yukleme_id INTO v_yukleme_id;

  RETURN v_yukleme_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION kaydet_yukleme_gecmisi IS 'Excel yükleme işlemini veri_yukleme_gecmisi tablosuna kaydeder';

