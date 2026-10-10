'use client'

// =====================================================================
// SesionContexto.jsx
// -----------------------------------------------------------------------
// Sesión del usuario en todo el portal. Si marca "Mantener sesión
// iniciada" se guarda en localStorage (sobrevive a cerrar el
// navegador); si no, en sessionStorage (dura hasta cerrar la pestaña).
// =====================================================================

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CLAVE_SESION, configurarVencimiento, leerSesionGuardada } from '../servicios/api'
import { iniciarSesionApi } from '../servicios/cuentaApi'
import { alertaAviso } from '../utilidades/alertas'

const SesionContexto = createContext(null)

export function SesionProveedor({ children }) {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [lista, setLista] = useState(false)

  useEffect(() => {
    setUsuario(leerSesionGuardada()?.usuario ?? null)
    setLista(true)
  }, [])

  const cerrarSesion = useCallback(() => {
    try {
      localStorage.removeItem(CLAVE_SESION)
      sessionStorage.removeItem(CLAVE_SESION)
    } catch {
      // Sin almacenamiento no hay nada que borrar.
    }
    setUsuario(null)
  }, [])

  useEffect(() => {
    configurarVencimiento(() => {
      cerrarSesion()
      router.replace('/login')
      alertaAviso('Por seguridad cerramos tu sesión. Volvé a ingresar.', 'Tu sesión venció')
    })
  }, [cerrarSesion, router])

  // Devuelve los datos del usuario, null si las credenciales no son
  // correctas o { errorConexion } si el servidor no respondió.
  const iniciarSesion = async (email, contrasena, recordar) => {
    try {
      const { tokenAcceso, usuario: datos } = await iniciarSesionApi(email.trim().toLowerCase(), contrasena)
      const almacen = recordar ? localStorage : sessionStorage
      almacen.setItem(CLAVE_SESION, JSON.stringify({ token: tokenAcceso, usuario: datos }))
      setUsuario(datos)
      return datos
    } catch (problema) {
      if (problema.estado === 401) return problema.message.includes('baja') ? { errorConexion: problema.message } : null
      return { errorConexion: problema.message }
    }
  }

  const actualizarUsuario = (cambios) => {
    setUsuario((actual) => {
      if (!actual) return actual
      const nuevo = { ...actual, ...cambios }
      const sesion = leerSesionGuardada()
      const almacen = localStorage.getItem(CLAVE_SESION) ? localStorage : sessionStorage
      almacen.setItem(CLAVE_SESION, JSON.stringify({ ...sesion, usuario: nuevo }))
      return nuevo
    })
  }

  return (
    <SesionContexto.Provider value={{ usuario, lista, iniciarSesion, cerrarSesion, actualizarUsuario }}>{children}</SesionContexto.Provider>
  )
}

export const useSesion = () => useContext(SesionContexto)
