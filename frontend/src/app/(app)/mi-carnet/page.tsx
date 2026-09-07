'use client';

import { useEffect, useState, useRef } from 'react';
import { Carnet } from '@/tipos';
import { sociosServicio } from '@/servicios/sociosServicio';
import { ErrorApi } from '@/servicios/clienteApi';
import { TarjetaCarnet } from '@/componentes/TarjetaCarnet';
import { Boton } from '@/componentes/ui/Boton';

export default function PaginaMiCarnet() {
  const [carnet, setCarnet] = useState<Carnet | null>(null);
  const [cargando, setCargando] = useState(true);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState('');
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  async function cargarCarnet() {
    try {
      const datos = await sociosServicio.obtenerMiCarnet();
      setCarnet(datos);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo cargar el carnet');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCarnet();
  }, []);

  async function manejarCambioArchivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    setSubiendoFoto(true);
    setError('');
    try {
      await sociosServicio.subirFotoCarnet(archivo);
      await cargarCarnet();
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo subir la foto');
    } finally {
      setSubiendoFoto(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-titulo text-3xl font-bold uppercase tracking-wide">Mi carnet</h1>
      {/* <p className="mb-8 font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
        Tu identificación digital como socio del club
      </p> */}

      {cargando && <p className="font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">Cargando…</p>}

      {error && (
        <p role="alert" className="mb-4 font-cuerpo text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {carnet && (
        <>
          <TarjetaCarnet carnet={carnet} />

          <div className="mt-6 flex justify-center">
            <input
              ref={inputArchivoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={manejarCambioArchivo}
            />
            <Boton
              variante="secundario"
              onClick={() => inputArchivoRef.current?.click()}
              cargando={subiendoFoto}
            >
              {carnet.fotoCarnetUrl ? 'Cambiar foto de carnet' : 'Subir foto de carnet'}
            </Boton>
          </div>
        </>
      )}
    </div>
  );
}
