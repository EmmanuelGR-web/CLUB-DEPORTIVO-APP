'use client'

import { useState } from 'react'
import PanelLayout from '../layout/PanelLayout'
import Tarjeta from '../comun/Tarjeta'
import { useSesion } from '../../contextos/SesionContexto'

// Pantalla provisoria mientras se migran los paneles del personal.
function PanelEnPreparacion({ titulo, items, variante }) {
  const { usuario } = useSesion()
  const [seccion, setSeccion] = useState(items[0].id)
  const actual = items.find((i) => i.id === seccion)

  return (
    <PanelLayout titulo={actual.etiqueta} usuario={{ nombre: usuario.nombre }} detalle={usuario.rolTexto} items={items} activo={seccion} onSeleccionar={setSeccion} variante={variante}>
      <Tarjeta titulo={titulo}>
        <p className="mb-0 text-body-secondary">Esta sección se está terminando de conectar con el servidor del club y va a estar disponible en la próxima actualización.</p>
      </Tarjeta>
    </PanelLayout>
  )
}

export default PanelEnPreparacion
