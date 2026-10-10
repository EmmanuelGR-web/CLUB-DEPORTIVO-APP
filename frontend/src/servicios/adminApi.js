// Pedidos de la administración: /admin (solo la dirección), /noticias y
// /beneficios (también los gestiona el personal administrativo).
import { pedir } from './api'

export const obtenerPanelAdmin = () => pedir('/admin/panel')

export const agregarPersonalApi = (datos) => pedir('/admin/personal', { metodo: 'POST', datos })

export const actualizarPersonalApi = (ids, cambios) => pedir('/admin/personal', { metodo: 'PATCH', datos: { ids, cambios } })

export const eliminarPersonalApi = (ids) => pedir('/admin/personal', { metodo: 'DELETE', datos: { ids } })

export const listarNoticias = () => pedir('/noticias', { conSesion: false })

export const crearNoticia = (noticia) => pedir('/noticias', { metodo: 'POST', datos: noticia })

export const modificarNoticia = (id, noticia) => pedir(`/noticias/${id}`, { metodo: 'PATCH', datos: noticia })

export const borrarNoticia = (id) => pedir(`/noticias/${id}`, { metodo: 'DELETE' })

export const listarBeneficios = () => pedir('/beneficios')

export const crearBeneficio = (beneficio) => pedir('/beneficios', { metodo: 'POST', datos: beneficio })

export const modificarBeneficio = (id, beneficio) => pedir(`/beneficios/${id}`, { metodo: 'PATCH', datos: beneficio })

export const borrarBeneficio = (id) => pedir(`/beneficios/${id}`, { metodo: 'DELETE' })
