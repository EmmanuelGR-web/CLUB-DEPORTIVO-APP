import type { CookieOptions, Response } from 'express';

export const COOKIE_SESION = 'club_sesion';

export const CABECERA_CLIENTE = 'x-club-cliente';

export const DURACION_RECORDADA = 30 * 24 * 60 * 60;
export const DURACION_COMUN = 12 * 60 * 60;

export interface CargaUtilJwt {
  sub: string;
  email: string;
  rol: string;
  ver: number;
  rec: boolean;
}

const opciones = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.COOKIE_SEGURA !== 'false',
  sameSite: 'strict',
  path: '/',
});

export function guardarCookieSesion(respuesta: Response, token: string, recordar: boolean) {
  respuesta.cookie(COOKIE_SESION, token, {
    ...opciones(),
    ...(recordar ? { maxAge: DURACION_RECORDADA * 1000 } : {}),
  });
}

export function borrarCookieSesion(respuesta: Response) {
  respuesta.clearCookie(COOKIE_SESION, opciones());
}
