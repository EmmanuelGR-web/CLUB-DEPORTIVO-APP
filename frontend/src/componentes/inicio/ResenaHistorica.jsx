'use client'

import { useState } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import { FaBookOpen } from 'react-icons/fa'
import dynamic from 'next/dynamic'
import PaginaRevista from './PaginaRevista'

// El libro animado usa el navegador para medir las hojas: se carga recién
// en el cliente.
const RevistaDigital = dynamic(() => import('./RevistaDigital'), { ssr: false })

function ResenaHistorica({ resumen, paginas }) {
  const [mostrarRevista, setMostrarRevista] = useState(false)
  const abrir = () => setMostrarRevista(true)

  return (
    <section id="resena" className="bg-body rounded-4 shadow-sm p-4">
      <Row className="align-items-center g-4">
        <Col sm={5} className="d-flex justify-content-center">
          <button
            type="button"
            onClick={abrir}
            aria-label="Abrir la revista digital"
            className="border-0 p-0 bg-transparent shadow-lg w-100"
            style={{ maxWidth: 220, aspectRatio: '420 / 594', transform: 'rotate(-3deg)' }}
          >
            <PaginaRevista pagina={paginas[0]} numero={1} className="w-100 h-100" />
          </button>
        </Col>

        <Col sm={7} className="text-center text-sm-start">
          <span className="text-uppercase fw-bold text-primary small">Reseña histórica</span>
          <h2 className="fw-bolder text-uppercase fst-italic mb-3">Más de 100 años de historia</h2>
          <p className="mb-4">{resumen}</p>
          <Button variant="dark" size="lg" className="rounded-pill px-4 d-inline-flex align-items-center gap-2" onClick={abrir}>
            <FaBookOpen />
            Leer la revista digital
          </Button>
        </Col>
      </Row>

      <RevistaDigital mostrar={mostrarRevista} onCerrar={() => setMostrarRevista(false)} paginas={paginas} />
    </section>
  )
}

export default ResenaHistorica
