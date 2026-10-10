'use client'

import { useState } from 'react'
import { Row, Col, Form, Button, Collapse, ButtonGroup, Badge } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import EstadoBadge from '../comun/EstadoBadge'
import { coincide } from '../../utilidades/texto'
import { esDelSocio, estadoPedido, tipoDeRegistro, tiposCambio, tituloSolicitud } from '../../utilidades/tiposCambio'

const diaLocal = (fecha) => fecha.toLocaleDateString('en-CA')
const hora = (iso) => new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
const autores = [
  { id: '', etiqueta: 'Todos' },
  { id: 'socio', etiqueta: 'Socios' },
  { id: 'personal', etiqueta: 'Personal' },
]

function Registro({ registro: r }) {
  const tipo = tipoDeRegistro(r)
  const delSocio = esDelSocio(r)
  const pedido = estadoPedido(r)

  return (
    <li className="d-flex gap-3 py-3 border-bottom">
      <div className="small text-body-secondary text-nowrap pt-1 flex-shrink-0" style={{ width: 72 }}>
        {hora(r.fecha)}
      </div>
      <div className="flex-grow-1">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
          <span className="small text-uppercase fw-semibold text-secondary" style={{ letterSpacing: '0.05em' }}>
            {tipo.etiqueta}
          </span>
          {pedido && <EstadoBadge estado={pedido} />}
        </div>
        <p className="mb-2">
          {delSocio ? (
            <>
              <strong>{r.socioNombre}</strong> {tipo.socio}
            </>
          ) : (
            <>
              <strong>{r.autor}</strong> {tipo.personal} <strong>{r.socioNombre}</strong>
              {tipo.id === 'solicitud' && <span className="text-body-secondary"> ({tituloSolicitud(r)})</span>}
            </>
          )}
        </p>
        <div className="bg-body-tertiary rounded-3 px-3 py-2 small">
          {r.cambios.map((c) => (
            <Row key={c.campo} className="g-2 py-1">
              <Col xs={12} sm={3} className="fw-semibold">
                {c.campo}
              </Col>
              <Col xs={6} sm={4} className="text-body-secondary text-break">
                <span className="d-block text-uppercase" style={{ fontSize: '0.7rem' }}>
                  Antes
                </span>
                {c.anterior || '—'}
              </Col>
              <Col xs={6} sm={5} className="text-break">
                <span className="d-block text-uppercase text-body-secondary" style={{ fontSize: '0.7rem' }}>
                  {pedido === 'Esperando aprobación' ? 'Pedido' : 'Ahora'}
                </span>
                <strong>{c.nuevo || '—'}</strong>
              </Col>
            </Row>
          ))}
        </div>
      </div>
    </li>
  )
}

function RegistroCambios({ registros }) {
  const [hoy] = useState(() => new Date())
  const [busqueda, setBusqueda] = useState('')
  const [tipo, setTipo] = useState('')
  const [autor, setAutor] = useState('')
  const [fechas, setFechas] = useState({ desde: '', hasta: '' })
  const [verFechas, setVerFechas] = useState(false)

  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  const nombreDia = (dia) => {
    if (dia === diaLocal(hoy)) return 'Hoy'
    if (dia === diaLocal(ayer)) return 'Ayer'
    const texto = new Date(`${dia}T12:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    return texto[0].toUpperCase() + texto.slice(1)
  }

  const cantidad = (id) => registros.filter((r) => tipoDeRegistro(r).id === id).length
  const filtrados = registros.filter((r) => {
    const dia = diaLocal(new Date(r.fecha))
    return (
      (!tipo || tipoDeRegistro(r).id === tipo) &&
      (!autor || (autor === 'socio') === esDelSocio(r)) &&
      (!fechas.desde || dia >= fechas.desde) &&
      (!fechas.hasta || dia <= fechas.hasta) &&
      coincide(`${r.socioNombre} ${r.autor} ${tipoDeRegistro(r).etiqueta} ${r.cambios.map((c) => `${c.campo} ${c.anterior} ${c.nuevo}`).join(' ')}`, busqueda)
    )
  })
  const porDia = Object.entries(
    filtrados.reduce((dias, r) => {
      const dia = diaLocal(new Date(r.fecha))
      return { ...dias, [dia]: [...(dias[dia] ?? []), r] }
    }, {}),
  )
  const elegido = tiposCambio.find((t) => t.id === tipo)
  const hayFiltros = tipo || autor || fechas.desde || fechas.hasta || busqueda

  return (
    <Tarjeta titulo="Registro de cambios">
      <div className="d-flex flex-wrap gap-2 mb-2" role="group" aria-label="Tipo de cambio">
        <Button size="sm" variant={tipo ? 'outline-secondary' : 'secondary'} className="rounded-pill px-3" onClick={() => setTipo('')}>
          Todos <span className="opacity-75 ms-1">{registros.length}</span>
        </Button>
        {tiposCambio
          .filter((t) => cantidad(t.id) > 0)
          .map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant={tipo === t.id ? 'secondary' : 'outline-secondary'}
              className="rounded-pill px-3"
              onClick={() => setTipo(tipo === t.id ? '' : t.id)}
              aria-pressed={tipo === t.id}
            >
              {t.etiqueta} <span className="opacity-75 ms-1">{cantidad(t.id)}</span>
            </Button>
          ))}
      </div>
      {elegido && <p className="small text-body-secondary mb-2">{elegido.ayuda}</p>}

      <div className="d-flex flex-wrap align-items-center gap-2 border-top pt-3 mt-3 mb-2">
        <span className="small fw-semibold">Hecho por</span>
        <ButtonGroup size="sm">
          {autores.map((a) => (
            <Button key={a.id} variant={autor === a.id ? 'secondary' : 'outline-secondary'} onClick={() => setAutor(a.id)}>
              {a.etiqueta}
            </Button>
          ))}
        </ButtonGroup>
        <Button
          size="sm"
          variant={verFechas || fechas.desde || fechas.hasta ? 'secondary' : 'outline-secondary'}
          className="rounded-pill px-3"
          onClick={() => setVerFechas(!verFechas)}
          aria-expanded={verFechas}
          aria-controls="fechas-cambios"
        >
          Fechas
          {(fechas.desde || fechas.hasta) && (
            <Badge bg="light" text="dark" pill className="ms-2">
              1
            </Badge>
          )}
        </Button>
        <Form.Control
          type="search"
          size="sm"
          className="ms-md-auto"
          style={{ maxWidth: 300 }}
          placeholder="Buscar socio, empleado o dato"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar en el registro de cambios"
        />
      </div>

      <Collapse in={verFechas}>
        <div id="fechas-cambios">
          <Row className="g-2 bg-body-tertiary rounded-4 p-3 mx-0 mb-2">
            <Col xs={6} md={3}>
              <Form.Label className="small fw-semibold mb-1" htmlFor="filtro-desde">
                Desde
              </Form.Label>
              <Form.Control id="filtro-desde" type="date" size="sm" value={fechas.desde} onChange={(e) => setFechas({ ...fechas, desde: e.target.value })} />
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small fw-semibold mb-1" htmlFor="filtro-hasta">
                Hasta
              </Form.Label>
              <Form.Control id="filtro-hasta" type="date" size="sm" value={fechas.hasta} onChange={(e) => setFechas({ ...fechas, hasta: e.target.value })} />
            </Col>
          </Row>
        </div>
      </Collapse>

      <p className="small text-body-secondary mb-0">
        {filtrados.length} {filtrados.length === 1 ? 'cambio' : 'cambios'}
        {hayFiltros && (
          <Button
            variant="link"
            size="sm"
            className="link-secondary p-0 ms-2"
            onClick={() => {
              setTipo('')
              setAutor('')
              setFechas({ desde: '', hasta: '' })
              setBusqueda('')
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </p>

      {filtrados.length === 0 && <p className="text-center text-body-secondary py-4 mb-0">No hay cambios que coincidan.</p>}

      {porDia.map(([dia, lista]) => (
        <section key={dia} className="mt-3">
          <h3 className="h6 fw-bold text-secondary bg-secondary-subtle rounded-pill px-3 py-2 mb-0">{nombreDia(dia)}</h3>
          <ul className="list-unstyled mb-0">
            {lista.map((r) => (
              <Registro key={r.id} registro={r} />
            ))}
          </ul>
        </section>
      ))}
    </Tarjeta>
  )
}

export default RegistroCambios
