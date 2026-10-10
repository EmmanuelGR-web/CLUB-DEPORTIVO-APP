'use client'

import { CloseButton } from 'react-bootstrap'
import { fondoBordo } from '../auth/estilosAuth'

const iniciales = (nombre) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '··'

function EncabezadoLegajo({ nombre, antetitulo, children, onCerrar }) {
  return (
    <header className="position-relative text-white px-4 px-md-5 pt-4 pb-4 border-bottom border-4 border-warning" style={fondoBordo}>
      <CloseButton variant="white" aria-label="Cerrar" onClick={onCerrar} className="position-absolute top-0 end-0 m-3" />
      <div className="d-flex align-items-center gap-3 gap-md-4">
        <div
          className="rounded-circle border border-2 border-warning bg-white bg-opacity-10 d-flex align-items-center justify-content-center font-credencial fw-bold fs-2 flex-shrink-0 shadow"
          style={{ width: 84, height: 84 }}
          aria-hidden="true"
        >
          {iniciales(nombre)}
        </div>
        <div>
          <div className="small text-uppercase text-warning font-credencial fw-semibold" style={{ letterSpacing: '0.12em' }}>
            {antetitulo}
          </div>
          <h2 className="font-credencial fw-bold fs-1 lh-1 my-1 text-break">{nombre || 'Nueva persona'}</h2>
          {children}
        </div>
      </div>
    </header>
  )
}

export default EncabezadoLegajo
