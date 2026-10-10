'use client'

import RutaProtegida from '@/componentes/RutaProtegida'
import PanelEmpleado from '@/componentes/paneles/PanelEmpleado'

const ROLES = ['administrativo']

export default function PaginaEmpleado() {
  return (
    <RutaProtegida roles={ROLES}>
      <PanelEmpleado />
    </RutaProtegida>
  )
}
