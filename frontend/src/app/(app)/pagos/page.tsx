'use client';

import { useEffect, useState } from 'react';
import { EstadoCuentaItem } from '@/tipos';
import { pagosServicio } from '@/servicios/pagosServicio';
import { ErrorApi } from '@/servicios/clienteApi';
import { Tarjeta } from '@/componentes/ui/Tarjeta';
import { Boton } from '@/componentes/ui/Boton';

const ETIQUETA_ESTADO: Record<EstadoCuentaItem['estadoPago'], { texto: string; clase: string }> = {
  aprobado: {
    texto: 'Pagada',
    clase: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  pendiente: {
    texto: 'En revisión',
    clase: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  rechazado: {
    texto: 'Rechazada',
    clase: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  sin_pagar: {
    texto: 'Sin pagar',
    clase: 'bg-carbon/10 text-carbon/70 dark:bg-white/10 dark:text-hueso/70',
  },
};

const MEDIOS_PAGO = [
  { valor: 'efectivo', etiqueta: 'Efectivo' },
  { valor: 'transferencia', etiqueta: 'Transferencia' },
  { valor: 'debito', etiqueta: 'Débito' },
  { valor: 'credito', etiqueta: 'Crédito' },
];

function formatearMonto(monto: string): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(monto));
}

export default function PaginaPagos() {
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuentaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [pagandoCuotaId, setPagandoCuotaId] = useState<string | null>(null);

  async function cargarEstadoCuenta() {
    try {
      const datos = await pagosServicio.obtenerMiEstadoDeCuenta();
      setEstadoCuenta(datos);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo cargar el estado de cuenta');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEstadoCuenta();
  }, []);

  async function pagarCuota(cuotaId: string, medioPago: string) {
    setPagandoCuotaId(cuotaId);
    setError('');
    setMensaje('');
    try {
      await pagosServicio.registrarPago({ cuotaId, medioPago });
      setMensaje('Tu pago quedó registrado. El club lo va a confirmar en breve.');
      await cargarEstadoCuenta();
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo registrar el pago');
    } finally {
      setPagandoCuotaId(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-titulo text-3xl font-bold uppercase tracking-wide">Cuota social</h1>
      <p className="mb-8 font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
        Tus cuotas pagadas y pendientes
      </p>

      {cargando && <p className="font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">Cargando…</p>}

      {error && (
        <p role="alert" className="mb-4 font-cuerpo text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {mensaje && (
        <p role="status" className="mb-4 font-cuerpo text-sm text-green-700 dark:text-green-400">
          {mensaje}
        </p>
      )}

      {!cargando && estadoCuenta.length === 0 && (
        <Tarjeta className="text-center">
          <p className="font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
            Todavía no hay cuotas cargadas por el club.
          </p>
        </Tarjeta>
      )}

      <div className="flex flex-col gap-3">
        {estadoCuenta.map((item) => {
          const estilo = ETIQUETA_ESTADO[item.estadoPago];
          const puedePagar = item.estadoPago === 'sin_pagar' || item.estadoPago === 'rechazado';

          return (
            <Tarjeta key={item.cuotaId} className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-titulo text-lg font-semibold">Cuota {item.periodo}</p>
                <p className="font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
                  Vence el {new Date(item.fechaVencimiento).toLocaleDateString('es-AR')} ·{' '}
                  {formatearMonto(item.monto)}
                </p>
              </div>

              <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <span className={`rounded-full px-3 py-1 font-cuerpo text-xs font-medium ${estilo.clase}`}>
                  {estilo.texto}
                </span>

                {puedePagar && (
                  <select
                    className="rounded-lg border border-carbon/15 bg-white px-2 py-1.5 font-cuerpo text-sm text-carbon dark:border-white/15 dark:bg-carbon dark:text-hueso"
                    defaultValue=""
                    disabled={pagandoCuotaId === item.cuotaId}
                    onChange={(e) => {
                      if (e.target.value) pagarCuota(item.cuotaId, e.target.value);
                    }}
                  >
                    <option value="" disabled>
                      Pagar con…
                    </option>
                    {MEDIOS_PAGO.map((medio) => (
                      <option key={medio.valor} value={medio.valor}>
                        {medio.etiqueta}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </Tarjeta>
          );
        })}
      </div>
    </div>
  );
}
