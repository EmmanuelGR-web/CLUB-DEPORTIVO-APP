import { formatearFechaConAnio } from './fechas'

export const textoTurno = (e) => `${e.dias}, de ${e.entrada} a ${e.salida} h`

export const motivosAusencia = ['Vacaciones', 'Licencia médica', 'Licencia personal', 'Suspensión']

export const enActividadTexto = 'En actividad'
export const sinCambiosTexto = 'Sin cambios'

export const errorAusencia = (ausencia) => {
  if (!ausencia) return null
  if (!ausencia.desde || !ausencia.hasta) return 'Indicá desde y hasta qué día.'
  if (ausencia.hasta < ausencia.desde) return 'El último día no puede ser anterior al primero.'
  return null
}

export const fechaDeHoy = (fecha = new Date()) => fecha.toLocaleDateString('en-CA')

export const diaSiguiente = (dia) => {
  const fecha = new Date(`${dia}T12:00:00`)
  fecha.setDate(fecha.getDate() + 1)
  return fechaDeHoy(fecha)
}

export const ausenciaVigente = (empleado, hoy) => {
  const a = empleado.ausencia
  return a && a.desde <= hoy && hoy <= a.hasta ? a : null
}

export const ausenciaProgramada = (empleado, hoy) => (empleado.ausencia && empleado.ausencia.desde > hoy ? empleado.ausencia : null)

export const enActividad = (empleado, hoy) => !ausenciaVigente(empleado, hoy)

export const textoRegreso = (ausencia) => `Vuelve el ${formatearFechaConAnio(diaSiguiente(ausencia.hasta))}`

export const textoAusencia = (ausencia) => `${ausencia.motivo} del ${formatearFechaConAnio(ausencia.desde)} al ${formatearFechaConAnio(ausencia.hasta)}`
