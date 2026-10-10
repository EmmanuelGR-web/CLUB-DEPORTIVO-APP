'use client'

import { useState } from 'react'
import { Form, InputGroup, Button } from 'react-bootstrap'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

function CampoContrasena({ id, etiqueta, valor, onCambiar, invalido, mensaje, autoComplete = 'new-password' }) {
  const [ver, setVer] = useState(false)

  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{etiqueta} *</Form.Label>
      <InputGroup hasValidation>
        <Form.Control
          type={ver ? 'text' : 'password'}
          value={valor}
          onChange={(e) => onCambiar(e.target.value)}
          isInvalid={invalido}
          autoComplete={autoComplete}
        />
        <Button variant="light" onClick={() => setVer(!ver)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          {ver ? <FaEyeSlash /> : <FaEye />}
        </Button>
        <Form.Control.Feedback type="invalid" className="text-warning fw-semibold">
          {mensaje}
        </Form.Control.Feedback>
      </InputGroup>
    </Form.Group>
  )
}

export default CampoContrasena
