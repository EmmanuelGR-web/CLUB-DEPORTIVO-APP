// =====================================================================
// contrasenas.util.ts
// -----------------------------------------------------------------------
// Reglas únicas para las contraseñas de todo el portal: qué se acepta,
// cómo se cifra y cómo se arma una contraseña temporal cuando el
// personal da de alta o restablece la cuenta de un socio.
// =====================================================================

import { randomInt } from 'node:crypto';
import * as bcrypt from 'bcrypt';

// Costo de bcrypt: cada punto duplica el tiempo de cálculo. 12 tarda
// ~0,25 s por intento, poco para el usuario y mucho para quien prueba
// millones de contraseñas.
const COSTO = 12;

// Al menos 8 caracteres, con letras y números. bcrypt solo usa los
// primeros 72 bytes, por eso el máximo.
export const REGLA_CONTRASENA = /^(?=.*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(?=.*\d).{8,72}$/;
export const MENSAJE_CONTRASENA = 'La contraseña tiene que tener al menos 8 caracteres, con letras y números.';

export const cifrarContrasena = (contrasena: string) => bcrypt.hash(contrasena, COSTO);

export const compararContrasena = (contrasena: string, hash: string) => bcrypt.compare(contrasena, hash);

// Sin letras ni números que se confundan al dictarla (0/O, 1/l/I).
const LETRAS = 'abcdefghjkmnpqrstuvwxyz';
const NUMEROS = '23456789';

// Diez caracteres al azar con letras y números, generados con el
// generador criptográfico de Node.
export function contrasenaTemporal(): string {
  const todos = LETRAS + NUMEROS;
  const caracteres = [LETRAS[randomInt(LETRAS.length)], NUMEROS[randomInt(NUMEROS.length)]];
  while (caracteres.length < 10) caracteres.push(todos[randomInt(todos.length)]);
  for (let i = caracteres.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
  }
  return caracteres.join('');
}
