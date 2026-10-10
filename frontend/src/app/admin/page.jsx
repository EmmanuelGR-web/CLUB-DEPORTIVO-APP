'use client'

import RutaProtegida from '@/componentes/RutaProtegida'
import PanelEnPreparacion from '@/componentes/paneles/PanelEnPreparacion'
import { menuAdmin } from '@/datos/menus'

const ROLES = ['admin_principal']

export default function PaginaAdmin() {
  return (
    <RutaProtegida roles={ROLES}>
      <PanelEnPreparacion titulo="Panel del administrador principal" items={menuAdmin} variante="rojo" />
    </RutaProtegida>
  )
}
