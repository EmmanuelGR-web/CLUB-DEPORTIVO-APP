'use client'

import Adjunto from './Adjunto'

const fechaHora = (iso) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function MensajeHilo({ mensaje, propio, nombreOtro }) {
  return (
    <div className={`d-flex ${propio ? 'justify-content-end' : ''}`}>
      <div className={`rounded-4 p-3 mb-3 ${propio ? 'bg-primary-subtle' : 'bg-body-tertiary'}`} style={{ maxWidth: '85%' }}>
        <div className="small text-body-secondary text-break mb-1">
          <strong className="text-body">{propio ? 'Vos' : nombreOtro}</strong> · {mensaje.de} → {mensaje.para}
        </div>
        <p className="mb-2 text-break" style={{ whiteSpace: 'pre-line' }}>
          {mensaje.texto}
        </p>
        {mensaje.adjuntos.map((a) => (
          <Adjunto key={a.id} archivo={a} />
        ))}
        <div className="small text-body-secondary text-end">{fechaHora(mensaje.fecha)}</div>
      </div>
    </div>
  )
}

export default MensajeHilo
