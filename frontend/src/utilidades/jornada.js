import { diasLaborales } from '../datos/gestion'

const minuto = 60 * 1000
export const descansoPermitido = 30 * minuto
export const intervaloActividad = 20 * 1000
const limiteConexion = 90 * 1000

const aMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}
const semilla = (texto) => [...texto].reduce((total, letra) => total + letra.charCodeAt(0), 0)

const jornadaSimulada = (empleado, ahora) => {
  const hoy = new Date(ahora)
  if (!diasLaborales[empleado.dias]?.includes(hoy.getDay())) return { franco: true }
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()
  const s = semilla(empleado.id)
  const llegada = base + (aMinutos(empleado.entrada) + (s % 9) - 4) * minuto
  const salida = base + (aMinutos(empleado.salida) + (s % 7)) * minuto
  if (ahora < llegada) return null
  const inicioDescanso = (llegada + salida) / 2 + ((s % 21) - 10) * minuto
  const finDescanso = inicioDescanso + (20 + (s % 21)) * minuto
  const descansos = ahora >= inicioDescanso ? [{ inicio: inicioDescanso, fin: ahora < finDescanso ? null : finDescanso }] : []
  const termino = ahora >= salida
  return {
    inicio: llegada,
    ultimaActividad: termino ? salida : ahora,
    estado: termino ? 'fuera' : descansos[0]?.fin === null ? 'descanso' : 'trabajando',
    descansos,
    ausencias: [],
    fin: termino ? salida : null,
    terminada: termino,
    simulada: true,
  }
}

const etiquetas = {
  linea: 'En línea',
  descanso: 'En descanso',
  sinConexion: 'Sin conexión',
  termino: 'Terminó su jornada',
  fuera: 'Salió del portal',
  sinIngresar: 'Aún no ingresó',
  franco: 'Franco hoy',
}

export const estadoJornada = (jornada, ahora) => {
  if (!jornada || jornada.franco) {
    const clave = jornada?.franco ? 'franco' : 'sinIngresar'
    return { clave, etiqueta: etiquetas[clave], trabajado: 0, descanso: 0, descansoActual: 0, excedido: false }
  }
  const sinConexion = jornada.estado !== 'fuera' && ahora - jornada.ultimaActividad > limiteConexion
  const referencia = jornada.estado === 'fuera' ? jornada.fin : sinConexion ? jornada.ultimaActividad : ahora
  const sumar = (lista) => lista.reduce((total, x) => total + Math.max(0, Math.min(x.fin ?? referencia, referencia) - x.inicio), 0)
  const descanso = sumar(jornada.descansos)
  const clave = jornada.estado === 'fuera' ? (jornada.terminada ? 'termino' : 'fuera') : sinConexion ? 'sinConexion' : jornada.estado === 'descanso' ? 'descanso' : 'linea'
  return {
    clave,
    etiqueta: etiquetas[clave],
    inicio: jornada.inicio,
    fin: jornada.fin,
    ultimaActividad: jornada.ultimaActividad,
    trabajado: Math.max(0, referencia - jornada.inicio - descanso - sumar(jornada.ausencias)),
    descanso,
    descansoActual: clave === 'descanso' ? Math.max(0, referencia - jornada.descansos.at(-1).inicio) : 0,
    excedido: descanso - descansoPermitido >= minuto,
    simulada: Boolean(jornada.simulada),
  }
}

// Quien usa el portal tiene su jornada real; para el resto se arma una
// según su horario, así el control del personal se puede mostrar completo.
export const presenciaDe = (empleado, jornadas, ahora) =>
  estadoJornada(empleado.conPortal ? jornadas[empleado.id] : jornadaSimulada(empleado, ahora), ahora)

export const textoDuracion = (ms) => {
  const total = Math.max(0, Math.floor(ms / minuto))
  const horas = Math.floor(total / 60)
  return horas ? `${horas} h ${String(total % 60).padStart(2, '0')} min` : `${total} min`
}

export const reloj = (ms) => {
  const segundos = Math.max(0, Math.floor(ms / 1000))
  return `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`
}

export const horaCorta = (ms) => new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

export const hace = (ms, ahora) => {
  const minutos = Math.floor((ahora - ms) / minuto)
  if (minutos < 1) return 'ahora'
  return minutos < 60 ? `hace ${minutos} min` : `hace ${textoDuracion(ahora - ms)}`
}

export const colorEstado = { linea: 'success', descanso: 'warning', sinConexion: 'danger', fuera: 'secondary', termino: 'secondary', sinIngresar: 'secondary', franco: 'secondary' }
