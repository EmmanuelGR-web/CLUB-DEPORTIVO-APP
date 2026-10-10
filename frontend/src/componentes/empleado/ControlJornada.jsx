'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Modal, ProgressBar, Row, Col } from 'react-bootstrap'
import { useSesion } from '../../contextos/SesionContexto'
import { descansoPermitido, estadoJornada, horaCorta, intervaloActividad, reloj, textoDuracion } from '../../utilidades/jornada'
import { jornadaApi } from '../../servicios/gestionApi'
import { alertaError, alertaExito } from '../../utilidades/alertas'

// La jornada se guarda en el servidor: el panel avisa cada 20 segundos
// que la persona sigue conectada, así la dirección la ve en vivo.
function ControlJornada() {
  const { cerrarSesion } = useSesion()
  const router = useRouter()
  const [ahora, setAhora] = useState(() => Date.now())
  const [jornada, setJornada] = useState(null)
  const [confirmar, setConfirmar] = useState(false)

  useEffect(() => {
    const avisar = () => jornadaApi('actividad').then(setJornada).catch(() => {})
    avisar()
    const actividad = setInterval(avisar, intervaloActividad)
    const segundero = setInterval(() => setAhora(Date.now()), 1000)
    return () => {
      clearInterval(actividad)
      clearInterval(segundero)
    }
  }, [])

  const estado = estadoJornada(jornada, ahora)
  const enDescanso = estado.clave === 'descanso'
  const restante = descansoPermitido - estado.descanso

  const alternar = async () => {
    try {
      setJornada(await jornadaApi(enDescanso ? 'volver' : 'descanso'))
      setAhora(Date.now())
    } catch (problema) {
      alertaError(problema.message)
    }
  }

  const terminar = async () => {
    try {
      await jornadaApi('fin')
    } catch (problema) {
      alertaError(problema.message)
      return
    }
    setConfirmar(false)
    cerrarSesion()
    router.replace('/login')
    alertaExito(`Registramos tu salida (${horaCorta(Date.now())}). Hoy trabajaste ${textoDuracion(estado.trabajado)} y descansaste ${textoDuracion(estado.descanso)}. ¡Hasta mañana!`, 'Jornada terminada')
  }

  const resumen = [
    ['Ingreso', estado.inicio ? horaCorta(estado.inicio) : '—'],
    ['Salida', horaCorta(ahora)],
    ['Trabajado', textoDuracion(estado.trabajado)],
    ['Descanso', `${textoDuracion(estado.descanso)} de ${textoDuracion(descansoPermitido)}`],
  ]

  return (
    <section className={`rounded-4 shadow-sm p-3 px-md-4 mb-4 d-flex flex-wrap align-items-center gap-3 gap-md-4 ${enDescanso ? 'bg-warning-subtle' : 'bg-body'}`} aria-label="Mi jornada">
      <div className="d-flex align-items-center gap-2">
        <span className={`rounded-circle d-inline-block bg-${enDescanso ? 'warning' : 'success'}`} style={{ width: 10, height: 10 }} aria-hidden="true" />
        <strong>{enDescanso ? `En descanso · ${reloj(estado.descansoActual)}` : 'En línea'}</strong>
      </div>
      {estado.inicio && (
        <div className="small text-body-secondary">
          Ingreso {horaCorta(estado.inicio)} · Trabajado <span className="text-body fw-semibold">{textoDuracion(estado.trabajado)}</span>
        </div>
      )}
      <div className="small flex-grow-1" style={{ minWidth: 180, maxWidth: 280 }}>
        <div className="d-flex justify-content-between mb-1">
          <span className="text-body-secondary">Descanso del día</span>
          <span className={estado.excedido ? 'text-danger fw-semibold' : 'fw-semibold'}>
            {textoDuracion(estado.descanso)} de {textoDuracion(descansoPermitido)}
          </span>
        </div>
        <ProgressBar now={Math.min(100, (estado.descanso / descansoPermitido) * 100)} variant={estado.excedido ? 'danger' : 'warning'} style={{ height: 6 }} />
      </div>
      <div className="d-flex flex-wrap gap-2 ms-md-auto">
        <Button variant={enDescanso ? 'secondary' : 'outline-secondary'} className="rounded-pill px-4" onClick={alternar}>
          {enDescanso ? 'Volver al trabajo' : 'Tomar descanso'}
        </Button>
        <Button variant="secondary" className="rounded-pill px-4" onClick={() => setConfirmar(true)}>
          Terminar jornada
        </Button>
      </div>
      {enDescanso && restante < 0 && <div className="w-100 small text-danger mt-n2">Superaste el descanso permitido por {textoDuracion(-restante)}.</div>}

      <Modal show={confirmar} onHide={() => setConfirmar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-secondary">Terminar la jornada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Se registra tu salida y se cierra tu sesión. La administración ve tu jornada como terminada.</p>
          <Row className="g-2">
            {resumen.map(([etiqueta, valor]) => (
              <Col key={etiqueta} xs={6}>
                <div className="bg-body-tertiary rounded-4 p-3 h-100">
                  <div className="small text-uppercase text-body-secondary fw-semibold">{etiqueta}</div>
                  <div className={`fw-bold ${etiqueta === 'Descanso' && estado.excedido ? 'text-danger' : ''}`}>{valor}</div>
                </div>
              </Col>
            ))}
          </Row>
          {enDescanso && <p className="small text-body-secondary mt-3 mb-0">Tu descanso en curso se cierra ahora.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setConfirmar(false)}>
            Seguir trabajando
          </Button>
          <Button variant="secondary" className="rounded-pill px-4" onClick={terminar}>
            Marcar salida
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export default ControlJornada
