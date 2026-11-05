import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UsuarioAutenticado {
  id: string;
  email: string;
  rol: string;
  recordar?: boolean;
}

export const UsuarioActual = createParamDecorator(
  (_datos: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
    const peticion = contexto.switchToHttp().getRequest();
    return peticion.user;
  },
);
