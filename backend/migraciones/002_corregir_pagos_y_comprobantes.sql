-- =========================================================================
-- Migración 002: corrige el bloqueo de reintento de pagos rechazados,
-- agrega el comprobante/cupón de pago y una observación administrativa,
-- y agrega auditoría de modificación a las cuotas.
--
-- Contexto del fix (ver docs/guia-commits.md del PR correspondiente):
-- la restricción UNIQUE(socio_id, cuota_id) original impedía que un
-- socio volviera a declarar un pago después de que el club le
-- rechazara el primero (ej: comprobante de transferencia inválido),
-- dejándolo trabado sin forma de regularizar esa cuota.
-- =========================================================================

-- 1) Sacamos la restricción UNIQUE original.
--    NOTA: si tu instancia le puso otro nombre a esta constraint,
--    consultalo antes con:
--      SELECT conname FROM pg_constraint WHERE conrelid = 'pagos'::regclass;
ALTER TABLE pagos DROP CONSTRAINT IF EXISTS pagos_socio_id_cuota_id_key;

-- 2) La reemplazamos por un índice único PARCIAL: solo aplica a pagos
--    que NO están rechazados. Así, un socio puede tener como máximo
--    un pago "vivo" (pendiente o aprobado) por cuota, pero si el
--    único pago que tiene está rechazado, puede volver a intentar.
CREATE UNIQUE INDEX ux_pagos_socio_cuota_activo
    ON pagos (socio_id, cuota_id)
    WHERE estado <> 'rechazado';

-- 3) Comprobante/cupón de pago: se completa automáticamente cuando el
--    pago pasa a estado 'aprobado'. Queda NULL mientras el pago está
--    pendiente o rechazado.
ALTER TABLE pagos ADD COLUMN numero_comprobante VARCHAR(30) UNIQUE;

-- 4) Observación administrativa: para que el administrativo deje
--    constancia del motivo cuando corrige o rechaza un pago
--    (ej: "comprobante ilegible, se pidió reenviar").
ALTER TABLE pagos ADD COLUMN observacion TEXT;

-- 5) Auditoría de cuándo se actualizó cada pago por última vez
--    (reintento de un rechazo, cambio de estado, etc.). El pago ya
--    tenía fecha_pago, pero esa es de creación; esta es de la última
--    modificación.
ALTER TABLE pagos ADD COLUMN actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now();

-- 6) El admin ahora puede corregir el monto o la fecha de vencimiento
--    de una cuota ya creada (ej: error de tipeo, ajuste de precio).
--    Guardamos cuándo fue la última modificación para trazabilidad.
--    IMPORTANTE: esto NO afecta pagos ya registrados, porque
--    "pagos.monto" guarda una COPIA del monto vigente al momento del
--    pago, no una referencia a la cuota.
ALTER TABLE cuotas ADD COLUMN actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now();
