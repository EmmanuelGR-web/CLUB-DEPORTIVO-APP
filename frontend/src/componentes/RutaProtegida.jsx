'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from 'react-bootstrap'
import { useSesion } from '../contextos/SesionContexto'

export const pantallaCargando = (
  <div className="min-vh-100 d-flex align-items-center justify-content-center bg-black">
    <Spinner animation="border" variant="warning" role="status">
      <span className="visually-hidden">Cargando…</span>
    </Spinner>
  </div>
)

// Cada panel es solo para su rol: si entra otro, lo manda a su propio panel.
function RutaProtegida({ roles, children }) {
  const { usuario, lista } = useSesion()
  const router = useRouter()
  const permitido = usuario && roles.includes(usuario.rol)

  useEffect(() => {
    if (!lista) return
    if (!usuario) router.replace('/login')
    else if (!roles.includes(usuario.rol)) router.replace(usuario.ruta)
  }, [lista, usuario, roles, router])

  return permitido ? children : pantallaCargando
}

export default RutaProtegida
