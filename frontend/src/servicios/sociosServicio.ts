import { clienteApi } from './clienteApi';
import { Carnet, Perfil } from '@/tipos';

export const sociosServicio = {
  obtenerMiPerfil() {
    return clienteApi<Perfil>('/socios/mi-perfil');
  },

  actualizarMiPerfil(datos: Partial<Perfil>) {
    return clienteApi<Perfil>('/socios/mi-perfil', {
      method: 'PATCH',
      body: JSON.stringify(datos),
    });
  },

  obtenerMiCarnet() {
    return clienteApi<Carnet>('/socios/mi-carnet');
  },

  subirFotoCarnet(archivo: File) {
    const formulario = new FormData();
    formulario.append('foto', archivo);
    return clienteApi<{ fotoCarnetUrl: string }>('/socios/mi-carnet/foto', {
      method: 'POST',
      body: formulario,
    });
  },
};
