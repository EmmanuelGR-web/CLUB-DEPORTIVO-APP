'use client'

import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { FaBars, FaSyncAlt } from 'react-icons/fa'
import BarraLateral from './BarraLateral'
import { useEsEscritorio } from '../../hooks/useEsEscritorio'

const hora = (fecha) => fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

function PanelLayout({ titulo, children, onActualizar, actualizado, extra, barraInferior, ...propsBarra }) {
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

      <main className={`flex-grow-1 p-3 p-md-4 p-xl-5 overflow-hidden ${barraInferior ? 'con-barra-inferior' : ''}`} style={{ minWidth: 0 }}>
        <div className="d-flex align-items-center gap-2 gap-md-3 mb-4">
          <Button variant="secondary" className="d-lg-none flex-shrink-0" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú del panel">
            <FaBars />
          </Button>
          <h1 className="titulo-panel fw-bolder text-uppercase fst-italic text-secondary mb-0 me-auto">{titulo}</h1>
          {onActualizar && (
            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              {actualizado && <small className="text-body-secondary d-none d-md-inline">Actualizado {hora(actualizado)}</small>}
              <Button variant="outline-secondary" size="sm" className="rounded-pill d-inline-flex align-items-center gap-2 px-2 px-sm-3" onClick={actualizar} aria-label="Actualizar panel">
                <FaSyncAlt aria-hidden="true" style={{ transition: 'transform 600ms ease', transform: girando ? 'rotate(360deg)' : 'none' }} />
                <span className="d-none d-sm-inline">Actualizar</span>
              </Button>
            </div>
          )}
        </div>
        {extra}
        {children}
      </main>
      {barraInferior}
    </div>
  )
}

export default PanelLayout
