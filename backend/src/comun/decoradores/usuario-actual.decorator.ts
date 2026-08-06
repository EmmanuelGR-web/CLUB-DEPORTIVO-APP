// =====================================================================
// usuario-actual.decorator.ts
// -----------------------------------------------------------------------
// Passport (la librería que valida el token JWT) SIEMPRE guarda los
// datos del usuario logueado en la propiedad "request.user" (en inglés,
// es un detalle interno de esa librería que no podemos cambiar).
//
// Este decorador existe para que el resto del código de la aplicación
// no tenga que acordarse de ese detalle: en cualquier controlador,
// alcanza con escribir @UsuarioActual() y se obtiene directamente el
// objeto { id, email, rol } del usuario logueado, sin usar "any" ni
// acceder a "request.user" a mano en cada lugar.
//
// Esto también evita el error típico de escribir "request.usuario"
// (en español) por costumbre, que es justo el bug que causó el
// error 500 en el endpoint del carnet.
// =====================================================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UsuarioAutenticado {
  id: string;
  email: string;
  rol: string;
}

export const UsuarioActual = createParamDecorator(
  (_datos: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
    const peticion = contexto.switchToHttp().getRequest();
    return peticion.user;
  },
);
