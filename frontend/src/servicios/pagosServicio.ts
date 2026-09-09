import { clienteApi } from './clienteApi';
import { Comprobante, EstadoCuentaItem } from '@/tipos';

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

  // --- Panel del socio ---

  obtenerComprobante(pagoId: string) {
    return clienteApi<Comprobante>(`/pagos/${pagoId}/comprobante`);
  },

  // --- Panel de administración ---

  listarPagosPendientes() {
    return clienteApi<PagoPendiente[]>('/pagos/pendientes');
  },

  obtenerPago(id: string) {
    return clienteApi<PagoPendiente>(`/pagos/${id}`);
  },

  actualizarEstadoPago(id: string, estado: 'aprobado' | 'rechazado', observacion?: string) {
    return clienteApi<PagoPendiente>(`/pagos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado, observacion }),
    });
  },

  crearCuota(datos: { periodo: string; monto: number; fechaVencimiento: string }) {
    return clienteApi<Cuota>('/cuotas', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  actualizarCuota(id: string, datos: { monto?: number; fechaVencimiento?: string }) {
    return clienteApi<Cuota>(`/cuotas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(datos),
    });
  },
};