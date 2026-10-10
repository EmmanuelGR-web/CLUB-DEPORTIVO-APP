'use client'

import RutaProtegida from '@/componentes/RutaProtegida'
import PanelEnPreparacion from '@/componentes/paneles/PanelEnPreparacion'
import { menuEmpleado } from '@/datos/menus'

const ROLES = ['administrativo']

export default function PaginaEmpleado() {
  return (
    <RutaProtegida roles={ROLES}>
      <PanelEnPreparacion titulo="Panel administrativo" items={menuEmpleado} variante="bordo" />
    </RutaProtegida>
  )
}
