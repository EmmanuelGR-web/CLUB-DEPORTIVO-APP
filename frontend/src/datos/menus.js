import { FaThLarge, FaUser, FaFileInvoiceDollar, FaInbox, FaClipboardCheck, FaUsers, FaHistory, FaUserPlus, FaIdBadge, FaComments, FaUserTie, FaChartBar, FaUserClock, FaNewspaper } from 'react-icons/fa'

export const enlacesInicio = [
  { etiqueta: 'Inicio', href: '#inicio' },
  { etiqueta: 'Reseña histórica', href: '#resena' },
  { etiqueta: 'Noticias', href: '#noticias' },
  { etiqueta: 'Calendario', href: '#calendario' },
  { etiqueta: 'Disciplinas', href: '#disciplinas' },
  { etiqueta: 'Contacto', href: '#contacto' },
]

export const menuSocio = [
  { id: 'resumen', etiqueta: 'Resumen', icono: FaThLarge },
  { id: 'datos', etiqueta: 'Datos personales', icono: FaUser },
  { id: 'pagos', etiqueta: 'Facturas y pagos', icono: FaFileInvoiceDollar },
  { id: 'bandeja', etiqueta: 'Bandeja de entrada', icono: FaInbox },
]

export const menuEmpleado = [
  { id: 'resumen', etiqueta: 'Resumen de gestión', icono: FaThLarge },
  { id: 'solicitudes', etiqueta: 'Solicitudes', icono: FaClipboardCheck },
  { id: 'socios', etiqueta: 'Socios', icono: FaUsers },
  { id: 'mensajes', etiqueta: 'Mensajes de socios', icono: FaInbox },
  { id: 'cambios', etiqueta: 'Registro de cambios', icono: FaHistory },
  { id: 'interno', etiqueta: 'Administración principal', icono: FaComments },
  { id: 'nuevo', etiqueta: 'Nuevo socio', icono: FaUserPlus },
  { id: 'datos', etiqueta: 'Mis datos', icono: FaIdBadge },
]

export const menuAdmin = [
  { id: 'resumen', etiqueta: 'Resumen', icono: FaThLarge },
  { id: 'personal', etiqueta: 'Personal', icono: FaUserTie },
  { id: 'presencia', etiqueta: 'Control del personal', icono: FaUserClock },
  { id: 'socios', etiqueta: 'Socios', icono: FaUsers },
  { id: 'facturacion', etiqueta: 'Facturación', icono: FaFileInvoiceDollar },
  { id: 'noticias', etiqueta: 'Noticias', icono: FaNewspaper },
  { id: 'reportes', etiqueta: 'Reportes', icono: FaChartBar },
  { id: 'interno', etiqueta: 'Mensajes del personal', icono: FaComments },
]
