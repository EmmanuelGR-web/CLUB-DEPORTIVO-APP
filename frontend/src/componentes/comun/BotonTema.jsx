'use client'

import { Button } from 'react-bootstrap'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useTema } from '../../contextos/TemaContexto'

function BotonTema({ variante = 'outline-secondary', className = '' }) {
  const { tema, alternarTema } = useTema()
  const oscuro = tema === 'oscuro'

  return (
    <Button
      variant={variante}
      size="sm"
      className={`rounded-pill d-inline-flex align-items-center gap-2 px-3 ${className}`}
      onClick={alternarTema}
      aria-label={oscuro ? 'Pasar a modo claro' : 'Pasar a modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
    >
      {oscuro ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
      <span className="d-none d-sm-inline">{oscuro ? 'Claro' : 'Oscuro'}</span>
    </Button>
  )
}

export default BotonTema
