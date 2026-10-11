'use client'

// Recuerda si en esta visita ya se pasó de una pantalla a otra dentro del
// sitio. Así un botón "Volver" sabe si puede usar el historial (vuelve a
// la pantalla anterior) o si se entró directo con el link (y va al
// inicio, en lugar de sacar al usuario del sitio).

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

let navegoDentro = false

export const huboNavegacionInterna = () => navegoDentro

export function useRegistrarNavegacion() {
  const ruta = usePathname()
  const primera = useRef(true)

  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    navegoDentro = true
  }, [ruta])
}
