'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const cadaCuanto = 10000

// Consulta los datos al entrar, cada 10 segundos y cada vez que la
// pestaña vuelve a tener foco, así el panel se actualiza solo cuando
// otro usuario cambia algo.
export function useDatosEnVivo(leer) {
  const [datos, setDatos] = useState(null)
  const [actualizado, setActualizado] = useState(null)
  const [error, setError] = useState('')
  const enCurso = useRef(false)

  const consultar = useCallback(async () => {
    if (enCurso.current) return
    enCurso.current = true
    try {
      setDatos(await leer())
      setActualizado(new Date())
      setError('')
    } catch (problema) {
      setError(problema.message)
    } finally {
      enCurso.current = false
    }
  }, [leer])

  useEffect(() => {
    consultar()
    const intervalo = setInterval(() => {
      if (document.visibilityState === 'visible') consultar()
    }, cadaCuanto)
    window.addEventListener('focus', consultar)
    return () => {
      clearInterval(intervalo)
      window.removeEventListener('focus', consultar)
    }
  }, [consultar])

  return [datos, consultar, actualizado, error, setDatos]
}
