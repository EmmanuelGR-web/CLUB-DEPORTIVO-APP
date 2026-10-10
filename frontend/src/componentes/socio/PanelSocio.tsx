'use client';

import { ReactNode, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import { BarraLateral } from './BarraLateral';

export function PanelSocio({ children }: { children: ReactNode }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="d-lg-flex min-vh-100">
      <div className="flex-shrink-0 barra-lateral-fija">
        <BarraLateral mostrar={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      </div>

      {/* En celular la barra lateral se esconde y queda esta franja arriba */}
      <div className="d-lg-none fondo-nocturno text-white d-flex align-items-center gap-3 px-3 py-2 sticky-top shadow-sm no-imprimir">
        <Button variant="link" className="text-white p-1" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
          <FaBars size={20} />
        </Button>
        <img src="/logo.png" alt="" width={28} height={28} className="object-fit-contain" />
        <span className="font-credencial fw-bold text-uppercase" style={{ letterSpacing: '0.12em', fontSize: '0.85rem' }}>
          Portal de socios
        </span>
      </div>

      <main className="flex-grow-1 p-3 p-md-4 p-xl-5" style={{ minWidth: 0 }}>
        <div className="mx-auto" style={{ maxWidth: 1180 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
