'use client';

import { useMemo, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Comprobante } from '@/tipos';
import { pagosServicio } from '@/servicios/pagosServicio';
import { ErrorApi } from '@/servicios/clienteApi';
import { useEstadoCuenta } from '@/hooks/useEstadoCuenta';
import { useTituloPagina } from '@/hooks/useTituloPagina';
import { alertaError } from '@/utilidades/alertas';
import { formatearPesos } from '@/utilidades/formato';
import { EncabezadoPagina } from '@/componentes/socio/EncabezadoPagina';
import { Seccion } from '@/componentes/socio/Seccion';
import { Cargando } from '@/componentes/socio/Cargando';
import { InformarPago } from '@/componentes/socio/InformarPago';
import { ModalComprobante } from '@/componentes/socio/ModalComprobante';
import { CampoOrden, TablaCuotas } from '@/componentes/socio/TablaCuotas';

const FILTROS = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'aprobado', etiqueta: 'Pagadas' },
  { valor: 'pendiente', etiqueta: 'En revisión' },
  { valor: 'sin_pagar', etiqueta: 'Pendientes' },
  { valor: 'rechazado', etiqueta: 'Rechazadas' },
] as const;

type Filtro = (typeof FILTROS)[number]['valor'];

function Indicador({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle?: string }) {
  return (
    <div className="superficie indicador p-3 h-100">
      <div className="etiqueta-mini mb-2">{etiqueta}</div>
      <div className="indicador-valor">{valor}</div>
      {detalle && <small className="text-body-secondary">{detalle}</small>}
    </div>
  );
}

export default function PaginaPagos() {
  useTituloPagina('Cuota social');
  const { cuotas, resumen, cargando, error, recargar } = useEstadoCuenta();
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [orden, setOrden] = useState<{ campo: CampoOrden; asc: boolean }>({ campo: 'periodo', asc: false });
  const [comprobante, setComprobante] = useState<Comprobante | null>(null);
  const [abriendo, setAbriendo] = useState<string | null>(null);

  const visibles = useMemo(() => {
    const filtradas = filtro === 'todas' ? cuotas : cuotas.filter((c) => c.estadoPago === filtro);
    return [...filtradas].sort((a, b) => {
      const diferencia =
        orden.campo === 'monto' ? Number(a.monto) - Number(b.monto) : a[orden.campo].localeCompare(b[orden.campo]);
      return orden.asc ? diferencia : -diferencia;
    });
  }, [cuotas, filtro, orden]);

  function ordenar(campo: CampoOrden) {
    setOrden((actual) => ({ campo, asc: actual.campo === campo ? !actual.asc : true }));
  }

  async function verComprobante(pagoId: string) {
    setAbriendo(pagoId);
    try {
      setComprobante(await pagosServicio.obtenerComprobante(pagoId));
    } catch (err) {
      alertaError(err instanceof ErrorApi ? err.message : 'No se pudo obtener el comprobante');
    } finally {
      setAbriendo(null);
    }
  }

  return (
    <>
      <EncabezadoPagina titulo="Cuota social" bajada="Informá tus pagos y descargá los comprobantes aprobados." />

      {cargando || error ? (
        <Cargando texto="Cargando tu estado de cuenta…" error={error} onReintentar={recargar} />
      ) : (
        <>
          <Row className="g-3 mb-4">
            <Col xs={6} xl={3}>
              <Indicador etiqueta="Saldo adeudado" valor={formatearPesos(resumen.totalAdeudado)} detalle={resumen.adeudadas ? `${resumen.adeudadas} cuota${resumen.adeudadas > 1 ? 's' : ''}` : 'Estás al día'} />
            </Col>
            <Col xs={6} xl={3}>
              <Indicador etiqueta="Cuotas pagadas" valor={String(resumen.pagadas)} />
            </Col>
            <Col xs={6} xl={3}>
              <Indicador etiqueta="En revisión" valor={String(resumen.enRevision)} detalle="Esperando aprobación" />
            </Col>
            <Col xs={6} xl={3}>
              <Indicador etiqueta="Total de cuotas" valor={String(cuotas.length)} />
            </Col>
          </Row>

          {resumen.proxima && <InformarPago key={resumen.proxima.cuotaId + resumen.proxima.estadoPago} cuota={resumen.proxima} onInformado={recargar} />}

          <Seccion
            titulo="Historial de cuotas"
            acciones={
              <Form.Select size="sm" className="rounded-pill w-auto" value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)} aria-label="Filtrar por estado">
                {FILTROS.map((f) => (
                  <option key={f.valor} value={f.valor}>
                    {f.etiqueta}
                  </option>
                ))}
              </Form.Select>
            }
          >
            {cuotas.length === 0 ? (
              <p className="text-body-secondary text-center py-4 mb-0">Todavía no hay cuotas cargadas por el club.</p>
            ) : (
              <TablaCuotas cuotas={visibles} orden={orden} onOrdenar={ordenar} onVerComprobante={verComprobante} abriendoComprobante={abriendo} />
            )}
          </Seccion>
        </>
      )}

      <ModalComprobante comprobante={comprobante} onCerrar={() => setComprobante(null)} />
    </>
  );
}
