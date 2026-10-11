'use client'

import { ProgressBar } from 'react-bootstrap'
import { useScroll } from '../../hooks/useScroll'

const clasesBase = 'position-fixed start-0 w-100 rounded-0 bg-transparent z-3'
const estilo = { height: 4, '--bs-progress-bar-bg': 'crimson' }

function BarraProgreso() {
  const { porcentaje } = useScroll()

  return (
    <>
      <ProgressBar
        now={porcentaje}
        aria-label="Progreso de lectura de la página"
        className={`${clasesBase} bottom-0 d-lg-none`}
        style={estilo}
      />
      <ProgressBar
        now={porcentaje}
        aria-hidden="true"
        className={`${clasesBase} top-0 d-none d-lg-flex`}
        style={estilo}
      />
    </>
  )
}

export default BarraProgreso
