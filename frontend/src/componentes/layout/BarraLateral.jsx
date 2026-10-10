'use client'

import { Offcanvas, Nav, Button, Image, CloseButton, Form } from 'react-bootstrap'
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

  const salir = async () => {
    onCerrar()
    if (!(await confirmarSalida())) return
    await alSalir?.()
    cerrarSesion()
    router.replace('/login')
  }

  const elegir = (id) => {
    onSeleccionar(id)
    onCerrar()
  }

  return (
    <Offcanvas
      show={mostrar}
      onHide={onCerrar}
      responsive="lg"
      placement="start"
      className={`${variantes[variante].clase} text-white ${esEscritorio ? '' : 'rounded-bottom-4 shadow'}`}
      style={{ width: 270, bottom: esEscritorio ? undefined : 'auto' }}
    >
      <Offcanvas.Body className={`position-relative d-flex flex-column p-0 ${variantes[variante].clase} text-white w-100 ${esEscritorio ? 'min-vh-100' : 'rounded-bottom-4'}`} style={variantes[variante].estilo}>
        {!esEscritorio && <CloseButton variant="white" aria-label="Cerrar menú" onClick={onCerrar} className="position-absolute top-0 end-0 m-2" />}
        <div className="d-flex align-items-center gap-3 p-4 border-bottom border-light border-opacity-10">
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
          {items.map(({ id, etiqueta, icono: Icono, contador }) => {
            const esActivo = id === activo
            return (
              <Nav.Link
                key={id}
                as="button"
                onClick={() => elegir(id)}
                aria-current={esActivo ? 'page' : undefined}
                className={`d-flex align-items-center gap-3 text-start pe-4 py-3 ${
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
