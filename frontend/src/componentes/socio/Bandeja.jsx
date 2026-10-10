'use client'

import { useState } from 'react'
import { Row, Col, Button, Badge, ListGroup } from 'react-bootstrap'
import Redactor from './Redactor'
import MensajeHilo from '../comun/MensajeHilo'

export const correoAdministracion = 'administracion@clubdeportivo.com.ar'

const fechaHora = (iso) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function Bandeja({ socio, hilos, onAbrir, onResponder, onCrear }) {
  const [abierto, setAbierto] = useState(null)
  const [redactando, setRedactando] = useState(false)
  const hilo = hilos.find((h) => h.id === abierto)
  const verDetalle = Boolean(hilo) || redactando

  const abrir = (id) => {
    setRedactando(false)
    setAbierto(id)
    if (!hilos.find((h) => h.id === id)?.leido) onAbrir(id)
  }

  const responder = (datos) => onResponder(abierto, datos)

  const crear = async (datos) => {
    const id = await onCrear(datos)
    setRedactando(false)
    setAbierto(id)
  }

  return (
    <>
      <div className="bg-body rounded-4 shadow-sm p-3 mb-3 small d-flex flex-wrap gap-3">
        <span>
          Tu correo institucional: <strong className="text-break">{socio.correoInstitucional}</strong>
        </span>
        <span>
          Administración: <strong>{correoAdministracion}</strong>
        </span>
      </div>

      <Row className="g-3">
        <Col lg={5} className={verDetalle ? 'd-none d-lg-block' : ''}>
          <Button variant="secondary" className="w-100 rounded-pill mb-3" onClick={() => { setAbierto(null); setRedactando(true) }}>
            Nuevo mensaje a administración
          </Button>
          {hilos.length === 0 && <p className="text-center text-body-secondary small py-4">Tu bandeja está vacía.</p>}
          <ListGroup className="shadow-sm rounded-4">
            {hilos.map((h) => {
              const ultimo = h.mensajes.at(-1)
              return (
                <ListGroup.Item key={h.id} action active={h.id === abierto} onClick={() => abrir(h.id)} className="py-3">
                  <div className="d-flex align-items-center gap-2">
                    {!h.leido && <Badge bg="warning" text="dark">Nuevo</Badge>}
                    <span className={`text-truncate ${h.leido ? '' : 'fw-bold'}`}>{h.asunto}</span>
                    <small className="ms-auto text-nowrap opacity-75">{fechaHora(ultimo.fecha)}</small>
                  </div>
                  <small className="d-block text-truncate opacity-75">
                    {h.mensajes.length > 1 && `(${h.mensajes.length}) `}
                    {ultimo.texto}
                  </small>
                </ListGroup.Item>
              )
            })}
          </ListGroup>
        </Col>

        <Col lg={7} className={verDetalle ? '' : 'd-none d-lg-block'}>
          <div className="bg-body rounded-4 shadow-sm p-3 p-md-4 h-100">
            {verDetalle && (
              <Button variant="link" className="d-lg-none p-0 mb-3 link-secondary" onClick={() => { setAbierto(null); setRedactando(false) }}>
                ← Volver a la bandeja
              </Button>
            )}

            {redactando && (
              <>
                <h2 className="h5 fw-bold text-secondary mb-1">Nuevo mensaje</h2>
                <p className="small text-body-secondary">Para: {correoAdministracion}</p>
                <Redactor id="nuevo" conAsunto onEnviar={crear} onCancelar={() => setRedactando(false)} />
              </>
            )}

            {hilo && (
              <>
                <h2 className="h5 fw-bold text-secondary mb-3">{hilo.asunto}</h2>
                {hilo.mensajes.map((m) => (
                  <MensajeHilo key={m.id} mensaje={m} propio={!m.delClub} nombreOtro="Administración" />
                ))}
                <div className="border-top pt-3">
                  <Redactor id={`responder-${hilo.id}`} textoBoton="Responder" onEnviar={responder} />
                </div>
              </>
            )}

            {!verDetalle && (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center text-body-secondary py-5">
                Elegí un mensaje para leerlo y responder.
              </div>
            )}
          </div>
        </Col>
      </Row>
    </>
  )
}

export default Bandeja
