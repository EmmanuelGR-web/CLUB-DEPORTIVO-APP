'use client'

import { useState } from 'react'
import { Row, Col, Form } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import TablaSolicitudes from './TablaSolicitudes'
import { coincide } from '../../utilidades/texto'

function Solicitudes({ solicitudes, onRevisar }) {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('Pendiente')
  const [tipo, setTipo] = useState('')

  const tipos = [...new Set(solicitudes.map((s) => s.tipo))]
  const filtradas = solicitudes.filter(
    (s) =>
      (!estado || s.estado === estado) &&
      (!tipo || s.tipo === tipo) &&
      coincide(`${s.socioNombre} ${s.socioDni ?? ''} ${s.tipo}`, busqueda),
  )

  return (
    <Tarjeta titulo="Filtro de búsqueda">
      <Row className="g-2 mb-3">
        <Col md={6}>
          <Form.Control
            type="search"
            placeholder="Buscar por socio, DNI o tipo de solicitud"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar solicitudes"
          />
        </Col>
        <Col xs={6} md={3}>
          <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            <option>Pendiente</option>
            <option>Autorizado</option>
            <option>Rechazado</option>
          </Form.Select>
        </Col>
        <Col xs={6} md={3}>
          <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Filtrar por tipo">
            <option value="">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <p className="small text-body-secondary mb-2">
        {filtradas.length} {filtradas.length === 1 ? 'solicitud' : 'solicitudes'}
      </p>
      <TablaSolicitudes solicitudes={filtradas} onRevisar={onRevisar} />
    </Tarjeta>
  )
}

export default Solicitudes
