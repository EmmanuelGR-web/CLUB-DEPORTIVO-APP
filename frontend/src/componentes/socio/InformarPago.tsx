'use client';

import { useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { FaMoneyBillWave, FaUniversity, FaCreditCard, FaRegCreditCard } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { CuotaSocio } from '@/hooks/useEstadoCuenta';
import { pagosServicio } from '@/servicios/pagosServicio';
import { Comprobante } from '@/tipos';
import { confirmarAccion, alertaExito } from '@/utilidades/alertas';
import { formatearFecha, formatearPeriodo, formatearPesos } from '@/utilidades/formato';
import { ETIQUETA_MEDIO_PAGO } from './ModalComprobante';
import { Seccion } from './Seccion';

type MedioPago = Comprobante['medioPago'];

const MEDIOS: { valor: MedioPago; icono: IconType; ayuda: string }[] = [
  { valor: 'efectivo', icono: FaMoneyBillWave, ayuda: 'En la secretaría del club' },
  { valor: 'transferencia', icono: FaUniversity, ayuda: 'CBU o alias del club' },
  { valor: 'debito', icono: FaRegCreditCard, ayuda: 'En un pago' },
  { valor: 'credito', icono: FaCreditCard, ayuda: 'Visa o Mastercard' },
];

interface Props {
  cuota: CuotaSocio;
  onInformado: () => void;
}

export function InformarPago({ cuota, onInformado }: Props) {
  const [medio, setMedio] = useState<MedioPago | null>(null);

  async function informar() {
    if (!medio) return;
    const confirmado = await confirmarAccion({
      titulo: 'Confirmar pago',
      html: `Vas a informar el pago de la cuota <b>${formatearPeriodo(cuota.periodo)}</b> por <b>${formatearPesos(cuota.monto)}</b> con <b>${ETIQUETA_MEDIO_PAGO[medio].toLowerCase()}</b>.`,
      boton: 'Informar pago',
      accion: () => pagosServicio.registrarPago({ cuotaId: cuota.cuotaId, medioPago: medio }),
    });
    if (confirmado) {
      setMedio(null);
      onInformado();
      alertaExito('La administración va a verificar el pago y te avisamos cuando quede aprobado.', 'Pago informado');
    }
  }

  const textoVencimiento = cuota.vencida
    ? `Venció el ${formatearFecha(cuota.fechaVencimiento.slice(0, 10))}`
    : cuota.diasParaVencer === 0
      ? 'Vence hoy'
      : `Vence el ${formatearFecha(cuota.fechaVencimiento.slice(0, 10))}`;

  return (
    <Seccion titulo={cuota.estadoPago === 'rechazado' ? 'Volver a informar el pago' : 'Cuota a pagar'} className="mb-4">
      <Row className="g-4 align-items-stretch">
        <Col lg={4}>
          <div className="fondo-bordo text-white rounded-4 p-4 h-100 d-flex flex-column">
            <span className="etiqueta-mini text-white-50">Cuota social</span>
            <span className="font-credencial fs-3 fw-bold text-uppercase lh-1 mt-1">{formatearPeriodo(cuota.periodo)}</span>
            <span className="font-numeros display-6 fw-bold mt-3">{formatearPesos(cuota.monto)}</span>
            <span className={`mt-auto pt-3 small fw-semibold ${cuota.vencida ? 'text-warning' : 'text-white-50'}`}>{textoVencimiento}</span>
          </div>
        </Col>

        <Col lg={8}>
          {cuota.estadoPago === 'rechazado' && (
            <p className="small text-danger-emphasis bg-danger-subtle rounded-3 px-3 py-2">
              El pago anterior de esta cuota fue rechazado. Elegí el medio y volvé a informarlo.
            </p>
          )}
          <p className="fw-semibold mb-2">¿Cómo pagaste?</p>
          <div className="d-grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }} role="radiogroup" aria-label="Medio de pago">
            {MEDIOS.map(({ valor, icono: Icono, ayuda }) => {
              const elegido = medio === valor;
              return (
                <button
                  key={valor}
                  type="button"
                  role="radio"
                  aria-checked={elegido}
                  onClick={() => setMedio(valor)}
                  className={`btn text-start rounded-4 p-3 border-2 ${elegido ? 'btn-outline-primary active' : 'border bg-body-tertiary'}`}
                >
                  <Icono className="mb-2" size={20} aria-hidden="true" />
                  <div className="fw-semibold lh-sm">{ETIQUETA_MEDIO_PAGO[valor]}</div>
                  <small className={elegido ? 'opacity-75' : 'text-body-secondary'}>{ayuda}</small>
                </button>
              );
            })}
          </div>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <Button variant="primary" className="rounded-pill px-4" disabled={!medio} onClick={informar}>
              Informar pago
            </Button>
            <small className="text-body-secondary">Queda en revisión hasta que la administración lo confirme.</small>
          </div>
        </Col>
      </Row>
    </Seccion>
  );
}
