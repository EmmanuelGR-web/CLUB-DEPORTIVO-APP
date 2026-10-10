'use client'

import { useState } from 'react'
import CintaInfinita from './CintaInfinita'

function TarjetaSponsor({ nombre, url, icono: Icono, copia }) {
  const [encima, setEncima] = useState(false)

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={nombre}
      aria-hidden={copia}
      tabIndex={copia ? -1 : undefined}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      className={`d-inline-flex align-items-center gap-2 border rounded px-4 py-2 me-3 text-decoration-none text-nowrap fw-semibold ${
        encima ? 'border-warning text-warning bg-dark' : 'border-white text-white'
      }`}
    >
      <Icono className="fs-3" />
      <span className="small">{nombre}</span>
    </a>
  )
}

function Sponsors({ sponsors, segundosPorVuelta = 40 }) {
  return (
    <CintaInfinita
      items={sponsors}
      segundosPorVuelta={segundosPorVuelta}
      renderItem={(sponsor, copia) => <TarjetaSponsor key={`${sponsor.id}-${copia}`} {...sponsor} copia={copia} />}
    />
  )
}

export default Sponsors
