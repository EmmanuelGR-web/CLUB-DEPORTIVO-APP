'use client'

import { Row, Col } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import { formatearFechaConAnio } from '../../utilidades/fechas'
import { textoAntiguedad } from '../../utilidades/tiempo'

function DatosEmpleado({ empleado }) {
  const datos = [
    ['Nombre', empleado.nombre],
    ['Código de empleado', empleado.codigo],
    ['Puesto', empleado.puesto],
    ['Sector', empleado.sector],
    ['Correo del club', empleado.correo],
    ['Teléfono', empleado.interno],
    ['Horario', empleado.turno],
    ['En el club desde', `${formatearFechaConAnio(empleado.ingreso)} (${textoAntiguedad(new Date(`${empleado.ingreso}T12:00:00`))})`],
  ]

  return (
    <Tarjeta titulo="Mis datos">
      <Row as="dl" className="g-4 mb-0">
        {datos.map(([etiqueta, valor]) => (
          <Col key={etiqueta} md={6}>
            <dt className="small text-uppercase text-body-secondary fw-semibold">{etiqueta}</dt>
            <dd className="fs-5 mb-0 text-break">{valor}</dd>
          </Col>
        ))}
      </Row>
      <p className="small text-body-secondary border-top pt-3 mt-4 mb-0">Para corregir tus datos, comunicate con el administrador principal.</p>
    </Tarjeta>
  )
}

export default DatosEmpleado
