'use client'

import { useState } from 'react'
import { Row, Col, Badge, Modal } from 'react-bootstrap'
import { FaGift } from 'react-icons/fa'

const degradado = 'linear-gradient(145deg, #d7263d 0%, #7a0f2e 55%, #2a0710 100%)'

// Todos los beneficios del socio en tarjetas; al tocar una se abren
// las condiciones, como en la cinta del resumen.
function BeneficiosSocio({ beneficios, socio }) {
  const [abierto, setAbierto] = useState(null)

  if (beneficios.length === 0) {
    return <div className="bg-body rounded-4 shadow-sm p-5 text-center text-body-secondary">Todavía no hay beneficios cargados.</div>
  }

  return (
    <>
      <div className="rounded-4 shadow-sm p-4 mb-4 text-white d-flex flex-wrap align-items-center gap-3" style={{ backgroundImage: degradado }}>
        <FaGift className="display-6 text-warning flex-shrink-0" aria-hidden="true" />
        <div className="flex-grow-1">
          <div className="font-credencial fw-bold fs-4 lh-1 text-uppercase">Beneficios para socios</div>
          <div className="small opacity-75 mt-1">
            Mostrá tu carnet digital {socio?.categoria ? `de socio ${socio.categoria}` : ''} para usarlos.
            {socio?.estado === 'En validación' && ' Vas a poder usarlos cuando tu alta quede validada.'}
          </div>
        </div>
      </div>

      <Row className="g-3">
        {beneficios.map((b) => (
          <Col key={b.id} xs={12} sm={6} xl={4}>
            <button
              type="button"
              onClick={() => setAbierto(b)}
              className="beneficio-tarjeta w-100 h-100 d-flex flex-column justify-content-end text-white text-start rounded-4 border-0 shadow-sm p-4"
              style={{ minHeight: 170, backgroundImage: degradado }}
            >
              <h3 className="font-credencial h4 fw-bold text-uppercase lh-1 mb-2">{b.titulo}</h3>
              <p className="fw-semibold text-warning mb-1">{b.detalle}</p>
              {b.extra && <p className="small opacity-75 mb-0">{b.extra}</p>}
              <span className="small fw-semibold mt-3 pt-2 border-top border-light border-opacity-25">Ver condiciones</span>
            </button>
          </Col>
        ))}
      </Row>

      <Modal show={Boolean(abierto)} onHide={() => setAbierto(null)} centered contentClassName="border-0 rounded-4 overflow-hidden bg-transparent">
        {abierto && (
          <div className="position-relative text-white p-4 p-md-5" style={{ backgroundImage: degradado, minHeight: 340 }}>
            <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3" aria-label="Cerrar" onClick={() => setAbierto(null)} />
            <Badge bg="light" text="dark" pill className="d-block mb-3" style={{ width: 'fit-content' }}>
              Beneficio exclusivo para socios
            </Badge>
            <h2 className="display-6 fw-bolder fst-italic text-uppercase mb-1">{abierto.titulo}</h2>
            <p className="fs-5 text-warning fw-semibold mb-3">{abierto.detalle}</p>
            <p className="mb-3" style={{ maxWidth: 420 }}>
              {abierto.descripcion}
            </p>
            <p className="small fw-semibold border-top border-light border-opacity-25 pt-3 mb-0">
              {abierto.extra ? `${abierto.extra} · ` : ''}Presentá tu carnet digital.
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}

export default BeneficiosSocio
