-- =========================================================================
-- Migración 003: portal del socio completo.
--
-- Lleva la base al modelo del sistema del club:
--   - categorías por antigüedad con su cuota mensual (Bronce, Plata, Oro)
--   - DNI, estado, medio de pago y foto con fecha de cambio en el socio
--   - pagos por período (las cuotas se generan solas desde el alta) con
--     comprobante adjunto, recargo por mora y verificación por IA
--   - archivos adjuntos (comprobantes y adjuntos de mensajes)
--   - registro de cambios, que también funciona como bandeja de
--     solicitudes para el personal
--   - bandeja de mensajes entre socios, personal y administración
-- =========================================================================

-- 1) Categorías: mismos tramos y cuotas que usa el club.
UPDATE categorias_socio SET anios_minimos = 0, anios_maximos = 2, descripcion = 'Hasta 2 años de antigüedad' WHERE nombre = 'Bronce';
UPDATE categorias_socio SET anios_minimos = 3, anios_maximos = 10, descripcion = 'De 2 a 10 años de antigüedad' WHERE nombre = 'Plata';
UPDATE categorias_socio SET anios_minimos = 11, anios_maximos = NULL, descripcion = 'Más de 10 años de antigüedad' WHERE nombre = 'Oro';

ALTER TABLE categorias_socio ADD COLUMN cuota_mensual NUMERIC(12,2);
UPDATE categorias_socio SET cuota_mensual = CASE nombre WHEN 'Bronce' THEN 15000 WHEN 'Plata' THEN 18000 ELSE 21000 END;
ALTER TABLE categorias_socio ALTER COLUMN cuota_mensual SET NOT NULL;

-- 2) Datos nuevos del socio.
ALTER TABLE socios ADD COLUMN dni VARCHAR(8) UNIQUE;
-- 'En validación' mientras el personal revisa el alta online; 'Activo' después.
ALTER TABLE socios ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'Activo';
-- { tipo: 'tarjeta' | 'efectivo', debitoAutomatico, emisor, red, ultimos4 }.
-- De la tarjeta nunca se guarda el número completo ni el código.
ALTER TABLE socios ADD COLUMN medio_pago JSONB NOT NULL DEFAULT '{"tipo": "efectivo", "debitoAutomatico": false}';
ALTER TABLE socios ADD COLUMN foto_actualizada TIMESTAMPTZ;
ALTER TABLE socios ADD COLUMN debe_cambiar_contrasena BOOLEAN NOT NULL DEFAULT FALSE;
-- Qué leyó la IA del DNI al registrarse y qué corrigió el socio a mano.
ALTER TABLE socios ADD COLUMN lectura_ia JSONB;
CREATE INDEX idx_socios_dni ON socios(dni);

-- 3) Archivos adjuntos. Se guardan aparte para que listar pagos o
--    mensajes no traiga el contenido de cada archivo.
CREATE TABLE archivos (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre      VARCHAR(200) NOT NULL,
    tipo        VARCHAR(100) NOT NULL,
    tamanio     INT NOT NULL,
    datos       TEXT NOT NULL, -- data URL (imagen optimizada o PDF)
    subido_por  UUID REFERENCES socios(id) ON DELETE SET NULL,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Pagos por período en lugar de por cuota cargada a mano.
ALTER TABLE pagos ADD COLUMN periodo VARCHAR(7);
UPDATE pagos p SET periodo = c.periodo FROM cuotas c WHERE c.id = p.cuota_id;
ALTER TABLE pagos ALTER COLUMN periodo SET NOT NULL;
ALTER TABLE pagos ALTER COLUMN cuota_id DROP NOT NULL;

DROP INDEX IF EXISTS ux_pagos_socio_cuota_activo;
CREATE UNIQUE INDEX ux_pagos_socio_periodo_activo ON pagos (socio_id, periodo) WHERE estado <> 'rechazado';
CREATE INDEX idx_pagos_periodo ON pagos(periodo);

-- Medios como los muestra el portal: Transferencia, Billetera virtual,
-- Depósito, Efectivo o Tarjeta (débito automático).
ALTER TABLE pagos ALTER COLUMN medio_pago TYPE VARCHAR(30) USING initcap(medio_pago::text);
UPDATE pagos SET medio_pago = 'Tarjeta' WHERE medio_pago IN ('Debito', 'Credito');

ALTER TABLE pagos ADD COLUMN concepto VARCHAR(40) NOT NULL DEFAULT 'Cuota mensual';
ALTER TABLE pagos ADD COLUMN base NUMERIC(12,2);
UPDATE pagos SET base = monto;
ALTER TABLE pagos ALTER COLUMN base SET NOT NULL;
ALTER TABLE pagos ADD COLUMN recargo NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE pagos ADD COLUMN dias_demora INT NOT NULL DEFAULT 0;
ALTER TABLE pagos ADD COLUMN comprobante_id UUID REFERENCES archivos(id) ON DELETE SET NULL;
-- Lo que leyó la IA del comprobante: monto, fecha, número de operación
-- y si coincide con la cuota.
ALTER TABLE pagos ADD COLUMN verificacion_ia JSONB;
ALTER TABLE pagos ADD COLUMN informado_en TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE pagos ADD COLUMN resuelto_por VARCHAR(120);
ALTER TABLE pagos ADD COLUMN resuelto_en TIMESTAMPTZ;

-- 5) Registro de cambios. Cada modificación de una cuenta queda como
--    constancia; las que necesitan aprobación (alta online, cambio de
--    nombre, DNI o nacimiento) quedan con pendiente = true y aparecen
--    como solicitudes para el personal.
CREATE TABLE registro_cambios (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha         TIMESTAMPTZ NOT NULL DEFAULT now(),
    socio_id      UUID REFERENCES socios(id) ON DELETE CASCADE,
    socio_nombre  VARCHAR(200) NOT NULL,
    seccion       VARCHAR(80) NOT NULL,
    autor         VARCHAR(120) NOT NULL DEFAULT 'Socio',
    cambios       JSONB NOT NULL, -- [{ campo, anterior, nuevo }] para mostrar
    valores       JSONB,          -- { campo: { anterior, nuevo } } para aplicar o revertir
    pendiente     BOOLEAN NOT NULL DEFAULT FALSE,
    resuelto      VARCHAR(20),    -- 'Autorizado' | 'Rechazado'
    motivo        TEXT,
    resuelto_por  VARCHAR(120),
    resuelto_en   TIMESTAMPTZ
);
CREATE INDEX idx_registro_socio ON registro_cambios(socio_id);
CREATE INDEX idx_registro_fecha ON registro_cambios(fecha DESC);
CREATE INDEX idx_registro_pendientes ON registro_cambios(pendiente) WHERE pendiente AND resuelto IS NULL;

-- 6) Mensajes. Un hilo 'socio' es la conversación de un socio con
--    administración; un hilo 'interno' es entre la administración
--    principal y una persona del personal.
CREATE TABLE hilos (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo              VARCHAR(10) NOT NULL DEFAULT 'socio' CHECK (tipo IN ('socio', 'interno')),
    socio_id          UUID REFERENCES socios(id) ON DELETE CASCADE,
    asunto            VARCHAR(120) NOT NULL,
    leido_por_socio   BOOLEAN NOT NULL DEFAULT FALSE, -- en un hilo interno: leído por el empleado
    leido_por_club    BOOLEAN NOT NULL DEFAULT FALSE, -- en un hilo interno: leído por la dirección
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_hilos_socio ON hilos(socio_id);

CREATE TABLE mensajes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hilo_id    UUID NOT NULL REFERENCES hilos(id) ON DELETE CASCADE,
    autor_id   UUID REFERENCES socios(id) ON DELETE SET NULL,
    del_club   BOOLEAN NOT NULL, -- true si lo escribió el personal o la dirección
    de         VARCHAR(150) NOT NULL,
    para       VARCHAR(150) NOT NULL,
    texto      TEXT NOT NULL,
    adjuntos   JSONB NOT NULL DEFAULT '[]', -- [{ id, nombre, tipo, tamanio }]
    fecha      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mensajes_hilo ON mensajes(hilo_id, fecha);
