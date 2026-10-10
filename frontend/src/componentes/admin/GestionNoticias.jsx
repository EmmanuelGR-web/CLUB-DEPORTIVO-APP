'use client'

import { useState } from 'react'
import { Row, Col, Form, Button, Table, Modal, Badge, FloatingLabel, Image } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import EstadoConsulta from '../comun/EstadoConsulta'
import { useConsulta } from '../../hooks/useConsulta'
import { borrarNoticia, crearNoticia, listarNoticias, modificarNoticia } from '../../servicios/adminApi'
import { categoriasNoticia, coloresCategoria } from '../../datos/noticias'
import { formatearFecha } from '../../utilidades/fechas'
import { comprimirParaApi, pesoAproximado } from '../../utilidades/imagenes'
import { alertaError, alertaExito, confirmarBorrado } from '../../utilidades/alertas'

const vacia = () => ({ titulo: '', categoria: categoriasNoticia[0], fecha: new Date().toLocaleDateString('en-CA'), resumen: '', cuerpo: '', imagen: '' })

const aFormulario = (noticia) => ({ ...vacia(), ...noticia, cuerpo: noticia.cuerpo.join('\n\n'), imagen: noticia.imagen ?? '' })

const aNoticia = (datos) => ({
  titulo: datos.titulo.trim(),
  categoria: datos.categoria,
  fecha: datos.fecha,
  resumen: datos.resumen.trim(),
  cuerpo: datos.cuerpo
    .split(/\n\s*\n/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean),
  ...(datos.imagen.trim() && { imagen: datos.imagen.trim() }),
})

function GestionNoticias() {
  const { datos: noticias, cargando, error, recargar } = useConsulta(listarNoticias)
  const [editando, setEditando] = useState(null)
  const [formulario, setFormulario] = useState(vacia)
  const [validado, setValidado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [errorImagen, setErrorImagen] = useState('')

  const subirImagen = async (e) => {
    const archivo = e.target.files[0]
    e.target.value = ''
    if (!archivo) return
    setErrorImagen('')
    setProcesando(true)
    try {
      setFormulario((actual) => ({ ...actual, imagen: '' }))
      const dataUrl = await comprimirParaApi(archivo)
      setFormulario((actual) => ({ ...actual, imagen: dataUrl }))
    } catch (problema) {
      setErrorImagen(problema.message)
    } finally {
      setProcesando(false)
    }
  }

  const abrir = (noticia) => {
    setEditando(noticia ?? {})
    setFormulario(noticia ? aFormulario(noticia) : vacia())
    setValidado(false)
    setErrorImagen('')
  }

  const poner = (campo) => (e) => setFormulario({ ...formulario, [campo]: e.target.value })
  const invalidos = {
    titulo: formulario.titulo.trim().length < 5,
    resumen: formulario.resumen.trim().length < 10,
    cuerpo: formulario.cuerpo.trim().length < 20,
    fecha: !formulario.fecha,
  }

  const guardar = async (e) => {
    e.preventDefault()
    setValidado(true)
    if (Object.values(invalidos).some(Boolean)) return
    setEnviando(true)
    try {
      if (editando.id) await modificarNoticia(editando.id, aNoticia(formulario))
      else await crearNoticia(aNoticia(formulario))
      setEditando(null)
      alertaExito(editando.id ? 'Se guardaron los cambios de la noticia.' : 'La noticia quedó publicada.')
      await recargar()
    } catch (problema) {
      alertaError(problema.message, 'No se pudo guardar la noticia')
    } finally {
      setEnviando(false)
    }
  }

  const borrar = async (noticia) => {
    const borrada = await confirmarBorrado({
      titulo: '¿Borrar la noticia?',
      texto: `"${noticia.titulo}" deja de estar publicada.`,
      accion: () => borrarNoticia(noticia.id),
    })
    if (!borrada) return
    alertaExito(`Se borró "${noticia.titulo}".`)
    await recargar()
  }

  const campo = (id, etiqueta, mensaje, props = {}) => (
    <FloatingLabel controlId={`noticia-${id}`} label={etiqueta}>
      <Form.Control value={formulario[id]} onChange={poner(id)} isInvalid={validado && invalidos[id]} placeholder={etiqueta} {...props} />
      <Form.Control.Feedback type="invalid">{mensaje}</Form.Control.Feedback>
    </FloatingLabel>
  )

  return (
    <Tarjeta titulo="Noticias del club">
      <p className="small text-body-secondary">Lo que se publica acá lo ven todos los socios en la sección Noticias de su panel.</p>

      <EstadoConsulta cargando={cargando} error={error} vacio={noticias?.length === 0} onReintentar={recargar} textoVacio="Todavía no hay noticias." />

      {noticias?.length > 0 && (
        <ul className="list-unstyled d-lg-none mb-3">
          {noticias.map((n) => (
            <li key={n.id} className="border-bottom py-3">
              <div className="d-flex align-items-center gap-2 mb-1">
                <Badge bg={coloresCategoria[n.categoria]?.bg ?? 'secondary'} text={coloresCategoria[n.categoria]?.text}>
                  {n.categoria}
                </Badge>
                <small className="text-body-secondary">{formatearFecha(n.fecha)}</small>
              </div>
              <div className="fw-semibold">{n.titulo}</div>
              <div className="small text-body-secondary">{n.resumen}</div>
              <div className="mt-2">
                <Button size="sm" variant="outline-secondary" className="rounded-pill px-3 me-1" onClick={() => abrir(n)}>
                  Editar
                </Button>
                <Button size="sm" variant="link" className="link-danger" onClick={() => borrar(n)}>
                  Borrar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {noticias?.length > 0 && (
        <Table responsive hover className="align-middle d-none d-lg-table">
          <thead>
            <tr className="text-uppercase small">
              <th scope="col">Noticia</th>
              <th scope="col">Categoría</th>
              <th scope="col">Fecha</th>
              <th scope="col" className="text-end">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {noticias.map((n) => (
              <tr key={n.id}>
                <td>
                  <div className="fw-semibold">{n.titulo}</div>
                  <div className="small text-body-secondary">{n.resumen}</div>
                </td>
                <td>
                  <Badge bg={coloresCategoria[n.categoria]?.bg ?? 'secondary'} text={coloresCategoria[n.categoria]?.text}>
                    {n.categoria}
                  </Badge>
                </td>
                <td className="text-nowrap">{formatearFecha(n.fecha)}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-secondary" className="rounded-pill px-3 me-1" onClick={() => abrir(n)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="link" className="link-danger" onClick={() => borrar(n)}>
                    Borrar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Button variant="secondary" className="rounded-pill px-4" onClick={() => abrir(null)}>
        Nueva noticia
      </Button>

      <Modal show={Boolean(editando)} onHide={() => setEditando(null)} centered size="lg" fullscreen="sm-down" enforceFocus={false}>
        <Form noValidate onSubmit={guardar}>
          <Modal.Header closeButton>
            <Modal.Title className="h5 fw-bold text-secondary">{editando?.id ? 'Editar noticia' : 'Nueva noticia'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-3">
              <Col md={8}>{campo('titulo', 'Título', 'El título tiene al menos 5 caracteres.', { autoFocus: true, maxLength: 90 })}</Col>
              <Col md={4}>{campo('fecha', 'Fecha', 'Indicá la fecha.', { type: 'date' })}</Col>
              <Col md={6}>
                <FloatingLabel controlId="noticia-categoria" label="Categoría">
                  <Form.Select value={formulario.categoria} onChange={poner('categoria')}>
                    {categoriasNoticia.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="noticia-imagen" label="Imagen: pegá un link (opcional)">
                  <Form.Control
                    value={formulario.imagen.startsWith('data:') ? '' : formulario.imagen}
                    onChange={poner('imagen')}
                    placeholder="https://…"
                    disabled={formulario.imagen.startsWith('data:')}
                  />
                </FloatingLabel>
              </Col>
              <Col xs={12}>
                <div className="d-flex flex-wrap align-items-center gap-3 bg-body-tertiary rounded-4 p-3">
                  {formulario.imagen ? (
                    <Image src={formulario.imagen} alt="Vista previa de la imagen" width={120} height={80} rounded className="object-fit-cover border" />
                  ) : (
                    <span className="small text-body-secondary">Sin imagen</span>
                  )}
                  <div className="d-flex flex-wrap gap-2 ms-auto">
                    <label className={`btn btn-outline-secondary rounded-pill px-3 mb-0 ${procesando ? 'disabled' : ''}`}>
                      {procesando ? 'Optimizando…' : 'Subir desde el dispositivo'}
                      <input type="file" accept="image/*" onChange={subirImagen} className="visually-hidden" disabled={procesando} />
                    </label>
                    {formulario.imagen && (
                      <Button variant="link" className="link-danger" onClick={() => setFormulario({ ...formulario, imagen: '' })}>
                        Quitar imagen
                      </Button>
                    )}
                  </div>
                  {formulario.imagen.startsWith('data:') && (
                    <div className="w-100 small text-body-secondary">Imagen subida y optimizada para el servidor ({pesoAproximado(formulario.imagen)}).</div>
                  )}
                  {errorImagen && <div className="w-100 small text-danger">{errorImagen}</div>}
                </div>
              </Col>
              <Col xs={12}>{campo('resumen', 'Resumen (se ve en la tarjeta)', 'El resumen tiene al menos 10 caracteres.', { maxLength: 140 })}</Col>
              <Col xs={12}>
                <Form.Group controlId="noticia-cuerpo">
                  <Form.Label className="small fw-semibold">Texto completo</Form.Label>
                  <Form.Control as="textarea" rows={6} value={formulario.cuerpo} onChange={poner('cuerpo')} isInvalid={validado && invalidos.cuerpo} />
                  <Form.Text>Dejá una línea en blanco entre párrafos.</Form.Text>
                  <Form.Control.Feedback type="invalid">Escribí el texto de la noticia (al menos 20 caracteres).</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" className="rounded-pill px-4" disabled={enviando || procesando}>
              {enviando ? 'Guardando…' : editando?.id ? 'Guardar cambios' : 'Publicar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Tarjeta>
  )
}

export default GestionNoticias
