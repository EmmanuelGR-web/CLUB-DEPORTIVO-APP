'use client'

import { useState } from 'react'
import { Row, Col, Form, Button, Table, Modal, FloatingLabel } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import EstadoConsulta from '../comun/EstadoConsulta'
import { useConsulta } from '../../hooks/useConsulta'
import { borrarBeneficio, crearBeneficio, listarBeneficios, modificarBeneficio } from '../../servicios/adminApi'
import { alertaError, alertaExito, confirmarBorrado } from '../../utilidades/alertas'

const vacio = { titulo: '', detalle: '', extra: '', descripcion: '' }

// Alta, edición y borrado de los beneficios que ven los socios. La usan
// el personal administrativo y la administración principal.
function GestionBeneficios() {
  const { datos: beneficios, cargando, error, recargar } = useConsulta(listarBeneficios)
  const [editando, setEditando] = useState(null)
  const [formulario, setFormulario] = useState(vacio)
  const [validado, setValidado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const abrir = (beneficio) => {
    setEditando(beneficio ?? {})
    setFormulario(beneficio ? { titulo: beneficio.titulo, detalle: beneficio.detalle, extra: beneficio.extra ?? '', descripcion: beneficio.descripcion } : vacio)
    setValidado(false)
  }

  const poner = (campo) => (e) => setFormulario({ ...formulario, [campo]: e.target.value })
  const invalidos = {
    titulo: formulario.titulo.trim().length < 3,
    detalle: formulario.detalle.trim().length < 3,
    descripcion: formulario.descripcion.trim().length < 20,
  }

  const guardar = async (e) => {
    e.preventDefault()
    setValidado(true)
    if (Object.values(invalidos).some(Boolean)) return
    const datos = Object.fromEntries(Object.entries(formulario).map(([campo, valor]) => [campo, valor.trim()]))
    setEnviando(true)
    try {
      if (editando.id) await modificarBeneficio(editando.id, datos)
      else await crearBeneficio(datos)
      setEditando(null)
      alertaExito(editando.id ? 'Se guardaron los cambios del beneficio.' : 'El beneficio ya lo ven los socios.')
      await recargar()
    } catch (problema) {
      alertaError(problema.message, 'No se pudo guardar el beneficio')
    } finally {
      setEnviando(false)
    }
  }

  const borrar = async (beneficio) => {
    const borrado = await confirmarBorrado({
      titulo: '¿Borrar el beneficio?',
      texto: `"${beneficio.titulo}" deja de verse en el panel de los socios.`,
      accion: () => borrarBeneficio(beneficio.id),
    })
    if (!borrado) return
    alertaExito(`Se borró "${beneficio.titulo}".`)
    await recargar()
  }

  const campo = (id, etiqueta, mensaje, props = {}) => (
    <FloatingLabel controlId={`beneficio-${id}`} label={etiqueta}>
      <Form.Control value={formulario[id]} onChange={poner(id)} isInvalid={validado && invalidos[id]} placeholder={etiqueta} {...props} />
      <Form.Control.Feedback type="invalid">{mensaje}</Form.Control.Feedback>
    </FloatingLabel>
  )

  const acciones = (b) => (
    <>
      <Button size="sm" variant="outline-secondary" className="rounded-pill px-3 me-1" onClick={() => abrir(b)}>
        Editar
      </Button>
      <Button size="sm" variant="link" className="link-danger" onClick={() => borrar(b)}>
        Borrar
      </Button>
    </>
  )

  return (
    <Tarjeta titulo="Beneficios para socios">
      <EstadoConsulta cargando={cargando} error={error} vacio={beneficios?.length === 0} onReintentar={recargar} textoVacio="Todavía no hay beneficios." />

      {beneficios?.length > 0 && (
        <>
          <ul className="list-unstyled d-lg-none mb-3">
            {beneficios.map((b) => (
              <li key={b.id} className="border-bottom py-3">
                <div className="fw-semibold">{b.titulo}</div>
                <div className="small text-primary fw-semibold">{b.detalle}</div>
                {b.extra && <div className="small text-body-secondary">{b.extra}</div>}
                <div className="mt-2">{acciones(b)}</div>
              </li>
            ))}
          </ul>
          <Table responsive hover className="align-middle d-none d-lg-table">
            <thead>
              <tr className="text-uppercase small">
                <th scope="col">Beneficio</th>
                <th scope="col">Condición</th>
                <th scope="col" className="text-end">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {beneficios.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="fw-semibold">{b.titulo}</div>
                    <div className="small text-primary fw-semibold">{b.detalle}</div>
                  </td>
                  <td className="small text-body-secondary">{b.extra || '—'}</td>
                  <td className="text-end text-nowrap">{acciones(b)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      <Button variant="secondary" className="rounded-pill px-4" onClick={() => abrir(null)}>
        Nuevo beneficio
      </Button>

      <Modal show={Boolean(editando)} onHide={() => setEditando(null)} centered size="lg" fullscreen="sm-down">
        <Form noValidate onSubmit={guardar}>
          <Modal.Header closeButton>
            <Modal.Title className="h5 fw-bold text-secondary">{editando?.id ? 'Editar beneficio' : 'Nuevo beneficio'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>{campo('titulo', 'Título', 'El título tiene al menos 3 caracteres.', { autoFocus: true, maxLength: 60 })}</Col>
              <Col md={6}>{campo('detalle', 'Qué ofrece (se ve en la tarjeta)', 'Contá el beneficio en pocas palabras.', { maxLength: 80, placeholder: '15 % de descuento' })}</Col>
              <Col xs={12}>{campo('extra', 'Condición breve (opcional)', '', { maxLength: 120 })}</Col>
              <Col xs={12}>
                <Form.Group controlId="beneficio-descripcion">
                  <Form.Label className="small fw-semibold">Descripción completa</Form.Label>
                  <Form.Control as="textarea" rows={4} value={formulario.descripcion} onChange={poner('descripcion')} isInvalid={validado && invalidos.descripcion} maxLength={1000} />
                  <Form.Control.Feedback type="invalid">Escribí la descripción (al menos 20 caracteres).</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" className="rounded-pill px-4" disabled={enviando}>
              {enviando ? 'Guardando…' : editando?.id ? 'Guardar cambios' : 'Publicar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Tarjeta>
  )
}

export default GestionBeneficios
