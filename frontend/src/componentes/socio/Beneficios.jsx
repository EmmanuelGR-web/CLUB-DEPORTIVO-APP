'use client'

import { useState } from 'react'
import { Modal, Badge } from 'react-bootstrap'
import CintaInfinita from '../comun/CintaInfinita'

const degradado = 'linear-gradient(145deg, #d7263d 0%, #7a0f2e 55%, #2a0710 100%)'

function TarjetaBeneficio({ beneficio, copia, onAbrir }) {
  const [encima, setEncima] = useState(false)

  return (
    <button
      type="button"
      tabIndex={copia ? -1 : 0}
      aria-hidden={copia}
      aria-label={`Ver más sobre ${beneficio.titulo}`}
      onClick={() => onAbrir(beneficio)}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setEncima(true)}
      onBlur={() => setEncima(false)}
      className={`d-flex flex-column justify-content-end flex-shrink-0 overflow-hidden rounded-4 text-white text-start p-3 me-3 my-2 border ${
        encima ? 'border-warning shadow-lg' : 'border-light border-opacity-10 shadow-sm'
      }`}
      style={{
        width: 220,
        minHeight: 160,
        backgroundImage: degradado,
        transform: encima ? 'translateY(-6px)' : 'none',
        transition: 'transform 250ms ease, box-shadow 250ms ease',
      }}
    >
      <h3 className="font-credencial h4 fw-bold text-uppercase lh-1 mb-2">{beneficio.titulo}</h3>
      <p className={`fw-semibold mb-0 ${encima ? 'text-warning' : 'opacity-75'}`}>{beneficio.detalle}</p>
      <p
        className="small fw-semibold text-warning mb-0 mt-3 border-top border-light border-opacity-25 pt-2"
        style={{ opacity: encima ? 1 : 0, transform: encima ? 'none' : 'translateY(8px)', transition: 'opacity 250ms ease, transform 250ms ease' }}
      >
        Tocá para ver más
      </p>
    </button>
  )
}

function BeneficioAmpliado({ beneficio, mostrar, onCerrar }) {
  return (
    <Modal show={mostrar} onHide={onCerrar} centered contentClassName="border-0 rounded-4 overflow-hidden bg-transparent">
      {beneficio && (
        <div className="position-relative text-white p-4 p-md-5" style={{ backgroundImage: degradado, minHeight: 360 }}>
          <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3" aria-label="Cerrar" onClick={onCerrar} />

          <Badge bg="light" text="dark" pill className="d-block mb-3" style={{ width: 'fit-content' }}>
            Beneficio exclusivo para socios
          </Badge>
          <h2 className="position-relative display-6 fw-bolder fst-italic text-uppercase mb-1">{beneficio.titulo}</h2>
          <p className="position-relative fs-5 text-warning fw-semibold mb-3">{beneficio.detalle}</p>
          <p className="position-relative mb-3" style={{ maxWidth: 420 }}>
            {beneficio.descripcion}
          </p>
          <p className="position-relative small fw-semibold border-top border-light border-opacity-25 pt-3 mb-0">
            {beneficio.extra} · Presentá tu carnet digital.
          </p>
        </div>
      )}
    </Modal>
  )
}

function Beneficios({ beneficios }) {
  const [ampliado, setAmpliado] = useState(null)
  const [mostrar, setMostrar] = useState(false)
  const abrir = (beneficio) => {
    setAmpliado(beneficio)
    setMostrar(true)
  }

  return (
    <>
      <CintaInfinita
        items={beneficios}
        segundosPorVuelta={35}
        className="pt-2"
        renderItem={(beneficio, copia) => <TarjetaBeneficio key={`${beneficio.id}-${copia}`} beneficio={beneficio} copia={copia} onAbrir={abrir} />}
      />
      <BeneficioAmpliado beneficio={ampliado} mostrar={mostrar} onCerrar={() => setMostrar(false)} />
    </>
  )
}

export default Beneficios
