-- Migration 999: Drop All Database Objects (Except Tables and Data)
-- Tüm veritabanı objelerini sil (Tablolar ve veriler korunacak)
-- Bu script fonksiyonlar, trigger'lar, view'ler, indeksler ve RLS policy'lerini siler

-- ============================================
-- UYARI: Bu script tabloları ve verileri silmez!
-- Sadece fonksiyonlar, trigger'lar, view'ler, indeksler ve RLS policy'leri silinir.
-- ============================================

-- ============================================
-- 1. TÜM TRIGGER'LARI SİL
-- ============================================

-- Tüm trigger'ları dinamik olarak sil
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT trigger_name, event_object_table, event_object_schema
        FROM information_schema.triggers
        WHERE event_object_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE', 
            r.trigger_name, r.event_object_schema, r.event_object_table);
    END LOOP;
END $$;

-- ============================================
-- 2. TÜM FONKSİYONLARI SİL
-- ============================================

-- Tüm fonksiyonları dinamik olarak sil
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc
        INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
        WHERE pg_namespace.nspname = 'public'
        AND proname NOT LIKE 'pg_%'
        AND proname NOT LIKE 'information_schema%'
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE', 
                r.proname, r.args);
        EXCEPTION WHEN OTHERS THEN
            -- Bazı fonksiyonlar farklı imzalarla olabilir, tüm varyantları dene
            FOR r IN 
                SELECT proname, pg_get_function_identity_arguments(oid) as args
                FROM pg_proc
                INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
                WHERE pg_namespace.nspname = 'public'
                AND proname = r.proname
            LOOP
                BEGIN
                    EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE', 
                        r.proname, r.args);
                EXCEPTION WHEN OTHERS THEN
                    -- Hata olsa bile devam et
                    NULL;
                END;
            END LOOP;
        END;
    END LOOP;
END $$;

-- Alternatif yöntem: Tüm fonksiyonları tek tek sil
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        INNER JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname NOT LIKE 'pg_%'
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE', 
                r.proname, COALESCE(r.args, ''));
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================
-- 3. TÜM VIEW'LERİ SİL
-- ============================================

-- Tüm view'leri dinamik olarak sil
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', r.table_name);
    END LOOP;
END $$;

-- ============================================
-- 4. TÜM CONSTRAINT'LERİ SİL (Primary Key ve Foreign Key hariç)
-- ============================================

-- Önce unique constraint'leri ve check constraint'leri sil
-- (Primary key ve foreign key constraint'leri korunacak)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            n.nspname as schema_name,
            t.relname as table_name,
            c.conname as constraint_name,
            c.contype as constraint_type
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = 'public'
        AND c.contype IN ('u', 'c') -- 'u' = unique, 'c' = check
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I CASCADE', 
                r.schema_name, r.table_name, r.constraint_name);
        EXCEPTION WHEN OTHERS THEN
            -- Hata olsa bile devam et
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================
-- 5. TÜM İNDEKSLERİ SİL (Primary Key ve Foreign Key constraint'leri hariç)
-- ============================================

-- Tüm indeksleri dinamik olarak sil (PK ve FK constraint'leri hariç)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey'
        AND indexname NOT LIKE '%_fkey'
    LOOP
        BEGIN
            EXECUTE format('DROP INDEX IF EXISTS public.%I CASCADE', r.indexname);
        EXCEPTION WHEN OTHERS THEN
            -- Constraint'e bağlı index'ler için hata olabilir, devam et
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================
-- 6. TÜM RLS (Row Level Security) POLICY'LERİNİ SİL
-- ============================================

-- Tüm RLS policy'lerini dinamik olarak sil
DO $$
DECLARE
    r RECORD;
    t RECORD;
BEGIN
    -- Önce tüm tablolardaki policy'leri sil
    FOR t IN 
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        FOR r IN 
            SELECT policyname
            FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = t.tablename
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I CASCADE', 
                r.policyname, t.tablename);
        END LOOP;
    END LOOP;
END $$;

-- RLS'yi devre dışı bırak (opsiyonel - tablolar korunacak)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;
END $$;

-- ============================================
-- 7. TÜM SEQUENCE'LERİ SİL (Tablolarla ilişkili olmayanlar)
-- ============================================

-- Tablolarla ilişkili olmayan sequence'leri sil
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
        AND sequence_name NOT IN (
            SELECT column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND column_default LIKE 'nextval%'
        )
    LOOP
        BEGIN
            EXECUTE format('DROP SEQUENCE IF EXISTS public.%I CASCADE', r.sequence_name);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ============================================
-- TAMAMLANDI
-- ============================================

-- Not: Tablolar ve içindeki veriler korunmuştur.
-- Sadece fonksiyonlar, trigger'lar, view'ler, indeksler ve RLS policy'leri silinmiştir.

