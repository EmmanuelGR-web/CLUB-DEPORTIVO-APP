'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSesion } from '@/contextos/SesionContexto'
import { pantallaCargando } from '@/componentes/RutaProtegida'

// La raíz lleva directo al panel de cada rol, o al ingreso si no hay sesión.
export default function PaginaInicio() {
  const { usuario, lista } = useSesion()
  const router = useRouter()

  useEffect(() => {
    if (lista) router.replace(usuario ? usuario.ruta : '/login')
  }, [lista, usuario, router])

  return pantallaCargando
}
