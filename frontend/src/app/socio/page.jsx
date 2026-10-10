'use client'

import RutaProtegida from '@/componentes/RutaProtegida'
import PanelSocio from '@/componentes/paneles/PanelSocio'

const ROLES = ['socio']

export default function PaginaSocio() {
  return (
    <RutaProtegida roles={ROLES}>
      <PanelSocio />
    </RutaProtegida>
  )
}
