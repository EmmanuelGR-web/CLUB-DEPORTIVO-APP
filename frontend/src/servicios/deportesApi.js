// Calendario y tabla del fútbol desde la API pública de ESPN. Por defecto
// muestra a San Martín de Tucumán (17814) en la Primera Nacional (arg.2);
// con las variables NEXT_PUBLIC_DEPORTES_* se cambia de equipo o de liga.

const urlDeportes = process.env.NEXT_PUBLIC_DEPORTES_URL || 'https://site.api.espn.com/apis'
const equipo = process.env.NEXT_PUBLIC_DEPORTES_EQUIPO || '17814'
const liga = process.env.NEXT_PUBLIC_DEPORTES_LIGA || 'arg.2'
export const nombreLiga = process.env.NEXT_PUBLIC_DEPORTES_NOMBRE_LIGA || 'Primera Nacional'

const apiDeportes = {
  async get(ruta, { params } = {}) {
    const consulta = params ? `?${new URLSearchParams(params)}` : ''
    let respuesta
    try {
      respuesta = await fetch(`${urlDeportes}${ruta}${consulta}`, { signal: AbortSignal.timeout(15000) })
    } catch {
      throw new Error('No hay conexión con el servicio de resultados.')
    }
    if (!respuesta.ok) throw new Error(`El servicio de resultados respondió con un error (${respuesta.status}).`)
    return { data: await respuesta.json() }
  },
}

const zonaHoraria = 'America/Argentina/Tucuman'

const aLado = (competidor) => ({
  id: competidor.team.id,
  nombre: competidor.team.displayName,
  escudo: competidor.team.logos?.[0]?.href ?? competidor.team.logo,
  goles: competidor.score?.displayValue !== undefined ? Number(competidor.score.displayValue) : null,
})

const aPartido = (evento) => {
  const competencia = evento.competitions[0]
  const local = aLado(competencia.competitors.find((c) => c.homeAway === 'home'))
  const visitante = aLado(competencia.competitors.find((c) => c.homeAway === 'away'))
  const inicio = new Date(evento.date)
  const jugado = competencia.status.type.completed
  return {
    id: evento.id,
    disciplina: 'Fútbol',
    fecha: inicio.toLocaleDateString('en-CA', { timeZone: zonaHoraria }),
    hora: inicio.toLocaleTimeString('es-AR', { timeZone: zonaHoraria, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
    titulo: `${local.nombre} vs ${visitante.nombre}`,
    lugar: competencia.venue?.fullName ?? 'Estadio a confirmar',
    local,
    visitante,
    jugado,
    descripcion: [nombreLiga, jugado ? `Resultado final: ${local.goles} a ${visitante.goles}.` : 'Partido por jugarse.'],
  }
}

const calendarioDelEquipo = async (proximos) => {
  const { data } = await apiDeportes.get(`/site/v2/sports/soccer/${liga}/teams/${equipo}/schedule`, { params: proximos ? { fixture: true } : {} })
  return (data.events ?? []).map(aPartido).sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))
}

export const proximosPartidos = async () => (await calendarioDelEquipo(true)).slice(0, 3)

export const ultimosResultados = async () => (await calendarioDelEquipo(false)).filter((p) => p.jugado).slice(-3)

const dato = (fila, nombre) => fila.stats.find((s) => s.name === nombre)?.displayValue ?? ''

export const tablaPosiciones = async () => {
  const { data } = await apiDeportes.get(`/v2/sports/soccer/${liga}/standings`)
  const grupos = data.children ?? [data]
  return grupos.map((grupo) => ({
    zona: (grupo.name ?? 'General').replace('Group', 'Zona'),
    equipos: grupo.standings.entries
      .map((fila) => ({
        id: fila.team.id,
        puesto: Number(dato(fila, 'rank')),
        equipo: fila.team.displayName,
        escudo: fila.team.logos?.[0]?.href,
        jugados: Number(dato(fila, 'gamesPlayed')),
        ganados: Number(dato(fila, 'wins')),
        empatados: Number(dato(fila, 'ties')),
        perdidos: Number(dato(fila, 'losses')),
        diferencia: dato(fila, 'pointDifferential'),
        puntos: Number(dato(fila, 'points')),
        esElEquipo: fila.team.id === equipo,
      }))
      .sort((a, b) => a.puesto - b.puesto),
  }))
}
