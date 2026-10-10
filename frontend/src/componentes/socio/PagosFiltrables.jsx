'use client'

import { useState } from 'react'
import { Row, Col, Form, Button, Pagination, Collapse, Badge, CloseButton } from 'react-bootstrap'
import TablaPagos from './TablaPagos'
import { columnasPagos, describirFiltro, filtrarPagos, filtroInicial, opcionesDe, ordenarPagos } from '../../utilidades/pagos'
import { descargarEstadoCuenta } from '../../utilidades/pdf'

const ordenesRapidos = [
  { etiqueta: 'Más recientes primero', campo: 'id', asc: false },
  { etiqueta: 'Más antiguos primero', campo: 'id', asc: true },
  { etiqueta: 'Pendientes primero', campo: 'estado', asc: false },
  { etiqueta: 'Monto: mayor a menor', campo: 'monto', asc: false },
  { etiqueta: 'Monto: menor a mayor', campo: 'monto', asc: true },
  { etiqueta: 'Medio de pago (A-Z)', campo: 'medio', asc: true },
  { etiqueta: 'Concepto (A-Z)', campo: 'concepto', asc: true },
]

function Filtro({ id, etiqueta, valor, opciones, onCambiar }) {
  return (
    <Form.Group controlId={id}>
      <Form.Label className="small fw-semibold mb-1">{etiqueta}</Form.Label>
      <Form.Select size="sm" value={valor} onChange={(e) => onCambiar(e.target.value)}>
        <option value="">Todos</option>
        {opciones.map((opcion) => (
          <option key={opcion}>{opcion}</option>
        ))}
      </Form.Select>
    </Form.Group>
  )
}

const nombresFiltro = { anio: 'Año', estado: 'Estado', medio: 'Medio', concepto: 'Concepto' }

function PagosFiltrables({ socio, porPagina = 12 }) {
  const [abierto, setAbierto] = useState(false)
  const [filtro, setFiltro] = useState(filtroInicial)
  const [orden, setOrden] = useState({ campo: 'id', asc: false })
  const [pagina, setPagina] = useState(1)
  const [descargando, setDescargando] = useState(false)

  const filtrados = ordenarPagos(filtrarPagos(socio.pagos, filtro), orden)
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina))
  const visibles = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina)

  const cambiarFiltro = (campo) => (valor) => {
    setFiltro((actual) => ({ ...actual, [campo]: valor }))
    setPagina(1)
  }
  const ordenar = (campo) =>
    setOrden((actual) => ({
      campo,
      asc: actual.campo === campo ? !actual.asc : true,
    }))
  const ordenRapido = ordenesRapidos.findIndex((o) => o.campo === orden.campo && o.asc === orden.asc)
  const activos = Object.entries(filtro).filter(([, valor]) => valor)

  const descargar = async () => {
    setDescargando(true)
    await descargarEstadoCuenta(socio, filtrados, describirFiltro(filtro))
    setDescargando(false)
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <Button
          variant={abierto || activos.length ? 'primary' : 'outline-secondary'}
          className="rounded-pill px-4 fw-bold text-uppercase d-inline-flex align-items-center gap-2"
          onClick={() => setAbierto(!abierto)}
          aria-expanded={abierto}
          aria-controls="panel-filtros"
        >
          Filtrar
          {activos.length > 0 && (
            <Badge bg="light" text="dark" pill>
              {activos.length}
            </Badge>
          )}
        </Button>

        {activos.map(([campo, valor]) => (
          <Badge key={campo} bg="secondary" pill className="d-inline-flex align-items-center gap-2 py-2 px-3 fw-normal">
            {nombresFiltro[campo]}: <strong>{valor}</strong>
            <CloseButton
              variant="white"
              aria-label={`Quitar filtro ${nombresFiltro[campo]}`}
              onClick={() => cambiarFiltro(campo)('')}
              style={{ fontSize: '0.6rem' }}
            />
          </Badge>
        ))}

        <Button
          size="sm"
          variant="secondary"
          className="ms-auto rounded-pill d-inline-flex align-items-center gap-2"
          onClick={descargar}
          disabled={descargando || filtrados.length === 0}
        >
          {descargando ? 'Generando…' : 'Descargar estado de cuenta'}
        </Button>
      </div>

      <Collapse in={abierto}>
        <div id="panel-filtros">
          <div className="bg-body-tertiary rounded-4 p-3 mb-3">
            <Row className="g-2 align-items-end">
              <Col xs={6} md>
                <Filtro id="filtro-anio" etiqueta="Año" valor={filtro.anio} opciones={opcionesDe(socio.pagos, 'anio')} onCambiar={cambiarFiltro('anio')} />
              </Col>
              <Col xs={6} md>
                <Filtro id="filtro-estado" etiqueta="Estado" valor={filtro.estado} opciones={['Aprobado', 'Pendiente', 'Vencido', 'En revisión']} onCambiar={cambiarFiltro('estado')} />
              </Col>
              <Col xs={6} md>
                <Filtro
                  id="filtro-medio"
                  etiqueta="Medio de pago"
                  valor={filtro.medio}
                  opciones={opcionesDe(socio.pagos, 'medio')}
                  onCambiar={cambiarFiltro('medio')}
                />
              </Col>
              <Col xs={6} md>
                <Filtro
                  id="filtro-concepto"
                  etiqueta="Concepto"
                  valor={filtro.concepto}
                  opciones={opcionesDe(socio.pagos, 'concepto')}
                  onCambiar={cambiarFiltro('concepto')}
                />
              </Col>
              <Col xs={12} md>
                <Form.Group controlId="filtro-orden">
                  <Form.Label className="small fw-semibold mb-1">Ordenar por</Form.Label>
                  <Form.Select size="sm" value={ordenRapido} onChange={(e) => setOrden(ordenesRapidos[e.target.value])}>
                    {ordenRapido === -1 && (
                      <option value={-1}>
                        {columnasPagos.find((c) => c.id === orden.campo).etiqueta} ({orden.asc ? 'A-Z' : 'Z-A'})
                      </option>
                    )}
                    {ordenesRapidos.map((o, i) => (
                      <option key={o.etiqueta} value={i}>
                        {o.etiqueta}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>
        </div>
      </Collapse>

      <div className="d-flex flex-wrap align-items-center gap-2 mb-2 small">
        <span className="text-body-secondary">
          {filtrados.length} {filtrados.length === 1 ? 'movimiento' : 'movimientos'} · {describirFiltro(filtro)}
        </span>
        {activos.length > 0 && (
          <Button size="sm" variant="link" className="p-0" onClick={() => setFiltro(filtroInicial)}>
            Limpiar filtros
          </Button>
        )}
      </div>

      <TablaPagos pagos={visibles} orden={orden} onOrdenar={ordenar} />

      {totalPaginas > 1 && (
        <Pagination size="sm" className="justify-content-center mt-3 mb-0 flex-wrap">
          <Pagination.Prev disabled={pagina === 1} onClick={() => setPagina(pagina - 1)} />
          {Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 2)
            .map((n) => (
              <Pagination.Item key={n} active={n === pagina} onClick={() => setPagina(n)}>
                {n}
              </Pagination.Item>
            ))}
          <Pagination.Next disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)} />
        </Pagination>
      )}
    </>
  )
}

export default PagosFiltrables
