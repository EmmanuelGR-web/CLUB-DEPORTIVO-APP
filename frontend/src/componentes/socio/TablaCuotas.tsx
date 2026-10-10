'use client';

import { Button, Table } from 'react-bootstrap';
import { FaReceipt } from 'react-icons/fa';
import { CuotaSocio } from '@/hooks/useEstadoCuenta';
import { formatearFecha, formatearPeriodo, formatearPesos } from '@/utilidades/formato';
import { EstadoCuota, estadoVisible } from './EstadoCuota';

export type CampoOrden = 'periodo' | 'monto' | 'fechaVencimiento';

interface Props {
  cuotas: CuotaSocio[];
  orden?: { campo: CampoOrden; asc: boolean };
  onOrdenar?: (campo: CampoOrden) => void;
  onVerComprobante?: (pagoId: string) => void;
  abriendoComprobante?: string | null;
}

const COLUMNAS: { id: CampoOrden | null; etiqueta: string }[] = [
  { id: 'periodo', etiqueta: 'Cuota' },
  { id: 'fechaVencimiento', etiqueta: 'Vencimiento' },
  { id: 'monto', etiqueta: 'Importe' },
  { id: null, etiqueta: 'Estado' },
  { id: null, etiqueta: '' },
];

export function TablaCuotas({ cuotas, orden, onOrdenar, onVerComprobante, abriendoComprobante }: Props) {
  return (
    <Table responsive hover className="table-club align-middle mb-0">
      <thead>
        <tr>
          {COLUMNAS.map(({ id, etiqueta }) => {
            if (!id || !onOrdenar || !orden) return <th key={etiqueta || 'acciones'} scope="col">{etiqueta}</th>;
            const activa = orden.campo === id;
            return (
              <th key={id} scope="col" aria-sort={activa ? (orden.asc ? 'ascending' : 'descending') : 'none'}>
                <button
                  type="button"
                  className="btn btn-link p-0 text-reset text-decoration-none fw-semibold text-uppercase d-inline-flex align-items-center gap-1"
                  style={{ fontSize: 'inherit', letterSpacing: 'inherit' }}
                  onClick={() => onOrdenar(id)}
                >
                  {etiqueta}
                  <span className={activa ? 'text-primary' : 'opacity-50'} aria-hidden="true">
                    {activa ? (orden.asc ? '↑' : '↓') : '↕'}
                  </span>
                </button>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {cuotas.length === 0 && (
          <tr>
            <td colSpan={COLUMNAS.length} className="text-center text-body-secondary py-4">
              No hay cuotas para mostrar con este filtro.
            </td>
          </tr>
        )}
        {cuotas.map((cuota) => (
          <tr key={cuota.cuotaId}>
            <td className="fw-semibold text-nowrap">{formatearPeriodo(cuota.periodo)}</td>
            <td className="text-nowrap">{formatearFecha(cuota.fechaVencimiento.slice(0, 10))}</td>
            <td className="font-numeros text-nowrap">{formatearPesos(cuota.monto)}</td>
            <td>
              <EstadoCuota estado={estadoVisible(cuota, cuota.vencida)} />
            </td>
            <td className="text-end">
              {cuota.estadoPago === 'aprobado' && cuota.pagoId && onVerComprobante && (
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="rounded-pill d-inline-flex align-items-center gap-2 text-nowrap"
                  disabled={abriendoComprobante === cuota.pagoId}
                  onClick={() => onVerComprobante(cuota.pagoId as string)}
                >
                  <FaReceipt aria-hidden="true" /> Comprobante
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
