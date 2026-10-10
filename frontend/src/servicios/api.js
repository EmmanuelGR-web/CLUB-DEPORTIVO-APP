// =====================================================================
// api.js
// -----------------------------------------------------------------------
// Cliente único para hablar con el backend del club. Agrega el token de
// la sesión, traduce los errores a mensajes que se pueden mostrar y
// corta la sesión si el token venció.
// =====================================================================

const URL_API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

// El backend gratuito "duerme" cuando no se usa: el primer pedido puede
// tardar cerca de un minuto en despertarlo.
const TIEMPO_MAXIMO = 60000

export const CLAVE_SESION = 'sesionClub'

const mensajesPorEstado = {
  400: 'Los datos enviados no son válidos.',
  404: 'No se encontró el dato pedido.',
  413: 'Los datos son demasiado pesados para el servidor.',
  429: 'Demasiados pedidos seguidos. Probá de nuevo en un momento.',
  500: 'El servidor tuvo un problema. Probá de nuevo.',
}

export const leerSesionGuardada = () => {
  try {
    const guardada = localStorage.getItem(CLAVE_SESION) ?? sessionStorage.getItem(CLAVE_SESION)
    return guardada ? JSON.parse(guardada) : null
  } catch {
    return null
  }
}

let alVencerSesion = () => {}
export const configurarVencimiento = (accion) => {
  alVencerSesion = accion
}

export async function pedir(ruta, { metodo = 'GET', datos, conSesion = true } = {}) {
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), TIEMPO_MAXIMO)
  const cabeceras = { 'Content-Type': 'application/json' }
  const token = conSesion ? leerSesionGuardada()?.token : null
  if (token) cabeceras.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: cabeceras,
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
  const cuerpo = texto ? JSON.parse(texto) : null
  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) alVencerSesion()
    const delServidor = Array.isArray(cuerpo?.message) ? cuerpo.message[0] : cuerpo?.message
    const mensaje = delServidor ?? mensajesPorEstado[respuesta.status] ?? `El servidor respondió con un error (${respuesta.status}).`
    throw Object.assign(new Error(mensaje), { estado: respuesta.status, datos: cuerpo })
  }
  return cuerpo
}
