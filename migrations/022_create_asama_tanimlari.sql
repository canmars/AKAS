-- Migration 022: Create Asama Tanimlari Table
-- Her program için aşama tanımları (DERS_DONEMI, YETERLIK_SINAVI, vb.)
-- Aşama geçiş koşulları ve kontrol verileri JSONB formatında tutulacak
-- ============================================

-- ============================================
-- ASAMA TANIMLARI TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS public.asama_tanimlari (
  asama_tanimi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_turu_id UUID NOT NULL REFERENCES public.program_turleri(program_turu_id) ON DELETE CASCADE,
  asama_kodu TEXT NOT NULL, -- DERS_DONEMI, YETERLIK_SINAVI, TEZ_ONERISI, vb.
  asama_adi TEXT NOT NULL, -- "Ders Dönemi", "Yeterlik Sınavı", vb.
  sira_no INTEGER NOT NULL, -- Aşama sırası (1, 2, 3, ...)
  azami_sure_yariyil INTEGER, -- Azami süre (yarıyıl) - kabul türüne göre değişebilir, JSONB'de detay var
  azami_sure_yil INTEGER, -- Azami süre (yıl) - kabul türüne göre değişebilir
  gecis_kosullari JSONB, -- Geçiş koşulları (JSON formatında)
  kontrol_verileri TEXT[], -- Kontrol edilmesi gereken veriler (array)
  aciklama TEXT, -- Aşama açıklaması
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_program_asama UNIQUE (program_turu_id, asama_kodu)
);

-- ============================================
-- İNDEKSLER
-- ============================================

CREATE INDEX IF NOT EXISTS idx_asama_tanimlari_program_turu ON public.asama_tanimlari(program_turu_id);
CREATE INDEX IF NOT EXISTS idx_asama_tanimlari_asama_kodu ON public.asama_tanimlari(asama_kodu);
CREATE INDEX IF NOT EXISTS idx_asama_tanimlari_sira_no ON public.asama_tanimlari(program_turu_id, sira_no);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.asama_tanimlari IS 'Program bazlı aşama tanımları - Her program için aşamalar (DERS_DONEMI, YETERLIK_SINAVI, vb.)';
COMMENT ON COLUMN public.asama_tanimlari.asama_kodu IS 'Aşama kodu (DERS_DONEMI, YETERLIK_SINAVI, TEZ_ONERISI, vb.)';
COMMENT ON COLUMN public.asama_tanimlari.sira_no IS 'Aşama sırası (1, 2, 3, ...) - Program içindeki sıralama';
COMMENT ON COLUMN public.asama_tanimlari.azami_sure_yariyil IS 'Azami süre (yarıyıl) - Kabul türüne göre değişebilir, detaylar gecis_kosullari JSONB içinde';
COMMENT ON COLUMN public.asama_tanimlari.gecis_kosullari IS 'Geçiş koşulları (JSON formatında) - Sonraki aşamaya geçiş için gerekli koşullar';
COMMENT ON COLUMN public.asama_tanimlari.kontrol_verileri IS 'Kontrol edilmesi gereken veriler (array) - Bu aşamada kontrol edilecek veri türleri';

-- ============================================
-- TAMAMLANDI
-- ============================================

-- NOT: Aşama tanımları mock veri migration'ında (030) eklenecek
-- Her program için aşamalar docs klasöründeki JSON dosyalarından alınacak:
-- - Doktora: DERS_DONEMI, YETERLIK_SINAVI, TEZ_ONERISI, TEZ_CALISMASI, TEZ_SAVUNMA, MEZUNIYET
-- - Tezli YL: DERS_DONEMI, TEZ_ONERISI, TEZ_CALISMASI, TEZ_SAVUNMA, MEZUNIYET
-- - Tezsiz İÖ: DERS_DONEMI, DONEM_PROJESI, YETERLIK_SINAVI, MEZUNIYET
-- - Tezsiz Uzaktan: DERS_DONEMI, DONEM_PROJESI, YETERLIK_SINAVI, MEZUNIYET

