'use client'

import { useState } from 'react'
import { Modal, Row, Col, Button, ProgressBar } from 'react-bootstrap'
import EncabezadoLegajo from './EncabezadoLegajo'
import { formatearFechaConAnio } from '../../utilidades/fechas'
import { textoAntiguedad } from '../../utilidades/tiempo'
import { ausenciaProgramada, ausenciaVigente, fechaDeHoy, textoAusencia, textoRegreso, textoTurno } from '../../utilidades/personal'
import { colorEstado, descansoPermitido, horaCorta, presenciaDe, textoDuracion } from '../../utilidades/jornada'

function Dato({ etiqueta, children }) {
  return (
    <div className="mb-3">
      <div className="small text-uppercase text-body-secondary fw-semibold" style={{ letterSpacing: '0.06em' }}>
        {etiqueta}
      </div>
      <div className="fw-semibold text-break">{children}</div>
    </div>
  )
}

function Bloque({ titulo, children }) {
  return (
    <section className="h-100 bg-body-tertiary rounded-4 p-4">
      <h3 className="h6 fw-bold text-uppercase text-secondary border-start border-4 border-primary ps-2 mb-3">{titulo}</h3>
      {children}
    </section>
  )
}

function FichaPersonal({ empleado, jornadas, onCerrar, onEditar, onReincorporar }) {
  const [ahora] = useState(() => Date.now())
  const [fecha] = useState(() => fechaDeHoy())
  const ausencia = ausenciaVigente(empleado, fecha) ?? ausenciaProgramada(empleado, fecha)
  const vigente = Boolean(ausenciaVigente(empleado, fecha))
  const hoy = vigente ? null : presenciaDe(empleado, jornadas, ahora)

  return (
    <Modal show onHide={onCerrar} centered size="lg" contentClassName="border-0 rounded-4 overflow-hidden shadow-lg">
      <EncabezadoLegajo nombre={empleado.nombre} antetitulo={`Legajo ${empleado.codigo} · ${empleado.rol}`} onCerrar={onCerrar}>
        <div className="d-flex flex-wrap align-items-center gap-2 small">
          {vigente ? (
            <>
              <span className="badge rounded-pill bg-warning text-dark">{ausencia.motivo}</span>
              <span className="text-white-50">{textoRegreso(ausencia)}</span>
            </>
          ) : (
            <span className="d-inline-flex align-items-center gap-2 text-white-50">
              <span className={`rounded-circle d-inline-block bg-${colorEstado[hoy.clave]}`} style={{ width: 8, height: 8 }} aria-hidden="true" />
              {hoy.etiqueta}
            </span>
          )}
        </div>
      </EncabezadoLegajo>

      <Modal.Body className="p-4 p-md-5">
        <Row className="g-3">
          <Col md={6}>
            <Bloque titulo="Contacto">
              <Dato etiqueta="Correo del club">{empleado.correo}</Dato>
              <Dato etiqueta="Teléfono o interno">{empleado.telefono || '—'}</Dato>
              <Dato etiqueta="DNI">
                <span className="font-numeros">{empleado.dni}</span>
              </Dato>
            </Bloque>
          </Col>
          <Col md={6}>
            <Bloque titulo="Puesto">
              <Dato etiqueta="Rol">{empleado.rol}</Dato>
              <Dato etiqueta="Horario">{textoTurno(empleado)}</Dato>
              <Dato etiqueta="En el club desde">
                {formatearFechaConAnio(empleado.ingreso)} <span className="fw-normal text-body-secondary">({textoAntiguedad(new Date(`${empleado.ingreso}T12:00:00`))})</span>
              </Dato>
            </Bloque>
          </Col>
          {ausencia && (
            <Col xs={12}>
              <Bloque titulo={vigente ? 'Ausente · sin acceso al portal' : 'Ausencia programada'}>
                <p className="fw-semibold mb-1">{textoAusencia(ausencia)}</p>
                {ausencia.nota && <p className="small text-body-secondary mb-1">{ausencia.nota}</p>}
                <p className="small mb-3">{textoRegreso(ausencia)} y desde ese día puede volver a entrar al portal.</p>
                <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={() => onReincorporar(empleado)}>
                  {vigente ? 'Reincorporar hoy' : 'Cancelar la ausencia'}
                </Button>
              </Bloque>
            </Col>
          )}
          {hoy && (
            <Col xs={12}>
              <Bloque titulo="Jornada de hoy">
                {hoy.inicio ? (
                  <Row className="g-3 align-items-end">
                    <Col xs={6} md={3}>
                      <Dato etiqueta="Ingreso">{horaCorta(hoy.inicio)}</Dato>
                    </Col>
                    <Col xs={6} md={3}>
                      <Dato etiqueta="Trabajado">{textoDuracion(hoy.trabajado)}</Dato>
                    </Col>
                    <Col md={6}>
                      <Dato etiqueta="Descanso">
                        <span className={hoy.excedido ? 'text-danger' : ''}>
                          {textoDuracion(hoy.descanso)} de {textoDuracion(descansoPermitido)}
                        </span>
                        <ProgressBar className="mt-1" now={Math.min(100, (hoy.descanso / descansoPermitido) * 100)} variant={hoy.excedido ? 'danger' : 'warning'} style={{ height: 6 }} />
                      </Dato>
                    </Col>
                  </Row>
                ) : (
                  <p className="text-body-secondary mb-0">{hoy.etiqueta}.</p>
                )}
              </Bloque>
            </Col>
          )}
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-body-tertiary border-0 px-4 px-md-5">
        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={onCerrar}>
          Cerrar
        </Button>
        <Button variant="secondary" className="rounded-pill px-4" onClick={() => onEditar(empleado)}>
          Editar legajo
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default FichaPersonal
