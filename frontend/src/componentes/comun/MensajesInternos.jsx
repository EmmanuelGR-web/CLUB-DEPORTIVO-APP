'use client'

import { useState } from 'react'
import { Row, Col, Badge, ListGroup, Button, Form } from 'react-bootstrap'
import MensajeHilo from './MensajeHilo'
import Redactor from '../socio/Redactor'
import { ausenciaVigente, fechaDeHoy, textoRegreso } from '../../utilidades/personal'

export const correoDireccion = 'direccion@clubdeportivo.com.ar'
export const nombreDireccion = 'Laura Gómez (Administradora principal)'

const fechaCorta = (iso) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// Canal interno entre la dirección y el personal. El rol 'admin' ve las
// conversaciones con todos y elige destinatario; el 'empleado' solo las suyas.
function MensajesInternos({ rol, hilos, personal = [], onAbrir, onResponder, onCrear }) {
  const esAdmin = rol === 'admin'
  const [abierto, setAbierto] = useState(null)
  const [redactando, setRedactando] = useState(false)
  const [destino, setDestino] = useState('')
  const [sinDestino, setSinDestino] = useState(false)
  const [conQuien, setConQuien] = useState('')
  const [hoy] = useState(() => fechaDeHoy())
  const activos = personal.filter((e) => !ausenciaVigente(e, hoy))
  const visibles = hilos.filter((h) => !conQuien || h.empleado.id === conQuien)
  const hilo = hilos.find((h) => h.id === abierto)
  const verDetalle = Boolean(hilo) || redactando

  const abrir = (id) => {
    setRedactando(false)
    setAbierto(id)
    if (!hilos.find((h) => h.id === id)?.leidoPor[rol]) onAbrir(id)
  }

  const responder = (datos) => onResponder(abierto, datos)

  const crear = async (datos) => {
    if (esAdmin && !destino) {
      setSinDestino(true)
      return 'Elegí a quién le mandás el mensaje.'
    }
    const id = await onCrear(datos, esAdmin ? destino : undefined)
    setRedactando(false)
    setDestino('')
    setAbierto(id)
  }

  const nombreOtro = (h) => (esAdmin ? h.empleado.nombre : nombreDireccion)

  return (
    <>
      <div className="bg-body rounded-4 shadow-sm p-3 mb-3 small d-flex flex-wrap align-items-center gap-2">
        {esAdmin ? (
          <>
            <span>
              Escribís desde <strong>{correoDireccion}</strong>
            </span>
            <Form.Select size="sm" className="w-auto ms-md-auto" value={conQuien} onChange={(e) => setConQuien(e.target.value)} aria-label="Ver conversaciones con">
              <option value="">Conversaciones con todo el personal</option>
              {personal.map((e) => (
                <option key={e.id} value={e.id}>
                  Con {e.nombre}
                </option>
              ))}
            </Form.Select>
          </>
        ) : (
          <span>
            Canal interno con <strong>{nombreDireccion}</strong> · {correoDireccion}
          </span>
        )}
      </div>

      <Row className="g-3">
        <Col lg={5} className={verDetalle ? 'd-none d-lg-block' : ''}>
          <Button
            variant="secondary"
            className="w-100 rounded-pill mb-3"
            onClick={() => {
              setAbierto(null)
              setRedactando(true)
              setSinDestino(false)
            }}
          >
            Nuevo mensaje
          </Button>
          {visibles.length === 0 && <p className="text-center text-body-secondary small py-4">No hay conversaciones.</p>}
          <ListGroup className="shadow-sm rounded-4">
            {visibles.map((h) => {
              const ultimo = h.mensajes.at(-1)
              return (
                <ListGroup.Item key={h.id} action active={h.id === abierto} onClick={() => abrir(h.id)} className="py-3">
                  <div className="d-flex align-items-center gap-2">
                    {!h.leidoPor[rol] && (
                      <Badge bg="warning" text="dark">
                        Nuevo
                      </Badge>
                    )}
                    <span className={`text-truncate ${h.leidoPor[rol] ? '' : 'fw-bold'}`}>{h.asunto}</span>
                    <small className="ms-auto text-nowrap opacity-75">{fechaCorta(ultimo.fecha)}</small>
                  </div>
                  {esAdmin && <small className="d-block fw-semibold opacity-75">Con {h.empleado.nombre}</small>}
                  <small className="d-block text-truncate opacity-75">{ultimo.texto}</small>
                </ListGroup.Item>
              )
            })}
          </ListGroup>
        </Col>

        <Col lg={7} className={verDetalle ? '' : 'd-none d-lg-block'}>
          <div className="bg-body rounded-4 shadow-sm p-3 p-md-4 h-100">
            {verDetalle && (
              <Button
                variant="link"
                className="d-lg-none p-0 mb-3 link-secondary"
                onClick={() => {
                  setAbierto(null)
                  setRedactando(false)
                }}
              >
                ← Volver
              </Button>
            )}
            {redactando && (
              <>
                <h2 className="h5 fw-bold text-secondary mb-3">Nuevo mensaje</h2>
                {esAdmin ? (
                  <Form.Group className="mb-3" controlId="interno-destino">
                    <Form.Label className="small fw-semibold">Para</Form.Label>
                    <Form.Select
                      value={destino}
                      onChange={(e) => {
                        setDestino(e.target.value)
                        setSinDestino(false)
                      }}
                      isInvalid={sinDestino}
                    >
                      <option value="">Elegí a quién le escribís</option>
                      <option value="todos">Todo el personal en actividad ({activos.length} personas)</option>
                      {personal.map((e) => (
                        <option key={e.id} value={e.id} disabled={Boolean(ausenciaVigente(e, hoy))}>
                          {e.nombre} · {e.rol} · {e.correo}
                          {ausenciaVigente(e, hoy) ? ` (${ausenciaVigente(e, hoy).motivo.toLowerCase()} · ${textoRegreso(ausenciaVigente(e, hoy)).toLowerCase()})` : ''}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">Elegí un destinatario.</Form.Control.Feedback>
                    {destino === 'todos' && <Form.Text>Cada persona recibe el mensaje en una conversación propia.</Form.Text>}
                  </Form.Group>
                ) : (
                  <p className="small text-body-secondary">Para: {correoDireccion}</p>
                )}
                <Redactor id={`interno-nuevo-${rol}`} conAsunto onEnviar={crear} onCancelar={() => setRedactando(false)} />
              </>
            )}
            {hilo && (
              <>
                <h2 className="h5 fw-bold text-secondary mb-1">{hilo.asunto}</h2>
                {esAdmin && <p className="small text-body-secondary mb-3">Conversación con {hilo.empleado.nombre} · {hilo.empleado.correo}</p>}
                {hilo.mensajes.map((m) => (
                  <MensajeHilo key={m.id} mensaje={m} propio={m.rol === rol} nombreOtro={nombreOtro(hilo)} />
                ))}
                <div className="border-top pt-3">
                  <Redactor id={`interno-${hilo.id}`} textoBoton="Responder" onEnviar={responder} />
                </div>
              </>
            )}
            {!verDetalle && <div className="h-100 d-flex align-items-center justify-content-center text-center text-body-secondary py-5">Elegí un mensaje para leerlo y responder.</div>}
          </div>
        </Col>
      </Row>
    </>
  )
}

export default MensajesInternos
