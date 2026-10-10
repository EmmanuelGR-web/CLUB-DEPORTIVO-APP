import { Badge, ProgressBar } from 'react-bootstrap';
import { Carnet } from '@/tipos';
import { CATEGORIAS, estiloCategoria, proximaCategoria } from '@/utilidades/categorias';
import { Seccion } from './Seccion';

export function EstadoMembresia({ carnet }: { carnet: Carnet }) {
  const estilo = estiloCategoria(carnet.categoria);
  const proxima = proximaCategoria(carnet.antiguedadAnios);
  // Avance dentro del tramo actual (Bronce 0–5, Plata 5–15).
  const avance = proxima
    ? carnet.antiguedadAnios < 5
      ? (carnet.antiguedadAnios / 5) * 100
      : ((carnet.antiguedadAnios - 5) / 10) * 100
    : 100;

  const filas: [string, React.ReactNode][] = [
    [
      'Estado',
      <Badge key="estado" pill bg={carnet.socioActivo ? 'success' : 'danger'} className="px-3 py-2">
        {carnet.socioActivo ? 'Activo' : 'Inactivo'}
      </Badge>,
    ],
    [
      'Categoría',
      <span key="categoria" className={`badge rounded-pill px-3 py-2 text-${estilo.texto}`} style={{ backgroundImage: estilo.degradado }}>
        {carnet.categoria}
      </span>,
    ],
    ['Antigüedad', `${carnet.antiguedadAnios} ${carnet.antiguedadAnios === 1 ? 'año' : 'años'}`],
    ['N.º de socio', <span key="numero" className="font-numeros">{carnet.idSocio}</span>],
  ];

  return (
    <Seccion titulo="Estado de membresía" className="h-100">
      <dl className="mb-0">
        {filas.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="d-flex justify-content-between align-items-center border-bottom py-2">
            <dt className="fw-normal text-body-secondary">{etiqueta}</dt>
            <dd className="fw-semibold mb-0 text-end">{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <div className="d-flex justify-content-between small mb-1">
          <span className="text-body-secondary">{proxima ? `Camino a socio ${proxima.nombre}` : 'Categoría máxima'}</span>
          {proxima && (
            <span className="fw-semibold">
              {proxima.faltan === 1 ? 'Falta 1 año' : `Faltan ${proxima.faltan} años`}
            </span>
          )}
        </div>
        <ProgressBar now={avance} variant="warning" style={{ height: 8 }} aria-label="Avance hacia la próxima categoría" />
      </div>

      <p className="small text-body-secondary mt-3 mb-0">
        {Object.entries(CATEGORIAS)
          .map(([nombre, { rango }]) => `${nombre}: ${rango}`)
          .join(' · ')}
      </p>
    </Seccion>
  );
}
