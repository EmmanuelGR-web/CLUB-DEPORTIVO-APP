'use client'

// =====================================================================
// SesionContexto.jsx
// -----------------------------------------------------------------------
// Sesión del usuario en todo el portal. El pase de sesión lo guarda el
// navegador en una cookie httpOnly que pone el backend: el código de la
// página nunca lo ve. Acá solo se guardan los datos para mostrar (nombre,
// rol, panel), que se piden al backend al abrir el sitio.
// "Mantener sesión iniciada" hace que la cookie dure 30 días; si no, se
// borra al cerrar el navegador.
// =====================================================================

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { configurarVencimiento } from '../servicios/api'
import { cerrarSesionApi, iniciarSesionApi, obtenerSesionApi } from '../servicios/cuentaApi'
import { alertaAviso } from '../utilidades/alertas'

const SesionContexto = createContext(null)

// Las versiones anteriores guardaban el pase en el almacenamiento del
// navegador: se borra para que no quede expuesto.
const borrarSesionAnterior = () => {
  try {
    localStorage.removeItem('sesionClub')
    sessionStorage.removeItem('sesionClub')
  } catch {
    // Sin almacenamiento no hay nada que borrar.
  }
}

export function SesionProveedor({ children }) {
  const router = useRouter()
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
      // Si el servidor no responde, la cookie vence sola.
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

  // Devuelve los datos del usuario, null si las credenciales no son
  // correctas, { bloqueado } si el personal está de licencia o la cuenta
  // quedó bloqueada por intentos fallidos, o { errorConexion } si el
  // servidor no respondió.
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
