'use client'

import { useState } from 'react'
import { Badge } from 'react-bootstrap'
import { formatearFecha } from '../../utilidades/fechas'
import { coloresCategoria } from '../../datos/noticias'

function TarjetaNoticia({ noticia, onAbrir }) {
  const [encima, setEncima] = useState(false)
  const color = coloresCategoria[noticia.categoria] ?? { bg: 'secondary' }

  return (
    <button
      type="button"
      onClick={() => onAbrir(noticia)}
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      className={`w-100 text-start bg-body border-1 border-3 rounded-2 p-3 ${
        encima ? 'border-warning shadow' : 'border-primary shadow-sm'
      }`}
    >
      <div className="d-flex justify-content-between align-items-center mb-1">
        <Badge bg={color.bg} text={color.text} className={`text-uppercase ${color.borde ? 'border' : ''}`}>
          {noticia.categoria}
        </Badge>
        <small className="text-body-secondary">{formatearFecha(String(noticia.fecha).slice(0, 10))}</small>
      </div>
      <h3 className={`h6 fw-bold mb-1 ${encima ? 'text-primary' : 'text-body'}`}>{noticia.titulo}</h3>
      <p className="small text-body-secondary mb-0">{noticia.resumen}</p>
    </button>
  )
}

export default TarjetaNoticia
