-- Migration 020: Create Admin Table
-- Admin kullanıcıları için ayrı tablo oluşturuluyor
-- Login mantığı olmadığı için sadece temel bilgiler tutulacak
-- ============================================

-- ============================================
-- ADMINLER TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS public.adminler (
  admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  telefon TEXT,
  aktif_mi BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- İNDEKSLER
-- ============================================

CREATE INDEX IF NOT EXISTS idx_adminler_email ON public.adminler(email);
CREATE INDEX IF NOT EXISTS idx_adminler_aktif ON public.adminler(aktif_mi) WHERE aktif_mi = true;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.adminler IS 'Sistem yöneticileri (Admin) - Login mantığı yok, sadece temel bilgiler';
COMMENT ON COLUMN public.adminler.email IS 'Admin e-posta adresi (unique)';
COMMENT ON COLUMN public.adminler.aktif_mi IS 'Admin aktif mi? (true/false)';

-- ============================================
-- TAMAMLANDI
-- ============================================

