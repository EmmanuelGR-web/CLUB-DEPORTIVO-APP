import { ReactNode } from 'react';
import { InterruptorTema } from './InterruptorTema';

interface Props {
  titulo: string;
  bajada: string;
  ancho?: number;
  children: ReactNode;
}

// Marco común de ingreso y registro: foto del club con velo bordó a
// la izquierda (solo en pantallas grandes) y el formulario en vidrio.
export function PantallaAcceso({ titulo, bajada, ancho = 420, children }: Props) {
  return (
    <main className="min-vh-100 d-flex fondo-bordo text-white">
      <aside
        className="d-none d-lg-flex flex-column justify-content-between position-relative col-lg-5 col-xl-6 p-5 overflow-hidden"
        style={{ backgroundImage: "url('/fondo.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ background: 'linear-gradient(160deg, rgba(74,10,28,0.92) 0%, rgba(122,15,46,0.75) 55%, rgba(13,11,16,0.9) 100%)' }}
          aria-hidden="true"
        />
        <div className="position-relative d-flex align-items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={52} height={52} className="object-fit-contain" />
          <span className="font-credencial fw-bold text-uppercase lh-1" style={{ letterSpacing: '0.18em' }}>
            Club
            <br />
            Deportivo
          </span>
        </div>
        <div className="position-relative" style={{ maxWidth: 440 }}>
          <p className="etiqueta-mini text-warning mb-2">Portal de socios</p>
          <h2 className="font-credencial display-5 fw-bold text-uppercase lh-1 mb-3">Tu carnet, tus cuotas y tus beneficios.</h2>
          <p className="text-white-50 mb-0">Mostrá el carnet digital en la entrada, informá el pago de la cuota y descargá tus comprobantes desde el celular.</p>
        </div>
        <small className="position-relative text-white-50">© {new Date().getFullYear()} Club Deportivo · San Miguel de Tucumán</small>
      </aside>

      <section className="flex-grow-1 d-flex flex-column align-items-center justify-content-center px-3 py-5 position-relative">
        <div className="position-absolute top-0 end-0 p-3">
          <InterruptorTema />
        </div>

        <div className="vidrio w-100 p-4 p-sm-5" style={{ maxWidth: ancho }}>
          <div className="text-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Escudo del club" width={72} height={72} className="object-fit-contain mb-3 d-lg-none" />
            <h1 className="font-credencial fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.04em' }}>
              {titulo}
            </h1>
            <p className="text-white-50 mb-0">{bajada}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
