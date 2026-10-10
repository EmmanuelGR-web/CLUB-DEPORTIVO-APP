'use client'

import { useState } from 'react'
import { Row, Col, Badge, Modal } from 'react-bootstrap'
import { FaRegNewspaper } from 'react-icons/fa'
import { coloresCategoria } from '../../datos/noticias'
import { formatearFechaConAnio } from '../../utilidades/fechas'

const fecha = (dia) => formatearFechaConAnio(String(dia).slice(0, 10))

function Categoria({ categoria }) {
  const color = coloresCategoria[categoria]
  return (
    <Badge bg={color?.bg ?? 'secondary'} text={color?.text} className={color?.borde ? 'border' : ''}>
      {categoria}
    </Badge>
  )
}

function Portada({ noticia }) {
  if (noticia.imagen) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={noticia.imagen} alt="" className="portada w-100 rounded-top-4" loading="lazy" />
  }
  return (
    <div className="portada w-100 rounded-top-4 d-flex align-items-center justify-content-center text-white fondo-noticia" style={{ backgroundImage: 'linear-gradient(145deg, #d7263d 0%, #7a0f2e 60%, #2a0710 100%)', aspectRatio: '16 / 9' }}>
      <FaRegNewspaper className="display-4 opacity-50" aria-hidden="true" />
    </div>
  )
}

// Noticias que publica el club, de la más nueva a la más vieja.
function NoticiasSocio({ noticias }) {
  const [abierta, setAbierta] = useState(null)
  const [categoria, setCategoria] = useState('')
  const categorias = [...new Set(noticias.map((n) => n.categoria))]
  const visibles = noticias.filter((n) => !categoria || n.categoria === categoria)
  const [destacada, ...resto] = visibles

  if (noticias.length === 0) {
    return <div className="bg-body rounded-4 shadow-sm p-5 text-center text-body-secondary">El club todavía no publicó noticias.</div>
  }

  return (
    <>
      {categorias.length > 1 && (
        <div className="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Filtrar por categoría">
          {['', ...categorias].map((c) => (
            <button
              key={c || 'todas'}
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${categoria === c ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setCategoria(c)}
              aria-pressed={categoria === c}
            >
              {c || 'Todas'}
            </button>
          ))}
        </div>
      )}

      {destacada && (
        <button type="button" onClick={() => setAbierta(destacada)} className="tarjeta-noticia w-100 text-start border-0 p-0 bg-body rounded-4 shadow-sm mb-4 overflow-hidden">
          <Row className="g-0 align-items-stretch">
            <Col md={6}>
              <Portada noticia={destacada} />
            </Col>
            <Col md={6} className="p-4 d-flex flex-column">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Categoria categoria={destacada.categoria} />
                <small className="text-body-secondary">{fecha(destacada.fecha)}</small>
              </div>
              <h2 className="h4 fw-bold text-secondary">{destacada.titulo}</h2>
              <p className="text-body-secondary mb-3">{destacada.resumen}</p>
              <span className="small fw-semibold text-primary mt-auto">Leer la noticia →</span>
            </Col>
          </Row>
        </button>
      )}

      <Row className="g-3">
        {resto.map((n) => (
          <Col key={n.id} sm={6} xl={4}>
            <button type="button" onClick={() => setAbierta(n)} className="tarjeta-noticia w-100 h-100 text-start border-0 p-0 bg-body rounded-4 shadow-sm overflow-hidden d-flex flex-column">
              <Portada noticia={n} />
              <div className="p-3 d-flex flex-column flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Categoria categoria={n.categoria} />
                  <small className="text-body-secondary">{fecha(n.fecha)}</small>
                </div>
                <h3 className="h6 fw-bold mb-1">{n.titulo}</h3>
                <p className="small text-body-secondary mb-0">{n.resumen}</p>
              </div>
            </button>
          </Col>
        ))}
      </Row>
      {visibles.length === 0 && <p className="text-center text-body-secondary py-4">No hay noticias de esta categoría.</p>}

      <Modal show={Boolean(abierta)} onHide={() => setAbierta(null)} centered size="lg" fullscreen="sm-down" scrollable contentClassName="border-0 rounded-4 overflow-hidden">
        {abierta && (
          <>
            <Modal.Header closeButton className="border-0 pb-0">
              <div className="d-flex align-items-center gap-2">
                <Categoria categoria={abierta.categoria} />
                <small className="text-body-secondary">{fecha(abierta.fecha)}</small>
              </div>
            </Modal.Header>
            <Modal.Body className="pt-2">
              <h2 className="h3 fw-bold text-secondary">{abierta.titulo}</h2>
              <p className="lead fs-6 text-body-secondary">{abierta.resumen}</p>
              {abierta.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={abierta.imagen} alt="" className="w-100 rounded-4 mb-3" style={{ maxHeight: 360, objectFit: 'cover' }} />
              )}
              {abierta.cuerpo.map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}
            </Modal.Body>
          </>
        )}
      </Modal>
    </>
  )
}

export default NoticiasSocio
