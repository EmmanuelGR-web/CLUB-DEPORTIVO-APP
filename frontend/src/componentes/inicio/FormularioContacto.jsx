'use client'

import { useState } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'
import { FaPaperPlane } from 'react-icons/fa'

const vacio = { nombre: '', email: '', mensaje: '' }
const maximo = 300

function FormularioContacto() {
  const [valores, setValores] = useState(vacio)
  const [validado, setValidado] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const cambiar = (e) => setValores({ ...valores, [e.target.name]: e.target.value })

  const enviar = (e) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) {
      setValidado(true)
      return
    }
    setEnviado(true)
    setValores(vacio)
    setValidado(false)
  }

  return (
    <Form noValidate validated={validado} onSubmit={enviar} className="bg-body rounded-4 shadow-sm p-4">
      {enviado && (
        <Alert variant="success" dismissible onClose={() => setEnviado(false)}>
          ¡Gracias por escribirnos! Te vamos a responder a la brevedad.
        </Alert>
      )}

      <Form.Group className="mb-3" controlId="contacto-nombre">
        <Form.Label>Nombre completo</Form.Label>
        <Form.Control name="nombre" value={valores.nombre} onChange={cambiar} required autoComplete="name" />
        <Form.Control.Feedback type="invalid">Ingresá tu nombre.</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="contacto-email">
        <Form.Label>Correo electrónico</Form.Label>
        <Form.Control type="email" name="email" value={valores.email} onChange={cambiar} required autoComplete="email" placeholder='ejemplo@gmail.com' />
        <Form.Control.Feedback type="invalid">Ingresá un correo electrónico válido.</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="contacto-mensaje">
        <Form.Label>Mensaje</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="mensaje"
          value={valores.mensaje}
          onChange={cambiar}
          required
          minLength={10}
          maxLength={maximo}
        />
        <Form.Control.Feedback type="invalid">Contanos brevemente tu consulta (al menos 10 caracteres).</Form.Control.Feedback>
        <Form.Text className="d-block text-end">
          {valores.mensaje.length}/{maximo} caracteres
        </Form.Text>
      </Form.Group>

      <Button type="submit" variant="primary" className="rounded-pill px-4 d-inline-flex align-items-center gap-2">
        <FaPaperPlane /> Enviar
      </Button>
    </Form>
  )
}

export default FormularioContacto
