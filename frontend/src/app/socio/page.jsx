'use client'

import { Suspense } from 'react'
import RutaProtegida, { pantallaCargando } from '@/componentes/RutaProtegida'
import PanelSocio from '@/componentes/paneles/PanelSocio'

const ROLES = ['socio']

export default function PaginaSocio() {
  return (
    <RutaProtegida roles={ROLES}>
      <Suspense fallback={pantallaCargando}>
        <PanelSocio />
      </Suspense>
    </RutaProtegida>
  )
}
