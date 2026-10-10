'use client'

import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { FaBars, FaSyncAlt } from 'react-icons/fa'
import BarraLateral from './BarraLateral'
import BotonTema from '../comun/BotonTema'
import { useEsEscritorio } from '../../hooks/useEsEscritorio'

const hora = (fecha) => fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

function PanelLayout({ titulo, children, onActualizar, actualizado, extra, ...propsBarra }) {
  const esEscritorio = useEsEscritorio()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [girando, setGirando] = useState(false)

  const actualizar = () => {
    onActualizar()
    setGirando(true)
    setTimeout(() => setGirando(false), 600)
  }

  return (
    <div className="d-lg-flex min-vh-100 bg-body-tertiary">
      <div className="flex-shrink-0 sticky-lg-top align-self-lg-start" style={esEscritorio ? { height: '100vh', overflowY: 'auto', overscrollBehavior: 'contain' } : undefined}>
        <BarraLateral {...propsBarra} mostrar={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      </div>

      <main className="flex-grow-1 p-3 p-md-4 p-xl-5 overflow-hidden" style={{ minWidth: 0 }}>
        <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3 mb-4">
          <Button variant="secondary" className="d-lg-none" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú del panel">
            <FaBars />
          </Button>
          <h1 className="h3 fw-bolder text-uppercase fst-italic text-secondary mb-0 me-auto">{titulo}</h1>
          <div className="d-flex align-items-center gap-2 ms-auto">
            {onActualizar && actualizado && <small className="text-body-secondary d-none d-md-inline">Actualizado {hora(actualizado)}</small>}
            {onActualizar && (
              <Button variant="outline-secondary" size="sm" className="rounded-pill d-inline-flex align-items-center gap-2 px-3" onClick={actualizar} aria-label="Actualizar panel">
                <FaSyncAlt aria-hidden="true" style={{ transition: 'transform 600ms ease', transform: girando ? 'rotate(360deg)' : 'none' }} />
                <span className="d-none d-sm-inline">Actualizar</span>
              </Button>
            )}
            <BotonTema />
          </div>
        </div>
        {extra}
        {children}
      </main>
    </div>
  )
}

export default PanelLayout
