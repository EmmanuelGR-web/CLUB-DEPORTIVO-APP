'use client'

import { Row, Col, Form, FloatingLabel } from 'react-bootstrap'
import OpcionesPildora from './OpcionesPildora'
import { diaSiguiente, enActividadTexto, motivosAusencia, sinCambiosTexto } from '../../utilidades/personal'
import { formatearFechaConAnio } from '../../utilidades/fechas'

function CamposAusencia({ id, ausencia, onCambiar, hoy, error, conSinCambios = false }) {
  const actual = ausencia === undefined ? sinCambiosTexto : (ausencia?.motivo ?? enActividadTexto)
  const opciones = [...(conSinCambios ? [sinCambiosTexto] : []), enActividadTexto, ...motivosAusencia]

  const elegir = (opcion) => {
    if (opcion === sinCambiosTexto) onCambiar(undefined)
    else if (opcion === enActividadTexto) onCambiar(null)
    else onCambiar({ motivo: opcion, desde: ausencia?.desde ?? hoy, hasta: ausencia?.hasta ?? '', nota: ausencia?.nota ?? '' })
  }
  const poner = (campo) => (e) => onCambiar({ ...ausencia, [campo]: e.target.value })

  return (
    <>
      <OpcionesPildora nombre={`${id}-situacion`} valor={actual} opciones={opciones} onCambiar={elegir} />
      {ausencia && (
        <div className="bg-body-tertiary rounded-4 p-3 mt-3">
          <Row className="g-3">
            <Col sm={6}>
              <FloatingLabel controlId={`${id}-desde`} label="Primer día">
                <Form.Control type="date" value={ausencia.desde} onChange={poner('desde')} isInvalid={Boolean(error)} />
              </FloatingLabel>
            </Col>
            <Col sm={6}>
              <FloatingLabel controlId={`${id}-hasta`} label="Último día">
                <Form.Control type="date" value={ausencia.hasta} min={ausencia.desde} onChange={poner('hasta')} isInvalid={Boolean(error)} />
              </FloatingLabel>
            </Col>
            <Col xs={12}>
              <FloatingLabel controlId={`${id}-nota`} label="Nota interna (opcional)">
                <Form.Control value={ausencia.nota} onChange={poner('nota')} maxLength={120} placeholder="Nota" />
              </FloatingLabel>
            </Col>
          </Row>
          {error ? (
            <div className="small text-danger mt-2">{error}</div>
          ) : (
            ausencia.hasta && (
              <p className="small mb-0 mt-3">
                No va a poder entrar al portal del <strong>{formatearFechaConAnio(ausencia.desde)}</strong> al <strong>{formatearFechaConAnio(ausencia.hasta)}</strong>. El{' '}
                <strong>{formatearFechaConAnio(diaSiguiente(ausencia.hasta))}</strong> vuelve a estar en actividad solo.
              </p>
            )
          )}
        </div>
      )}
    </>
  )
}

export default CamposAusencia
