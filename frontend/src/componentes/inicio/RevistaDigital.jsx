'use client'

import { useRef, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import HTMLFlipBook from 'react-pageflip'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import PaginaRevista from './PaginaRevista'

function RevistaDigital({ mostrar, onCerrar, paginas }) {
  const libro = useRef(null)
  const [paginaActual, setPaginaActual] = useState(0)

  const anterior = () => libro.current?.pageFlip().flipPrev()
  const siguiente = () => libro.current?.pageFlip().flipNext()

  return (
    <Modal show={mostrar} onHide={onCerrar} fullscreen contentClassName="bg-dark text-white" onExited={() => setPaginaActual(0)}>
      <Modal.Header closeButton closeVariant="white" className="border-0 py-2">
        <Modal.Title className="h6 text-uppercase fw-bold">Revista digital · Reseña histórica</Modal.Title>
      </Modal.Header>

      <Modal.Body className="d-flex flex-column align-items-center justify-content-center gap-3 py-2">
        <div className="w-100" style={{ maxWidth: 'calc((100dvh - 170px) * 1.41)' }}>
          <HTMLFlipBook
            ref={libro}
            width={420}
            height={594}
            size="stretch"
            minWidth={240}
            maxWidth={600}
            minHeight={340}
            maxHeight={850}
            showCover
            usePortrait
            drawShadow
            maxShadowOpacity={0.5}
            flippingTime={800}
            mobileScrollSupport={false}
            clickEventForward
            disableFlipByClick
            onFlip={(e) => setPaginaActual(e.data)}
            className="mx-auto"
          >
            {paginas.map((pagina, indice) => (
              <PaginaRevista key={indice} pagina={pagina} numero={indice + 1} onAsociarse={onCerrar} />
            ))}
          </HTMLFlipBook>
        </div>

        <div className="d-flex align-items-center gap-3">
          <Button variant="outline-light" className="rounded-pill" onClick={anterior} disabled={paginaActual === 0} aria-label="Página anterior">
            <FaChevronLeft />
          </Button>
          <span className="small text-white-50">
            Página {paginaActual + 1} de {paginas.length}
          </span>
          <Button
            variant="primary"
            className="rounded-pill"
            onClick={siguiente}
            disabled={paginaActual >= paginas.length - 1}
            aria-label="Página siguiente"
          >
            <FaChevronRight />
          </Button>
        </div>
        <p className="small text-white-50 mb-0">Deslizá la hoja con el dedo o el mouse, o usá las flechas.</p>
      </Modal.Body>
    </Modal>
  )
}

export default RevistaDigital
