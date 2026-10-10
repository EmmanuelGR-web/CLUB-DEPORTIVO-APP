const nombreMes = (periodo, opciones) => new Date(`${periodo}-15T12:00:00`).toLocaleDateString('es-AR', opciones)

export const nombrePeriodo = (periodo) => {
  const texto = nombreMes(periodo, { month: 'long', year: 'numeric' })
  return texto[0].toUpperCase() + texto.slice(1)
}

export const cuotas = (cantidad) => `${cantidad} ${cantidad === 1 ? 'cuota' : 'cuotas'}`

export const periodoDe = (fecha = new Date()) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`

export const ultimosPeriodos = (cantidad, hoy = new Date()) => Array.from({ length: cantidad }, (_, i) => periodoDe(new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)))

const agrupar = (cuotas, clave) =>
  Object.values(
    cuotas.reduce((grupos, c) => {
      const etiqueta = clave(c)
      const grupo = grupos[etiqueta] ?? { etiqueta, cantidad: 0, monto: 0 }
      return { ...grupos, [etiqueta]: { ...grupo, cantidad: grupo.cantidad + 1, monto: grupo.monto + c.pago.monto } }
    }, {}),
  ).sort((a, b) => b.monto - a.monto)

const sumar = (cuotas, campo = 'monto') => cuotas.reduce((total, c) => total + c.pago[campo], 0)

export const resumenEconomico = (perfiles, periodo) => {
  const cuotas = perfiles.map((perfil) => ({ perfil, pago: perfil.pagos.find((p) => p.periodo === periodo) })).filter((c) => c.pago)
  const cobradas = cuotas.filter((c) => c.pago.estado === 'Aprobado')
  const enRevision = cuotas.filter((c) => c.pago.estado === 'En revisión')
  const impagas = cuotas.filter((c) => ['Pendiente', 'Vencido'].includes(c.pago.estado))
  const vencidas = impagas.filter((c) => c.pago.estado === 'Vencido')
  const emitido = sumar(cuotas)
  const ingresos = sumar(cobradas)

  return {
    periodo,
    nombre: nombrePeriodo(periodo),
    cuotas,
    padron: cuotas.length,
    activos: cuotas.filter((c) => c.perfil.estado === 'Activo').length,
    alDia: cobradas.length,
    emitido,
    ingresos,
    recargosCobrados: sumar(cobradas, 'recargo'),
    enRevision: sumar(enRevision),
    cantidadEnRevision: enRevision.length,
    impago: sumar(impagas),
    cantidadImpagas: impagas.length,
    cobranza: emitido ? Math.round((ingresos / emitido) * 100) : 0,
    morosos: vencidas.map(({ perfil, pago }) => ({
      id: perfil.id,
      nombre: perfil.nombreCompleto,
      numeroSocio: perfil.numeroSocio,
      categoria: perfil.categoria,
      telefono: perfil.telefono,
      dias: pago.diasDemora,
      recargo: pago.recargo,
      total: pago.monto,
    })),
    porMedio: agrupar(cobradas, (c) => c.pago.medio),
    porCategoria: agrupar(cuotas, (c) => c.perfil.categoria),
  }
}

export const evolucionIngresos = (perfiles, meses = 6) =>
  ultimosPeriodos(meses)
    .reverse()
    .map((periodo) => {
      const r = resumenEconomico(perfiles, periodo)
      return { periodo, nombre: nombreMes(periodo, { month: 'short', year: '2-digit' }), ingresos: r.ingresos, impago: r.impago + r.enRevision }
    })
