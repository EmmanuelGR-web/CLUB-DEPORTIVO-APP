-- =========================================================================
-- Migración 004: personal del club, jornadas, mensajes internos y noticias.
--
--   - personal: la nómina del club (código A01, A02…, rol, horario y
--     ausencias). Quien tiene usuario del portal se vincula por usuario_id.
--   - jornadas: ingreso, descansos y salida de cada día, para el control
--     del personal en vivo.
--   - hilos.personal_id: los mensajes internos entre la dirección y cada
--     persona del personal.
--   - noticias: las que se cargan desde el panel del administrador.
-- =========================================================================

CREATE TABLE personal (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo          VARCHAR(5) NOT NULL UNIQUE,          -- A01, A02...
    usuario_id      UUID UNIQUE REFERENCES socios(id) ON DELETE SET NULL,
    nombre          VARCHAR(150) NOT NULL,
    dni             VARCHAR(8),
    rol             VARCHAR(30) NOT NULL,                -- Administrativo, Tesorería, Recepción, Mantenimiento
    sector          VARCHAR(60),
    correo          VARCHAR(150) NOT NULL UNIQUE,
    telefono        VARCHAR(40),
    dias            VARCHAR(30) NOT NULL DEFAULT 'Lunes a viernes',
    entrada         VARCHAR(5) NOT NULL DEFAULT '09:00',
    salida          VARCHAR(5) NOT NULL DEFAULT '17:00',
    ingreso         DATE NOT NULL DEFAULT CURRENT_DATE,
    -- { motivo, desde, hasta, nota }: vacaciones, licencias o suspensión.
    -- Mientras está vigente, la persona no puede entrar al portal.
    ausencia        JSONB,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE jornadas (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personal_id       UUID NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
    fecha             DATE NOT NULL,
    inicio            TIMESTAMPTZ NOT NULL,
    ultima_actividad  TIMESTAMPTZ NOT NULL,
    estado            VARCHAR(12) NOT NULL DEFAULT 'trabajando', -- trabajando | descanso | fuera
    descansos         JSONB NOT NULL DEFAULT '[]',  -- [{ inicio, fin }] en milisegundos
    ausencias         JSONB NOT NULL DEFAULT '[]',  -- ratos sin conexión o fuera del portal
    fin               TIMESTAMPTZ,
    terminada         BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (personal_id, fecha)
);

ALTER TABLE hilos ADD COLUMN personal_id UUID REFERENCES personal(id) ON DELETE CASCADE;
CREATE INDEX idx_hilos_personal ON hilos(personal_id);

CREATE TABLE noticias (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria   VARCHAR(40) NOT NULL,
    fecha       DATE NOT NULL,
    titulo      VARCHAR(120) NOT NULL,
    resumen     VARCHAR(300) NOT NULL,
    cuerpo      JSONB NOT NULL DEFAULT '[]', -- párrafos
    imagen      TEXT,
    enlace      JSONB,                       -- { texto, ruta }
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_noticias_fecha ON noticias(fecha DESC);
