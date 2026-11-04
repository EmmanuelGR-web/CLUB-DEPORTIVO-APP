-- =========================================================================
-- Migración 007: la cuota mensual es la misma para todas las categorías.
--
-- La categoría (Bronce, Plata u Oro) sube con la antigüedad del socio y da
-- acceso a más beneficios, pero no cambia lo que paga. La 003 había dejado
-- $15.000, $18.000 y $21.000; quedan las tres en $15.000, igual que la regla
-- de cuotas del backend (CUOTA_MENSUAL en cuotas.util.ts).
-- =========================================================================

UPDATE categorias_socio SET cuota_mensual = 15000;
