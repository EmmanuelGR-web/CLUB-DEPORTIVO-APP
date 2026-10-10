'use client'

import { useState } from 'react'
import { Row, Col, Button, Badge, Alert, Collapse, Form } from 'react-bootstrap'
import { FaCreditCard } from 'react-icons/fa'
import Tarjeta from '../comun/Tarjeta'
import OpcionPago from '../auth/OpcionPago'
import DatosTarjeta from '../auth/DatosTarjeta'
import { emisores, redesTarjeta } from '../../datos/pagos'
import { erroresTarjeta, resumirTarjeta, revisarNumeroTarjeta, tarjetaVacia } from '../../utilidades/tarjetas'

const opciones = [
  { valor: 'tarjeta', etiqueta: 'Tarjeta' },
  { valor: 'efectivo', etiqueta: 'Efectivo' },
]

function Actual({ medio }) {
  if (medio.tipo === 'efectivo') {
    return (
      <p className="mb-0">
        Pagás en efectivo en la secretaría de la sede.
      </p>
    )
  }
  const red = redesTarjeta[medio.red]
  const emisor = emisores.find((e) => e.id === medio.emisor)
  const IconoRed = red?.icono ?? FaCreditCard
  return (
    <div className="d-flex flex-wrap align-items-center gap-3">
      <span className="fs-1 lh-1" style={{ color: red?.color }}>
        <IconoRed aria-label={red?.nombre ?? 'Tarjeta'} />
      </span>
      <div>
        <div className="fw-semibold">
          {red?.nombre ?? 'Tarjeta'} terminada en {medio.ultimos4 ?? '••••'}
        </div>
        <div className="small text-body-secondary">{emisor?.nombre ?? 'Emisor sin datos'}</div>
      </div>
      <Badge bg={medio.debitoAutomatico ? 'success' : 'secondary'} pill className="ms-md-auto">
        Débito automático {medio.debitoAutomatico ? 'activado' : 'desactivado'}
      </Badge>
    </div>
  )
}

function MedioPago({ socio, onGuardar }) {
  const [editando, setEditando] = useState(false)
  const [tipo, setTipo] = useState(socio.medioPago.tipo)
  const [tarjeta, setTarjeta] = useState(tarjetaVacia)
  const [soloDebito, setSoloDebito] = useState(true)
  const [validado, setValidado] = useState(false)
  const [aviso, setAviso] = useState('')

  const tieneTarjeta = socio.medioPago.tipo === 'tarjeta'
  const cambiaTarjeta = tipo === 'tarjeta' && !(tieneTarjeta && soloDebito)
  const errores = cambiaTarjeta ? erroresTarjeta(tarjeta) : {}
  const marcar = (campo) => validado && errores[campo]

  const empezar = () => {
    setTipo(socio.medioPago.tipo)
    setTarjeta({ ...tarjetaVacia, debitoAutomatico: socio.medioPago.debitoAutomatico })
    setSoloDebito(tieneTarjeta)
    setValidado(false)
    setAviso('')
    setEditando(true)
  }

  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    setValidado(true)
    if (Object.values(errores).some(Boolean)) return

    const nuevo =
      tipo === 'efectivo'
        ? { tipo: 'efectivo', debitoAutomatico: false }
        : cambiaTarjeta
          ? resumirTarjeta(tarjeta)
          : { ...socio.medioPago, debitoAutomatico: tarjeta.debitoAutomatico }

    setGuardando(true)
    try {
      const huboCambios = await onGuardar({ medioPago: nuevo }, 'Medio de pago')
      setAviso(huboCambios ? 'Tu medio de pago se actualizó y el cambio quedó registrado.' : 'No hiciste ningún cambio.')
      setEditando(false)
    } catch (problema) {
      setAviso(problema.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Tarjeta titulo="Medio de pago" className="mb-4">
      {aviso && (
        <Alert variant={aviso.startsWith('Revisá') ? 'warning' : 'success'} dismissible onClose={() => setAviso('')} className="py-2">
          {aviso}
        </Alert>
      )}

      {!editando ? (
        <>
          <Actual medio={socio.medioPago} />
          <Button variant="secondary" className="rounded-pill px-4 mt-3" onClick={empezar}>
            Cambiar medio de pago
          </Button>
        </>
      ) : (
        <Form noValidate onSubmit={guardar} className="bg-secondary text-white rounded-4 p-4">
          <Row className="g-3">
            {opciones.map((opcion) => (
              <Col xs={6} key={opcion.valor}>
                <OpcionPago {...opcion} elegido={tipo} onElegir={setTipo} />
              </Col>
            ))}
          </Row>

          <Collapse in={tipo === 'tarjeta'}>
            <div>
              {tieneTarjeta && (
                <Form.Check
                  type="switch"
                  id="usar-otra-tarjeta"
                  className="mt-3"
                  checked={!soloDebito}
                  onChange={(e) => setSoloDebito(!e.target.checked)}
                  label="Quiero cargar otra tarjeta"
                />
              )}
              {cambiaTarjeta ? (
                <DatosTarjeta tarjeta={tarjeta} onCambiar={setTarjeta} marcar={marcar} mensajes={{ numero: revisarNumeroTarjeta(tarjeta.numero, tarjeta.emisor) }} />
              ) : (
                <Form.Check
                  type="switch"
                  id="solo-debito"
                  className="mt-3"
                  checked={tarjeta.debitoAutomatico}
                  onChange={(e) => setTarjeta({ ...tarjeta, debitoAutomatico: e.target.checked })}
                  label={`Debitar la cuota automáticamente de mi tarjeta terminada en ${socio.medioPago.ultimos4 ?? '••••'}`}
                />
              )}
            </div>
          </Collapse>

          <div className="d-flex flex-wrap gap-2 mt-4">
            <Button type="submit" variant="light" className="rounded-pill px-4 text-secondary fw-semibold" disabled={guardando}>
              Guardar
            </Button>
            <Button variant="outline-light" className="rounded-pill px-4" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
          </div>
        </Form>
      )}
    </Tarjeta>
  )
}

export default MedioPago
