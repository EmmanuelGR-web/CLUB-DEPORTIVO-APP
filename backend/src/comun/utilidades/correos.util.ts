// Direcciones que se muestran en la bandeja de mensajes del portal.

export const CORREO_ADMINISTRACION = 'administracion@clubdeportivo.com.ar';
export const CORREO_DIRECCION = 'direccion@clubdeportivo.com.ar';

const quitarAcentos = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '');

// "Lucía Herrera" + 599000006 → "lucia.herrera.0006@socios.clubdeportivo.com.ar"
export function correoInstitucional(nombreCompleto: string, numeroSocio = '') {
  const partes = quitarAcentos(nombreCompleto)
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .split(' ')
    .filter(Boolean);
  const sufijo = numeroSocio ? `.${numeroSocio.slice(-4)}` : '';
  return `${partes.slice(0, 2).join('.')}${sufijo}@socios.clubdeportivo.com.ar`;
}

// Correo del personal: nombre.apellido@clubdeportivo.com.ar
export function correoPersonal(nombre: string, apellido: string) {
  const limpiar = (texto: string) => quitarAcentos(texto).toLowerCase().replace(/[^a-z]/g, '');
  return `${limpiar(nombre.split(' ')[0])}.${limpiar(apellido.split(' ')[0])}@clubdeportivo.com.ar`;
}
