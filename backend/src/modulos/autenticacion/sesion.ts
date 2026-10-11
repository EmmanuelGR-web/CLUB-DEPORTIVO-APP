// =====================================================================
// sesion.ts
// -----------------------------------------------------------------------
// El pase de sesión (JWT) viaja en una cookie que el código de la página
// no puede leer (httpOnly): aunque se colara un script malicioso, no
// tendría cómo robarla. Solo se manda por HTTPS (secure) y únicamente
// desde el propio sitio (sameSite strict). El frontend le habla al
// backend a través de /api en su mismo dominio, por eso es una cookie
// propia y no de terceros.
// =====================================================================

import type { CookieOptions, Response } from 'express';

export const COOKIE_SESION = 'club_sesion';

// Cabecera que manda solo el frontend del club. Otra página no puede
// agregarla a un pedido sin que el navegador lo frene, así que sirve de
// segunda barrera contra pedidos falsificados (CSRF).
export const CABECERA_CLIENTE = 'x-club-cliente';

export const DURACION_RECORDADA = 30 * 24 * 60 * 60; // 30 días, en segundos
export const DURACION_COMUN = 12 * 60 * 60; // 12 horas

export interface CargaUtilJwt {
  sub: string; // id del usuario
  email: string;
  rol: string;
  ver: number; // versión de la sesión del usuario al emitir el pase
  rec: boolean; // si eligió mantener la sesión iniciada
}

const opciones = (): CookieOptions => ({
  httpOnly: true,
  // En desarrollo local se puede apagar con COOKIE_SEGURA=false si se
  // prueba desde otro equipo por http.
  secure: process.env.COOKIE_SEGURA !== 'false',
  sameSite: 'strict',
  path: '/',
});

export function guardarCookieSesion(respuesta: Response, token: string, recordar: boolean) {
  respuesta.cookie(COOKIE_SESION, token, {
    ...opciones(),
    // Sin maxAge es una cookie de sesión: se borra al cerrar el navegador.
    ...(recordar ? { maxAge: DURACION_RECORDADA * 1000 } : {}),
  });
}

export function borrarCookieSesion(respuesta: Response) {
  respuesta.clearCookie(COOKIE_SESION, opciones());
}
