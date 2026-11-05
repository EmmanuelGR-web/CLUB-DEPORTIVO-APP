const URL_API = '/api'

const TIEMPO_MAXIMO = 60000

const mensajesPorEstado = {
  400: 'Los datos enviados no son válidos.',
  403: 'No tenés permiso para hacer esto.',
  404: 'No se encontró el dato pedido.',
  413: 'Los datos son demasiado pesados para el servidor.',
  429: 'Demasiados pedidos seguidos. Probá de nuevo en un momento.',
  500: 'El servidor tuvo un problema. Probá de nuevo.',
}

let alVencerSesion = () => {}
export const configurarVencimiento = (accion) => {
  alVencerSesion = accion
}

export async function pedir(ruta, { metodo = 'GET', datos, conSesion = true } = {}) {
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), TIEMPO_MAXIMO)
  const cabeceras = { 'Content-Type': 'application/json', 'X-Club-Cliente': 'web' }

  let respuesta
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      credentials: 'same-origin',
      body: datos === undefined ? undefined : JSON.stringify(datos),
      signal: control.signal,
    })
  } catch (problema) {
    const mensaje = problema.name === 'AbortError' ? 'El servidor tardó demasiado en responder. Probá de nuevo.' : 'No hay conexión con el servidor. Revisá tu internet.'
    throw Object.assign(new Error(mensaje, { cause: problema }), { estado: 0 })
  } finally {
    clearTimeout(temporizador)
  }

  const texto = await respuesta.text()
  let cuerpo = null
  try {
    cuerpo = texto ? JSON.parse(texto) : null
  } catch {
  }
  if (!respuesta.ok) {
    if (respuesta.status === 401 && conSesion) alVencerSesion()
    const delServidor = Array.isArray(cuerpo?.message) ? cuerpo.message[0] : cuerpo?.message
    const mensaje = delServidor ?? mensajesPorEstado[respuesta.status] ?? `El servidor respondió con un error (${respuesta.status}).`
    throw Object.assign(new Error(mensaje), { estado: respuesta.status, datos: cuerpo })
  }
  return cuerpo
}
