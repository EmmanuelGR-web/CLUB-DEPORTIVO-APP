'use client'

import { useState } from 'react'
import { Button } from 'react-bootstrap'
import Link from 'next/link'
import { FaClock, FaUsers } from 'react-icons/fa'

function TarjetaDisciplina({ disciplina }) {
  const [sinFoto, setSinFoto] = useState(!disciplina.imagen)
  const Icono = disciplina.icono

  return (
    <article className="h-100 d-flex flex-column bg-body border rounded-4 shadow overflow-hidden">
      <div className="bg-dark flex-shrink-0" style={{ height: '45%' }}>
        {sinFoto ? (
          <div className="h-100 d-flex align-items-center justify-content-center text-warning display-1">
            <Icono aria-hidden="true" />
          </div>
        ) : (
          <img
            src={disciplina.imagen}
            alt={`Entrenamiento de ${disciplina.nombre.toLowerCase()} en el club`}
            loading="lazy"
            draggable="false"
            onError={() => setSinFoto(true)}
            className="w-100 h-100 object-fit-cover"
          />
        )}
      </div>

      <div className="flex-grow-1 d-flex flex-column p-3">
        <h3 className="h4 fw-bolder text-uppercase fst-italic mb-1">{disciplina.nombre}</h3>
        <p className="small mb-2">{disciplina.descripcion}</p>
        <p className="small text-body-secondary d-flex align-items-start gap-2 mb-1">
          <FaUsers className="mt-1 flex-shrink-0" aria-hidden="true" /> {disciplina.categorias}
        </p>
        <p className="small text-body-secondary d-flex align-items-start gap-2 mb-2">
          <FaClock className="mt-1 flex-shrink-0" aria-hidden="true" /> {disciplina.dias}
        </p>
        <Button as={Link} href="/registro" variant="outline-primary" size="sm" className="mt-auto rounded-pill fw-bold">
          Quiero anotarme
        </Button>
      </div>
    </article>
  )
}

export default TarjetaDisciplina
