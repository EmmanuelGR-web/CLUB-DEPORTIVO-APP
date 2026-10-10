export const idQrCarnet = 'qr-carnet'

export const barrasCarnet = (numero) =>
  [...numero.repeat(3)].flatMap((digito, i) => [
    { ancho: 1 + (Number(digito) % 3), color: i % 2 ? 'primary' : 'dark' },
    { ancho: 1 + ((Number(digito) + i) % 2), color: 'white' },
  ])

export const textoQr = (socio) => `CLUB-DEPORTIVO|SOCIO|${socio.numeroSocio}|${socio.dni}|${socio.categoria}`

export const formatearPesos = (monto) =>
  monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
