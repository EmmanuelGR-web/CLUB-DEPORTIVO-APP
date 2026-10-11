'use client'

import { useState } from 'react'

// El bordó del ícono va fijo: en el modo oscuro .text-secondary se aclara
// y se perdería sobre el círculo blanco.
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
        encima ? 'bg-warning text-dark shadow' : 'bg-white'
      }`}
      style={{ transition: 'transform 200ms ease', transform: encima ? 'translateY(-3px)' : 'none', color: encima ? undefined : 'var(--club-bordo)' }}
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
