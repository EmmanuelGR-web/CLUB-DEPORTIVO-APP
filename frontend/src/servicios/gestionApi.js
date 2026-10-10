// Pedidos del panel del personal (rutas /gestion del backend).
import { pedir } from './api'

export const obtenerPanelGestion = () => pedir('/gestion/panel')

export const resolverSolicitudApi = (id, estado, motivo) => pedir(`/gestion/solicitudes/${id}`, { metodo: 'POST', datos: { estado, motivo } })

export const obtenerFicha = (socioId) => pedir(`/gestion/socios/${socioId}`)

export const corregirSocio = (socioId, cambios, seccion) => pedir(`/gestion/socios/${socioId}`, { metodo: 'PATCH', datos: { cambios, seccion } })

export const restablecerContrasenaApi = (socioId) => pedir(`/gestion/socios/${socioId}/restablecer-contrasena`, { metodo: 'POST' })

export const darDeBajaApi = (socioId) => pedir(`/gestion/socios/${socioId}`, { metodo: 'DELETE' })

export const altaPresencialApi = (datos) => pedir('/gestion/socios', { metodo: 'POST', datos })

export const responderSocioApi = (hiloId, mensaje) => pedir(`/gestion/conversaciones/${hiloId}/mensajes`, { metodo: 'POST', datos: mensaje })

export const nuevoInternoApi = (mensaje, destino) => pedir('/gestion/interno', { metodo: 'POST', datos: { ...mensaje, destino } })

export const responderInternoApi = (hiloId, mensaje) => pedir(`/gestion/interno/${hiloId}/mensajes`, { metodo: 'POST', datos: mensaje })

export const leidoInternoApi = (hiloId) => pedir(`/gestion/interno/${hiloId}/leido`, { metodo: 'POST' })

export const jornadaApi = (accion) => pedir('/gestion/jornada', { metodo: 'POST', datos: { accion } })
