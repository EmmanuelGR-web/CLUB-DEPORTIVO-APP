'use client'

import { useState } from 'react'
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { iconosDisciplina } from '../../datos/eventos'
import { partesFecha } from '../../utilidades/fechas'

function TarjetaEvento({ evento, onAbrir }) {
  const [encima, setEncima] = useState(false)
  const { dia, mes, diaSemana } = partesFecha(evento.fecha)
  const Icono = iconosDisciplina[evento.disciplina]

  return (
    <button
      type="button"
      onClick={() => onAbrir(evento)}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      className={`w-100 h-100 text-start bg-body border rounded-3 overflow-hidden p-0 d-flex flex-column ${
        encima ? 'border-warning shadow' : 'shadow-sm'
      }`}
    >
      <div className={`w-100 d-flex align-items-center gap-3 px-3 py-2 text-white ${encima ? 'bg-primary' : 'bg-dark'}`}>
        <span className="display-6 fw-bolder lh-1">{dia}</span>
        <span className="d-flex flex-column text-uppercase lh-sm">
          <span className="fw-bold">{mes}</span>
          <span className="small text-white-50">{diaSemana}</span>
        </span>
        <Icono className="ms-auto fs-4" aria-hidden="true" />
      </div>

      <div className="p-3 d-flex flex-column gap-1 flex-grow-1">
        <span className="text-uppercase fw-bold text-primary small">{evento.disciplina}</span>
        <h3 className="h6 fw-bold mb-1">{evento.titulo}</h3>
        {evento.jugado && (
          <span className="badge bg-secondary align-self-start mb-1">
            Final: {evento.local.goles} - {evento.visitante.goles}
          </span>
        )}
        <span className="small text-body-secondary d-flex align-items-center gap-2">
          <FaClock aria-hidden="true" /> {evento.hora} h
        </span>
        <span className="small text-body-secondary d-flex align-items-center gap-2">
          <FaMapMarkerAlt aria-hidden="true" /> {evento.lugar}
        </span>
      </div>
    </button>
  )
}

export default TarjetaEvento
