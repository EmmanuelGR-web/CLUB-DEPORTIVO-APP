'use client'


import { useCallback, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export function useVista(inicio, validas) {
  const router = useRouter()
  const ruta = usePathname()
  const parametros = useSearchParams()
  const pedida = parametros.get('seccion')
  const seccion = validas.includes(pedida) ? pedida : inicio
  const ficha = parametros.get('ficha')
  const pasos = useRef(0)

  useEffect(() => {
    const alVolver = () => {
      pasos.current = Math.max(0, pasos.current - 1)
    }
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [])

  const direccion = useCallback(
    (destino, idFicha) => {
      const consulta = new URLSearchParams()
      if (destino !== inicio) consulta.set('seccion', destino)
      if (idFicha) consulta.set('ficha', idFicha)
      const texto = consulta.toString()
      return texto ? `${ruta}?${texto}` : ruta
    },
    [inicio, ruta],
  )

  const ir = useCallback(
    (destino, idFicha = null) => {
      if (destino === seccion && (idFicha ?? null) === ficha) return
      pasos.current += 1
      router.push(direccion(destino, idFicha))
    },
    [direccion, ficha, router, seccion],
  )

  const volver = useCallback(() => {
    if (pasos.current > 0) router.back()
    else router.replace(ficha ? direccion(seccion) : direccion(inicio))
  }, [direccion, ficha, inicio, router, seccion])

  return { seccion, ficha, ir, volver, puedeVolver: seccion !== inicio || Boolean(ficha) }
}
