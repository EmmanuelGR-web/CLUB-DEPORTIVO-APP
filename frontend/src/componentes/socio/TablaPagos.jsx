'use client'

import { Table } from 'react-bootstrap'
import EstadoBadge from '../comun/EstadoBadge'
import Adjunto from '../comun/Adjunto'
import { formatearPesos } from '../../utilidades/carnet'
import { columnasPagos } from '../../utilidades/pagos'

function Encabezado({ columna, orden, onOrdenar }) {
  if (!onOrdenar) return <th scope="col">{columna.etiqueta}</th>
  const activa = orden.campo === columna.id
  return (
    <th scope="col" aria-sort={activa ? (orden.asc ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="btn btn-link p-0 text-reset text-decoration-none fw-bold text-uppercase small d-inline-flex align-items-center gap-1" onClick={() => onOrdenar(columna.id)}>
        {columna.etiqueta}
        <span className={activa ? 'text-primary' : 'text-body-tertiary'} aria-hidden="true">
          {activa ? (orden.asc ? '↑' : '↓') : '↕'}
        </span>
      </button>
    </th>
  )
}

function Recargo({ pago }) {
  if (!(pago.recargo > 0)) return null
  return (
    <div className="small text-danger">
      Incluye {formatearPesos(pago.recargo)} de recargo ({pago.diasDemora} {pago.diasDemora === 1 ? 'día' : 'días'})
    </div>
  )
}

function TablaPagos({ pagos, orden, onOrdenar }) {
  return (
    <>
      <Table responsive hover className="align-middle mb-0 tabla-escritorio">
        <thead>
          <tr className="text-uppercase small">
            {columnasPagos.map((columna) => (
              <Encabezado key={columna.id} columna={columna} orden={orden} onOrdenar={onOrdenar} />
            ))}
          </tr>
        </thead>
        <tbody>
          {pagos.length === 0 && (
            <tr>
              <td colSpan={columnasPagos.length} className="text-center text-body-secondary py-4">
                No hay pagos que coincidan con el filtro.
              </td>
            </tr>
          )}
          {pagos.map((pago) => (
            <tr key={pago.id}>
              <td className="text-nowrap">{pago.fecha}</td>
              <td>{pago.concepto}</td>
              <td className="text-nowrap">{pago.medio}</td>
              <td className="text-nowrap">
                {formatearPesos(pago.monto)}
                <Recargo pago={pago} />
              </td>
              <td>
                <EstadoBadge estado={pago.estado} />
                {pago.comprobante && <Adjunto archivo={pago.comprobante} texto="Ver comprobante" className="d-block small link-secondary mt-1" />}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <ul className="list-unstyled mb-0 lista-celular">
        {pagos.length === 0 && <li className="text-center text-body-secondary py-4">No hay pagos que coincidan con el filtro.</li>}
        {pagos.map((pago) => (
          <li key={pago.id} className="border-bottom py-3">
            <div className="d-flex align-items-start justify-content-between gap-2">
              <div>
                <div className="fw-semibold">{pago.fecha}</div>
                <div className="small text-body-secondary">
                  {pago.concepto} · {pago.medio}
                </div>
              </div>
              <div className="text-end">
                <div className="fw-bold font-numeros">{formatearPesos(pago.monto)}</div>
                <EstadoBadge estado={pago.estado} />
              </div>
            </div>
            <Recargo pago={pago} />
            {pago.comprobante && <Adjunto archivo={pago.comprobante} texto="Ver comprobante" className="d-inline-block small link-secondary mt-1" />}
          </li>
        ))}
      </ul>
    </>
  )
}

export default TablaPagos
