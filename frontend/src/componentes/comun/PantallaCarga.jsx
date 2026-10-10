'use client'

import { Alert, Button, Spinner } from 'react-bootstrap'

function PantallaCarga({ error, onReintentar }) {
  return (
    <div className="min-vh-100 bg-body-tertiary d-flex align-items-center justify-content-center p-3">
      {error ? (
        <Alert variant="warning" className="text-center" style={{ maxWidth: 420 }}>
          <p className="fw-semibold mb-2">No pudimos traer los datos del club.</p>
          <p className="small mb-3">{error}</p>
          <Button variant="secondary" className="rounded-pill px-4" onClick={onReintentar}>
            Reintentar
          </Button>
        </Alert>
      ) : (
        <div className="d-flex align-items-center gap-2 text-secondary" role="status">
          <Spinner animation="border" variant="secondary" /> Cargando datos del club…
        </div>
      )}
    </div>
  )
}

export default PantallaCarga
