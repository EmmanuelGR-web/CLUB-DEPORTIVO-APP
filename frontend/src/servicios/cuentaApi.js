// Pedidos del socio a su propia cuenta (rutas /mi-cuenta del backend).
import { pedir } from './api'

export const iniciarSesionApi = (email, contrasena) =>
  pedir('/autenticacion/login', { metodo: 'POST', datos: { email, contrasena }, conSesion: false })

export const registrarSocio = (datos) => pedir('/autenticacion/registro', { metodo: 'POST', datos, conSesion: false })

export const leerDocumento = (tipo, archivos, contexto) =>
  pedir('/ia/leer-documento', { metodo: 'POST', datos: { tipo, archivos, contexto }, conSesion: false })

export const obtenerPerfil = () => pedir('/mi-cuenta')

export const guardarCambiosCuenta = (cambios, seccion) => pedir('/mi-cuenta', { metodo: 'PATCH', datos: { cambios, seccion } })

export const obtenerHistorial = () => pedir('/mi-cuenta/cambios')

export const cambiarContrasenaApi = (actual, nueva) => pedir('/mi-cuenta/contrasena', { metodo: 'POST', datos: { actual, nueva } })

export const informarPagoApi = (datos) => pedir('/mi-cuenta/pagos', { metodo: 'POST', datos })

export const obtenerHilos = () => pedir('/mi-cuenta/hilos')

export const crearHilo = (mensaje) => pedir('/mi-cuenta/hilos', { metodo: 'POST', datos: mensaje })

export const responderHilo = (id, mensaje) => pedir(`/mi-cuenta/hilos/${id}/mensajes`, { metodo: 'POST', datos: mensaje })

export const marcarHiloLeido = (id) => pedir(`/mi-cuenta/hilos/${id}/leido`, { metodo: 'POST' })

export const abrirArchivo = (id) => pedir(`/archivos/${id}`)
