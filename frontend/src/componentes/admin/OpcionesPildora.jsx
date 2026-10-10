'use client'

import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'

function OpcionesPildora({ nombre, valor, opciones, onCambiar }) {
  return (
    <ToggleButtonGroup type="radio" name={nombre} value={valor} onChange={onCambiar} className="d-flex flex-wrap gap-2">
      {opciones.map((o) => (
        <ToggleButton key={o} id={`${nombre}-${o}`} value={o} variant="outline-secondary" className="rounded-pill px-3 flex-grow-0">
          {o}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default OpcionesPildora
