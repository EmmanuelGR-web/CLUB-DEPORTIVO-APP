'use client'

import { useEffect, useState } from 'react'
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'
import { abrirArchivo } from '../../servicios/cuentaApi'
import EstadoBadge from '../comun/EstadoBadge'
import { formatearPesos } from '../../utilidades/carnet'
import { formatearFechaConAnio } from '../../utilidades/fechas'

const fechaHora = (iso) => new Date(iso).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })
const fecha = (dia) => (dia ? new Date(`${dia}T12:00:00`).toLocaleDateString('es-AR') : 'no legible')
const nombresCampo = { nombre: 'Nombre', apellido: 'Apellido', dni: 'DNI', fechaNacimiento: 'Fecha de nacimiento', direccion: 'Domicilio' }

function LecturaDni({ lectura }) {
  const vencido = lectura.vencimiento && lectura.vencimiento < new Date(lectura.fecha).toISOString().slice(0, 10)
  return (
    <div className="bg-body-tertiary rounded-4 p-3 mb-3 small">
      <div className="fw-bold text-uppercase text-secondary mb-2">DNI leído por IA</div>
      {Object.entries(lectura.leidos).map(([campo, valor]) => (
        <div key={campo} className="mb-1">
          <strong>{nombresCampo[campo]}:</strong> {campo === 'fechaNacimiento' ? formatearFechaConAnio(valor) : valor}
          {lectura.corregidos?.includes(campo) && <span className="badge rounded-pill bg-warning text-dark ms-2">El socio lo corrigió</span>}
        </div>
      ))}
      {lectura.vencimiento && (
        <div className={vencido ? 'text-danger fw-semibold' : ''}>
          Vencimiento del DNI: {formatearFechaConAnio(lectura.vencimiento)}
          {vencido && ' (vencido)'}
        </div>
      )}
      {lectura.observaciones && <div className="text-body-secondary mt-1">Observaciones de la IA: {lectura.observaciones}</div>}
      <div className="mt-2">
        {lectura.corregidos?.length ? 'Compará los datos corregidos con las fotos del DNI antes de autorizar.' : 'El socio no corrigió ningún dato leído.'}
      </div>
    </div>
  )
}

function VerificacionComprobante({ verificacion: v, repetida }) {
  if (!v.leido) {
    return (
      <Alert variant="light" className="small border">
        No se pudo leer con IA{v.motivo ? `: ${v.motivo}` : '.'} Revisalo a mano.
      </Alert>
    )
  }
  const bien = v.esComprobante && v.coincideMonto && !repetida
  return (
    <Alert variant={repetida ? 'danger' : bien ? 'success' : 'warning'} className="small">
      <div className="fw-bold mb-1">
        {repetida
          ? 'Atención: este número de operación ya figura en otro comprobante.'
          : !v.esComprobante
            ? 'La IA no reconoce el archivo como un comprobante de pago.'
            : v.coincideMonto
              ? 'Verificado por IA: el monto coincide con la cuota.'
              : 'Verificado por IA: el monto no coincide con la cuota.'}
      </div>
      {v.esComprobante && (
        <>
          <div>
            Monto leído {v.monto !== null ? formatearPesos(v.monto) : 'no legible'} · esperado {formatearPesos(v.montoEsperado)}
          </div>
          <div>
            Fecha leída {fecha(v.fecha)}
            {!v.coincideFecha && ' · no coincide con la fecha que informó el socio'}
          </div>
          {v.numeroOperacion && <div>Operación N° {v.numeroOperacion}</div>}
          {v.origen && <div>Origen: {v.origen}</div>}
          {v.destino && <div>Destino: {v.destino}</div>}
        </>
      )}
      {v.observaciones && <div className="mt-1">Observaciones de la IA: {v.observaciones}</div>}
    </Alert>
  )
}

function DetalleSolicitud({ solicitud, mostrar, onCerrar, onResolver }) {
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [validado, setValidado] = useState(false)
  const [ampliado, setAmpliado] = useState(false)
  const [archivo, setArchivo] = useState(null)
  const [resolviendo, setResolviendo] = useState(false)

  // El comprobante se trae del servidor recién cuando se abre la solicitud.
  const idComprobante = mostrar ? solicitud?.comprobante?.id : null
  useEffect(() => {
    setArchivo(null)
    if (!idComprobante) return
    let vigente = true
    abrirArchivo(idComprobante)
      .then((datos) => vigente && setArchivo(datos))
      .catch(() => vigente && setArchivo({ error: true }))
    return () => {
      vigente = false
    }
  }, [idComprobante])

  const resolver = async (estado, texto) => {
    setResolviendo(true)
    try {
      await onResolver(solicitud, estado, texto)
      setRechazando(false)
    } finally {
      setResolviendo(false)
    }
  }

  const reiniciar = () => {
    setRechazando(false)
    setMotivo('')
    setValidado(false)
    setAmpliado(false)
  }

  const rechazar = () => {
    setValidado(true)
    if (motivo.trim().length < 5) return
    resolver('Rechazado', motivo.trim())
  }

  return (
    <Modal show={mostrar} onHide={onCerrar} onExited={reiniciar} centered size={ampliado ? 'xl' : 'lg'}>
      {solicitud && (
        <>
          <Modal.Header closeButton closeVariant="white" className="bg-secondary text-white">
            <Modal.Title className="h5 fw-bold">
              <span className="d-block small text-white-50 text-uppercase">{solicitud.tipo}</span>
              {solicitud.socioNombre}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-wrap gap-4 mb-3">
              {solicitud.foto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={solicitud.foto}
                  alt={`Foto de ${solicitud.socioNombre}`}
                  width={110}
                  height={110}
                  className="rounded-4 object-fit-cover border border-3 border-secondary"
                />
              )}
              <dl className="mb-0 flex-grow-1">
                {solicitud.socioDni && (
                  <>
                    <dt className="small text-uppercase text-body-secondary">DNI</dt>
                    <dd>{solicitud.socioDni}</dd>
                  </>
                )}
                <dt className="small text-uppercase text-body-secondary">Recibida</dt>
                <dd>{fechaHora(solicitud.fecha)}</dd>
                <dt className="small text-uppercase text-body-secondary">Estado</dt>
                <dd className="mb-0">
                  <EstadoBadge estado={solicitud.estado} />
                </dd>
              </dl>
            </div>

            <p>{solicitud.detalle}</p>

            {solicitud.lecturaIA && <LecturaDni lectura={solicitud.lecturaIA} />}
            {solicitud.verificacionIA && <VerificacionComprobante verificacion={solicitud.verificacionIA} repetida={solicitud.operacionRepetida} />}

            {solicitud.tipo === 'Comprobante de pago' && (
              <div className="bg-body-tertiary rounded-4 p-3 mb-3">
                <div className="small fw-bold text-uppercase text-secondary mb-2">Comprobante enviado</div>
                {!solicitud.comprobante && <p className="small text-body-secondary mb-0">Pago informado sin archivo adjunto.</p>}
                {solicitud.comprobante && !archivo && (
                  <div className="d-flex align-items-center gap-2 small text-body-secondary py-3" role="status">
                    <Spinner size="sm" /> Cargando el comprobante…
                  </div>
                )}
                {archivo?.error && <p className="small text-danger mb-0">No pudimos traer el archivo del servidor.</p>}
                {archivo?.dataUrl && archivo.tipo.startsWith('image/') && (
                  <button
                    type="button"
                    className="d-block w-100 p-0 border-0 bg-transparent mb-2"
                    onClick={() => setAmpliado(!ampliado)}
                    aria-label={ampliado ? 'Achicar comprobante' : 'Ver comprobante en tamaño completo'}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={archivo.dataUrl}
                      alt="Comprobante de pago"
                      className={`rounded-3 border ${ampliado ? 'w-100' : 'img-fluid'}`}
                      style={{ maxHeight: ampliado ? 'none' : 420, cursor: ampliado ? 'zoom-out' : 'zoom-in' }}
                    />
                  </button>
                )}
                {archivo?.dataUrl && archivo.tipo === 'application/pdf' && (
                  <object data={archivo.dataUrl} type="application/pdf" className="w-100 rounded-3 border mb-2" style={{ height: 420 }} aria-label="Comprobante en PDF">
                    <p className="small mb-0">Tu navegador no muestra PDF acá: descargalo para verlo.</p>
                  </object>
                )}
                {archivo?.dataUrl && (
                  <a href={archivo.dataUrl} download={archivo.nombre} className="d-inline-block small link-secondary">
                    Descargar {archivo.nombre}
                  </a>
                )}
              </div>
            )}

            {solicitud.cambios.length > 0 && (
              <div className="bg-body-tertiary rounded-4 p-3 mb-3">
                <div className="small fw-bold text-uppercase text-secondary mb-2">Cambios pedidos</div>
                {solicitud.cambios.map((c) => (
                  <div key={c.campo} className="small mb-1">
                    <strong>{c.campo}:</strong> <del className="text-body-secondary">{c.anterior}</del> → {c.nuevo}
                  </div>
                ))}
              </div>
            )}

            {solicitud.revision && (
              <Alert variant={solicitud.estado === 'Autorizado' ? 'success' : 'danger'} className="small mb-0">
                {solicitud.estado} por <strong>{solicitud.revision.revisadoPor}</strong> el {fechaHora(solicitud.revision.fecha)}.
                {solicitud.revision.motivo && ` Motivo: ${solicitud.revision.motivo}`}
              </Alert>
            )}

            {rechazando && (
              <Form.Group controlId="motivo-rechazo">
                <Form.Label className="fw-semibold">Motivo del rechazo</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  isInvalid={validado && motivo.trim().length < 5}
                  placeholder="Se lo vamos a enviar al socio por su bandeja de entrada."
                />
                <Form.Control.Feedback type="invalid">Contá brevemente por qué se rechaza.</Form.Control.Feedback>
              </Form.Group>
            )}
          </Modal.Body>

          {solicitud.estado === 'Pendiente' && (
            <Modal.Footer>
              {rechazando ? (
                <>
                  <Button variant="link" className="link-secondary" onClick={() => setRechazando(false)}>
                    Volver
                  </Button>
                  <Button variant="primary" className="rounded-pill px-4" onClick={rechazar} disabled={resolviendo}>
                    Confirmar rechazo
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setRechazando(true)}>
                    Rechazar
                  </Button>
                  <Button variant="secondary" className="rounded-pill px-4" onClick={() => resolver('Autorizado')} disabled={resolviendo}>
                    Autorizar
                  </Button>
                </>
              )}
            </Modal.Footer>
          )}
        </>
      )}
    </Modal>
  )
}

export default DetalleSolicitud
