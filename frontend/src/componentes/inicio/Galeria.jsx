'use client'

import { Carousel } from 'react-bootstrap'

function Galeria({ fotos, intervalo = 4000 }) {
  return (
    <section id="galeria" className="h-100 d-flex flex-column bg-body rounded-4 shadow-sm p-4">
      <span className="text-uppercase fw-bold text-primary small">Momentos</span>
      <h2 className="fw-bolder text-uppercase fst-italic mb-4">Galería</h2>

      <Carousel
        interval={intervalo}
        fade
        pause="hover"
        touch
        indicators={false}
        className="rounded-4 overflow-hidden shadow my-auto"
        data-bs-theme="light"
      >
        {fotos.map((foto) => (
          <Carousel.Item key={foto.id}>
            <div className="ratio ratio-4x3">
              <img src={foto.imagen} alt={foto.titulo} loading="lazy" className="object-fit-cover" />
            </div>
            <Carousel.Caption className="bg-dark bg-opacity-75 rounded-3 px-3 py-2 start-0 end-0 mx-3 mb-2">
              <p className="fw-semibold mb-0">{foto.titulo}</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  )
}

export default Galeria
