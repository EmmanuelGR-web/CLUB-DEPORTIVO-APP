// Las mismas reglas que usa el backend (cuotas.util.ts), para mostrarle
// al socio cuánto le queda la cuota según la fecha en que pagó.

export const diaVencimiento = 15
export const interesDiario = 0.001

const unDia = 24 * 3600 * 1000

export const vencimientoDe = (anio, mes) => new Date(anio, mes, diaVencimiento, 23, 59, 59)

export const diasDeDemora = (anio, mes, fechaPago = new Date(), vence = vencimientoDe(anio, mes)) => {
  return fechaPago > vence ? Math.ceil((fechaPago - vence) / unDia) : 0
}

export const calcularCuota = (base, anio, mes, fechaPago = new Date(), vence = vencimientoDe(anio, mes)) => {
  const dias = diasDeDemora(anio, mes, fechaPago, vence)
  const recargo = Math.round(base * interesDiario * dias)
  return { base, dias, recargo, total: base + recargo }
}
