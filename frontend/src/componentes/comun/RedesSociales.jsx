'use client'

import { useState } from 'react'

function BotonRed({ nombre, url, icono: Icono }) {
  const [encima, setEncima] = useState(false)

  return (
    <a
      href={url}
      aria-label={nombre}
      title={nombre}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      className={`d-inline-flex align-items-center justify-content-center rounded-circle p-2 fs-5 ${
        encima ? 'bg-warning text-dark shadow' : 'bg-white text-secondary'
      }`}
      style={{ transition: 'transform 200ms ease', transform: encima ? 'translateY(-3px)' : 'none' }}
    >
      <Icono />
    </a>
  )
}

function RedesSociales({ redes, titulo = 'Redes sociales' }) {
  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      <span className="text-uppercase small fw-semibold me-2">{titulo}</span>
      {redes.map((red) => (
        <BotonRed key={red.id} {...red} />
      ))}
    </div>
  )
}

export default RedesSociales
