'use client'

import { Badge } from 'react-bootstrap'

const estilos = {
  Aprobado: { bg: 'success' },
  Activo: { bg: 'success' },
  Autorizado: { bg: 'success' },
  Pendiente: { bg: 'warning', texto: 'dark' },
  'En validación': { bg: 'warning', texto: 'dark' },
  'Esperando aprobación': { bg: 'warning', texto: 'dark' },
  Rechazado: { bg: 'danger' },
  Vencido: { bg: 'danger' },
  'En revisión': { bg: 'info', texto: 'dark' },
  Inactivo: { bg: 'secondary' },
}

function EstadoBadge({ estado }) {
  const { bg, texto } = estilos[estado] ?? { bg: 'secondary' }
  return (
    <Badge bg={bg} text={texto} pill>
      {estado}
    </Badge>
  )
}

export default EstadoBadge
