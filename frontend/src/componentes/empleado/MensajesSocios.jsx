'use client'

import { useState } from 'react'
import { Row, Col, Badge, ListGroup, Button, Form } from 'react-bootstrap'
import MensajeHilo from '../comun/MensajeHilo'
import Redactor from '../socio/Redactor'
import { correoAdministracion } from '../socio/Bandeja'
import { coincide } from '../../utilidades/texto'

const fechaCorta = (iso) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function MensajesSocios({ conversaciones, onResponder }) {
  const [abierta, setAbierta] = useState(null)
  const [soloPendientes, setSoloPendientes] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const clave = (c) => `${c.socio.id}:${c.hilo.id}`
  const actual = conversaciones.find((c) => clave(c) === abierta)
  const visibles = conversaciones.filter((c) => (!soloPendientes || c.sinResponder) && coincide(`${c.socio.nombre} ${c.hilo.asunto}`, busqueda))

  return (
    <>
      <div className="bg-body rounded-4 shadow-sm p-3 mb-3 small">
        Respondés como <strong>{correoAdministracion}</strong>
      </div>

      <Row className="g-3">
        <Col lg={5} className={actual ? 'd-none d-lg-block' : ''}>
          <div className="bg-body rounded-4 shadow-sm p-3 mb-3">
            <Form.Control
              type="search"
              size="sm"
              className="mb-2"
              placeholder="Buscar por socio o asunto"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar conversaciones"
            />
            <Form.Check
              type="switch"
              id="solo-pendientes"
              label="Solo sin responder"
              checked={soloPendientes}
              onChange={(e) => setSoloPendientes(e.target.checked)}
            />
          </div>
          <ListGroup className="shadow-sm rounded-4">
            {visibles.length === 0 && <ListGroup.Item className="text-body-secondary small py-3">No hay conversaciones para mostrar.</ListGroup.Item>}
            {visibles.map((c) => (
              <ListGroup.Item key={clave(c)} action active={clave(c) === abierta} onClick={() => setAbierta(clave(c))} className="py-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-truncate">{c.socio.nombre}</span>
                  {c.sinResponder && (
                    <Badge bg="warning" text="dark">
                      Sin responder
                    </Badge>
                  )}
                  <small className="ms-auto text-nowrap opacity-75">{fechaCorta(c.ultimo.fecha)}</small>
                </div>
                <small className="d-block text-truncate">{c.hilo.asunto}</small>
                <small className="d-block text-truncate opacity-75">{c.ultimo.texto}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col lg={7} className={actual ? '' : 'd-none d-lg-block'}>
          <div className="bg-body rounded-4 shadow-sm p-3 p-md-4 h-100">
            {actual ? (
              <>
                <Button variant="link" className="d-lg-none p-0 mb-3 link-secondary" onClick={() => setAbierta(null)}>
                  ← Volver a los mensajes
                </Button>
                <h2 className="h5 fw-bold text-secondary mb-1">{actual.hilo.asunto}</h2>
                <p className="small text-body-secondary mb-3 text-break">
                  {actual.socio.nombre} · {actual.socio.correoInstitucional}
                </p>
                {actual.hilo.mensajes.map((m) => (
                  <MensajeHilo key={m.id} mensaje={m} propio={m.delClub} nombreOtro={actual.socio.nombre} />
                ))}
                <div className="border-top pt-3">
                  <Redactor id={`responder-socio-${actual.hilo.id}`} textoBoton="Responder" onEnviar={(datos) => onResponder(actual.socio, actual.hilo.id, datos)} />
                </div>
              </>
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-center text-body-secondary py-5">Elegí una conversación para leerla y responder.</div>
            )}
          </div>
        </Col>
      </Row>
    </>
  )
}

export default MensajesSocios
