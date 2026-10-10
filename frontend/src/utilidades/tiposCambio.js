const camposDocumento = ['Nombre', 'Apellido', 'DNI', 'Fecha de nacimiento']

export const tiposCambio = [
  {
    id: 'contacto',
    etiqueta: 'Contacto y domicilio',
    ayuda: 'Dirección, teléfono o correo. Se aplican al instante.',
    socio: 'actualizó su contacto o domicilio',
    personal: 'corrigió el contacto o domicilio de',
  },
  {
    id: 'documento',
    etiqueta: 'Nombre, DNI o nacimiento',
    ayuda: 'Datos del documento. Si los pide el socio, esperan la aprobación del personal.',
    socio: 'pidió cambiar su nombre, DNI o fecha de nacimiento',
    personal: 'corrigió el nombre, DNI o fecha de nacimiento de',
  },
  { id: 'pago', etiqueta: 'Medio de pago', ayuda: 'Tarjeta, efectivo o débito automático.', socio: 'cambió su medio de pago', personal: 'cambió el medio de pago de' },
  { id: 'foto', etiqueta: 'Foto de perfil', ayuda: 'La foto del carnet.', socio: 'cambió su foto de perfil', personal: 'cambió la foto de perfil de' },
  { id: 'clave', etiqueta: 'Contraseña', ayuda: 'Cambios o restablecimientos de contraseña.', socio: 'cambió su contraseña', personal: 'restableció la contraseña de' },
  {
    id: 'deshecho',
    etiqueta: 'Cambio deshecho',
    ayuda: 'Se volvió al dato anterior porque el personal rechazó el cambio.',
    socio: 'volvió a sus datos anteriores',
    personal: 'rechazó y deshizo un cambio de',
  },
  { id: 'solicitud', etiqueta: 'Solicitud resuelta', ayuda: 'Solicitudes autorizadas o rechazadas.', socio: 'resolvió una solicitud', personal: 'resolvió una solicitud de' },
  { id: 'baja', etiqueta: 'Baja de socio', ayuda: 'Socios dados de baja por la administración.', socio: 'fue dado de baja', personal: 'dio de baja a' },
  { id: 'alta', etiqueta: 'Alta en la sede', ayuda: 'Socios dados de alta por el personal.', socio: 'se asoció en la sede', personal: 'asoció en la sede a' },
]

const porSeccion = {
  'Datos personales': 'contacto',
  'Datos de identidad': 'documento',
  'Medio de pago': 'pago',
  'Foto de perfil': 'foto',
  Contraseña: 'clave',
  'Cambio revertido': 'deshecho',
  'Alta presencial': 'alta',
  'Alta de socio': 'alta',
  'Baja de socio': 'baja',
}

export const tipoDeRegistro = (registro) => {
  const id = registro.seccion.startsWith('Solicitud')
    ? 'solicitud'
    : registro.seccion === 'Datos personales' && registro.cambios.some((c) => camposDocumento.includes(c.campo))
      ? 'documento'
      : porSeccion[registro.seccion]
  return tiposCambio.find((t) => t.id === id) ?? { id: 'otro', etiqueta: registro.seccion, socio: 'hizo un cambio', personal: 'hizo un cambio en la cuenta de' }
}

export const esDelSocio = (registro) => registro.autor === 'Socio'

export const estadoPedido = (registro) => (registro.pendiente ? (registro.resuelto ?? 'Esperando aprobación') : null)

export const tituloSolicitud = (registro) => registro.seccion.replace('Solicitud: ', '')
