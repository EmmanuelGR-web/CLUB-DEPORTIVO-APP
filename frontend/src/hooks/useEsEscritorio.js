'use client'

import { useEffect, useState } from 'react'

const consulta = '(min-width: 992px)'

export function useEsEscritorio() {
  const [esEscritorio, setEsEscritorio] = useState(() => (typeof window === 'undefined' ? true : window.matchMedia(consulta).matches))

  useEffect(() => {
    const medios = window.matchMedia(consulta)
    const actualizar = () => setEsEscritorio(medios.matches)
    actualizar()
    medios.addEventListener('change', actualizar)
    return () => medios.removeEventListener('change', actualizar)
  }, [])

  return esEscritorio
}
