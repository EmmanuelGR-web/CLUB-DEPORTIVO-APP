// =====================================================================
// numero-comprobante.util.ts
// -----------------------------------------------------------------------
// Genera el número de comprobante/cupón que se le muestra al socio
// cuando su pago queda APROBADO. Es una función pura (mismo criterio
// que codigo-barras.util.ts): a partir del mismo id de pago siempre
// da el mismo resultado, así que se puede "regenerar" sin problema
// si hiciera falta reimprimir el comprobante más adelante.
//
// Formato: REC-{año}-{primeros 8 caracteres del id del pago, en mayúsculas}
// Ejemplo: REC-2026-3F9A2B7C
//
// Se usan caracteres del UUID del pago (ya único por definición) en
// vez de armar un contador con una secuencia propia de base de datos:
// evita tener que coordinar otra secuencia y, de paso, el número
// queda inequívocamente ligado a ESE pago puntual.
// =====================================================================

export function generarNumeroComprobante(idPago: string, fechaAprobacion: Date): string {
  const anio = fechaAprobacion.getFullYear();
  const sufijo = idPago.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `REC-${anio}-${sufijo}`;
}
