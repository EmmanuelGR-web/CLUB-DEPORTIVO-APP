'use client'

import { Row, Col } from 'react-bootstrap'
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaExternalLinkAlt } from 'react-icons/fa'
import FormularioContacto from './FormularioContacto'

function DatoContacto({ icono: Icono, children }) {
  return (
    <li className="d-flex align-items-start gap-3 mb-3">
      <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning text-dark p-2 flex-shrink-0">
        <Icono aria-hidden="true" />
      </span>
      <span className="pt-1 text-break">{children}</span>
    </li>
  )
}

function Contacto({ datos }) {
  return (
    <section id="contacto" className="py-4">
      <Row className="g-4 align-items-center">
        <Col lg={5}>
          <span className="text-uppercase fw-bold text-primary small">Estamos cerca</span>
          <h2 className="fw-bolder text-uppercase fst-italic mb-4">Contacto</h2>

          <ul className="list-unstyled mb-4">
            <DatoContacto icono={FaMapMarkerAlt}>{datos.direccion}</DatoContacto>
            <DatoContacto icono={FaPhoneAlt}>
              <a href={`tel:${datos.telefono.replace(/\D/g, '')}`} className="link-body-emphasis">
                {datos.telefono}
              </a>
            </DatoContacto>
            <DatoContacto icono={FaEnvelope}>
              <a href={`mailto:${datos.email}`} className="link-body-emphasis">
                {datos.email}
              </a>
            </DatoContacto>
            <DatoContacto icono={FaClock}>{datos.horario}</DatoContacto>
          </ul>

          <p className="small text-body-secondary mb-0">
            Para conocer las políticas deportivas de la provincia, podés visitar la{' '}
            <a href={datos.enlaceExterno.url} target="_blank" rel="noopener noreferrer" className="link-primary fw-semibold">
              {datos.enlaceExterno.texto} <FaExternalLinkAlt className="small" aria-hidden="true" />
            </a>
            .
          </p>
        </Col>

        <Col lg={7}>
          <FormularioContacto />
        </Col>
      </Row>
    </section>
  )
}

export default Contacto
