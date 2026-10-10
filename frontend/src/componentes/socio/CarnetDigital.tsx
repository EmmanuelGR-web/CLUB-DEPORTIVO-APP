'use client';

import { PointerEvent, useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import { Carnet } from '@/tipos';
import { estiloCategoria } from '@/utilidades/categorias';
import { iniciales } from '@/utilidades/formato';

// Silueta de escudo para la foto, igual que en la credencial impresa.
const FORMA_ESCUDO = 'polygon(50% 0%, 100% 12%, 100% 62%, 50% 100%, 0% 62%, 0% 12%)';

function Retrato({ foto, nombre, degradado }: { foto: string | null; nombre: string; degradado: string }) {
  return (
    <div className="flex-shrink-0 p-1 shadow" style={{ width: 104, height: 128, clipPath: FORMA_ESCUDO, backgroundImage: degradado }}>
      <div className="w-100 h-100 bg-white p-1" style={{ clipPath: FORMA_ESCUDO }}>
        <div className="w-100 h-100 bg-secondary d-flex align-items-center justify-content-center" style={{ clipPath: FORMA_ESCUDO }}>
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt={`Foto de ${nombre}`} className="w-100 h-100 object-fit-cover" />
          ) : (
            <span className="font-credencial fw-bold fs-2 text-white">{iniciales(nombre)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor, numerico }: { etiqueta: string; valor: string; numerico?: boolean }) {
  return (
    <div className="lh-1 mb-2">
      <div className="text-uppercase fw-semibold" style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: '#6b6475' }}>
        {etiqueta}
      </div>
      <div className={`fw-bold text-uppercase ${numerico ? 'font-numeros' : ''}`} style={{ color: '#1e1b24' }}>
        {valor}
      </div>
    </div>
  );
}

export function CarnetDigital({ carnet }: { carnet: Carnet }) {
  const estilo = estiloCategoria(carnet.categoria);
  const refCodigo = useRef<SVGSVGElement>(null);
  const [inclinacion, setInclinacion] = useState({ x: 0, y: 0, brillo: 50, activo: false });

  // JsBarcode dibuja directo sobre el <svg>, por eso va en un efecto.
  useEffect(() => {
    if (!refCodigo.current) return;
    JsBarcode(refCodigo.current, carnet.codigoBarras, {
      format: 'CODE128',
      width: 2,
      height: 44,
      margin: 0,
      displayValue: false,
      background: 'transparent',
      lineColor: '#1e1b24',
    });
  }, [carnet.codigoBarras]);

  function mover(evento: PointerEvent<HTMLElement>) {
    if (evento.pointerType !== 'mouse') return;
    const caja = evento.currentTarget.getBoundingClientRect();
    const px = (evento.clientX - caja.left) / caja.width;
    const py = (evento.clientY - caja.top) / caja.height;
    setInclinacion({ x: (0.5 - py) * 9, y: (px - 0.5) * 12, brillo: px * 100, activo: true });
  }

  const soltar = () => setInclinacion({ x: 0, y: 0, brillo: 50, activo: false });

  return (
    <div style={{ perspective: 1100 }}>
      <article
        className="carnet font-credencial position-relative bg-white rounded-4 shadow-lg overflow-hidden"
        aria-label="Carnet digital de socio"
        onPointerMove={mover}
        onPointerLeave={soltar}
        style={{
          transform: `rotateX(${inclinacion.x}deg) rotateY(${inclinacion.y}deg)`,
          transition: inclinacion.activo ? 'transform 60ms linear' : 'transform 500ms ease',
        }}
      >
        <header
          className={`d-flex align-items-center justify-content-between px-4 py-2 text-${estilo.texto}`}
          style={{ backgroundImage: estilo.degradado }}
        >
          <div className="lh-1">
            <div className="fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.25em' }}>
              Socio {carnet.categoria}
            </div>
            <div className="font-numeros fw-bold fs-5 mt-1">N.º {carnet.idSocio}</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-uppercase fw-bold text-end lh-1 d-none d-sm-block" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
              Club
              <br />
              Deportivo
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Escudo del club" width={48} height={48} className="object-fit-contain" />
          </div>
        </header>

        <div className="carnet-fondo position-relative" style={{ backgroundImage: "url('/fondo.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="position-relative d-flex flex-wrap align-items-center gap-3 p-3 p-sm-4" style={{ zIndex: 1 }}>
            <Retrato foto={carnet.fotoCarnetUrl} nombre={carnet.nombreCompleto} degradado={estilo.degradado} />

            <div className="flex-grow-1 text-break" style={{ minWidth: 150 }}>
              <Dato etiqueta="Nombre" valor={carnet.nombreCompleto} />
              <div className="d-flex gap-4">
                <Dato etiqueta="Antigüedad" valor={`${carnet.antiguedadAnios} ${carnet.antiguedadAnios === 1 ? 'año' : 'años'}`} />
                <Dato etiqueta="Estado" valor={carnet.socioActivo ? 'Activo' : 'Inactivo'} />
              </div>
            </div>

            <div className="flex-shrink-0 mx-auto mx-sm-0 bg-white p-2 rounded-3 shadow-sm">
              <QRCodeSVG value={carnet.codigoBarras} size={84} marginSize={0} fgColor="#1e1b24" aria-label="Código QR del carnet" />
            </div>
          </div>

          <div className="carnet-codigo position-relative px-4 pb-3" style={{ zIndex: 1 }}>
            <svg ref={refCodigo} aria-hidden="true" />
            <p className="font-numeros small text-center mb-0 mt-1" style={{ letterSpacing: '0.35em', color: '#6b6475' }}>
              {carnet.codigoBarras}
            </p>
          </div>
        </div>

        {/* Reflejo tornasolado que sigue al mouse, como un holograma */}
        <div
          aria-hidden="true"
          className="position-absolute top-0 start-0 w-100 h-100 pe-none"
          style={{
            zIndex: 2,
            mixBlendMode: 'overlay',
            opacity: inclinacion.activo ? 0.55 : 0.18,
            transition: 'opacity 300ms ease',
            backgroundImage: `linear-gradient(115deg, transparent ${inclinacion.brillo - 35}%, rgba(255, 0, 128, 0.6) ${inclinacion.brillo - 15}%, rgba(0, 220, 255, 0.6) ${inclinacion.brillo}%, rgba(255, 230, 0, 0.6) ${inclinacion.brillo + 15}%, transparent ${inclinacion.brillo + 35}%)`,
          }}
        />
      </article>
    </div>
  );
}
