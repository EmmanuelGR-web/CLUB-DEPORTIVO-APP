import { ReactNode } from 'react';

interface Props {
  titulo?: string;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Seccion({ titulo, acciones, children, className = '' }: Props) {
  return (
    <section className={`superficie p-4 ${className}`}>
      {(titulo || acciones) && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          {titulo && <h2 className="tarjeta-titulo mb-0 me-auto">{titulo}</h2>}
          {acciones}
        </div>
      )}
      {children}
    </section>
  );
}
