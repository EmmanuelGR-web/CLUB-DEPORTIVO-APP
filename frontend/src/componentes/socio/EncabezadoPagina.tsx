import { ReactNode } from 'react';

interface Props {
  titulo: string;
  bajada?: string;
  acciones?: ReactNode;
}

export function EncabezadoPagina({ titulo, bajada, acciones }: Props) {
  return (
    <header className="d-flex flex-wrap align-items-end gap-3 mb-4">
      <div className="me-auto">
        <h1 className="titulo-panel display-6 text-uppercase mb-0">{titulo}</h1>
        {bajada && <p className="text-body-secondary mb-0 mt-1">{bajada}</p>}
      </div>
      {acciones}
    </header>
  );
}
