'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Offcanvas, CloseButton } from 'react-bootstrap';
import { FaIdCard, FaFileInvoiceDollar, FaUserCog, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { useAuth } from '@/contextos/AuthContexto';
import { iniciales } from '@/utilidades/formato';
import { confirmarSalida } from '@/utilidades/alertas';
import { InterruptorTema } from './InterruptorTema';

interface Enlace {
  href: string;
  etiqueta: string;
  icono: IconType;
}

const ENLACES_SOCIO: Enlace[] = [
  { href: '/mi-carnet', etiqueta: 'Mi carnet', icono: FaIdCard },
  { href: '/pagos', etiqueta: 'Cuota social', icono: FaFileInvoiceDollar },
  { href: '/mi-perfil', etiqueta: 'Mi cuenta', icono: FaUserCog },
];

const ENLACE_ADMIN: Enlace = { href: '/admin', etiqueta: 'Administración', icono: FaShieldAlt };

interface Props {
  mostrar: boolean;
  onCerrar: () => void;
}

export function BarraLateral({ mostrar, onCerrar }: Props) {
  const rutaActual = usePathname();
  const { usuario, cerrarSesion } = useAuth();

  const enlaces = usuario && usuario.rol !== 'socio' ? [...ENLACES_SOCIO, ENLACE_ADMIN] : ENLACES_SOCIO;
  const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : '';

  async function salir() {
    onCerrar();
    if (await confirmarSalida()) cerrarSesion();
  }

  return (
    <Offcanvas
      show={mostrar}
      onHide={onCerrar}
      responsive="lg"
      placement="start"
      className="fondo-nocturno text-white border-0"
      style={{ width: 272 }}
    >
      <Offcanvas.Body className="fondo-nocturno d-flex flex-column p-0 w-100 min-vh-100 position-relative">
        <CloseButton
          variant="white"
          aria-label="Cerrar menú"
          onClick={onCerrar}
          className="d-lg-none position-absolute top-0 end-0 m-3"
        />

        <div className="d-flex align-items-center gap-2 px-4 pt-4 pb-3">
          <img src="/logo.png" alt="" width={34} height={34} className="object-fit-contain" />
          <span className="font-credencial fw-bold text-uppercase lh-1" style={{ letterSpacing: '0.12em', fontSize: '0.8rem' }}>
            Club
            <br />
            Deportivo
          </span>
        </div>

        <div className="d-flex align-items-center gap-3 mx-3 mb-2 p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center font-credencial fw-bold border border-2 border-warning"
            style={{ width: 46, height: 46, background: 'linear-gradient(135deg, #d7263d, #7a0f2e)' }}
            aria-hidden="true"
          >
            {iniciales(nombreCompleto)}
          </div>
          <div className="text-break lh-sm">
            <div className="fw-semibold">{nombreCompleto}</div>
            <small className="text-white-50 font-numeros">Socio N.º {usuario?.idSocio}</small>
          </div>
        </div>

        <nav className="flex-grow-1 py-2" aria-label="Secciones del portal">
          {enlaces.map(({ href, etiqueta, icono: Icono }) => {
            const activo = rutaActual === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onCerrar}
                aria-current={activo ? 'page' : undefined}
                className={`barra-enlace ${activo ? 'activo' : ''}`}
              >
                <Icono aria-hidden="true" />
                <span>{etiqueta}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4 pt-3 border-top border-light border-opacity-10 d-flex flex-column gap-3">
          <InterruptorTema />
          <button
            type="button"
            onClick={salir}
            className="btn btn-outline-light rounded-pill d-inline-flex align-items-center justify-content-center gap-2"
          >
            <FaSignOutAlt aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
