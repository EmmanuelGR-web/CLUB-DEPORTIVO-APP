import { clienteApi } from './clienteApi';
import { Comprobante, EstadoCuentaItem } from '@/tipos';

export interface Cuota {
  id: string;
  periodo: string;
  monto: string;
  fechaVencimiento: string;
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

  obtenerComprobante(pagoId: string) {
    return clienteApi<Comprobante>(`/pagos/${pagoId}/comprobante`);
  },
};
