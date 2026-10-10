'use client';

import { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface Props {
  id: string;
  valor: string;
  onCambiar: (valor: string) => void;
  autoComplete: string;
  minLength?: number;
  mensajeError?: string;
}

export function CampoContrasena({ id, valor, onCambiar, autoComplete, minLength, mensajeError }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup hasValidation>
      <Form.Control
        id={id}
        type={visible ? 'text' : 'password'}
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        autoComplete={autoComplete}
        minLength={minLength}
        placeholder="••••••••"
        required
      />
      <Button
        variant="light"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="border-0"
      >
        {visible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
      </Button>
      {mensajeError && <Form.Control.Feedback type="invalid">{mensajeError}</Form.Control.Feedback>}
    </InputGroup>
  );
}
