'use client'

import { Button } from 'react-bootstrap'
import Link from 'next/link'

function BannerVideo({ video, titulo, lema, textoBoton = 'Asociate', altura = '70vh' }) {
  return (
    <section
      id="inicio"
      className="position-relative overflow-hidden bg-dark"
      style={{ height: altura, minHeight: 360 }}
    >
      <video
        src={video}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="position-absolute start-0 w-100 object-fit-cover"
        
        style={{ height: '131%', top: '-15.5%' }}
      />

    
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" />

      <div className="position-relative h-100 d-flex flex-column align-items-center justify-content-center text-center text-white px-3">
        <h1 className="display-3 fw-bolder text-uppercase fst-italic mb-2">{titulo}</h1>
        <p className="lead fw-semibold mb-4">{lema}</p>
        <Button
          as={Link}
          href="/registro"
          variant="primary"
          size="lg"
          className="rounded-pill px-5 py-3 fw-bold text-uppercase shadow"
        >
          {textoBoton}
        </Button>
      </div>
    </section>
  )
}

export default BannerVideo
