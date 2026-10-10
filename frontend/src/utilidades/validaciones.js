const edadValida = (fecha) => {
  const anios = (Date.now() - new Date(`${fecha}T12:00:00`)) / (365.25 * 24 * 3600 * 1000)
  return anios >= 0 && anios < 110
}

export const camposPersonales = {
  nombre: { etiqueta: 'Nombre', autoComplete: 'given-name', valido: (v) => v.trim().length >= 2, mensaje: 'Ingresá tu nombre.' },
  apellido: { etiqueta: 'Apellido', autoComplete: 'family-name', valido: (v) => v.trim().length >= 2, mensaje: 'Ingresá tu apellido.' },
  dni: { etiqueta: 'Número de DNI', inputMode: 'numeric', valido: (v) => /^\d{7,8}$/.test(v.replace(/\./g, '')), mensaje: 'El DNI tiene 7 u 8 números.' },
  fechaNacimiento: { etiqueta: 'Fecha de nacimiento', tipo: 'date', valido: edadValida, mensaje: 'Ingresá una fecha de nacimiento válida.' },
  direccion: { etiqueta: 'Dirección', autoComplete: 'street-address', valido: (v) => v.trim().length >= 5, mensaje: 'Ingresá tu dirección.' },
  telefono: { etiqueta: 'Teléfono de contacto', tipo: 'tel', autoComplete: 'tel', ejemplo: '381 555-1234', valido: (v) => v.replace(/\D/g, '').length >= 8, mensaje: 'Ingresá un teléfono válido.' },
  email: { etiqueta: 'Correo electrónico', tipo: 'email', autoComplete: 'email', ejemplo: 'nombre@correo.com', valido: (v) => /^\S+@\S+\.\S+$/.test(v), mensaje: 'Ingresá un correo electrónico válido.' },
}

export const listaCampos = (nombres) => nombres.map((nombre) => ({ nombre, ...camposPersonales[nombre] }))

export const camposIdentidad = ['nombre', 'apellido', 'dni', 'fechaNacimiento']
