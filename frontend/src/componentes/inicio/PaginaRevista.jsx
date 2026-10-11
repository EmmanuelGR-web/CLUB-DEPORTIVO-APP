'use client'

import { forwardRef } from 'react'
import { Button, Image } from 'react-bootstrap'
import Link from 'next/link'

const letra = {
  base: { fontSize: '3.2cqw' },
  titulo: { fontSize: '2.1em' },
  tituloTapa: { fontSize: '3.4em' },
  dato: { fontSize: '2.4em' },
  chica: { fontSize: '0.72em' },
}

function Encabezado({ numero }) {
  return (
    <div className="d-flex justify-content-between bg-dark text-white text-uppercase fw-bold px-3 py-1" style={letra.chica}>
      <span>Revista del Club</span>
      <span>{numero}</span>
    </div>
  )
}

function Volanta({ children }) {
  return (
    <span className="d-inline-block bg-primary text-white text-uppercase fw-bold fst-italic px-2 mb-1" style={letra.chica}>
      {children}
    </span>
  )
}

function Tapa({ edicion, titulo, bajada, imagen }) {
  return (
    <div className="position-relative h-100 bg-dark text-white">
      <img src={imagen} alt="" loading="lazy" className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
      <div className="position-relative bg-primary px-3 py-2 shadow">
        <div className="fw-bolder fst-italic text-uppercase lh-1" style={letra.titulo}>
          Revista del Club
        </div>
        <div className="text-uppercase fw-semibold" style={letra.chica}>
          {edicion}
        </div>
      </div>
      <Image src="/logo.png" alt="" width="30%" className="position-absolute top-0 end-0 mt-5 me-2 object-fit-cover" style={{ aspectRatio: 1 }} />
      <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-75 px-3 py-3">
        <div className="fw-bolder fst-italic text-uppercase lh-1 mb-2" style={letra.tituloTapa}>
          {titulo}
        </div>
        <div className="fw-semibold border-start border-warning border-4 ps-2">{bajada}</div>
      </div>
    </div>
  )
}

function Indice({ numero, volanta, titulo, texto, sumario }) {
  return (
    <div className="h-100 d-flex flex-column">
      <Encabezado numero={numero} />
      <div className="flex-grow-1 d-flex flex-column px-3 pt-3 pb-2">
        <Volanta>{volanta}</Volanta>
        <div className="fw-bolder fst-italic text-uppercase lh-1 mb-2" style={letra.titulo}>
          {titulo}
        </div>
        {texto.map((parrafo) => (
          <p key={parrafo} className="lh-sm mb-2">
            {parrafo}
          </p>
        ))}
        <div className="text-uppercase fw-bold text-primary border-bottom border-primary border-3 mt-2 mb-2">En esta edición</div>
        <ul className="list-unstyled mb-0">
          {sumario.map(({ pagina, titulo: tituloNota }) => (
            <li key={pagina} className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-dark">{pagina}</span>
              <span className="fw-semibold lh-sm">{tituloNota}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Articulo({ numero, volanta, titulo, bajada, imagen, epigrafe, texto, dato }) {
  return (
    <div className="h-100 d-flex flex-column">
      <Encabezado numero={numero} />
      <div className="flex-grow-1 d-flex flex-column px-3 pt-2 pb-2 overflow-hidden">
        <div>
          <Volanta>{volanta}</Volanta>
        </div>
        <div className="fw-bolder fst-italic text-uppercase lh-1 mb-1" style={letra.titulo}>
          {titulo}
        </div>
        <p className="fw-semibold lh-sm mb-2">{bajada}</p>
        <figure className="mb-2">
          <img src={imagen} alt={epigrafe} loading="lazy" className="w-100 object-fit-cover shadow-sm" style={{ aspectRatio: '3 / 2' }} />
          <figcaption className="fst-italic text-body-secondary mt-1" style={letra.chica}>
            {epigrafe}
          </figcaption>
        </figure>
        {texto.map((parrafo) => (
          <p key={parrafo} className="lh-sm mb-1" style={{ fontSize: '0.9em' }}>
            {parrafo}
          </p>
        ))}
        <div className="mt-auto d-flex align-items-center gap-2 border-top border-primary border-3 pt-1">
          <span className="fw-bolder fst-italic text-primary lh-1" style={letra.dato}>
            {dato.numero}
          </span>
          <span className="text-uppercase fw-semibold lh-sm" style={letra.chica}>
            {dato.texto}
          </span>
        </div>
      </div>
    </div>
  )
}

function Contratapa({ titulo, texto, onAsociarse }) {
  return (
    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center bg-primary text-white p-4">
      <Image src="/logo.png" alt="Escudo del club" width="70%" className="object-fit-cover mb-3" style={{ aspectRatio: 1 }} />
      <div className="fw-bolder fst-italic text-uppercase lh-1 mb-2" style={letra.titulo}>
        {titulo}
      </div>
      <p className="mb-3">{texto}</p>
      <Button as={Link} href="/registro" onClick={onAsociarse} variant="light" className="rounded-pill px-4 fw-bold text-uppercase text-primary">
        Asociate
      </Button>
    </div>
  )
}

const disenos = { tapa: Tapa, indice: Indice, articulo: Articulo, contratapa: Contratapa }

// El libro necesita llegar al elemento de cada hoja para darla vuelta.
const PaginaRevista = forwardRef(function PaginaRevista({ pagina, numero, onAsociarse, className = '' }, ref) {
  const Diseno = disenos[pagina.tipo]

  return (
    <div ref={ref} data-bs-theme="light" className={`bg-white overflow-hidden ${className}`}>
      <div className="w-100 h-100" style={{ containerType: 'inline-size' }}>
        <div className="h-100 text-dark" style={letra.base}>
          <Diseno {...pagina} numero={numero} onAsociarse={onAsociarse} />
        </div>
      </div>
    </div>
  )
})

export default PaginaRevista
