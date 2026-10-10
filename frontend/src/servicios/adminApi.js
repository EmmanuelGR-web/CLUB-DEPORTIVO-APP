// Pedidos exclusivos de la administración principal (rutas /admin y /noticias).
import { pedir } from './api'

export const obtenerPanelAdmin = () => pedir('/admin/panel')

export const agregarPersonalApi = (datos) => pedir('/admin/personal', { metodo: 'POST', datos })

export const actualizarPersonalApi = (ids, cambios) => pedir('/admin/personal', { metodo: 'PATCH', datos: { ids, cambios } })

export const eliminarPersonalApi = (ids) => pedir('/admin/personal', { metodo: 'DELETE', datos: { ids } })

export const listarNoticias = () => pedir('/noticias', { conSesion: false })

export const crearNoticia = (noticia) => pedir('/noticias', { metodo: 'POST', datos: noticia })

export const modificarNoticia = (id, noticia) => pedir(`/noticias/${id}`, { metodo: 'PATCH', datos: noticia })

export const borrarNoticia = (id) => pedir(`/noticias/${id}`, { metodo: 'DELETE' })
