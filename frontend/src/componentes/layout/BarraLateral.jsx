'use client'

import { Offcanvas, Nav, Button, Image, CloseButton, Form } from 'react-bootstrap'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaMoon, FaSignOutAlt, FaSun, FaUserCircle } from 'react-icons/fa'
import { useSesion } from '../../contextos/SesionContexto'
import { useTema } from '../../contextos/TemaContexto'
import { confirmarSalida } from '../../utilidades/alertas'
import { fondoBordo, fondoElectrico } from '../auth/estilosAuth'
import { useEsEscritorio } from '../../hooks/useEsEscritorio'

const variantes = {
  electrico: { clase: 'bg-black', estilo: fondoElectrico },
  rojo: { clase: 'bg-primary', estilo: undefined },
  bordo: { clase: 'bg-secondary', estilo: fondoBordo },
}

function BarraLateral({ usuario, detalle, items, activo, onSeleccionar, variante = 'electrico', mostrar, onCerrar, alSalir }) {
  const { cerrarSesion } = useSesion()
  const { tema, alternarTema } = useTema()
  const oscuro = tema === 'oscuro'
  const esEscritorio = useEsEscritorio()
  const router = useRouter()

  // Al cerrarse, el menú queda oculto para los lectores de pantalla: el
  // foco se suelta antes para que no quede adentro.
  const cerrar = () => {
    document.activeElement?.blur()
    onCerrar()
  }

  // En el celular, la confirmación espera a que el menú termine de
  // cerrarse: si se abre antes, el menú todavía tiene el foco mientras
  // la ventana de confirmación oculta el resto de la página.
  const salirPendiente = useRef(false)

  const confirmarYSalir = async () => {
    if (!(await confirmarSalida())) return
    await alSalir?.()
    cerrarSesion()
    router.replace('/login')
  }

  const salir = () => {
    if (esEscritorio) {
      document.activeElement?.blur()
      confirmarYSalir()
      return
    }
    salirPendiente.current = true
    cerrar()
  }

  const alTerminarDeCerrar = () => {
    if (!salirPendiente.current) return
    salirPendiente.current = false
    confirmarYSalir()
  }

  const elegir = (id) => {
    onSeleccionar(id)
    cerrar()
  }

  return (
    <Offcanvas
      show={mostrar}
      onHide={cerrar}
      onExited={alTerminarDeCerrar}
      enforceFocus={false}
      responsive="lg"
      placement="start"
      className={`${variantes[variante].clase} text-white ${esEscritorio ? '' : 'rounded-bottom-4 shadow'}`}
      style={{ width: 270, bottom: esEscritorio ? undefined : 'auto' }}
    >
      <Offcanvas.Body className={`position-relative d-flex flex-column p-0 ${variantes[variante].clase} text-white w-100 ${esEscritorio ? 'min-vh-100' : 'rounded-bottom-4'}`}
        style={esEscritorio ? variantes[variante].estilo : { ...variantes[variante].estilo, maxHeight: '100dvh', overflowY: 'auto', overscrollBehavior: 'contain' }}
      >
        {!esEscritorio && (
          <div className="d-flex align-items-center gap-2 px-4 pt-3">
            {/* La imagen del escudo trae margen transparente: se amplía dentro de un recuadro fijo. */}
            <span className="flex-shrink-0 d-inline-flex align-items-center justify-content-center" style={{ width: 54, height: 54 }}>
              <Image src="/logo.png" alt="Escudo del Club Deportivo" width={54} height={54} className="object-fit-contain" style={{ transform: 'scale(1.75)' }} />
            </span>
            <span className="font-credencial fw-bold text-uppercase lh-1 me-auto" style={{ letterSpacing: "0.14em", fontSize: "1rem" }}>
              Club
              <br />
              Deportivo
            </span>
            <CloseButton variant="white" aria-label="Cerrar menú" onClick={cerrar} />
          </div>
        )}
        <div className={`d-flex align-items-center gap-3 px-4 ${esEscritorio ? 'py-4' : 'pt-3 pb-4'} border-bottom border-light border-opacity-10`}>
          {usuario.foto ? (
            <Image src={usuario.foto} alt={usuario.nombre} roundedCircle width={64} height={64} className="object-fit-cover border border-2 border-warning flex-shrink-0" />
          ) : (
            <FaUserCircle size={64} className="flex-shrink-0 opacity-75" aria-hidden="true" />
          )}
          <div className="flex-grow-1 text-break">
            <div className="fw-bold lh-sm">{usuario.nombre}</div>
            {detalle && <small className="text-white-50">{detalle}</small>}
          </div>
          <Image src="/logo.png" alt="" width={40} height={40} className="object-fit-cover flex-shrink-0 d-none d-lg-block" />
        </div>

        <Nav className={`flex-column py-3 ${esEscritorio ? 'flex-grow-1' : ''}`}>
          {items.map(({ id, etiqueta, icono: Icono, contador, soloEscritorio }) => {
            const esActivo = id === activo
            return (
              <Nav.Link
                key={id}
                as="button"
                onClick={() => elegir(id)}
                aria-current={esActivo ? 'page' : undefined}
                className={`${soloEscritorio ? 'd-none d-lg-flex' : 'd-flex'} align-items-center gap-3 text-start pe-4 py-3 ${
                  esActivo ? 'border-start border-4 border-warning ps-4 bg-white bg-opacity-10 text-white fw-semibold' : 'ps-4 ms-1 text-white-50'
                }`}
              >
                <Icono aria-hidden="true" />
                <span className="flex-grow-1">{etiqueta}</span>
                {contador > 0 && (
                  <span className="badge rounded-pill bg-warning text-dark">{contador}</span>
                )}
              </Nav.Link>
            )
          })}
        </Nav>

        <div className="p-4 pt-2">
          <label
            htmlFor="modo-oscuro"
            className="d-flex align-items-center gap-3 rounded-pill bg-white bg-opacity-10 px-3 py-2 mb-3 small fw-semibold"
            style={{ cursor: 'pointer' }}
          >
            {oscuro ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
            <span className="flex-grow-1">Modo oscuro</span>
            <Form.Check type="switch" id="modo-oscuro" className="mb-0" checked={oscuro} onChange={alternarTema} aria-label="Modo oscuro" />
          </label>
          <Button variant={{ rojo: 'light', bordo: 'outline-light' }[variante] ?? 'primary'} className="w-100 rounded-pill d-inline-flex align-items-center justify-content-center gap-2" onClick={salir}>
            <FaSignOutAlt aria-hidden="true" /> Cerrar sesión
          </Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  )
}

export default BarraLateral
