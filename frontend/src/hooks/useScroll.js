'use client'

import { useEffect, useState } from 'react'

export function useScroll() {
  const [scroll, setScroll] = useState({ y: 0, porcentaje: 0 })

  useEffect(() => {
    const actualizar = () => {
      const recorrido = document.documentElement.scrollHeight - window.innerHeight
      setScroll({ y: window.scrollY, porcentaje: recorrido > 0 ? (window.scrollY / recorrido) * 100 : 0 })
    }
    actualizar()
    window.addEventListener('scroll', actualizar, { passive: true })
    window.addEventListener('resize', actualizar)
    return () => {
      window.removeEventListener('scroll', actualizar)
      window.removeEventListener('resize', actualizar)
    }
  }, [])

  return scroll
}
