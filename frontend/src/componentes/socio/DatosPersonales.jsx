'use client'

import { useState } from 'react'
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import { formatearFechaConAnio } from '../../utilidades/fechas'
import { camposIdentidad, listaCampos } from '../../utilidades/validaciones'
import { tipoDeRegistro } from '../../utilidades/tiposCambio'

const campos = listaCampos(['nombre', 'apellido', 'dni', 'fechaNacimiento', 'direccion', 'telefono', 'email'])
const grupos = [
  {
    titulo: 'Nombre, DNI y nacimiento',
    nota: 'Son los datos de tu documento. Si los cambiás, se aplican cuando el personal del club los compara con tu DNI y los aprueba.',
    notaPersonal: 'Datos del documento. Como personal, tu corrección se aplica al instante: verificala con el DNI.',
    campos: campos.filter((c) => camposIdentidad.includes(c.nombre)),
  },
  {
    titulo: 'Contacto y domicilio',
    nota: 'Se actualizan al instante.',
    notaPersonal: 'Se actualizan al instante.',
    campos: campos.filter((c) => !camposIdentidad.includes(c.nombre)),
  },
]

function Grupo({ grupo, vistaPersonal, children }) {
  return (
    <section className="border-top pt-3 mt-3">
      <h3 className="h6 fw-bold text-secondary mb-1">{grupo.titulo}</h3>
      <p className="small text-body-secondary mb-3">{vistaPersonal ? grupo.notaPersonal : grupo.nota}</p>
      {children}
    </section>
  )
}

const mostrar = (campo, valor) => (campo === 'fechaNacimiento' && valor ? formatearFechaConAnio(valor) : valor || '—')
const columnas = (grupo) => (grupo.campos.length === 4 ? 3 : grupo.campos.length === 3 ? 4 : 6)

export function HistorialCambios({ registros }) {
  if (!registros?.length) return null

  return (
    <Tarjeta titulo="Historial de cambios" className="mt-4">
      <ul className="list-unstyled mb-0">
        {registros.map((registro) => (
          <li key={registro.id} className="border-top py-2 small">
            <div className="fw-semibold">
              {new Date(registro.fecha).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })} · {tipoDeRegistro(registro).etiqueta}
              {registro.pendiente && !registro.resuelto && <span className="badge text-bg-warning ms-2">Esperando aprobación</span>}
              {registro.resuelto && <span className={`badge ms-2 ${registro.resuelto === 'Autorizado' ? 'text-bg-success' : 'text-bg-danger'}`}>{registro.resuelto}</span>}
            </div>
            {registro.cambios.map((c) => (
              <div key={c.campo} className="text-body-secondary text-break">
                {c.campo}: <del>{c.anterior}</del> → <span className="text-body">{c.nuevo}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </Tarjeta>
  )
}

function DatosPersonales({
  socio,
  onGuardar,
  historial = [],
  textoEditar = 'Modificar mis datos',
  textoGuardado = 'Tus datos se actualizaron y el cambio quedó registrado.',
  vistaPersonal = false,
}) {
  const pendiente = vistaPersonal ? null : socio.identidadPendiente
  const bloqueado = (campo) => Boolean(pendiente) && camposIdentidad.includes(campo)
  const [editando, setEditando] = useState(false)
  const [valores, setValores] = useState({})
  const [validado, setValidado] = useState(false)
  const [duplicado, setDuplicado] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const empezar = () => {
    setValores(Object.fromEntries(campos.map((c) => [c.nombre, socio[c.nombre] ?? ''])))
    setValidado(false)
    setDuplicado(null)
    setAviso(null)
    setEditando(true)
  }

  const invalido = (c) => validado && (!c.valido(valores[c.nombre]) || duplicado === c.nombre)

  const guardar = async (e) => {
    e.preventDefault()
    setValidado(true)
    if (campos.some((c) => !bloqueado(c.nombre) && !c.valido(valores[c.nombre]))) return
    const cambios = Object.fromEntries(Object.entries(valores).filter(([campo]) => !bloqueado(campo)))
    setGuardando(true)
    try {
      const resultado = await onGuardar(cambios, 'Datos personales')
      setAviso({
        tipo: 'success',
        texto:
          resultado === 'pendiente'
            ? 'Recibimos tu pedido. El cambio de nombre, DNI o fecha de nacimiento se aplica cuando el personal del club lo apruebe.'
            : resultado
              ? textoGuardado
              : 'No hubo ningún cambio.',
      })
      setEditando(false)
    } catch (problema) {
      if (problema.datos?.duplicado) setDuplicado(problema.datos.duplicado)
      else setAviso({ tipo: 'warning', texto: problema.message })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <Tarjeta>
        {aviso && (
          <Alert variant={aviso.tipo} dismissible onClose={() => setAviso(null)} className="py-2">
            {aviso.texto}
          </Alert>
        )}

        {pendiente && (
          <Alert variant="warning" className="small">
            <strong>Cambio de documento pendiente de aprobación.</strong> Pediste modificar:{' '}
            {pendiente.cambios.map((c) => `${c.campo.toLowerCase()} de "${c.anterior}" a "${c.nuevo}"`).join('; ')}. Hasta que el personal lo apruebe, se siguen
            mostrando tus datos actuales.
          </Alert>
        )}

        <Row as="dl" className="g-4 mb-4">
          {[
            ['Número de socio', socio.numeroSocio],
            ['Categoría', socio.categoria],
            ['Correo institucional', socio.correoInstitucional],
          ].map(([etiqueta, valor]) => (
            <Col key={etiqueta} md={4}>
              <dt className="small text-uppercase text-body-secondary fw-semibold">
                {etiqueta} <span className="fw-normal text-lowercase">(no editable)</span>
              </dt>
              <dd className="fs-6 fw-semibold mb-0 text-break">{valor}</dd>
            </Col>
          ))}
        </Row>

        {editando ? (
          <Form noValidate onSubmit={guardar}>
            {grupos.map((grupo) => (
              <Grupo key={grupo.titulo} grupo={grupo} vistaPersonal={vistaPersonal}>
                <Row className="g-3">
                  {grupo.campos.map((c) => (
                    <Col key={c.nombre} md={6} xl={columnas(grupo)}>
                      <Form.Group controlId={`editar-${c.nombre}`}>
                        <Form.Label className="small fw-semibold">{c.etiqueta}</Form.Label>
                        <Form.Control
                          type={c.tipo ?? 'text'}
                          inputMode={c.inputMode}
                          autoComplete={c.autoComplete}
                          value={valores[c.nombre]}
                          onChange={(e) => {
                            setValores({ ...valores, [c.nombre]: e.target.value })
                            if (duplicado === c.nombre) setDuplicado(null)
                          }}
                          isInvalid={invalido(c)}
                          disabled={bloqueado(c.nombre)}
                        />
                        {bloqueado(c.nombre) && <Form.Text>Ya hay un pedido de cambio esperando aprobación.</Form.Text>}
                        <Form.Control.Feedback type="invalid">
                          {duplicado === c.nombre ? `Ya hay otro socio con este ${c.etiqueta.toLowerCase()}.` : c.mensaje}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </Grupo>
            ))}
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Button type="submit" variant="primary" className="rounded-pill px-4" disabled={guardando}>
                {guardando ? <Spinner size="sm" /> : 'Guardar cambios'}
              </Button>
              <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setEditando(false)}>
                Cancelar
              </Button>
            </div>
          </Form>
        ) : (
          <>
            {grupos.map((grupo) => (
              <Grupo key={grupo.titulo} grupo={grupo} vistaPersonal={vistaPersonal}>
                <Row as="dl" className="g-4 mb-0">
                  {grupo.campos.map((c) => (
                    <Col key={c.nombre} sm={6} xl={columnas(grupo)}>
                      <dt className="small text-uppercase text-body-secondary fw-semibold">{c.etiqueta}</dt>
                      <dd className="fs-5 mb-0 text-break">{mostrar(c.nombre, socio[c.nombre])}</dd>
                    </Col>
                  ))}
                </Row>
              </Grupo>
            ))}
            <Button variant="secondary" className="rounded-pill px-4 mt-4" onClick={empezar}>
              {textoEditar}
            </Button>
          </>
        )}
      </Tarjeta>

      <HistorialCambios registros={historial} />
    </>
  )
}

export default DatosPersonales
