'use client'


import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { configurarVencimiento } from '../servicios/api'
import { cerrarSesionApi, iniciarSesionApi, obtenerSesionApi } from '../servicios/cuentaApi'
import { alertaAviso } from '../utilidades/alertas'
import { useRegistrarNavegacion } from '../hooks/useNavegacionInterna'

const SesionContexto = createContext(null)

const borrarSesionAnterior = () => {
  try {
    localStorage.removeItem('sesionClub')
    sessionStorage.removeItem('sesionClub')
  } catch {
  }
}

export function SesionProveedor({ children }) {
  const router = useRouter()
  useRegistrarNavegacion()
  const [usuario, setUsuario] = useState(null)
  const [lista, setLista] = useState(false)
  const conSesion = useRef(false)
  conSesion.current = Boolean(usuario)

  useEffect(() => {
    borrarSesionAnterior()
    let vigente = true
    obtenerSesionApi()
      .then((datos) => vigente && setUsuario(datos?.usuario ?? null))
      .catch(() => vigente && setUsuario(null))
      .finally(() => vigente && setLista(true))
    return () => {
      vigente = false
    }
  }, [])

  const cerrarSesion = useCallback(async () => {
    setUsuario(null)
    try {
      await cerrarSesionApi()
    } catch {
    }
  }, [])

  useEffect(() => {
    configurarVencimiento(() => {
      if (!conSesion.current) return
      conSesion.current = false
      setUsuario(null)
      router.replace('/login')
      alertaAviso('Por seguridad cerramos tu sesión. Volvé a ingresar.', 'Tu sesión venció')
    })
  }, [router])

  const iniciarSesion = async (email, contrasena, recordar) => {
    try {
      const { usuario: datos } = await iniciarSesionApi(email.trim().toLowerCase(), contrasena, Boolean(recordar))
      setUsuario(datos)
      return datos
    } catch (problema) {
      if (problema.estado === 403 && problema.datos?.bloqueo) return { bloqueado: problema.message }
      if (problema.estado === 429) return { bloqueado: problema.message }
      if (problema.estado === 401) return problema.message.includes('baja') ? { errorConexion: problema.message } : null
      return { errorConexion: problema.message }
    }
  }

  const actualizarUsuario = (cambios) => setUsuario((actual) => (actual ? { ...actual, ...cambios } : actual))

  return (
    <SesionContexto.Provider value={{ usuario, lista, iniciarSesion, cerrarSesion, actualizarUsuario }}>{children}</SesionContexto.Provider>
  )
}

export const useSesion = () => useContext(SesionContexto)
