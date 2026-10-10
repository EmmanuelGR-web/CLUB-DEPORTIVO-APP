export const normalizarBusqueda = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export const coincide = (texto, busqueda) => normalizarBusqueda(texto).includes(normalizarBusqueda(busqueda))
