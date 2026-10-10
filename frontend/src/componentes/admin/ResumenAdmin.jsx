'use client'

import { Row, Col, Button } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import Indicador from '../empleado/Indicador'
import { formatearPesos } from '../../utilidades/carnet'
import { periodoDe, resumenEconomico } from '../../utilidades/finanzas'
import { tipoDeRegistro } from '../../utilidades/tiposCambio'

const fechaHora = (iso) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function ResumenAdmin({ perfiles, enActividad, enLinea, registros, solicitudes, hilosInternos, onIr }) {
  const mes = resumenEconomico(perfiles, periodoDe())
  const sinLeer = hilosInternos.filter((h) => !h.leidoPor.admin).length
  const pendientes = solicitudes.filter((s) => s.estado === 'Pendiente').length
  const resueltas = solicitudes.filter((s) => s.estado !== 'Pendiente').length

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <Indicador valor={formatearPesos(mes.ingresos)} etiqueta="Cobrado este mes" detalle={`Cobranza del ${mes.cobranza} %`} destacado tamano="2.2rem" onClick={() => onIr('facturacion')} />
        </Col>
        <Col sm={6} xl={3}>
          <Indicador valor={mes.morosos.length} etiqueta="Socios morosos" detalle={`${formatearPesos(mes.impago)} por cobrar`} tamano="2.2rem" onClick={() => onIr('facturacion')} />
        </Col>
        <Col sm={6} xl={3}>
          <Indicador valor={mes.activos} etiqueta="Socios activos" detalle={`De ${perfiles.length} en el padrón`} tamano="2.2rem" onClick={() => onIr('socios')} />
        </Col>
        <Col sm={6} xl={3}>
          <Indicador valor={`${enLinea} de ${enActividad}`} etiqueta="Personal en línea" detalle="Conectados ahora" tamano="2.2rem" onClick={() => onIr('presencia')} />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={5}>
          <Tarjeta titulo="Trabajo del personal" className="h-100">
            <dl className="mb-3">
              <div className="d-flex justify-content-between border-bottom py-2">
                <dt className="fw-normal">Solicitudes esperando revisión</dt>
                <dd className={`mb-0 fw-bold ${pendientes ? 'text-primary' : ''}`}>{pendientes}</dd>
              </div>
              <div className="d-flex justify-content-between border-bottom py-2">
                <dt className="fw-normal">Solicitudes resueltas</dt>
                <dd className="mb-0 fw-bold">{resueltas}</dd>
              </div>
              <div className="d-flex justify-content-between py-2">
                <dt className="fw-normal">Mensajes del personal sin leer</dt>
                <dd className={`mb-0 fw-bold ${sinLeer ? 'text-primary' : ''}`}>{sinLeer}</dd>
              </div>
            </dl>
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => onIr('interno')}>
              Ir a mensajes
            </Button>
          </Tarjeta>
        </Col>
        <Col lg={7}>
          <Tarjeta titulo="Últimos cambios en cuentas" className="h-100">
            {registros.length === 0 && <p className="text-body-secondary mb-0">Todavía no hay cambios registrados.</p>}
            <ul className="list-unstyled mb-3">
              {registros.slice(0, 5).map((r) => (
                <li key={r.id} className="d-flex flex-wrap gap-2 border-bottom py-2 small">
                  <strong>{r.socioNombre}</strong>
                  <span className="text-body-secondary">{tipoDeRegistro(r).etiqueta}</span>
                  <span className="text-body-secondary">· {r.autor === 'Socio' ? 'el socio' : r.autor}</span>
                  <span className="ms-auto text-body-secondary text-nowrap">{fechaHora(r.fecha)}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => onIr('reportes')}>
              Ver el registro completo
            </Button>
          </Tarjeta>
        </Col>
      </Row>
    </>
  )
}

export default ResumenAdmin
