'use client'

import Tarjeta from '../comun/Tarjeta'
import EstadoBadge from '../comun/EstadoBadge'
import { textoAntiguedad } from '../../utilidades/tiempo'
import { formatearFechaConAnio } from '../../utilidades/fechas'
import { categorias } from '../../utilidades/categorias'

function EstadoMembresia({ socio }) {
  const estilo = categorias[socio.categoria]
  const filas = [
    ['Estado', <EstadoBadge key="estado" estado={socio.estado} />],
    [
      'Categoría',
      <span key="categoria" className={`badge rounded-pill text-${estilo.texto}`} style={{ backgroundImage: estilo.degradado }}>
        {socio.categoria}
      </span>,
    ],
    ['Antigüedad', textoAntiguedad(new Date(socio.fechaAlta))],
    ['Socio desde', formatearFechaConAnio(socio.fechaAlta.slice(0, 10))],
  ]

  return (
    <Tarjeta titulo="Estado de membresía" className="h-100">
      <dl className="mb-0">
        {filas.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="d-flex justify-content-between border-bottom py-2">
            <dt className="fw-normal text-body-secondary">{etiqueta}</dt>
            <dd className="fw-semibold mb-0 text-end">{valor}</dd>
          </div>
        ))}
      </dl>
      <p className="small text-body-secondary mt-3 mb-0">Bronce: hasta 2 años · Plata: de 2 a 10 años · Oro: más de 10 años.</p>
      {socio.estado === 'En validación' && (
        <p className="small text-body-secondary mt-2 mb-0">El personal del club está revisando tus datos. Te avisamos cuando tu carnet quede activo.</p>
      )}
    </Tarjeta>
  )
}

export default EstadoMembresia
