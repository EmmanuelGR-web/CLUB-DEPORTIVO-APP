-- =====================================================================
-- 001_crear_tablas_base.sql
-- -----------------------------------------------------------------------
-- Migración inicial: crea las tablas núcleo del sistema.
-- Ejecutar esto una sola vez sobre una base PostgreSQL vacía
-- (por ejemplo en Supabase, desde el "SQL Editor").
--
-- Se usa UUID como clave primaria interna en la mayoría de las tablas
-- (más seguro y escalable que un id numérico autoincremental cuando
-- se trabaja con 20.000+ registros y APIs públicas), salvo en
-- "id_socio" que es el número de socio visible y correlativo.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipo de dato para los roles de usuario del sistema.
CREATE TYPE rol_usuario AS ENUM ('socio', 'administrativo', 'admin_principal');

-- ---------------------------------------------------------------------
-- Tabla: categorias_socio
-- Niveles de antigüedad (Oro / Plata / Bronce).
-- ---------------------------------------------------------------------
CREATE TABLE categorias_socio (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(20) NOT NULL UNIQUE,
    anios_minimos   INT NOT NULL,
    anios_maximos   INT, -- NULL = sin límite superior
    descripcion     TEXT
);

-- Datos iniciales de ejemplo (ajustables por el club desde el panel admin)
INSERT INTO categorias_socio (nombre, anios_minimos, anios_maximos, descripcion) VALUES
    ('Bronce', 0, 4, 'Socios con hasta 4 años de antigüedad'),
    ('Plata', 5, 14, 'Socios de entre 5 y 14 años de antigüedad'),
    ('Oro', 15, NULL, 'Socios con 15 años de antigüedad o más');

-- ---------------------------------------------------------------------
-- Tabla: socios
-- Tabla central del sistema.
-- ---------------------------------------------------------------------
CREATE TABLE socios (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_socio            BIGINT NOT NULL UNIQUE, -- número de socio visible, inmutable
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash     TEXT NOT NULL,
    telefono            VARCHAR(20),
    fecha_nacimiento    DATE,
    ciudad              VARCHAR(100),
    provincia           VARCHAR(100),
    direccion           VARCHAR(200),
    foto_carnet_url     TEXT,
    fecha_alta          DATE NOT NULL DEFAULT CURRENT_DATE,
    categoria_id        UUID REFERENCES categorias_socio(id),
    rol                 rol_usuario NOT NULL DEFAULT 'socio',
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsquedas frecuentes (mostrador del club, login, admin)
CREATE INDEX idx_socios_id_socio ON socios(id_socio);
CREATE INDEX idx_socios_email ON socios(email);
CREATE INDEX idx_socios_categoria ON socios(categoria_id);

-- Secuencia propia para id_socio, empezando en un número "de marca"
-- (fácil de reconocer, y evita confundir con IDs de prueba).
CREATE SEQUENCE secuencia_id_socio START WITH 599000001;
ALTER TABLE socios ALTER COLUMN id_socio SET DEFAULT nextval('secuencia_id_socio');

-- ---------------------------------------------------------------------
-- Tabla: cuotas
-- Define los períodos de cuota social (ej: "Cuota Agosto 2026").
-- ---------------------------------------------------------------------
CREATE TABLE cuotas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    periodo         VARCHAR(20) NOT NULL, -- ej: '2026-08'
    monto           NUMERIC(12,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(periodo)
);

-- ---------------------------------------------------------------------
-- Tabla: pagos
-- Registra cada pago realizado por un socio.
-- NUMERIC en vez de FLOAT: nunca usar coma flotante para dinero,
-- por errores de precisión (esto es examinable en la defensa de tesis).
-- ---------------------------------------------------------------------
CREATE TYPE medio_pago AS ENUM ('efectivo', 'transferencia', 'debito', 'credito');
CREATE TYPE estado_pago AS ENUM ('pendiente', 'aprobado', 'rechazado');

CREATE TABLE pagos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    socio_id        UUID NOT NULL REFERENCES socios(id) ON DELETE RESTRICT,
    cuota_id        UUID NOT NULL REFERENCES cuotas(id) ON DELETE RESTRICT,
    monto           NUMERIC(12,2) NOT NULL,
    medio_pago      medio_pago NOT NULL,
    estado          estado_pago NOT NULL DEFAULT 'pendiente',
    comprobante_url TEXT,
    fecha_pago      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(socio_id, cuota_id) -- evita pagar dos veces la misma cuota
);

CREATE INDEX idx_pagos_socio ON pagos(socio_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);

-- ---------------------------------------------------------------------
-- Tabla: auditoria
-- Registro de cambios importantes, clave para 20.000+ socios y
-- trazabilidad de movimientos económicos.
-- ---------------------------------------------------------------------
CREATE TABLE auditoria (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id      UUID REFERENCES socios(id),
    accion          VARCHAR(100) NOT NULL,
    tabla_afectada  VARCHAR(100) NOT NULL,
    registro_id     UUID,
    detalle         JSONB,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- NOTA: las tablas de disciplinas, plantel, fixture, comisión
-- directiva, beneficios, etc. se agregan en las migraciones de las
-- fases siguientes (002_..., 003_...), para mantener cada migración
-- enfocada en un módulo concreto y más fácil de revisar/defender.
-- =====================================================================
