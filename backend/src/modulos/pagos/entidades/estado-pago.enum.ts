// =====================================================================
// estado-pago.enum.ts
// -----------------------------------------------------------------------
// Ciclo de vida de un pago:
//
//   PENDIENTE  → se registró la intención de pago, pero todavía no
//                se confirmó (ej: una transferencia recién declarada,
//                o un pago con tarjeta que Mercado Pago aún procesa).
//   APROBADO   → el pago se confirmó y el socio queda al día con esa
//                cuota.
//   RECHAZADO  → el pago no se pudo completar (ej: tarjeta rechazada,
//                comprobante de transferencia inválido).
// =====================================================================

export enum EstadoPago {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
}
