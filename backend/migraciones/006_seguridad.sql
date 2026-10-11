-- =========================================================================
-- Migración 006: seguridad de las cuentas y de la base.
--
-- 1. Bloqueo temporal de la cuenta después de varios intentos fallidos.
-- 2. Versión de la sesión: al cambiar o restablecer la contraseña sube y
--    los pases emitidos antes dejan de valer en todos los dispositivos.
-- 3. Constancia del consentimiento al tratamiento de datos personales
--    (Ley 25.326) que el socio acepta al registrarse.
-- 4. Row Level Security en todas las tablas: Supabase publica el esquema
--    public en su API REST, y sin RLS cualquiera con la clave anónima del
--    proyecto podría leerlas. El backend se conecta con el usuario dueño
--    de la base, que no está alcanzado por RLS, así que sigue igual.
-- =========================================================================

ALTER TABLE socios
    ADD COLUMN intentos_fallidos     INT NOT NULL DEFAULT 0,
    ADD COLUMN bloqueado_hasta       TIMESTAMPTZ,
    ADD COLUMN version_sesion        INT NOT NULL DEFAULT 0,
    ADD COLUMN privacidad_aceptada   TIMESTAMPTZ;

DO $$
DECLARE
    tabla RECORD;
BEGIN
    FOR tabla IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tabla.tablename);
    END LOOP;
END $$;
