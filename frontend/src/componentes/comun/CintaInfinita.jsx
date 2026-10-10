'use client'

import { useEffect, useRef } from 'react'

function CintaInfinita({ items, renderItem, segundosPorVuelta = 40, className = '' }) {
  const cinta = useRef(null)
  const animacion = useRef(null)

  useEffect(() => {
    animacion.current = cinta.current.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], {
      duration: segundosPorVuelta * 1000,
      iterations: Infinity,
    })
    return () => animacion.current.cancel()
  }, [segundosPorVuelta])

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => animacion.current?.pause()}
      onMouseLeave={() => animacion.current?.play()}
      onFocus={() => animacion.current?.pause()}
      onBlur={() => animacion.current?.play()}
    >
      <div ref={cinta} className="d-flex" style={{ width: 'max-content' }}>
        {[false, true].map((copia) => items.map((item) => renderItem(item, copia)))}
      </div>
    </div>
  )
}

export default CintaInfinita
