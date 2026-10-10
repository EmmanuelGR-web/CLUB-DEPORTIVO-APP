'use client'

import { useEffect, useState } from 'react'
import { Row, Col, Table, ProgressBar } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import Indicador from '../empleado/Indicador'
import { colorEstado, descansoPermitido, hace, horaCorta, presenciaDe, textoDuracion } from '../../utilidades/jornada'
import { ausenciaVigente, fechaDeHoy, textoAusencia, textoRegreso, textoTurno } from '../../utilidades/personal'

const grupos = [
  { id: 'linea', etiqueta: 'En línea', detalle: 'Trabajando ahora', claves: ['linea'] },
  { id: 'descanso', etiqueta: 'En descanso', detalle: 'Con el descanso en curso', claves: ['descanso'] },
  { id: 'excedido', etiqueta: 'Descanso excedido', detalle: `Más de ${textoDuracion(descansoPermitido)} en el día` },
  { id: 'ausentes', etiqueta: 'Fuera del portal', detalle: 'Salió, sin conexión o sin ingresar', claves: ['fuera', 'sinConexion', 'sinIngresar'] },
]
const enGrupo = (grupo, p) => (grupo.id === 'excedido' ? p.excedido : grupo.claves.includes(p.clave))

function Estado({ presencia }) {
  return (
    <span className="d-inline-flex align-items-center gap-2 fw-semibold text-nowrap">
      <span className={`rounded-circle d-inline-block bg-${colorEstado[presencia.clave]}`} style={{ width: 10, height: 10 }} aria-hidden="true" />
      {presencia.etiqueta}
    </span>
  )
}

function Descanso({ presencia }) {
  return (
    <div style={{ minWidth: 150 }}>
      <div className={`small ${presencia.excedido ? 'text-danger fw-semibold' : ''}`}>
        {textoDuracion(presencia.descanso)} de {textoDuracion(descansoPermitido)}
        {presencia.excedido && ` · +${textoDuracion(presencia.descanso - descansoPermitido)}`}
      </div>
      <ProgressBar now={Math.min(100, (presencia.descanso / descansoPermitido) * 100)} variant={presencia.excedido ? 'danger' : 'warning'} style={{ height: 6 }} />
    </div>
  )
}

function ControlPersonal({ personal, jornadas }) {
  const [ahora, setAhora] = useState(() => Date.now())
  const [grupo, setGrupo] = useState('')

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 5000)
    return () => clearInterval(intervalo)
  }, [])

  const hoy = fechaDeHoy(new Date(ahora))
  const ausentes = personal.filter((e) => ausenciaVigente(e, hoy))
  const filas = personal.filter((e) => !ausenciaVigente(e, hoy)).map((e) => ({ empleado: e, presencia: presenciaDe(e, jornadas, ahora) }))
  const elegido = grupos.find((g) => g.id === grupo)
  const visibles = elegido ? filas.filter((f) => enGrupo(elegido, f.presencia)) : filas

  return (
    <>
      <Row className="g-3 mb-4">
        {grupos.map((g, i) => (
          <Col key={g.id} xs={6} xl={3}>
            <Indicador
              valor={filas.filter((f) => enGrupo(g, f.presencia)).length}
              etiqueta={g.etiqueta}
              detalle={grupo === g.id ? 'Filtrando · tocá para ver todos' : g.detalle}
              destacado={i === 0 || grupo === g.id}
              tamano="2.4rem"
              onClick={() => setGrupo(grupo === g.id ? '' : g.id)}
            />
          </Col>
        ))}
      </Row>

      <Tarjeta titulo={`Jornada de hoy · ${new Date(ahora).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}`}>
        <ul className="list-unstyled d-lg-none mb-0">
          {visibles.map(({ empleado: e, presencia: p }) => (
            <li key={e.id} className="border-bottom py-3">
              <div className="d-flex justify-content-between gap-2 mb-1">
                <div>
                  <div className="fw-semibold">{e.nombre}</div>
                  <div className="small text-body-secondary">{e.rol}</div>
                </div>
                <Estado presencia={p} />
              </div>
              {p.inicio && (
                <div className="small text-body-secondary mb-2">
                  Ingreso {horaCorta(p.inicio)} · Trabajado {textoDuracion(p.trabajado)} · Actividad {hace(p.ultimaActividad, ahora)}
                </div>
              )}
              <Descanso presencia={p} />
            </li>
          ))}
        </ul>

        <Table responsive hover className="align-middle mb-0 d-none d-lg-table">
          <thead>
            <tr className="text-uppercase small">
              <th scope="col">Empleado</th>
              <th scope="col">Estado</th>
              <th scope="col">Ingreso</th>
              <th scope="col">Trabajado</th>
              <th scope="col">Descanso</th>
              <th scope="col">Última actividad</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map(({ empleado: e, presencia: p }) => (
              <tr key={e.id}>
                <td>
                  <div className="fw-semibold">{e.nombre}</div>
                  <div className="small text-body-secondary">
                    {e.rol} · {textoTurno(e)}
                  </div>
                </td>
                <td>
                  <Estado presencia={p} />
                  {p.clave === 'descanso' && <div className="small text-body-secondary">Hace {textoDuracion(p.descansoActual)}</div>}
                </td>
                <td className="text-nowrap">{p.inicio ? horaCorta(p.inicio) : '—'}</td>
                <td className="text-nowrap">{p.inicio ? textoDuracion(p.trabajado) : '—'}</td>
                <td>
                  <Descanso presencia={p} />
                </td>
                <td className="small text-nowrap">{p.inicio ? (['termino', 'fuera'].includes(p.clave) ? `Salió ${horaCorta(p.fin)}` : hace(p.ultimaActividad, ahora)) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {visibles.length === 0 && <p className="text-center text-body-secondary py-4 mb-0">Nadie del personal está en esta situación.</p>}

        {ausentes.length > 0 && (
          <section className="border-top pt-3 mt-3">
            <h3 className="h6 fw-bold text-secondary mb-2">Ausentes hoy · sin acceso al portal</h3>
            <ul className="list-unstyled mb-0">
              {ausentes.map((e) => {
                const a = ausenciaVigente(e, hoy)
                return (
                  <li key={e.id} className="d-flex flex-wrap gap-2 py-2 border-bottom small">
                    <strong>{e.nombre}</strong>
                    <span className="text-body-secondary">{textoAusencia(a)}</span>
                    <span className="ms-auto fw-semibold text-secondary">{textoRegreso(a)}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

      </Tarjeta>
    </>
  )
}

export default ControlPersonal
