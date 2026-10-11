'use client'

import { useState } from 'react'
import { Offcanvas, Nav, Button, Fade, Image, CloseButton, Form } from 'react-bootstrap'
import Link from 'next/link'
import { FaBars, FaMoon, FaSun } from 'react-icons/fa'
import { useTema } from '../../contextos/TemaContexto'
import { useSesion } from '../../contextos/SesionContexto'

function BarraNavegacion({ enlaces }) {
  const { usuario } = useSesion()
  const { tema, alternarTema } = useTema()
  const oscuro = tema === 'oscuro'
  const [mostrar, setMostrar] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [esMobile, setEsMobile] = useState(false)

  
  // El menú oculta la página a los lectores de pantalla: el foco se
  // suelta antes de abrirlo y de cerrarlo.
  const abrir = () => {
    document.activeElement?.blur()
    setEsMobile(window.matchMedia('(max-width: 767.98px)').matches)
    setMostrar(true)
  }
  const cerrar = () => {
    document.activeElement?.blur()
    setMostrar(false)
  }

  return (
    <>
      <Button
        variant="secondary"
        size="lg"
        className="position-fixed top-0 start-0 m-3 z-3 shadow"
        aria-label="Abrir menú"
        onClick={abrir}
      >
        <FaBars />
      </Button>

      <Offcanvas
        show={mostrar}
        onHide={cerrar}
        onEntered={() => setMenuAbierto(true)}
        onExited={() => setMenuAbierto(false)}
        enforceFocus={false}
        placement="start"
        className={`bg-secondary text-white ${esMobile ? 'rounded-bottom shadow' : ''}`}
        style={{ width: 220, bottom: esMobile ? 'auto' : undefined }}
      >
        <Offcanvas.Header className="justify-content-center position-relative pt-4">
          <CloseButton
            variant="white"
            aria-label="Cerrar menú"
            onClick={cerrar}
            className="position-absolute top-0 end-0 m-3"
          />
          <Image src="/logo.png" alt="Escudo del club" width={110} height={110} className="object-fit-cover" />
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column">
          <Nav
            className="flex-column gap-1"
            style={{ '--bs-nav-link-color': '#fff', '--bs-nav-link-hover-color': 'var(--club-dorado)' }}
          >
            {enlaces.map((enlace, indice) => (
              <Fade
                in={menuAbierto}
                key={enlace.href}
                style={{
                  transition: `opacity 400ms ease ${indice * 120}ms, transform 400ms ease ${indice * 120}ms`,
                  transform: menuAbierto ? 'none' : 'translateY(-12px)',
                }}
              >
                <Nav.Link href={enlace.href} onClick={cerrar} className="fw-semibold">
                  {enlace.etiqueta}
                </Nav.Link>
              </Fade>
            ))}
          </Nav>

          <label
            htmlFor="modo-oscuro-inicio"
            className={`d-flex align-items-center gap-3 rounded-pill bg-white bg-opacity-10 px-3 py-2 mb-3 small fw-semibold ${esMobile ? 'mt-4' : 'mt-auto'}`}
            style={{ cursor: 'pointer' }}
          >
            {oscuro ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
            <span className="flex-grow-1">Modo oscuro</span>
            <Form.Check type="switch" id="modo-oscuro-inicio" className="mb-0" checked={oscuro} onChange={alternarTema} aria-label="Modo oscuro" />
          </label>
          <Button as={Link} href={usuario ? usuario.ruta : '/login'} variant="primary">
            {usuario ? 'Mi panel' : 'Ingresar'}
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default BarraNavegacion
