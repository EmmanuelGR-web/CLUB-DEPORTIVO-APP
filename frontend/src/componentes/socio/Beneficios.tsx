'use client';

import { useState } from 'react';
import { Badge, Modal } from 'react-bootstrap';
import { Beneficio } from '@/datos/beneficios';

function TarjetaBeneficio({ beneficio, copia, onAbrir }: { beneficio: Beneficio; copia: boolean; onAbrir: (b: Beneficio) => void }) {
  return (
    <button
      type="button"
      tabIndex={copia ? -1 : 0}
      aria-hidden={copia || undefined}
      aria-label={`Ver más sobre ${beneficio.titulo}`}
      onClick={() => onAbrir(beneficio)}
      className="beneficio d-flex flex-column justify-content-end flex-shrink-0 rounded-4 text-white text-start p-3 me-3 my-2 border border-light border-opacity-10 shadow-sm"
    >
      <h3 className="font-credencial h4 fw-bold text-uppercase lh-1 mb-2">{beneficio.titulo}</h3>
      <p className="fw-semibold mb-0 opacity-75">{beneficio.detalle}</p>
      <p className="beneficio-ver small fw-semibold text-warning mb-0 mt-3 border-top border-light border-opacity-25 pt-2">
        Ver condiciones
      </p>
    </button>
  );
}

export function Beneficios({ beneficios }: { beneficios: Beneficio[] }) {
  const [abierto, setAbierto] = useState<Beneficio | null>(null);
  const [mostrar, setMostrar] = useState(false);

  function abrir(beneficio: Beneficio) {
    setAbierto(beneficio);
    setMostrar(true);
  }

  return (
    <>
      {/* La lista se duplica para que la cinta pueda girar sin cortes */}
      <div className="cinta pt-2" style={{ ['--cinta-duracion' as string]: '38s' }}>
        <div className="cinta-pista">
          {[false, true].map((copia) =>
            beneficios.map((beneficio) => (
              <TarjetaBeneficio key={`${beneficio.id}-${copia}`} beneficio={beneficio} copia={copia} onAbrir={abrir} />
            )),
          )}
        </div>
      </div>

      <Modal show={mostrar} onHide={() => setMostrar(false)} centered contentClassName="border-0 rounded-4 overflow-hidden bg-transparent">
        {abierto && (
          <div className="fondo-bordo position-relative text-white p-4 p-md-5" style={{ minHeight: 340 }}>
            <button
              type="button"
              className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
              aria-label="Cerrar"
              onClick={() => setMostrar(false)}
            />
            <Badge bg="light" text="dark" pill className="mb-3">
              Beneficio para socios
            </Badge>
            <h2 className="font-credencial display-6 fw-bold text-uppercase mb-1">{abierto.titulo}</h2>
            <p className="fs-5 text-warning fw-semibold mb-3">{abierto.detalle}</p>
            <p className="mb-3" style={{ maxWidth: 420 }}>
              {abierto.descripcion}
            </p>
            <p className="small fw-semibold border-top border-light border-opacity-25 pt-3 mb-0">
              {abierto.extra} · Presentá tu carnet digital.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
