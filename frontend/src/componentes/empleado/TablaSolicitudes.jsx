'use client'

import { Table, Button } from 'react-bootstrap'
import EstadoBadge from '../comun/EstadoBadge'

const fecha = (iso) => new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })

function BotonRevisar({ solicitud, onRevisar }) {
  const pendiente = solicitud.estado === 'Pendiente'
  return (
    <Button size="sm" variant={pendiente ? 'secondary' : 'outline-secondary'} className="rounded-pill px-3" onClick={() => onRevisar(solicitud)}>
      {pendiente ? 'Revisar' : 'Ver'}
    </Button>
  )
}

function TablaSolicitudes({ solicitudes, onRevisar }) {
  const vacia = <p className="text-center text-body-secondary py-4 mb-0">No hay solicitudes que coincidan con la búsqueda.</p>

  return (
    <>
      <ul className="list-unstyled d-md-none mb-0">
        {solicitudes.length === 0 && <li>{vacia}</li>}
        {solicitudes.map((s) => (
          <li key={s.id} className="border-bottom py-3 d-flex align-items-center gap-3">
            <div className="flex-grow-1">
              <div className="fw-semibold">{s.socioNombre}</div>
              <div className="small">{s.tipo}</div>
              <div className="small text-body-secondary mb-1">{fecha(s.fecha)}</div>
              <EstadoBadge estado={s.estado} />
            </div>
            <BotonRevisar solicitud={s} onRevisar={onRevisar} />
          </li>
        ))}
      </ul>

      <Table responsive hover className="align-middle mb-0 d-none d-md-table">
        <thead>
          <tr className="text-uppercase small">
            <th scope="col">Socio</th>
            <th scope="col">Solicitud</th>
            <th scope="col">Fecha</th>
            <th scope="col">Estado</th>
            <th scope="col" className="text-end">
              Acción
            </th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-body-secondary py-4">
                No hay solicitudes que coincidan con la búsqueda.
              </td>
            </tr>
          )}
          {solicitudes.map((s) => (
            <tr key={s.id}>
              <td>
                <div className="fw-semibold">{s.socioNombre}</div>
                {s.socioDni && <div className="small text-body-secondary">DNI {s.socioDni}</div>}
              </td>
              <td>{s.tipo}</td>
              <td className="text-nowrap">{fecha(s.fecha)}</td>
              <td>
                <EstadoBadge estado={s.estado} />
              </td>
              <td className="text-end">
                <BotonRevisar solicitud={s} onRevisar={onRevisar} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default TablaSolicitudes
