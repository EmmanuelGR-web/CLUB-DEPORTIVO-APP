'use client'

import { useState } from 'react'
import { Row, Col, Form, Button, Alert, Collapse, Spinner } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import { formatearPesos } from '../../utilidades/carnet'
import { calcularCuota, diaVencimiento, interesDiario } from '../../utilidades/cuotas'
import { leerAdjunto, tamanioLegible, textoLimite } from '../../utilidades/mensajes'
import { leerConIA, montosCoinciden } from '../../utilidades/lecturaIA'

const medios = ['Transferencia', 'Billetera virtual', 'Depósito', 'Efectivo']

const hoyISO = () => new Date().toISOString().slice(0, 10)
const nombreMes = (periodo) => new Date(`${periodo}-01T12:00:00`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

function InformarPago({ cuota, onInformar }) {
  const [abierto, setAbierto] = useState(false)
  const [fechaPago, setFechaPago] = useState(hoyISO)
  const [medio, setMedio] = useState('Transferencia')
  const [comprobante, setComprobante] = useState(null)
  const [error, setError] = useState('')
  const [validado, setValidado] = useState(false)
  const [lectura, setLectura] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const [anio, mes] = cuota.periodo.split('-').map(Number)
  const segunFecha = calcularCuota(cuota.base, anio, mes - 1, new Date(`${fechaPago}T12:00:00`), new Date(cuota.vence))
  const enRevision = cuota.estado === 'En revisión'

  const elegirArchivo = async (e) => {
    setError('')
    const archivo = e.target.files[0]
    if (!archivo) return
    if (!/^image\/|application\/pdf/.test(archivo.type)) {
      setError('El comprobante tiene que ser una imagen o un PDF.')
      return
    }
    let adjunto
    try {
      adjunto = await leerAdjunto(archivo)
      setComprobante(adjunto)
    } catch (problema) {
      setError(problema.message)
      return
    }
    setLectura({ estado: 'leyendo' })
    try {
      const leido = await leerConIA('comprobante', [{ dataUrl: adjunto.dataUrl }], { hoy: hoyISO() })
      setLectura({ estado: 'lista', ...leido })
      if (leido.fecha && leido.fecha <= hoyISO()) setFechaPago(leido.fecha)
      if (medios.includes(leido.medio)) setMedio(leido.medio)
    } catch (problema) {
      setLectura({ estado: 'error', mensaje: problema.message })
    }
  }

  const coincide = lectura?.estado === 'lista' && montosCoinciden(lectura.monto, segunFecha.total)

  const enviar = async (e) => {
    e.preventDefault()
    setValidado(true)
    if (!comprobante || !fechaPago || fechaPago > hoyISO()) return
    const verificacionIA =
      lectura?.estado === 'lista'
        ? {
            leido: true,
            esComprobante: lectura.esComprobante,
            monto: lectura.monto,
            fecha: lectura.fecha,
            numeroOperacion: lectura.numeroOperacion,
            origen: lectura.origen,
            destino: lectura.destino,
            observaciones: lectura.observaciones,
            montoEsperado: segunFecha.total,
            coincideMonto: coincide,
            coincideFecha: lectura.fecha === fechaPago,
          }
        : { leido: false, motivo: lectura?.mensaje ?? '' }
    setEnviando(true)
    try {
      await onInformar(cuota, { fechaPago, medio, comprobante, verificacionIA })
    } catch (problema) {
      setError(problema.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Tarjeta titulo={`Cuota de ${nombreMes(cuota.periodo)}`} className="mb-4">
      <Row className="g-3 align-items-center">
        <Col md>
          <div className="font-credencial fw-bold text-secondary lh-1" style={{ fontSize: '2.6rem' }}>
            {formatearPesos(cuota.monto)}
          </div>
          {cuota.recargo > 0 ? (
            <p className="small text-danger mb-0">
              Cuota {formatearPesos(cuota.base)} + {formatearPesos(cuota.recargo)} de recargo por {cuota.diasDemora} {cuota.diasDemora === 1 ? 'día' : 'días'}{' '}
              de demora.
            </p>
          ) : (
            <p className="small text-body-secondary mb-0">Sin recargo si pagás hasta el {diaVencimiento} de este mes.</p>
          )}
        </Col>
        <Col md="auto">
          {enRevision ? (
            <Alert variant="info" className="small mb-0">
              Informaste el pago el {new Date(`${cuota.informe.fechaPago}T12:00:00`).toLocaleDateString('es-AR')}. El personal está revisando tu comprobante.
            </Alert>
          ) : (
            <Button variant="secondary" className="rounded-pill px-4" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
              Informar pago
            </Button>
          )}
        </Col>
      </Row>

      {cuota.informe?.estado === 'Rechazado' && !abierto && (
        <Alert variant="danger" className="small mt-3 mb-0">
          El comprobante que enviaste fue rechazado{cuota.informe.motivo ? `: ${cuota.informe.motivo}` : '.'} Podés informar el pago de nuevo.
        </Alert>
      )}

      <p className="small text-body-secondary border-top pt-3 mt-3 mb-0">
        La cuota vence el {diaVencimiento} de cada mes. Después se suma un recargo del {(interesDiario * 100).toLocaleString('es-AR')} % por día de demora.
      </p>

      <Collapse in={abierto && !enRevision}>
        <div>
          <Form noValidate onSubmit={enviar} className="bg-body-tertiary rounded-4 p-3 mt-3">
            <Row className="g-3">
              <Col md={4}>
                <Form.Group controlId="pago-fecha">
                  <Form.Label className="small fw-semibold">Fecha en que pagaste</Form.Label>
                  <Form.Control
                    type="date"
                    max={hoyISO()}
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                    isInvalid={validado && (!fechaPago || fechaPago > hoyISO())}
                  />
                  <Form.Control.Feedback type="invalid">Elegí una fecha que no sea futura.</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="pago-medio">
                  <Form.Label className="small fw-semibold">Cómo pagaste</Form.Label>
                  <Form.Select value={medio} onChange={(e) => setMedio(e.target.value)}>
                    {medios.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="pago-comprobante">
                  <Form.Label className="small fw-semibold">Comprobante</Form.Label>
                  <Form.Control type="file" accept="image/*,application/pdf" onChange={elegirArchivo} isInvalid={validado && !comprobante} />
                  <Form.Control.Feedback type="invalid">Adjuntá el comprobante. {textoLimite}.</Form.Control.Feedback>
                  {comprobante && (
                    <Form.Text>
                      {comprobante.nombre} ({tamanioLegible(comprobante.tamanio)})
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
            {lectura?.estado === 'leyendo' && (
              <div className="d-flex align-items-center gap-2 small mt-3" role="status">
                <Spinner animation="border" size="sm" variant="secondary" /> La IA está leyendo tu comprobante…
              </div>
            )}
            {lectura?.estado === 'error' && (
              <Alert variant="light" className="small mt-3 mb-0 border">
                No se pudo leer el comprobante automáticamente ({lectura.mensaje}). Completá los datos a mano: el personal lo revisa igual.
              </Alert>
            )}
            {lectura?.estado === 'lista' && (
              <div
                className={`rounded-4 p-3 mt-3 small border ${!lectura.esComprobante ? 'bg-warning-subtle border-warning' : coincide ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger'}`}
              >
                <div className="fw-bold mb-1">
                  {!lectura.esComprobante
                    ? 'El archivo no parece un comprobante de pago.'
                    : coincide
                      ? 'Leído por IA: el monto coincide con tu cuota.'
                      : 'Leído por IA: el monto no coincide con tu cuota.'}
                </div>
                {lectura.esComprobante && (
                  <div>
                    Monto {lectura.monto !== null ? formatearPesos(lectura.monto) : 'no legible'}
                    {lectura.fecha && ` · ${new Date(`${lectura.fecha}T12:00:00`).toLocaleDateString('es-AR')}`}
                    {lectura.numeroOperacion && ` · Operación ${lectura.numeroOperacion}`}
                    {lectura.origen && ` · ${lectura.origen}`}
                  </div>
                )}
                {lectura.esComprobante && !coincide && (
                  <div className="mt-1">
                    A la fecha del pago, tu cuota es de {formatearPesos(segunFecha.total)}. Podés enviarlo igual: el personal lo va a revisar.
                  </div>
                )}
                <div className="text-body-secondary mt-1">Completamos la fecha y el medio con lo que leímos. Revisalos antes de enviar.</div>
              </div>
            )}
            {error && (
              <Alert variant="warning" className="small mt-3 mb-0">
                {error}
              </Alert>
            )}
            <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
              <span className="small">
                Monto a esa fecha: <strong>{formatearPesos(segunFecha.total)}</strong>
                {segunFecha.recargo > 0 && ` (incluye ${formatearPesos(segunFecha.recargo)} de recargo)`}
              </span>
              <Button type="submit" variant="secondary" className="rounded-pill px-4 ms-auto" disabled={lectura?.estado === 'leyendo' || enviando}>
                {enviando ? 'Enviando…' : 'Enviar comprobante'}
              </Button>
            </div>
          </Form>
        </div>
      </Collapse>
    </Tarjeta>
  )
}

export default InformarPago
