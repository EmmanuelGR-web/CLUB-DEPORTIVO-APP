import { Button, Spinner } from 'react-bootstrap';

interface Props {
  texto?: string;
  error?: string;
  onReintentar?: () => void;
}

export function Cargando({ texto = 'Cargando…', error, onReintentar }: Props) {
  if (error) {
    return (
      <div className="superficie p-5 text-center">
        <p className="fw-semibold mb-1">No pudimos cargar esta sección</p>
        <p className="text-body-secondary small mb-3">{error}</p>
        {onReintentar && (
          <Button variant="secondary" className="rounded-pill px-4" onClick={onReintentar}>
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center gap-3 py-5 text-body-secondary" role="status">
      <Spinner animation="border" variant="primary" size="sm" />
      <span>{texto}</span>
    </div>
  );
}
