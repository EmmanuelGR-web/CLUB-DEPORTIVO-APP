'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { FaLock } from 'react-icons/fa';
import { Perfil } from '@/tipos';
import { sociosServicio } from '@/servicios/sociosServicio';
import { ErrorApi } from '@/servicios/clienteApi';
import { useAuth } from '@/contextos/AuthContexto';
import { useTituloPagina } from '@/hooks/useTituloPagina';
import { alertaError, alertaExito } from '@/utilidades/alertas';
import { iniciales } from '@/utilidades/formato';
import { EncabezadoPagina } from '@/componentes/socio/EncabezadoPagina';
import { Seccion } from '@/componentes/socio/Seccion';
import { Cargando } from '@/componentes/socio/Cargando';

type CampoEditable = 'nombre' | 'apellido' | 'telefono' | 'fechaNacimiento' | 'ciudad' | 'provincia' | 'direccion';

const PROVINCIAS = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad Autónoma de Buenos Aires', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];

export default function PaginaMiPerfil() {
  useTituloPagina('Mi cuenta');
  const { actualizarUsuario } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [original, setOriginal] = useState<Perfil | null>(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [validado, setValidado] = useState(false);

  async function cargar() {
    setError('');
    try {
      const datos = await sociosServicio.obtenerMiPerfil();
      setPerfil(datos);
      setOriginal(datos);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo cargar tu perfil');
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function cambiar(campo: CampoEditable, valor: string) {
    setPerfil((actual) => (actual ? { ...actual, [campo]: valor } : actual));
  }

  const huboCambios = JSON.stringify(perfil) !== JSON.stringify(original);

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!perfil) return;
    if (!evento.currentTarget.checkValidity()) {
      setValidado(true);
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await sociosServicio.actualizarMiPerfil({
        nombre: perfil.nombre.trim(),
        apellido: perfil.apellido.trim(),
        telefono: perfil.telefono || undefined,
        fechaNacimiento: perfil.fechaNacimiento || undefined,
        ciudad: perfil.ciudad || undefined,
        provincia: perfil.provincia || undefined,
        direccion: perfil.direccion || undefined,
      });
      setPerfil(actualizado);
      setOriginal(actualizado);
      setValidado(false);
      actualizarUsuario({ nombre: actualizado.nombre, apellido: actualizado.apellido });
      alertaExito('Tus datos quedaron actualizados.', 'Cambios guardados');
    } catch (err) {
      alertaError(err instanceof ErrorApi ? err.message : 'No se pudieron guardar los cambios');
    } finally {
      setGuardando(false);
    }
  }

  if (!perfil) {
    return (
      <>
        <EncabezadoPagina titulo="Mi cuenta" />
        <Cargando texto="Cargando tus datos…" error={error} onReintentar={cargar} />
      </>
    );
  }

  return (
    <>
      <EncabezadoPagina titulo="Mi cuenta" bajada="Mantené tus datos al día para recibir los avisos del club." />

      <Row className="g-4">
        <Col lg={4}>
          <Seccion className="text-center h-100">
            <div
              className="mx-auto mb-3 rounded-circle overflow-hidden d-flex align-items-center justify-content-center font-credencial fw-bold fs-2 text-white border border-3 border-warning"
              style={{ width: 112, height: 112, background: 'linear-gradient(135deg, #d7263d, #7a0f2e)' }}
            >
              {perfil.fotoCarnetUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={perfil.fotoCarnetUrl} alt="Tu foto de carnet" className="w-100 h-100 object-fit-cover" />
              ) : (
                iniciales(`${perfil.nombre} ${perfil.apellido}`)
              )}
            </div>
            <div className="fw-bold fs-5">
              {perfil.nombre} {perfil.apellido}
            </div>
            <div className="text-body-secondary small mb-3">{perfil.email}</div>
            <div className="bg-body-tertiary rounded-4 p-3 text-start">
              <div className="etiqueta-mini">N.º de socio</div>
              <div className="font-numeros fw-bold fs-5">{perfil.idSocio}</div>
              <small className="text-body-secondary d-flex align-items-center gap-1 mt-1">
                <FaLock aria-hidden="true" size={11} /> Lo asigna el club y no se puede cambiar.
              </small>
            </div>
            <p className="small text-body-secondary mt-3 mb-0">La foto se cambia desde la sección Mi carnet.</p>
          </Seccion>
        </Col>

        <Col lg={8}>
          <Seccion titulo="Datos personales">
            <Form noValidate validated={validado} onSubmit={guardar}>
              <Row className="g-3">
                <Form.Group as={Col} md={6} controlId="nombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control value={perfil.nombre} onChange={(e) => cambiar('nombre', e.target.value)} required maxLength={60} />
                  <Form.Control.Feedback type="invalid">Ingresá tu nombre.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md={6} controlId="apellido">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control value={perfil.apellido} onChange={(e) => cambiar('apellido', e.target.value)} required maxLength={60} />
                  <Form.Control.Feedback type="invalid">Ingresá tu apellido.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md={6} controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={perfil.email} disabled readOnly />
                  <Form.Text>Para cambiarlo, comunicate con secretaría.</Form.Text>
                </Form.Group>
                <Form.Group as={Col} md={6} controlId="telefono">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    value={perfil.telefono ?? ''}
                    onChange={(e) => cambiar('telefono', e.target.value)}
                    pattern="[0-9 +()-]{6,20}"
                    placeholder="381 555-1234"
                  />
                  <Form.Control.Feedback type="invalid">Revisá el número de teléfono.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md={6} controlId="fechaNacimiento">
                  <Form.Label>Fecha de nacimiento</Form.Label>
                  <Form.Control
                    type="date"
                    value={perfil.fechaNacimiento ? perfil.fechaNacimiento.slice(0, 10) : ''}
                    onChange={(e) => cambiar('fechaNacimiento', e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </Form.Group>
                <Form.Group as={Col} md={6} controlId="provincia">
                  <Form.Label>Provincia</Form.Label>
                  <Form.Select value={perfil.provincia ?? ''} onChange={(e) => cambiar('provincia', e.target.value)}>
                    <option value="">Elegí una provincia</option>
                    {PROVINCIAS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} md={6} controlId="ciudad">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control value={perfil.ciudad ?? ''} onChange={(e) => cambiar('ciudad', e.target.value)} maxLength={80} />
                </Form.Group>
                <Form.Group as={Col} md={6} controlId="direccion">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control value={perfil.direccion ?? ''} onChange={(e) => cambiar('direccion', e.target.value)} maxLength={120} />
                </Form.Group>
              </Row>

              <div className="d-flex flex-wrap gap-2 justify-content-end mt-4">
                <Button
                  variant="outline-secondary"
                  className="rounded-pill px-4"
                  disabled={!huboCambios || guardando}
                  onClick={() => {
                    setPerfil(original);
                    setValidado(false);
                  }}
                >
                  Descartar
                </Button>
                <Button type="submit" variant="primary" className="rounded-pill px-4" disabled={!huboCambios || guardando}>
                  {guardando ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </div>
            </Form>
          </Seccion>
        </Col>
      </Row>
    </>
  );
}
