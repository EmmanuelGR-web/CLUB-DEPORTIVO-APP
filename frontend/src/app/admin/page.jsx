'use client'

import { Suspense } from 'react'
import RutaProtegida, { pantallaCargando } from '@/componentes/RutaProtegida'
import PanelAdmin from '@/componentes/paneles/PanelAdmin'

const ROLES = ['admin_principal']

export default function PaginaAdmin() {
  return (
    <RutaProtegida roles={ROLES}>
      {/* La sección se lee de la dirección: Next.js pide un Suspense. */}
      <Suspense fallback={pantallaCargando}>
        <PanelAdmin />
      </Suspense>
    </RutaProtegida>
  )
}
