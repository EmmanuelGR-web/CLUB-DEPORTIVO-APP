'use client'

import { useCallback, useEffect, useState } from 'react'
import { alertaError } from '../utilidades/alertas'

export function useConsulta(consultar, tituloError = 'No pudimos cargar los datos') {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: '' })

  useEffect(() => {
    let vigente = true
    consultar()
      .then((datos) => vigente && setEstado({ datos, cargando: false, error: '' }))
      .catch((problema) => {
        if (!vigente) return
        setEstado({ datos: null, cargando: false, error: problema.message })
        alertaError(problema.message, tituloError)
      })
    return () => {
      vigente = false
    }
  }, [consultar, tituloError])

  const recargar = useCallback(async () => {
    setEstado((actual) => ({ ...actual, cargando: true, error: '' }))
    try {
      setEstado({ datos: await consultar(), cargando: false, error: '' })
    } catch (problema) {
      setEstado({ datos: null, cargando: false, error: problema.message })
      alertaError(problema.message, tituloError)
    }
  }, [consultar, tituloError])

  return { ...estado, recargar }
}
