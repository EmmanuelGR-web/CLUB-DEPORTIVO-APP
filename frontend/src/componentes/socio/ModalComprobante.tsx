'use client';

import { Button, Modal } from 'react-bootstrap';
import { FaPrint } from 'react-icons/fa';
import { Comprobante } from '@/tipos';
import { formatearFechaLarga, formatearPeriodo, formatearPesos } from '@/utilidades/formato';

export const ETIQUETA_MEDIO_PAGO: Record<Comprobante['medioPago'], string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  debito: 'Tarjeta de débito',
  credito: 'Tarjeta de crédito',
};

interface Props {
  comprobante: Comprobante | null;
  onCerrar: () => void;
}

export function ModalComprobante({ comprobante, onCerrar }: Props) {
  return (
    <Modal show={!!comprobante} onHide={onCerrar} centered contentClassName="border-0 rounded-4 overflow-hidden">
      {comprobante && (
        <div className="zona-impresion bg-white text-dark">
          <div className="fondo-bordo text-white px-4 py-3 d-flex align-items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={42} height={42} className="object-fit-contain" />
            <div className="lh-sm me-auto">
              <div className="font-credencial fw-bold text-uppercase" style={{ letterSpacing: '0.12em' }}>
                Club Deportivo
              </div>
              <small className="text-white-50">Comprobante de pago de cuota social</small>
            </div>
            <button type="button" className="btn-close btn-close-white no-imprimir" aria-label="Cerrar" onClick={onCerrar} />
          </div>

          <div className="p-4">
            <div className="text-center mb-4">
              <div className="etiqueta-mini" style={{ color: '#6b6475' }}>Comprobante N.º</div>
              <div className="font-numeros fs-4 fw-bold">{comprobante.numeroComprobante}</div>
            </div>

            <dl className="mb-0 small">
              {[
                ['Socio', comprobante.socio.nombreCompleto],
                ['N.º de socio', comprobante.socio.idSocio],
                ['Cuota', formatearPeriodo(comprobante.cuota.periodo)],
                ['Medio de pago', ETIQUETA_MEDIO_PAGO[comprobante.medioPago]],
                ['Fecha de emisión', formatearFechaLarga(comprobante.fechaEmision)],
              ].map(([etiqueta, valor]) => (
                <div key={etiqueta} className="d-flex justify-content-between py-2 border-bottom">
                  <dt className="fw-normal" style={{ color: '#6b6475' }}>{etiqueta}</dt>
                  <dd className="mb-0 fw-semibold text-end">{valor}</dd>
                </div>
              ))}
              <div className="d-flex justify-content-between align-items-baseline pt-3">
                <dt className="fw-bold text-uppercase">Total abonado</dt>
                <dd className="mb-0 font-numeros fs-5 fw-bold" style={{ color: '#7a0f2e' }}>
                  {formatearPesos(comprobante.monto)}
                </dd>
              </div>
            </dl>

            <p className="small text-center mt-4 mb-0" style={{ color: '#6b6475' }}>
              Pago verificado por la administración del club.
            </p>

            <div className="d-flex gap-2 mt-4 no-imprimir">
              <Button variant="outline-secondary" className="rounded-pill flex-fill" onClick={onCerrar}>
                Cerrar
              </Button>
              <Button variant="secondary" className="rounded-pill flex-fill d-inline-flex align-items-center justify-content-center gap-2" onClick={() => window.print()}>
                <FaPrint aria-hidden="true" /> Imprimir
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
