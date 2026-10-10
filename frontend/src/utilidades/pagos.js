export const columnasPagos = [
  { id: 'id', etiqueta: 'Período' },
  { id: 'concepto', etiqueta: 'Concepto' },
  { id: 'medio', etiqueta: 'Medio de pago' },
  { id: 'monto', etiqueta: 'Monto' },
  { id: 'estado', etiqueta: 'Estado' },
]

export const filtroInicial = { anio: '', estado: '', medio: '', concepto: '' }

export const filtrarPagos = (pagos, filtro) =>
  pagos.filter(
    (p) =>
      (!filtro.anio || p.anio === Number(filtro.anio)) &&
      (!filtro.estado || p.estado === filtro.estado) &&
      (!filtro.medio || p.medio === filtro.medio) &&
      (!filtro.concepto || p.concepto === filtro.concepto),
  )

export const ordenarPagos = (pagos, { campo, asc }) =>
  [...pagos].sort((a, b) => {
    const resultado = typeof a[campo] === 'number' ? a[campo] - b[campo] : String(a[campo]).localeCompare(String(b[campo]))
    return asc ? resultado : -resultado
  })

export const opcionesDe = (pagos, campo) => [...new Set(pagos.map((p) => p[campo]))]

export const describirFiltro = (filtro) => {
  const partes = [
    filtro.anio && `año ${filtro.anio}`,
    filtro.estado && `estado ${filtro.estado.toLowerCase()}`,
    filtro.medio && `pagados con ${filtro.medio.toLowerCase()}`,
    filtro.concepto && filtro.concepto.toLowerCase(),
  ].filter(Boolean)
  return partes.length ? partes.join(', ') : 'todos los movimientos'
}
