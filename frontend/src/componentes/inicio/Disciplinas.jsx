'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { FaChevronRight } from 'react-icons/fa'
import TarjetaDisciplina from './TarjetaDisciplina'

const duracion = 450

function Disciplinas({ disciplinas }) {
  const [orden, setOrden] = useState(() => disciplinas.map((_, indice) => indice))
  const [salida, setSalida] = useState(null)
  const inicioArrastre = useRef(null)
  const temporizador = useRef(null)

  useEffect(() => () => clearTimeout(temporizador.current), [])

  const pasar = (hacia = 'izquierda') => {
    if (salida) return
    setSalida(hacia)
    temporizador.current = setTimeout(() => {
      setOrden((actual) => [...actual.slice(1), actual[0]])
      setSalida(null)
    }, duracion)
  }

  const irA = (indice) => {
    if (salida) return
    setOrden((actual) => {
      const posicion = actual.indexOf(indice)
      return [...actual.slice(posicion), ...actual.slice(0, posicion)]
    })
  }

  const soltar = (x) => {
    if (inicioArrastre.current === null) return
    const distancia = x - inicioArrastre.current
    inicioArrastre.current = null
    if (Math.abs(distancia) > 50) pasar(distancia < 0 ? 'izquierda' : 'derecha')
  }

  const estiloCarta = (posicion) => {
    if (posicion === 0 && salida) {
      const signo = salida === 'izquierda' ? -1 : 1
      return { transform: `translateX(${signo * 130}%) rotate(${signo * 18}deg)`, opacity: 0 }
    }
    return {
      transform: `translate(${posicion * 10}px, ${posicion * 10}px) rotate(${posicion * 3}deg)`,
      opacity: posicion < 3 ? 1 : 0,
    }
  }

  return (
    <section id="disciplinas" className="h-100 bg-body rounded-4 shadow-sm p-4 overflow-hidden">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
        <div>
          <span className="text-uppercase fw-bold text-primary small">Actividades</span>
          <h2 className="fw-bolder text-uppercase fst-italic mb-0">Disciplinas</h2>
        </div>
        <Button variant="dark" className="ms-auto rounded-pill d-inline-flex align-items-center gap-2" onClick={() => pasar()}>
          Siguiente <FaChevronRight />
        </Button>
      </div>

      <div
        className="position-relative mx-auto mb-4"
        style={{ maxWidth: 300, height: 460, touchAction: 'pan-y' }}
        onPointerDown={(e) => (inicioArrastre.current = e.clientX)}
        onPointerUp={(e) => soltar(e.clientX)}
        onPointerLeave={(e) => soltar(e.clientX)}
      >
        {orden.map((indice, posicion) => (
          <div
            key={disciplinas[indice].id}
            aria-hidden={posicion !== 0}
            className="position-absolute top-0 start-0 w-100"
            style={{
              height: 440,
              zIndex: disciplinas.length - posicion,
              transition: `transform ${duracion}ms ease, opacity ${duracion}ms ease`,
              pointerEvents: posicion === 0 ? 'auto' : 'none',
              ...estiloCarta(posicion),
            }}
          >
            <TarjetaDisciplina disciplina={disciplinas[indice]} />
          </div>
        ))}
      </div>

      <div className="d-flex flex-wrap justify-content-center gap-2">
        {disciplinas.map((disciplina, indice) => {
          const Icono = disciplina.icono
          const activa = orden[0] === indice
          return (
            <Button
              key={disciplina.id}
              size="sm"
              variant={activa ? 'warning' : 'outline-dark'}
              className="rounded-pill d-inline-flex align-items-center gap-1"
              onClick={() => irA(indice)}
              aria-pressed={activa}
            >
              <Icono aria-hidden="true" /> {disciplina.nombre}
            </Button>
          )
        })}
      </div>
    </section>
  )
}

export default Disciplinas
