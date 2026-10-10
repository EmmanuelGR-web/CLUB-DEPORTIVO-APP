'use client'

import RutaProtegida from '@/componentes/RutaProtegida'
import PanelAdmin from '@/componentes/paneles/PanelAdmin'

const ROLES = ['admin_principal']

export default function PaginaAdmin() {
  return (
    <RutaProtegida roles={ROLES}>
      <PanelAdmin />
    </RutaProtegida>
  )
}
