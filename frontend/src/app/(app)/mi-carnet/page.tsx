'use client';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { FaCamera } from 'react-icons/fa';
import { Carnet } from '@/tipos';
import { sociosServicio } from '@/servicios/sociosServicio';
import { ErrorApi } from '@/servicios/clienteApi';
import { useAuth } from '@/contextos/AuthContexto';
import { useEstadoCuenta } from '@/hooks/useEstadoCuenta';
import { useTituloPagina } from '@/hooks/useTituloPagina';
import { alertaError, avisoBreve } from '@/utilidades/alertas';
import { formatearPeriodo, formatearPesos } from '@/utilidades/formato';
import { BENEFICIOS } from '@/datos/beneficios';
import { EncabezadoPagina } from '@/componentes/socio/EncabezadoPagina';
import { Seccion } from '@/componentes/socio/Seccion';
import { Cargando } from '@/componentes/socio/Cargando';
import { CarnetDigital } from '@/componentes/socio/CarnetDigital';
import { EstadoMembresia } from '@/componentes/socio/EstadoMembresia';
import { TablaCuotas } from '@/componentes/socio/TablaCuotas';
import { Beneficios } from '@/componentes/socio/Beneficios';

const TAMANIO_MAXIMO_FOTO = 5 * 1024 * 1024;

function saludo(): string {
  const hora = new Date().getHours();
  if (hora < 13) return 'Buen día';
  if (hora < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function PaginaMiCarnet() {
  useTituloPagina('Mi carnet');
  const { usuario } = useAuth();
  const [carnet, setCarnet] = useState<Carnet | null>(null);
  const [error, setError] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const inputArchivo = useRef<HTMLInputElement>(null);
  const { cuotas, resumen } = useEstadoCuenta();

  const cargarCarnet = useCallback(async () => {
    setError('');
    try {
      setCarnet(await sociosServicio.obtenerMiCarnet());
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo cargar el carnet');
    }
  }, []);

  useEffect(() => {
    cargarCarnet();
  }, [cargarCarnet]);

  async function cambiarFoto(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;
    if (archivo.size > TAMANIO_MAXIMO_FOTO) {
      alertaError('La foto no puede pesar más de 5 MB.', 'Foto demasiado pesada');
      return;
    }

    setSubiendoFoto(true);
    try {
      await sociosServicio.subirFotoCarnet(archivo);
      await cargarCarnet();
      avisoBreve('Foto de carnet actualizada');
    } catch (err) {
      alertaError(err instanceof ErrorApi ? err.message : 'No se pudo subir la foto');
    } finally {
      setSubiendoFoto(false);
    }
  }

  const ultimas = [...cuotas].sort((a, b) => b.periodo.localeCompare(a.periodo)).slice(0, 4);
  const proxima = resumen.proxima;

  return (
    <>
      <EncabezadoPagina titulo="Mi carnet" bajada={`${saludo()}, ${usuario?.nombre}. Este es tu resumen como socio.`} />

      {proxima && (
        <Alert variant={proxima.vencida ? 'danger' : 'warning'} className="d-flex flex-wrap align-items-center gap-2 rounded-4 border-0 shadow-sm">
          <span>
            {proxima.vencida ? 'Tenés la cuota ' : 'Tenés pendiente la cuota '}
            <strong>{formatearPeriodo(proxima.periodo)}</strong> por <strong>{formatearPesos(proxima.monto)}</strong>
            {proxima.vencida ? ', ya vencida.' : '.'}
          </span>
          <Link href="/pagos" className="btn btn-sm btn-secondary rounded-pill px-3 ms-auto">
            Informar pago
          </Link>
        </Alert>
      )}

      {!carnet ? (
        <Cargando texto="Preparando tu carnet…" error={error} onReintentar={cargarCarnet} />
      ) : (
        <Row className="g-4 mb-4">
          <Col xl={7}>
            <CarnetDigital carnet={carnet} />
            <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
              <input ref={inputArchivo} type="file" accept="image/jpeg,image/png,image/webp" className="d-none" onChange={cambiarFoto} />
              <Button
                variant="secondary"
                className="rounded-pill px-4 d-inline-flex align-items-center gap-2"
                onClick={() => inputArchivo.current?.click()}
                disabled={subiendoFoto}
              >
                <FaCamera aria-hidden="true" />
                {subiendoFoto ? 'Subiendo foto…' : carnet.fotoCarnetUrl ? 'Cambiar foto' : 'Subir foto de carnet'}
              </Button>
              <small className="text-body-secondary">Mostrá el código en la entrada del estadio y del complejo.</small>
            </div>
          </Col>
          <Col xl={5}>
            <EstadoMembresia carnet={carnet} />
          </Col>
        </Row>
      )}

      <Seccion
        titulo="Últimas cuotas"
        className="mb-4"
        acciones={
          <Link href="/pagos" className="small fw-semibold text-decoration-none">
            Ver todas
          </Link>
        }
      >
        {ultimas.length === 0 ? (
          <p className="text-body-secondary mb-0">Todavía no hay cuotas cargadas.</p>
        ) : (
          <TablaCuotas cuotas={ultimas} />
        )}
      </Seccion>

      <h2 className="tarjeta-titulo mb-2">Beneficios para socios</h2>
      <Beneficios beneficios={BENEFICIOS} />
    </>
  );
}
