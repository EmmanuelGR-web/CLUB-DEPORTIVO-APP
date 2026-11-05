import { randomInt } from 'node:crypto';
import * as bcrypt from 'bcrypt';

const COSTO = 12;

export const REGLA_CONTRASENA = /^(?=.*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ])(?=.*\d).{8,72}$/;
export const MENSAJE_CONTRASENA = 'La contraseña tiene que tener al menos 8 caracteres, con letras y números.';

export const cifrarContrasena = (contrasena: string) => bcrypt.hash(contrasena, COSTO);

export const compararContrasena = (contrasena: string, hash: string) => bcrypt.compare(contrasena, hash);

const LETRAS = 'abcdefghjkmnpqrstuvwxyz';
const NUMEROS = '23456789';

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
