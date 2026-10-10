'use client'

import { useState } from 'react'
import { Modal, Row, Col, Table, Button, ProgressBar, Alert } from 'react-bootstrap'
import { formatearPesos } from '../../utilidades/carnet'
import { descargarResumenEconomico } from '../../utilidades/pdf'
import { cuotas } from '../../utilidades/finanzas'

function Bloque({ titulo, children }) {
  return (
    <section className="mb-4">
      <h3 className="h6 fw-bold text-uppercase text-secondary border-start border-4 border-primary ps-2 mb-3">{titulo}</h3>
      {children}
    </section>
  )
}

function Cifra({ etiqueta, valor, detalle, color = 'secondary' }) {
  return (
    <div className="bg-body-tertiary rounded-4 p-3 h-100">
      <div className="small text-uppercase fw-semibold text-body-secondary">{etiqueta}</div>
      <div className={`font-credencial fw-bold fs-3 text-${color}`}>{valor}</div>
      {detalle && <div className="small text-body-secondary">{detalle}</div>}
    </div>
  )
}

function Composicion({ grupos, total }) {
  if (grupos.length === 0) return <p className="small text-body-secondary mb-0">Sin movimientos en el período.</p>
  return grupos.map((g) => (
    <div key={g.etiqueta} className="mb-2">
      <div className="d-flex small">
        <span className="fw-semibold">{g.etiqueta}</span>
        <span className="text-body-secondary ms-2">
          {cuotas(g.cantidad)}
        </span>
        <span className="ms-auto font-numeros">{formatearPesos(g.monto)}</span>
      </div>
      <ProgressBar variant="secondary" now={total ? (g.monto / total) * 100 : 0} style={{ height: 6 }} />
    </div>
  ))
}

function ResumenEconomico({ resumen, evolucion, autor, mostrar, onCerrar }) {
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState(false)

  const descargar = async () => {
    setGenerando(true)
    setError(false)
    try {
      await descargarResumenEconomico(resumen, evolucion, autor)
    } catch {
      setError(true)
    }
    setGenerando(false)
  }

  const r = resumen
  const maximo = Math.max(1, ...evolucion.map((m) => m.ingresos + m.impago))

  return (
    <Modal show={mostrar} onHide={onCerrar} size="xl" fullscreen="md-down" scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold text-secondary">
          Resumen económico · {r.nombre}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3 p-md-4">
        <Bloque titulo="Totales del período">
          <Row className="g-3">
            <Col sm={6} lg={3}>
              <Cifra etiqueta="Ingresos cobrados" valor={formatearPesos(r.ingresos)} detalle={`${cuotas(r.alDia)} · ${formatearPesos(r.recargosCobrados)} de recargos`} />
            </Col>
            <Col sm={6} lg={3}>
              <Cifra etiqueta="Cuotas impagas" valor={formatearPesos(r.impago)} detalle={`${cuotas(r.cantidadImpagas)} sin pagar, con recargos`} color="primary" />
            </Col>
            <Col sm={6} lg={3}>
              <Cifra etiqueta="En revisión" valor={formatearPesos(r.enRevision)} detalle={`${r.cantidadEnRevision} ${r.cantidadEnRevision === 1 ? 'comprobante' : 'comprobantes'} por aprobar`} color="warning-emphasis" />
            </Col>
            <Col sm={6} lg={3}>
              <Cifra etiqueta="Cobranza" valor={`${r.cobranza} %`} detalle={`De ${formatearPesos(r.emitido)} emitidos`} />
            </Col>
          </Row>
          <ProgressBar className="mt-3" style={{ height: 10 }}>
            <ProgressBar variant="secondary" now={r.emitido ? (r.ingresos / r.emitido) * 100 : 0} key="cobrado" />
            <ProgressBar variant="warning" now={r.emitido ? (r.enRevision / r.emitido) * 100 : 0} key="revision" />
            <ProgressBar variant="primary" striped now={r.emitido ? (r.impago / r.emitido) * 100 : 0} key="impago" />
          </ProgressBar>
          <div className="d-flex flex-wrap gap-3 small text-body-secondary mt-2">
            <span>Bordó: cobrado</span>
            <span>Dorado: en revisión</span>
            <span>Rojo: impago</span>
          </div>
        </Bloque>

        <Bloque titulo="Padrón">
          <Row className="g-3">
            <Col xs={6} lg={3}>
              <Cifra etiqueta="Socios en padrón" valor={r.padron} />
            </Col>
            <Col xs={6} lg={3}>
              <Cifra etiqueta="Activos" valor={r.activos} detalle="Con la cuenta validada" />
            </Col>
            <Col xs={6} lg={3}>
              <Cifra etiqueta="Al día" valor={r.alDia} detalle="Cuota del mes pagada" />
            </Col>
            <Col xs={6} lg={3}>
              <Cifra etiqueta="Morosos" valor={r.morosos.length} detalle="Cuota vencida sin pagar" color="primary" />
            </Col>
          </Row>
        </Bloque>

        <Row className="g-4">
          <Col lg={6}>
            <Bloque titulo="Cobrado por medio de pago">
              <Composicion grupos={r.porMedio} total={r.ingresos} />
            </Bloque>
          </Col>
          <Col lg={6}>
            <Bloque titulo="Cuotas emitidas por categoría">
              <Composicion grupos={r.porCategoria} total={r.emitido} />
            </Bloque>
          </Col>
        </Row>

        <Bloque titulo="Socios morosos">
          {r.morosos.length === 0 ? (
            <p className="small text-body-secondary mb-0">No hay socios con la cuota vencida en este período.</p>
          ) : (
            <Table responsive size="sm" className="align-middle mb-0">
              <thead>
                <tr className="text-uppercase small">
                  <th scope="col">Socio</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col" className="text-center">
                    Días de demora
                  </th>
                  <th scope="col" className="text-end">
                    Recargo
                  </th>
                  <th scope="col" className="text-end">
                    Deuda
                  </th>
                </tr>
              </thead>
              <tbody>
                {r.morosos.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="fw-semibold">{m.nombre}</div>
                      <div className="small text-body-secondary font-numeros">N° {m.numeroSocio}</div>
                    </td>
                    <td className="text-nowrap">{m.telefono || '—'}</td>
                    <td className="text-center">{m.dias}</td>
                    <td className="text-end font-numeros">{formatearPesos(m.recargo)}</td>
                    <td className="text-end font-numeros fw-bold text-primary">{formatearPesos(m.total)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Bloque>

        <Bloque titulo="Evolución de los últimos meses">
          {evolucion.map((m) => (
            <div key={m.periodo} className="d-flex align-items-center gap-3 mb-2">
              <span className="small text-capitalize text-nowrap" style={{ width: 70 }}>
                {m.nombre}
              </span>
              <ProgressBar className="flex-grow-1" style={{ height: 14 }}>
                <ProgressBar variant="secondary" now={(m.ingresos / maximo) * 100} key="cobrado" />
                <ProgressBar variant="primary" striped now={(m.impago / maximo) * 100} key="pendiente" />
              </ProgressBar>
              <span className="small font-numeros text-end text-nowrap" style={{ width: 110 }}>
                {formatearPesos(m.ingresos)}
              </span>
            </div>
          ))}
        </Bloque>

        {error && <Alert variant="danger">No se pudo generar el PDF. Probá de nuevo.</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" className="rounded-pill px-4 me-auto" onClick={onCerrar}>
          Cerrar
        </Button>
        <Button variant="secondary" className="rounded-pill px-4" onClick={descargar} disabled={generando}>
          {generando ? 'Generando…' : 'Descargar PDF para imprimir'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ResumenEconomico
