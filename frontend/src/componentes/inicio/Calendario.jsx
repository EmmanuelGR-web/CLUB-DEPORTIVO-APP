'use client'

import { useEffect, useRef, useState } from 'react'
import { Row, Col, Button, ButtonGroup, Modal, Table, Image } from 'react-bootstrap'
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaMapMarkerAlt, FaTicketAlt, FaTv } from 'react-icons/fa'
import TarjetaEvento from './TarjetaEvento'
import EstadoConsulta from '../comun/EstadoConsulta'
import { nombreLiga } from '../../servicios/deportesApi'
import { formatearFechaLarga } from '../../utilidades/fechas'

function DatoEvento({ icono: Icono, children }) {
  return (
    <p className="d-flex align-items-start gap-2 mb-2">
      <Icono className="text-primary mt-1 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

function Calendario({ eventos, tabla = [], cargando, error, onReintentar }) {
  const cinta = useRef(null)
  const [enInicio, setEnInicio] = useState(true)
  const [enFinal, setEnFinal] = useState(false)
  const [abierto, setAbierto] = useState(null)
  const [mostrar, setMostrar] = useState(false)
  const [zona, setZona] = useState(null)
  const zonaActual = tabla.find((z) => z.zona === zona) ?? tabla.find((z) => z.equipos.some((e) => e.esElEquipo)) ?? tabla[0]

  const actualizarFlechas = () => {
    const { scrollLeft, scrollWidth, clientWidth } = cinta.current
    setEnInicio(scrollLeft <= 1)
    setEnFinal(scrollLeft + clientWidth >= scrollWidth - 1)
  }

  useEffect(() => {
    actualizarFlechas()
    window.addEventListener('resize', actualizarFlechas)
    return () => window.removeEventListener('resize', actualizarFlechas)
  }, [eventos])

  const mover = (sentido) => {
    const anchoTarjeta = cinta.current.firstElementChild.offsetWidth
    cinta.current.scrollBy({ left: sentido * anchoTarjeta, behavior: 'smooth' })
  }

  const abrir = (evento) => {
    setAbierto(evento)
    setMostrar(true)
  }

  return (
    <section id="calendario" className="bg-body rounded-4 shadow-sm p-4">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <span className="d-none d-sm-inline-flex align-items-center justify-content-center rounded-circle bg-warning text-dark p-3 fs-4">
          <FaCalendarAlt aria-hidden="true" />
        </span>
        <div>
          <span className="text-uppercase fw-bold text-primary small">Fútbol profesional en Tucumán</span>
          <h2 className="fw-bolder text-uppercase fst-italic mb-0">Calendario</h2>
        </div>
        <div className="ms-auto d-flex gap-2">
          <Button variant="outline-dark" className="rounded-circle" onClick={() => mover(-1)} disabled={enInicio} aria-label="Eventos anteriores">
            <FaChevronLeft />
          </Button>
          <Button variant="dark" className="rounded-circle" onClick={() => mover(1)} disabled={enFinal} aria-label="Eventos siguientes">
            <FaChevronRight />
          </Button>
        </div>
      </div>

      <EstadoConsulta cargando={cargando} error={error} vacio={eventos.length === 0} onReintentar={onReintentar} textoVacio="No hay partidos cargados por ahora." />

      <Row
        ref={cinta}
        onScroll={actualizarFlechas}
        className="flex-nowrap overflow-auto g-3 pb-2"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
      >
        {eventos.map((evento) => (
          <Col key={evento.id} xs={10} sm={6} md={4} xl={3} style={{ scrollSnapAlign: 'start' }}>
            <TarjetaEvento evento={evento} onAbrir={abrir} />
          </Col>
        ))}
      </Row>

      {tabla.length > 0 && (
        <div className="mt-4">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <h3 className="h6 fw-bold text-uppercase text-secondary mb-0">Tabla de posiciones · {nombreLiga}</h3>
            {tabla.length > 1 && (
              <ButtonGroup size="sm" className="ms-sm-auto" aria-label="Elegir zona">
                {tabla.map((z) => (
                  <Button key={z.zona} variant={z.zona === zonaActual?.zona ? 'secondary' : 'outline-secondary'} onClick={() => setZona(z.zona)}>
                    {z.zona}
                  </Button>
                ))}
              </ButtonGroup>
            )}
          </div>
          <Table responsive size="sm" hover className="align-middle small mb-1">
            <thead>
              <tr className="text-uppercase">
                <th scope="col">#</th>
                <th scope="col">Equipo</th>
                <th scope="col" className="text-center">PJ</th>
                <th scope="col" className="text-center d-none d-sm-table-cell">G</th>
                <th scope="col" className="text-center d-none d-sm-table-cell">E</th>
                <th scope="col" className="text-center d-none d-sm-table-cell">P</th>
                <th scope="col" className="text-center">DG</th>
                <th scope="col" className="text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {zonaActual?.equipos.map((fila) => (
                <tr key={fila.id} className={fila.esElEquipo ? 'table-warning fw-semibold' : ''}>
                  <td className="fw-bold">{fila.puesto}</td>
                  <td className="text-nowrap">
                    <Image src={fila.escudo} alt="" width={20} height={20} className="object-fit-contain me-2" loading="lazy" />
                    {fila.equipo}
                  </td>
                  <td className="text-center">{fila.jugados}</td>
                  <td className="text-center d-none d-sm-table-cell">{fila.ganados}</td>
                  <td className="text-center d-none d-sm-table-cell">{fila.empatados}</td>
                  <td className="text-center d-none d-sm-table-cell">{fila.perdidos}</td>
                  <td className="text-center">{fila.diferencia}</td>
                  <td className="text-center fw-bold">{fila.puntos}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="small text-body-secondary mb-0">Datos en vivo de ESPN.</p>
        </div>
      )}

      <Modal show={mostrar} onHide={() => setMostrar(false)} centered>
        {abierto && (
          <>
            <Modal.Header closeButton closeVariant="white" className="bg-dark text-white">
              <Modal.Title className="h5 fw-bold">
                <span className="d-block text-uppercase small text-white-50">{abierto.disciplina}</span>
                {abierto.titulo}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <DatoEvento icono={FaCalendarAlt}>{formatearFechaLarga(abierto.fecha)}</DatoEvento>
              <DatoEvento icono={FaClock}>{abierto.hora} h</DatoEvento>
              <DatoEvento icono={FaMapMarkerAlt}>{abierto.lugar}</DatoEvento>
              {abierto.entradas && <DatoEvento icono={FaTicketAlt}>{abierto.entradas}</DatoEvento>}
              {abierto.transmision && <DatoEvento icono={FaTv}>{abierto.transmision}</DatoEvento>}
              <hr />
              {abierto.descripcion.map((parrafo) => (
                <p key={parrafo} className="mb-2">
                  {parrafo}
                </p>
              ))}
            </Modal.Body>
          </>
        )}
      </Modal>
    </section>
  )
}

export default Calendario
