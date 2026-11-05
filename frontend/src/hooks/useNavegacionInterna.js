'use client'


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
