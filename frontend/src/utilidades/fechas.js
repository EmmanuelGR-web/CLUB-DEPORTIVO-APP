const aFecha = (fecha) => new Date(`${fecha}T12:00:00`)

export const formatearFecha = (fecha) => aFecha(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })

export const formatearFechaLarga = (fecha) => {
  const texto = aFecha(fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export const partesFecha = (fecha) => {
  const f = aFecha(fecha)
  return {
    dia: f.getDate(),
    mes: f.toLocaleDateString('es-AR', { month: 'short' }).replace('.', ''),
    diaSemana: f.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', ''),
  }
}

export const formatearFechaConAnio = (fecha) =>
  aFecha(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
