'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useAuth } from '@/contextos/AuthContexto';
import { ErrorApi } from '@/servicios/clienteApi';
import { useTituloPagina } from '@/hooks/useTituloPagina';
import { alertaError, alertaExito } from '@/utilidades/alertas';
import { PantallaAcceso } from '@/componentes/socio/PantallaAcceso';
import { CampoContrasena } from '@/componentes/socio/CampoContrasena';

const VACIO = {
  nombre: '',
  apellido: '',
  email: '',
  contrasena: '',
  telefono: '',
  fechaNacimiento: '',
  ciudad: '',
  provincia: '',
  direccion: '',
};

type Campo = keyof typeof VACIO;

export default function PaginaRegistro() {
  useTituloPagina('Asociate');
  const { registrarse } = useAuth();
  const [datos, setDatos] = useState(VACIO);
  const [validado, setValidado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const cambiar = (campo: Campo) => (e: { target: { value: string } }) =>
    setDatos((actual) => ({ ...actual, [campo]: e.target.value }));

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!evento.currentTarget.checkValidity()) {
      setValidado(true);
      return;
    }

    setCargando(true);
    try {
      // Los opcionales vacíos no se mandan, para que el backend no los
      // valide como fechas o textos inválidos.
      const completos = Object.fromEntries(Object.entries(datos).filter(([, valor]) => valor.trim() !== '')) as typeof datos;
      await registrarse({ ...completos, email: datos.email.trim() });
      alertaExito('Ya podés ver tu carnet digital y pagar tu primera cuota.', `${datos.nombre}, ya sos parte del club`);
    } catch (err) {
      alertaError(err instanceof ErrorApi ? err.message : 'No pudimos crear tu cuenta. Probá de nuevo.', 'No se pudo completar el registro');
    } finally {
      setCargando(false);
    }
  }

  return (
    <PantallaAcceso titulo="Asociate" bajada="Completá tus datos y en un minuto tenés tu carnet digital." ancho={560}>
      <Form noValidate validated={validado} onSubmit={enviar}>
        <Row className="g-3">
          <Form.Group as={Col} sm={6} controlId="nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control value={datos.nombre} onChange={cambiar('nombre')} required maxLength={60} autoComplete="given-name" />
            <Form.Control.Feedback type="invalid">Ingresá tu nombre.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} sm={6} controlId="apellido">
            <Form.Label>Apellido</Form.Label>
            <Form.Control value={datos.apellido} onChange={cambiar('apellido')} required maxLength={60} autoComplete="family-name" />
            <Form.Control.Feedback type="invalid">Ingresá tu apellido.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} xs={12} controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={datos.email} onChange={cambiar('email')} required autoComplete="email" placeholder="nombre@correo.com" />
            <Form.Control.Feedback type="invalid">Ingresá un email válido.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} sm={6} controlId="telefono">
            <Form.Label>Teléfono <span className="opacity-50">(opcional)</span></Form.Label>
            <Form.Control type="tel" value={datos.telefono} onChange={cambiar('telefono')} pattern="[0-9 +()-]{6,20}" autoComplete="tel" />
            <Form.Control.Feedback type="invalid">Revisá el número.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} sm={6} controlId="fechaNacimiento">
            <Form.Label>Nacimiento <span className="opacity-50">(opcional)</span></Form.Label>
            <Form.Control type="date" value={datos.fechaNacimiento} onChange={cambiar('fechaNacimiento')} max={new Date().toISOString().slice(0, 10)} />
          </Form.Group>
          <Form.Group as={Col} sm={6} controlId="ciudad">
            <Form.Label>Ciudad <span className="opacity-50">(opcional)</span></Form.Label>
            <Form.Control value={datos.ciudad} onChange={cambiar('ciudad')} maxLength={80} />
          </Form.Group>
          <Form.Group as={Col} sm={6} controlId="provincia">
            <Form.Label>Provincia <span className="opacity-50">(opcional)</span></Form.Label>
            <Form.Control value={datos.provincia} onChange={cambiar('provincia')} maxLength={80} />
          </Form.Group>
          <Form.Group as={Col} xs={12} controlId="direccion">
            <Form.Label>Dirección <span className="opacity-50">(opcional)</span></Form.Label>
            <Form.Control value={datos.direccion} onChange={cambiar('direccion')} maxLength={120} autoComplete="street-address" />
          </Form.Group>
          <Form.Group as={Col} xs={12}>
            <Form.Label htmlFor="contrasena">Contraseña</Form.Label>
            <CampoContrasena
              id="contrasena"
              valor={datos.contrasena}
              onCambiar={(valor) => setDatos((actual) => ({ ...actual, contrasena: valor }))}
              autoComplete="new-password"
              minLength={8}
              mensajeError="Usá al menos 8 caracteres."
            />
            <Form.Text className="text-white-50">Mínimo 8 caracteres.</Form.Text>
          </Form.Group>
        </Row>

        <Button type="submit" variant="primary" size="lg" className="rounded-pill w-100 mt-4 fw-semibold" disabled={cargando}>
          {cargando ? (
            <>
              <Spinner size="sm" className="me-2" /> Creando tu cuenta…
            </>
          ) : (
            'Crear mi cuenta'
          )}
        </Button>
      </Form>

      <p className="text-center text-white-50 small mt-4 mb-0">
        ¿Ya sos socio?{' '}
        <Link href="/login" className="fw-semibold text-warning text-decoration-none">
          Ingresá
        </Link>
      </p>
    </PantallaAcceso>
  );
}
