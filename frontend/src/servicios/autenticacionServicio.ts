import { clienteApi } from './clienteApi';
import { RespuestaLogin } from '@/tipos';

export const autenticacionServicio = {
  login(email: string, contrasena: string) {
    return clienteApi<RespuestaLogin>('/autenticacion/login', {
      method: 'POST',
      body: JSON.stringify({ email, contrasena }),
      requiereAuth: false,
    });
  },

  registro(datos: {
    nombre: string;
    apellido: string;
    email: string;
    contrasena: string;
    telefono?: string;
  }) {
    return clienteApi<RespuestaLogin>('/autenticacion/registro', {
      method: 'POST',
      body: JSON.stringify(datos),
      requiereAuth: false,
    });
  },
};
