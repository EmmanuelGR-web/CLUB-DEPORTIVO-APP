'use client'

import { Suspense } from 'react'
import RutaProtegida, { pantallaCargando } from '@/componentes/RutaProtegida'
import PanelEmpleado from '@/componentes/paneles/PanelEmpleado'

const ROLES = ['administrativo']

export default function PaginaEmpleado() {
  return (
    <RutaProtegida roles={ROLES}>
      <Suspense fallback={pantallaCargando}>
        <PanelEmpleado />
      </Suspense>
    </RutaProtegida>
  )
}
