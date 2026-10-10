'use client'

import { Alert, Button, Spinner } from 'react-bootstrap'

function EstadoConsulta({ cargando, error, vacio, onReintentar, textoVacio = 'Todavía no hay datos.' }) {
  if (cargando) {
    return (
      <div className="d-flex align-items-center justify-content-center gap-2 text-body-secondary py-4" role="status">
        <Spinner animation="border" size="sm" variant="secondary" /> Cargando…
      </div>
    )
  }
  if (error) {
    return (
      <Alert variant="warning" className="d-flex flex-wrap align-items-center gap-2 small mb-0">
        {error}
        {onReintentar && (
          <Button size="sm" variant="outline-secondary" className="rounded-pill ms-auto" onClick={onReintentar}>
            Reintentar
          </Button>
        )}
      </Alert>
    )
  }
  if (vacio) return <p className="text-center text-body-secondary py-4 mb-0">{textoVacio}</p>
  return null
}

export default EstadoConsulta
