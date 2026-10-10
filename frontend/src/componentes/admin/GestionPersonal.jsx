'use client'

import { useEffect, useState } from 'react'
import { Row, Col, Form, Button, Collapse, Badge, CloseButton, Table, Dropdown, Modal, Alert } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import SituacionAhora from './SituacionAhora'
import CamposAusencia from './CamposAusencia'
import FormularioPersonal from './FormularioPersonal'
import FichaPersonal from './FichaPersonal'
import { rolesPersonal } from '../../datos/gestion'
import { ausenciaVigente, enActividadTexto, errorAusencia, fechaDeHoy, motivosAusencia } from '../../utilidades/personal'
import { presenciaDe } from '../../utilidades/jornada'
import { actualizarPersonalApi, agregarPersonalApi, eliminarPersonalApi } from '../../servicios/adminApi'
import { alertaError } from '../../utilidades/alertas'
import { coincide } from '../../utilidades/texto'

const filtroVacio = { rol: '', situacion: '' }
const masivoVacio = { rol: '', ausencia: undefined }

function GestionPersonal({ personal, jornadas, onCambio }) {
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [filtro, setFiltro] = useState(filtroVacio)
  const [elegidos, setElegidos] = useState([])
  const [viendo, setViendo] = useState(null)
  const [editando, setEditando] = useState(null)
  const [eliminando, setEliminando] = useState([])
  const [modificandoSeleccion, setModificandoSeleccion] = useState(false)
  const [cambioMasivo, setCambioMasivo] = useState(masivoVacio)
  const [errorMasivo, setErrorMasivo] = useState(null)
  const [aviso, setAviso] = useState('')
  const [hoy] = useState(() => fechaDeHoy())
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 15000)
    return () => clearInterval(intervalo)
  }, [])

  const situacionDe = (e) => ausenciaVigente(e, hoy)?.motivo ?? enActividadTexto
  const presencia = (e) => (ausenciaVigente(e, hoy) ? null : presenciaDe(e, jornadas, ahora))

  const activos = Object.entries(filtro).filter(([, v]) => v)
  const filtrados = personal.filter(
    (e) =>
      (!filtro.rol || e.rol === filtro.rol) &&
      (!filtro.situacion || situacionDe(e) === filtro.situacion) &&
      coincide(`${e.nombre} ${e.codigo} ${e.dni} ${e.correo} ${e.rol}`, busqueda),
  )
  const seleccion = elegidos.filter((id) => personal.some((e) => e.id === id))
  const todosElegidos = filtrados.length > 0 && filtrados.every((e) => seleccion.includes(e.id))
  const nombres = (ids) => personal.filter((e) => ids.includes(e.id)).map((e) => e.nombre)

  const alternar = (id) => setElegidos(seleccion.includes(id) ? seleccion.filter((x) => x !== id) : [...seleccion, id])
  const alternarTodos = () =>
    setElegidos(todosElegidos ? seleccion.filter((id) => !filtrados.some((e) => e.id === id)) : [...new Set([...seleccion, ...filtrados.map((e) => e.id)])])

  const terminar = (texto) => {
    setAviso(texto)
    onCambio()
  }

  // Si el servidor rechaza un dato, el error sube al formulario para marcarlo.
  const guardar = async (datos) => {
    if (editando?.id) await actualizarPersonalApi([editando.id], datos)
    else await agregarPersonalApi(datos)
    terminar(editando?.id ? `Se guardaron los cambios de ${datos.nombre}.` : `${datos.nombre} se sumó al personal.`)
    setEditando(null)
  }

  const eliminar = async () => {
    const texto =
      eliminando.length === 1 ? `${nombres(eliminando)[0]} ya no forma parte del personal.` : `Se eliminaron ${eliminando.length} personas del personal.`
    try {
      await eliminarPersonalApi(eliminando)
      terminar(texto)
      setElegidos(seleccion.filter((id) => !eliminando.includes(id)))
    } catch (problema) {
      alertaError(problema.message, 'No se pudo eliminar')
    }
    setEliminando([])
  }

  const modificarSeleccion = async (e) => {
    e.preventDefault()
    const error = errorAusencia(cambioMasivo.ausencia)
    setErrorMasivo(error)
    if (error) return
    const cambios = {
      ...(cambioMasivo.rol && { rol: cambioMasivo.rol }),
      ...(cambioMasivo.ausencia !== undefined && { ausencia: cambioMasivo.ausencia && { ...cambioMasivo.ausencia, nota: cambioMasivo.ausencia.nota.trim() } }),
    }
    if (Object.keys(cambios).length > 0) {
      try {
        await actualizarPersonalApi(seleccion, cambios)
        terminar(`Se modificaron ${seleccion.length} personas.`)
      } catch (problema) {
        alertaError(problema.message, 'No se pudieron aplicar los cambios')
      }
    }
    setModificandoSeleccion(false)
    setCambioMasivo(masivoVacio)
  }

  const reincorporar = async (e) => {
    try {
      await actualizarPersonalApi([e.id], { ausencia: null })
      terminar(`${e.nombre} está en actividad y ya puede entrar al portal.`)
    } catch (problema) {
      alertaError(problema.message)
    }
    setViendo(null)
  }

  const acciones = (e) => (
    <div className="d-flex gap-1 justify-content-end">
      <Button size="sm" variant="link" className="link-secondary" onClick={() => setViendo(e)}>
        Ver
      </Button>
      <Button size="sm" variant="outline-secondary" className="rounded-pill px-3" onClick={() => setEditando(e)}>
        Editar
      </Button>
      <Button size="sm" variant="link" className="link-danger" onClick={() => setEliminando([e.id])}>
        Eliminar
      </Button>
    </div>
  )

  return (
    <Tarjeta titulo="Gestión de personal">
      {aviso && (
        <Alert variant="success" dismissible onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      )}

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <Form.Control
          type="search"
          className="flex-grow-1"
          style={{ maxWidth: 420 }}
          placeholder="Buscar por nombre, código, DNI o correo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar personal"
        />
        <Button
          variant={abierto || activos.length ? 'primary' : 'outline-secondary'}
          className="rounded-pill px-4 fw-bold text-uppercase"
          onClick={() => setAbierto(!abierto)}
          aria-expanded={abierto}
          aria-controls="filtros-personal"
        >
          Filtrar
          {activos.length > 0 && (
            <Badge bg="light" text="dark" pill className="ms-2">
              {activos.length}
            </Badge>
          )}
        </Button>
        {activos.map(([campo, valor]) => (
          <Badge key={campo} bg="secondary" pill className="d-inline-flex align-items-center gap-2 py-2 px-3 fw-normal">
            {valor}
            <CloseButton variant="white" aria-label="Quitar filtro" onClick={() => setFiltro({ ...filtro, [campo]: '' })} style={{ fontSize: '0.6rem' }} />
          </Badge>
        ))}
      </div>

      <Collapse in={abierto}>
        <div id="filtros-personal">
          <Row className="g-2 bg-body-tertiary rounded-4 p-3 mx-0 mb-3">
            <Col xs={6} md={4}>
              <Form.Label className="small fw-semibold mb-1" htmlFor="filtro-rol">
                Rol
              </Form.Label>
              <Form.Select id="filtro-rol" size="sm" value={filtro.rol} onChange={(e) => setFiltro({ ...filtro, rol: e.target.value })}>
                <option value="">Todos</option>
                {rolesPersonal.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md={4}>
              <Form.Label className="small fw-semibold mb-1" htmlFor="filtro-situacion">
                Situación hoy
              </Form.Label>
              <Form.Select id="filtro-situacion" size="sm" value={filtro.situacion} onChange={(e) => setFiltro({ ...filtro, situacion: e.target.value })}>
                <option value="">Todas</option>
                {[enActividadTexto, ...motivosAusencia].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </div>
      </Collapse>

      <ul className="list-unstyled d-lg-none mb-0">
        {filtrados.map((e) => (
          <li key={e.id} className="border-bottom py-3">
            <div className="d-flex align-items-start gap-2">
              <Form.Check aria-label={`Elegir a ${e.nombre}`} checked={seleccion.includes(e.id)} onChange={() => alternar(e.id)} />
              <div className="flex-grow-1">
                <div className="fw-semibold">{e.nombre}</div>
                <div className="small text-body-secondary mb-1">
                  {e.codigo} · {e.rol}
                </div>
                <SituacionAhora empleado={e} hoy={hoy} presencia={presencia(e)} />
              </div>
            </div>
            {acciones(e)}
          </li>
        ))}
      </ul>

      <Table responsive hover className="align-middle mb-0 d-none d-lg-table">
        <thead>
          <tr className="text-uppercase small">
            <th scope="col" style={{ width: 40 }}>
              <Form.Check aria-label="Elegir todos" checked={todosElegidos} onChange={alternarTodos} />
            </th>
            <th scope="col">Empleado</th>
            <th scope="col">Rol</th>
            <th scope="col">Ahora</th>
            <th scope="col" className="text-end">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((e) => (
            <tr key={e.id} className={seleccion.includes(e.id) ? 'table-active' : ''}>
              <td>
                <Form.Check aria-label={`Elegir a ${e.nombre}`} checked={seleccion.includes(e.id)} onChange={() => alternar(e.id)} />
              </td>
              <td>
                <div className="fw-semibold">{e.nombre}</div>
                <div className="small text-body-secondary">
                  <span className="font-numeros">{e.codigo}</span> · {e.correo}
                </div>
              </td>
              <td>{e.rol}</td>
              <td>
                <SituacionAhora empleado={e} hoy={hoy} presencia={presencia(e)} />
              </td>
              <td>{acciones(e)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {filtrados.length === 0 && <p className="text-center text-body-secondary py-4 mb-0">No hay personal que coincida con la búsqueda.</p>}

      <div className="d-flex flex-wrap align-items-center gap-2 border-top pt-3 mt-3">
        <Button variant="secondary" className="rounded-pill px-4" onClick={() => setEditando({})}>
          Añadir personal
        </Button>
        <small className="text-body-secondary ms-sm-auto">
          {seleccion.length > 0 ? `${seleccion.length} seleccionados` : 'Marcá casillas para acciones en grupo'}
        </small>
        <Dropdown align="end">
          <Dropdown.Toggle variant="outline-secondary" className="rounded-pill px-4" disabled={seleccion.length === 0}>
            Más acciones
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setModificandoSeleccion(true)}>Modificar selección</Dropdown.Item>
            <Dropdown.Item className="text-danger" onClick={() => setEliminando(seleccion)}>
              Eliminar selección
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {viendo && (
        <FichaPersonal
          empleado={viendo}
          jornadas={jornadas}
          onCerrar={() => setViendo(null)}
          onReincorporar={reincorporar}
          onEditar={(e) => {
            setViendo(null)
            setEditando(e)
          }}
        />
      )}
      {editando && (
        <FormularioPersonal key={editando.id ?? 'nuevo'} empleado={editando.id ? editando : null} onCerrar={() => setEditando(null)} onGuardar={guardar} />
      )}

      <Modal show={eliminando.length > 0} onHide={() => setEliminando([])} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-secondary">Eliminar del personal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {eliminando.length === 1 ? (
            <>
              ¿Eliminar a <strong>{nombres(eliminando)[0]}</strong> del personal?
            </>
          ) : (
            <>
              ¿Eliminar a estas {eliminando.length} personas del personal? {nombres(eliminando).join(', ')}.
            </>
          )}
          <p className="small text-body-secondary mt-2 mb-0">Si solo deja de trabajar por un tiempo, conviene cargarle vacaciones, licencia o suspensión con fechas: vuelve sola a estar en actividad.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setEliminando([])}>
            Cancelar
          </Button>
          <Button variant="danger" className="rounded-pill px-4" onClick={eliminar}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={modificandoSeleccion} onHide={() => setModificandoSeleccion(false)} centered size="lg">
        <Form onSubmit={modificarSeleccion}>
          <Modal.Header closeButton>
            <Modal.Title className="h5 fw-bold text-secondary">Modificar {seleccion.length} seleccionados</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="small text-body-secondary">{nombres(seleccion).join(', ')}. Lo que dejes en &quot;Sin cambios&quot; queda como está.</p>
            <Row className="g-3">
              <Col sm={6}>
                <Form.Label className="small fw-semibold" htmlFor="masivo-rol">
                  Rol
                </Form.Label>
                <Form.Select id="masivo-rol" value={cambioMasivo.rol} onChange={(e) => setCambioMasivo({ ...cambioMasivo, rol: e.target.value })}>
                  <option value="">Sin cambios</option>
                  {rolesPersonal.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12}>
                <div className="small fw-semibold mb-2">Situación</div>
                <CamposAusencia
                  id="masivo"
                  ausencia={cambioMasivo.ausencia}
                  onCambiar={(v) => setCambioMasivo({ ...cambioMasivo, ausencia: v })}
                  hoy={hoy}
                  error={errorMasivo}
                  conSinCambios
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setModificandoSeleccion(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" className="rounded-pill px-4" disabled={!cambioMasivo.rol && cambioMasivo.ausencia === undefined}>
              Aplicar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Tarjeta>
  )
}

export default GestionPersonal
