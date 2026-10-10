'use client';

// =====================================================================
// useEstadoCuenta.ts
// -----------------------------------------------------------------------
// Lee el estado de cuenta del socio y le suma lo que la pantalla
// necesita calcular siempre igual: si la cuota está vencida, cuál es
// la próxima a pagar y cuánto se adeuda en total.
// =====================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EstadoCuentaItem } from '@/tipos';
import { pagosServicio } from '@/servicios/pagosServicio';
import { ErrorApi } from '@/servicios/clienteApi';
import { diasHasta } from '@/utilidades/formato';

export interface CuotaSocio extends EstadoCuentaItem {
  vencida: boolean;
  diasParaVencer: number;
}

const ADEUDADA: EstadoCuentaItem['estadoPago'][] = ['sin_pagar', 'rechazado'];

export function useEstadoCuenta() {
  const [items, setItems] = useState<EstadoCuentaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    setError('');
    try {
      setItems(await pagosServicio.obtenerMiEstadoDeCuenta());
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo cargar el estado de cuenta');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const cuotas = useMemo<CuotaSocio[]>(
    () =>
      items.map((item) => {
        const diasParaVencer = diasHasta(item.fechaVencimiento.slice(0, 10));
        return { ...item, diasParaVencer, vencida: ADEUDADA.includes(item.estadoPago) && diasParaVencer < 0 };
      }),
    [items],
  );

  const resumen = useMemo(() => {
    const adeudadas = cuotas.filter((c) => ADEUDADA.includes(c.estadoPago));
    // La próxima a pagar es la adeudada más vieja.
    const proxima = [...adeudadas].sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento))[0] ?? null;
    return {
      pagadas: cuotas.filter((c) => c.estadoPago === 'aprobado').length,
      enRevision: cuotas.filter((c) => c.estadoPago === 'pendiente').length,
      adeudadas: adeudadas.length,
      totalAdeudado: adeudadas.reduce((total, c) => total + Number(c.monto), 0),
      proxima,
    };
  }, [cuotas]);

  return { cuotas, resumen, cargando, error, recargar };
}
