'use client'

import { useState } from 'react'
import { Modal, Form, Row, Col, Button, Alert, FloatingLabel } from 'react-bootstrap'
import EncabezadoLegajo from './EncabezadoLegajo'
import OpcionesPildora from './OpcionesPildora'
import CamposAusencia from './CamposAusencia'
import { diasLaborales, rolesPersonal } from '../../datos/gestion'
import { errorAusencia, fechaDeHoy } from '../../utilidades/personal'

const vacio = {
  nombre: '',
  dni: '',
  rol: rolesPersonal[0],
  ausencia: null,
  correo: '',
  telefono: '',
  dias: 'Lunes a viernes',
  entrada: '09:00',
  salida: '17:00',
  ingreso: new Date().toISOString().slice(0, 10),
}

const validar = (datos) => {
  const errores = {}
  if (datos.nombre.trim().split(' ').filter(Boolean).length < 2) errores.nombre = 'Ingresá nombre y apellido.'
  if (!/^\d{7,8}$/.test(datos.dni.replace(/\./g, ''))) errores.dni = 'El DNI tiene 7 u 8 números.'
  if (!/^\S+@\S+\.\S+$/.test(datos.correo)) errores.correo = 'Ingresá un correo válido.'
  if (!datos.entrada || !datos.salida || datos.salida <= datos.entrada) errores.salida = 'La salida tiene que ser después de la entrada.'
  if (!datos.ingreso) errores.ingreso = 'Indicá la fecha de ingreso.'
  if (errorAusencia(datos.ausencia)) errores.ausencia = errorAusencia(datos.ausencia)
  return errores
}

function Seccion({ numero, titulo, children }) {
  return (
    <section className="mb-4">
      <h3 className="h6 fw-bold text-uppercase text-secondary d-flex align-items-center gap-2 mb-3">
        <span
          className="rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center font-credencial"
          style={{ width: 26, height: 26 }}
        >
          {numero}
        </span>
        {titulo}
      </h3>
      {children}
    </section>
  )
}

function FormularioPersonal({ empleado, onCerrar, onGuardar }) {
  const [datos, setDatos] = useState(() => (empleado ? { ...vacio, ...empleado } : vacio))
  const [errores, setErrores] = useState({})
  const [falla, setFalla] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [hoy] = useState(() => fechaDeHoy())

  const poner = (campo, valor) => setDatos({ ...datos, [campo]: valor })

  const enviar = async (e) => {
    e.preventDefault()
    const encontrados = validar(datos)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    const { nombre, dni, rol, ausencia, correo, telefono, dias, entrada, salida, ingreso } = datos
    setGuardando(true)
    setFalla('')
    try {
      await onGuardar({
      nombre: nombre.trim(),
      dni: dni.replace(/\./g, ''),
      rol,
      ausencia: ausencia ? { ...ausencia, nota: ausencia.nota.trim() } : null,
      correo: correo.trim().toLowerCase(),
      telefono: telefono.trim(),
      dias,
      entrada,
      salida,
      ingreso,
    })
    } catch (problema) {
      if (problema.datos?.campo === 'correo') setErrores({ correo: problema.message })
      else setFalla(problema.message)
    } finally {
      setGuardando(false)
    }
  }

  const campo = (id, etiqueta, props = {}) => (
    <FloatingLabel controlId={`personal-${id}`} label={etiqueta}>
      <Form.Control value={datos[id]} onChange={(e) => poner(id, e.target.value)} isInvalid={Boolean(errores[id])} placeholder={etiqueta} {...props} />
      <Form.Control.Feedback type="invalid">{errores[id]}</Form.Control.Feedback>
    </FloatingLabel>
  )

  return (
    <Modal show onHide={onCerrar} centered size="lg" scrollable contentClassName="border-0 rounded-4 overflow-hidden shadow-lg">
      <Form noValidate onSubmit={enviar} className="d-flex flex-column overflow-hidden">
        <EncabezadoLegajo nombre={datos.nombre} antetitulo={empleado ? `Editar legajo ${empleado.codigo}` : 'Alta de personal'} onCerrar={onCerrar}>
          <div className="small text-white-50">
            {datos.rol} · {datos.dias}, de {datos.entrada} a {datos.salida} h
          </div>
        </EncabezadoLegajo>

        <Modal.Body className="p-4 p-md-5">
          {falla && <Alert variant="danger">{falla}</Alert>}

          <Seccion numero="1" titulo="Datos personales">
            <Row className="g-3">
              <Col md={8}>{campo('nombre', 'Nombre y apellido', { autoFocus: true })}</Col>
              <Col md={4}>{campo('dni', 'DNI', { inputMode: 'numeric' })}</Col>
            </Row>
          </Seccion>

          <Seccion numero="2" titulo="Puesto y horario">
            <div className="small fw-semibold text-body-secondary mb-2">Rol</div>
            <OpcionesPildora nombre="personal-rol" valor={datos.rol} opciones={rolesPersonal} onCambiar={(v) => poner('rol', v)} />
            <div className="small fw-semibold text-body-secondary mt-3 mb-2">Días de trabajo</div>
            <OpcionesPildora nombre="personal-dias" valor={datos.dias} opciones={Object.keys(diasLaborales)} onCambiar={(v) => poner('dias', v)} />
            <Row className="g-3 mt-1">
              <Col xs={6} md={4}>
                {campo('entrada', 'Entrada', { type: 'time' })}
              </Col>
              <Col xs={6} md={4}>
                {campo('salida', 'Salida', { type: 'time' })}
              </Col>
              <Col md={4}>{campo('ingreso', 'En el club desde', { type: 'date' })}</Col>
            </Row>
          </Seccion>

          <Seccion numero="3" titulo="Contacto">
            <Row className="g-3">
              <Col md={7}>{campo('correo', 'Correo del club', { type: 'email' })}</Col>
              <Col md={5}>{campo('telefono', 'Teléfono o interno')}</Col>
            </Row>
          </Seccion>

          <Seccion numero="4" titulo="Situación">
            <p className="small text-body-secondary">Si está de vacaciones, con licencia o suspendido, no puede entrar al portal durante esas fechas.</p>
            <CamposAusencia
              id="personal-ausencia"
              ausencia={datos.ausencia}
              onCambiar={(v) => {
                poner('ausencia', v)
                setErrores({ ...errores, ausencia: null })
              }}
              hoy={hoy}
              error={errores.ausencia}
            />
          </Seccion>
          {!empleado && <p className="small text-body-secondary mt-3 mb-0">El número de legajo se asigna solo, a continuación del último.</p>}
        </Modal.Body>

        <Modal.Footer className="bg-body-tertiary border-0 px-4 px-md-5">
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" variant="secondary" className="rounded-pill px-4" disabled={guardando}>
            {guardando ? 'Guardando…' : empleado ? 'Guardar cambios' : 'Añadir al personal'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default FormularioPersonal
