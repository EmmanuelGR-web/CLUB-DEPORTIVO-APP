'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contextos/AuthContexto';
import { ErrorApi } from '@/servicios/clienteApi';
import { PagoPendiente, pagosServicio } from '@/servicios/pagosServicio';
import { Boton } from '@/componentes/ui/Boton';
import { CampoTexto } from '@/componentes/ui/CampoTexto';
import { Tarjeta } from '@/componentes/ui/Tarjeta';

function formatearMonto(monto: string | number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(monto));
}

function formatearMedioPago(medio: string): string {
  return medio.charAt(0).toUpperCase() + medio.slice(1);
}

export default function PaginaAdministracion() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [pagos, setPagos] = useState<PagoPendiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cuota, setCuota] = useState({ periodo: '', monto: '', fechaVencimiento: '' });
  const [creandoCuota, setCreandoCuota] = useState(false);

  useEffect(() => {
    if (usuario && usuario.rol === 'socio') {
      router.replace('/mi-carnet');
      return;
    }

    if (!usuario) return;
    pagosServicio
      .listarPagosPendientes()
      .then(setPagos)
      .catch((err) => setError(err instanceof ErrorApi ? err.message : 'No se pudieron cargar los pagos'))
      .finally(() => setCargando(false));
  }, [router, usuario]);

  async function cambiarEstado(id: string, estado: 'aprobado' | 'rechazado') {
    setAccionando(id);
    setError('');
    setMensaje('');
    try {
      await pagosServicio.actualizarEstadoPago(id, estado);
      setPagos((actuales) => actuales.filter((pago) => pago.id !== id));
      setMensaje(`Pago ${estado === 'aprobado' ? 'aprobado' : 'rechazado'} correctamente.`);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo actualizar el pago');
    } finally {
      setAccionando(null);
    }
  }

  async function crearCuota(evento: FormEvent) {
    evento.preventDefault();
    setCreandoCuota(true);
    setError('');
    setMensaje('');
    try {
      await pagosServicio.crearCuota({
        periodo: cuota.periodo,
        monto: Number(cuota.monto),
        fechaVencimiento: cuota.fechaVencimiento,
      });
      setCuota({ periodo: '', monto: '', fechaVencimiento: '' });
      setMensaje('La cuota se creó correctamente.');
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo crear la cuota');
    } finally {
      setCreandoCuota(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="font-dato text-xs uppercase tracking-[0.2em] text-rojo-club dark:text-dorado">Operaciones del club</p>
        <h1 className="mt-2 font-titulo text-4xl font-bold uppercase tracking-wide">Administración</h1>
        <p className="mt-1 font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
          Gestioná cuotas y validá las declaraciones de pago pendientes.
        </p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      {mensaje && <p role="status" className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">{mensaje}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-titulo text-2xl font-semibold uppercase">Pagos pendientes</h2>
              <p className="font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">Requieren revisión del club.</p>
            </div>
            <span className="rounded-full bg-rojo-club/10 px-3 py-1 font-dato text-xs text-rojo-club dark:bg-dorado/10 dark:text-dorado">{pagos.length}</span>
          </div>

          {cargando && <p className="text-sm text-carbon/60 dark:text-hueso/60">Cargando pagos...</p>}
          {!cargando && pagos.length === 0 && (
            <Tarjeta><p className="text-sm text-carbon/60 dark:text-hueso/60">No hay pagos pendientes de revisión.</p></Tarjeta>
          )}
          <div className="flex flex-col gap-3">
            {pagos.map((pago) => (
              <Tarjeta key={pago.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-titulo text-xl font-semibold">{pago.socio.nombre} {pago.socio.apellido}</p>
                  <p className="font-dato text-xs text-carbon/60 dark:text-hueso/60">Socio N.º {pago.socio.idSocio}</p>
                  <p className="mt-2 text-sm text-carbon/70 dark:text-hueso/70">
                    Cuota {pago.cuota.periodo} · {formatearMonto(pago.monto)} · {formatearMedioPago(pago.medioPago)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Boton variante="secundario" disabled={accionando === pago.id} onClick={() => cambiarEstado(pago.id, 'rechazado')}>Rechazar</Boton>
                  <Boton disabled={accionando === pago.id} onClick={() => cambiarEstado(pago.id, 'aprobado')}>Aprobar</Boton>
                </div>
              </Tarjeta>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-titulo text-2xl font-semibold uppercase">Nueva cuota</h2>
          <Tarjeta>
            <form onSubmit={crearCuota} className="flex flex-col gap-4">
              <CampoTexto etiqueta="Período" placeholder="2026-09" pattern="\\d{4}-(0[1-9]|1[0-2])" value={cuota.periodo} onChange={(e) => setCuota({ ...cuota, periodo: e.target.value })} required />
              <CampoTexto etiqueta="Monto" type="number" min="0.01" step="0.01" value={cuota.monto} onChange={(e) => setCuota({ ...cuota, monto: e.target.value })} required />
              <CampoTexto etiqueta="Fecha de vencimiento" type="date" value={cuota.fechaVencimiento} onChange={(e) => setCuota({ ...cuota, fechaVencimiento: e.target.value })} required />
              <Boton type="submit" cargando={creandoCuota} className="w-full">Crear cuota</Boton>
            </form>
          </Tarjeta>
        </section>
      </div>
    </div>
  );
}
