'use client'

import { Row, Col, Button } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import Indicador from './Indicador'
import TablaSolicitudes from './TablaSolicitudes'

function ResumenGestion({ solicitudes, perfiles, conversaciones, cambiosSemana, onIr, onRevisar }) {
  const pendientes = solicitudes.filter((s) => s.estado === 'Pendiente')
  const activos = perfiles.filter((p) => p.estado === 'Activo').length
  const sinResponder = conversaciones.filter((c) => c.sinResponder).length

  return (
    <>
      <Row className="g-3 mb-4">
        <Col xs={6} xl={3}>
          <Indicador valor={pendientes.length} etiqueta="Solicitudes pendientes" detalle="Esperando revisión" destacado onClick={() => onIr('solicitudes')} />
        </Col>
        <Col xs={6} xl={3}>
          <Indicador valor={sinResponder} etiqueta="Mensajes sin responder" detalle="De socios" onClick={() => onIr('mensajes')} />
        </Col>
        <Col xs={6} xl={3}>
          <Indicador valor={activos} etiqueta="Socios activos" detalle={`De ${perfiles.length} en el padrón`} onClick={() => onIr('socios')} />
        </Col>
        <Col xs={6} xl={3}>
          <Indicador valor={cambiosSemana} etiqueta="Cambios esta semana" detalle="En cuentas de socios" onClick={() => onIr('cambios')} />
        </Col>
      </Row>

      <Tarjeta titulo="Pendientes de revisión">
        <TablaSolicitudes solicitudes={pendientes.slice(0, 5)} onRevisar={onRevisar} />
        {pendientes.length > 5 && (
          <Button variant="link" className="link-secondary mt-2 p-0" onClick={() => onIr('solicitudes')}>
            Ver las {pendientes.length} solicitudes pendientes
          </Button>
        )}
      </Tarjeta>
    </>
  )
}

export default ResumenGestion
