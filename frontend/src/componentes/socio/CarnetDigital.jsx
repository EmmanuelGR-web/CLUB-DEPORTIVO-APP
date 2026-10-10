'use client'

import { useState } from 'react'
import { Image } from 'react-bootstrap'
import { QRCodeCanvas } from 'qrcode.react'
import { categorias } from '../../utilidades/categorias'
import { barrasCarnet, idQrCarnet, textoQr } from '../../utilidades/carnet'

const iniciales = (nombre) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()

const formaEscudo = 'polygon(50% 0%, 100% 12%, 100% 62%, 50% 100%, 0% 62%, 0% 12%)'

function Retrato({ foto, nombre, degradado }) {
  return (
    <div className="flex-shrink-0 p-1 shadow" style={{ width: 104, height: 128, clipPath: formaEscudo, backgroundImage: degradado }}>
      <div className="w-100 h-100 bg-white p-1" style={{ clipPath: formaEscudo }}>
        <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center" style={{ clipPath: formaEscudo }}>
          {foto ? (
            <img src={foto} alt={`Foto de ${nombre}`} className="w-100 h-100 object-fit-cover" />
          ) : (
            <span className="font-credencial fw-bold fs-2 text-white">{iniciales(nombre)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function Dato({ etiqueta, valor, numerico }) {
  return (
    <div className="lh-1 mb-2">
      <div className="text-uppercase text-body-secondary fw-semibold" style={{ fontSize: '0.62rem', letterSpacing: '0.12em' }}>
        {etiqueta}
      </div>
      <div className={`fw-bold text-uppercase text-dark ${numerico ? 'font-numeros' : ''}`}>{valor}</div>
    </div>
  )
}

function CarnetDigital({ socio }) {
  const estilo = categorias[socio.categoria]
  const [inclinacion, setInclinacion] = useState({ x: 0, y: 0, brillo: 50, activo: false })

  const mover = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setInclinacion({ x: (0.5 - py) * 10, y: (px - 0.5) * 14, brillo: px * 100, activo: true })
  }
  const soltar = () => setInclinacion({ x: 0, y: 0, brillo: 50, activo: false })

  return (
    <div style={{ perspective: 1000 }}>
      <article
        className="font-credencial position-relative bg-white rounded-4 shadow-lg overflow-hidden"
        data-bs-theme="light"
        aria-label="Carnet digital de socio"
        onPointerMove={mover}
        onPointerLeave={soltar}
        style={{
          transform: `rotateX(${inclinacion.x}deg) rotateY(${inclinacion.y}deg)`,
          transition: inclinacion.activo ? 'transform 60ms linear' : 'transform 500ms ease',
        }}
      >
        <header className={`position-relative d-flex align-items-center justify-content-between px-4 py-2 text-${estilo.texto}`} style={{ backgroundImage: estilo.degradado }}>
          <div className="lh-1">
            <div className="fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.25em' }}>
              Socio {socio.categoria}
            </div>
            <div className="font-numeros fw-bold fs-5 mt-1">N° {socio.numeroSocio}</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-uppercase fw-bold text-end lh-1 d-none d-sm-block" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
              Club
              <br />
              Deportivo
            </span>
            <Image src="/logo.png" alt="Escudo del club" width={50} height={50} className="object-fit-cover" />
          </div>
        </header>

        <div className="position-relative">
          <img src="/revista/tapa.jpeg" alt="" className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75" />

          <div className="position-relative d-flex flex-wrap align-items-center gap-3 p-3 p-sm-4">
            <Retrato foto={socio.foto} nombre={socio.nombreCompleto} degradado={estilo.degradado} />

            <div className="flex-grow-1 text-break" style={{ minWidth: 150 }}>
              <Dato etiqueta="Nombre" valor={socio.nombreCompleto} />
              <Dato etiqueta="DNI" valor={socio.dni} numerico />
              <div className="d-flex gap-4">
                <Dato etiqueta="Ingreso" valor={socio.anioIngreso} numerico />
                <Dato etiqueta="Estado" valor={socio.estado} />
              </div>
            </div>

            <div className="flex-shrink-0 mx-auto mx-sm-0 bg-white p-2 rounded-3 shadow-sm">
              <QRCodeCanvas id={idQrCarnet} value={textoQr(socio)} size={84} marginSize={0} aria-label="Código QR del carnet" />
            </div>
          </div>

          <div className="position-relative px-3 pb-3">
            <div className="d-flex overflow-hidden rounded-1" style={{ height: 32 }} aria-hidden="true">
              {barrasCarnet(socio.numeroSocio).map((barra, i) => (
                <span key={i} className={`h-100 bg-${barra.color}`} style={{ flexGrow: barra.ancho }} />
              ))}
            </div>
            <p className="font-numeros small text-center text-body-secondary mb-0 mt-1" style={{ letterSpacing: '0.35em' }}>
              {socio.numeroSocio}
            </p>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="position-absolute top-0 start-0 w-100 h-100 pe-none"
          style={{
            mixBlendMode: 'overlay',
            opacity: inclinacion.activo ? 0.55 : 0.2,
            transition: 'opacity 300ms ease',
            backgroundImage: `linear-gradient(115deg, transparent ${inclinacion.brillo - 35}%, rgba(255, 0, 128, 0.6) ${inclinacion.brillo - 15}%, rgba(0, 220, 255, 0.6) ${inclinacion.brillo}%, rgba(255, 230, 0, 0.6) ${inclinacion.brillo + 15}%, transparent ${inclinacion.brillo + 35}%)`,
          }}
        />
      </article>
    </div>
  )
}

export default CarnetDigital
