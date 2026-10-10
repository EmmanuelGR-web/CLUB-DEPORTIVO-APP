'use client'

import { useState } from 'react'
import { Row, Col, Form, Button, Table } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import EstadoBadge from '../comun/EstadoBadge'
import Indicador from '../empleado/Indicador'
import ResumenEconomico from './ResumenEconomico'
import { formatearPesos } from '../../utilidades/carnet'
import { cuotas as textoCuotas, evolucionIngresos, nombrePeriodo, periodoDe, resumenEconomico, ultimosPeriodos } from '../../utilidades/finanzas'
import { categorias } from '../../utilidades/categorias'
import Adjunto from '../comun/Adjunto'

const ordenEstados = { Vencido: 0, Pendiente: 1, 'En revisión': 2, Aprobado: 3 }

function Facturacion({ perfiles, autor, onAbrirFicha }) {
  const [periodo, setPeriodo] = useState(() => periodoDe())
  const [mostrarResumen, setMostrarResumen] = useState(false)
  const resumen = resumenEconomico(perfiles, periodo)
  const evolucion = evolucionIngresos(perfiles)
  const cuotas = [...resumen.cuotas].sort((a, b) => ordenEstados[a.pago.estado] - ordenEstados[b.pago.estado])

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <Form.Label htmlFor="periodo-facturacion" className="small fw-semibold mb-0">
          Período
        </Form.Label>
        <Form.Select id="periodo-facturacion" className="w-auto" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          {ultimosPeriodos(12).map((p) => (
            <option key={p} value={p}>
              {nombrePeriodo(p)}
            </option>
          ))}
        </Form.Select>
        <Button variant="secondary" className="rounded-pill px-4 ms-sm-auto fw-bold text-uppercase" onClick={() => setMostrarResumen(true)}>
          Resumen económico
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <Indicador valor={formatearPesos(resumen.ingresos)} etiqueta="Cobrado" detalle={`${textoCuotas(resumen.alDia)} pagadas`} destacado tamano="2.2rem" onClick={() => setMostrarResumen(true)} />
        </Col>
        <Col sm={6} xl={3}>
          <Indicador valor={formatearPesos(resumen.impago)} etiqueta="Por cobrar" detalle={`${textoCuotas(resumen.cantidadImpagas)} sin pagar`} tamano="2.2rem" onClick={() => setMostrarResumen(true)} />
        </Col>
        <Col sm={6} xl={3}>
          <Indicador valor={resumen.morosos.length} etiqueta="Socios morosos" detalle="Con la cuota vencida" tamano="2.2rem" onClick={() => setMostrarResumen(true)} />
        </Col>
        <Col sm={6} xl={3}>
          <Indicador valor={`${resumen.cobranza} %`} etiqueta="Cobranza" detalle={`${resumen.activos} socios activos`} tamano="2.2rem" onClick={() => setMostrarResumen(true)} />
        </Col>
      </Row>

      <Tarjeta titulo={`Cuotas de ${nombrePeriodo(periodo).toLowerCase()}`}>
        <ul className="list-unstyled d-lg-none mb-0">
          {cuotas.length === 0 && <li className="text-center text-body-secondary py-4">No hay cuotas en este período.</li>}
          {cuotas.map(({ perfil, pago }) => (
            <li key={perfil.id} className="border-bottom py-3">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div style={{ minWidth: 0 }}>
                  <div className="fw-semibold">{perfil.nombreCompleto}</div>
                  <div className="small text-body-secondary">
                    <span className="font-numeros">N° {perfil.numeroSocio}</span> · {pago.medio}
                  </div>
                </div>
                <div className="text-end flex-shrink-0">
                  <div className="font-numeros fw-bold">{formatearPesos(pago.monto)}</div>
                  <EstadoBadge estado={pago.estado} />
                </div>
              </div>
              {pago.recargo > 0 && <div className="small text-primary">Incluye {formatearPesos(pago.recargo)} de recargo</div>}
              <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                <span className={`badge rounded-pill text-${categorias[perfil.categoria].texto}`} style={{ backgroundImage: categorias[perfil.categoria].degradado }}>
                  {perfil.categoria}
                </span>
                {pago.comprobante && <Adjunto archivo={pago.comprobante} texto="Ver comprobante" className="small link-secondary" />}
                {pago.informe?.verificacionIA?.leido && (
                  <span className={`small ${pago.informe.verificacionIA.coincideMonto ? 'text-success' : 'text-danger'}`}>
                    IA: {pago.informe.verificacionIA.coincideMonto ? 'monto coincide' : 'monto no coincide'}
                  </span>
                )}
                <Button size="sm" variant="outline-secondary" className="rounded-pill px-3 ms-auto" onClick={() => onAbrirFicha(perfil.id)}>
                  Ver ficha
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <Table responsive hover className="align-middle mb-0 d-none d-lg-table">
          <thead>
            <tr className="text-uppercase small">
              <th scope="col">Socio</th>
              <th scope="col">Categoría</th>
              <th scope="col">Medio</th>
              <th scope="col" className="text-end">
                Importe
              </th>
              <th scope="col">Estado</th>
              <th scope="col" className="text-end">
                Ficha
              </th>
            </tr>
          </thead>
          <tbody>
            {cuotas.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-body-secondary py-4">
                  No hay cuotas en este período.
                </td>
              </tr>
            )}
            {cuotas.map(({ perfil, pago }) => (
              <tr key={perfil.id}>
                <td>
                  <div className="fw-semibold">{perfil.nombreCompleto}</div>
                  <div className="small text-body-secondary font-numeros">N° {perfil.numeroSocio}</div>
                </td>
                <td>
                  <span className={`badge rounded-pill text-${categorias[perfil.categoria].texto}`} style={{ backgroundImage: categorias[perfil.categoria].degradado }}>
                    {perfil.categoria}
                  </span>
                </td>
                <td className="text-nowrap">{pago.medio}</td>
                <td className="text-end text-nowrap font-numeros">
                  {formatearPesos(pago.monto)}
                  {pago.recargo > 0 && <div className="small text-primary">+ {formatearPesos(pago.recargo)} de recargo</div>}
                </td>
                <td>
                  <EstadoBadge estado={pago.estado} />
                  {pago.comprobante && <Adjunto archivo={pago.comprobante} texto="Ver comprobante" className="d-block small link-secondary mt-1" />}
                  {pago.informe?.verificacionIA?.leido && (
                    <div className={`small ${pago.informe.verificacionIA.coincideMonto ? 'text-success' : 'text-danger'}`}>
                      IA: {pago.informe.verificacionIA.coincideMonto ? 'monto coincide' : 'monto no coincide'}
                    </div>
                  )}
                </td>
                <td className="text-end">
                  <Button size="sm" variant="outline-secondary" className="rounded-pill px-3 text-nowrap" onClick={() => onAbrirFicha(perfil.id)}>
                    Ver ficha
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Tarjeta>

      <ResumenEconomico resumen={resumen} evolucion={evolucion} autor={autor} mostrar={mostrarResumen} onCerrar={() => setMostrarResumen(false)} />
    </>
  )
}

export default Facturacion
