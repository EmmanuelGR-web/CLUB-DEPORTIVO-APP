'use client'

import { Button, Fade } from 'react-bootstrap'
import { FaArrowUp } from 'react-icons/fa'
import { useScroll } from '../../hooks/useScroll'

function BotonVolverArriba({ desde = 400 }) {
  const { y } = useScroll()

  return (
    <Fade in={y > desde} mountOnEnter unmountOnExit>
      <Button
        variant="warning"
        size="lg"
        aria-label="Volver arriba"
        className="position-fixed bottom-0 end-0 m-3 rounded-circle shadow z-3"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <FaArrowUp />
      </Button>
    </Fade>
  )
}

export default BotonVolverArriba
