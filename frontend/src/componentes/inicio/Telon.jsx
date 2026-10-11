'use client'

import { useEffect, useRef, useState } from 'react'

// Se muestra una sola vez por visita: al volver al inicio desde otra
// pantalla ya no aparece.
let yaSeMostro = false

function Telon({ imagen, demora = 1200, duracion = 1400 }) {
  const [visible, setVisible] = useState(!yaSeMostro)
  const [imagenLista, setImagenLista] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [terminado, setTerminado] = useState(false)
  const foto = useRef(null)

  useEffect(() => {
    if (!visible) return
    if (window.scrollY > 0) {
      setVisible(false)
      return
    }
    yaSeMostro = true
    // La imagen puede terminar de cargar antes de que React tome la página.
    if (foto.current?.complete) setImagenLista(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!visible) return
    const subir = () => setSubiendo(true)
    const temporizador = imagenLista ? setTimeout(subir, demora) : null
    window.addEventListener('scroll', subir, { once: true })

    return () => {
      clearTimeout(temporizador)
      window.removeEventListener('scroll', subir)
    }
  }, [visible, imagenLista, demora])

  if (!visible || terminado) return null

  return (
    <div
      aria-hidden="true"
      className="position-fixed top-0 start-0 w-100 vh-100 overflow-hidden bg-dark shadow-lg"
      style={{
        zIndex: 1060,
        transform: subiendo ? 'translateY(-100%)' : 'none',
        transition: `transform ${duracion}ms ease-in-out`,
      }}
      onTransitionEnd={() => setTerminado(true)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={foto}
        src={imagen}
        alt=""
        onLoad={() => setImagenLista(true)}
        onError={() => setSubiendo(true)}
        className="w-100 h-100 object-fit-cover"
        style={{ transform: 'scale(1.13)' }}
      />
    </div>
  )
}

export default Telon
