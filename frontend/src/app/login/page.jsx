'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '@/contextos/AuthContexto';
import { ErrorApi } from '@/servicios/clienteApi';
import { useTituloPagina } from '@/hooks/useTituloPagina';
import { alertaError, avisoBreve } from '@/utilidades/alertas';
import { PantallaAcceso } from '@/componentes/socio/PantallaAcceso';
import { CampoContrasena } from '@/componentes/socio/CampoContrasena';

export default function PaginaLogin() {
  useTituloPagina('Ingresar');
  const { iniciarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [validado, setValidado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function ingresar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!evento.currentTarget.checkValidity()) {
      setValidado(true);
      return;
    }

    setCargando(true);
    try {
      await iniciarSesion(email.trim(), contrasena);
      avisoBreve('Sesión iniciada');
    } catch (err) {
      const mensaje =
        err instanceof ErrorApi
          ? err.codigoEstado === 401
            ? 'El email o la contraseña no son correctos.'
            : err.message
          : 'No pudimos conectarnos con el club. Probá de nuevo en unos minutos.';
      alertaError(mensaje, 'No pudiste ingresar');
    } finally {
      setCargando(false);
    }
  }

  return (
    <PantallaAcceso titulo="Ingresar" bajada="Accedé con el email con el que te asociaste.">
      <Form noValidate validated={validado} onSubmit={ingresar} className="d-grid gap-3">
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@correo.com"
            autoComplete="email"
            required
          />
          <Form.Control.Feedback type="invalid">Ingresá un email válido.</Form.Control.Feedback>
        </Form.Group>

        <Form.Group>
          <Form.Label htmlFor="contrasena">Contraseña</Form.Label>
          <CampoContrasena
            id="contrasena"
            valor={contrasena}
            onCambiar={setContrasena}
            autoComplete="current-password"
            mensajeError="Ingresá tu contraseña."
          />
        </Form.Group>

        <Button type="submit" variant="primary" size="lg" className="rounded-pill mt-2 fw-semibold" disabled={cargando}>
          {cargando ? (
            <>
              <Spinner size="sm" className="me-2" /> Ingresando…
            </>
          ) : (
            'Ingresar'
          )}
        </Button>
      </Form>

      <p className="text-center text-white-50 small mt-4 mb-0">
        ¿Todavía no sos socio?{' '}
        <Link href="/registro" className="fw-semibold text-warning text-decoration-none">
          Asociate acá
        </Link>
      </p>
    </PantallaAcceso>
  );
}
