import { clienteApi } from './clienteApi';
import { EstadoCuentaItem } from '@/tipos';

export interface Cuota {
  id: string;
  periodo: string;
  monto: string;
  fechaVencimiento: string;
}

export interface PagoPendiente {
  id: string;
  monto: string;
  medioPago: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  comprobanteUrl: string | null;
  fechaPago: string;
  socio: {
    idSocio: string;
    nombre: string;
    apellido: string;
  };
  cuota: Cuota;
}

export const pagosServicio = {
  obtenerMiEstadoDeCuenta() {
    return clienteApi<EstadoCuentaItem[]>('/mi-estado-de-cuenta');
  },

  listarCuotas() {
    return clienteApi<Cuota[]>('/cuotas');
  },

  registrarPago(datos: { cuotaId: string; medioPago: string; comprobanteUrl?: string }) {
    return clienteApi('/pagos', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  listarPagosPendientes() {
    return clienteApi<PagoPendiente[]>('/pagos/pendientes');
  },

  actualizarEstadoPago(id: string, estado: 'aprobado' | 'rechazado') {
    return clienteApi<PagoPendiente>(`/pagos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  },

  crearCuota(datos: { periodo: string; monto: number; fechaVencimiento: string }) {
    return clienteApi<Cuota>('/cuotas', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },
};
