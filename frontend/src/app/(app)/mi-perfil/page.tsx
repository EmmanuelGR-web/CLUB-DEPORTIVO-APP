'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Perfil } from '@/tipos';
import { sociosServicio } from '@/servicios/sociosServicio';
import { ErrorApi } from '@/servicios/clienteApi';
import { CampoTexto } from '@/componentes/ui/CampoTexto';
import { Boton } from '@/componentes/ui/Boton';
import { Tarjeta } from '@/componentes/ui/Tarjeta';

export default function PaginaMiPerfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    sociosServicio
      .obtenerMiPerfil()
      .then(setPerfil)
      .catch((err) => setError(err instanceof ErrorApi ? err.message : 'No se pudo cargar el perfil'))
      .finally(() => setCargando(false));
  }, []);

  function actualizarCampo(campo: keyof Perfil, valor: string) {
    setPerfil((anterior) => (anterior ? { ...anterior, [campo]: valor } : anterior));
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    if (!perfil) return;

    setGuardando(true);
    setError('');
    setMensaje('');
    try {
      const actualizado = await sociosServicio.actualizarMiPerfil({
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        telefono: perfil.telefono ?? undefined,
        ciudad: perfil.ciudad ?? undefined,
        provincia: perfil.provincia ?? undefined,
        direccion: perfil.direccion ?? undefined,
      });
      setPerfil(actualizado);
      setMensaje('Tus datos se guardaron correctamente');
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudieron guardar los cambios');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className="font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">Cargando…</p>;
  }

  if (!perfil) {
    return (
      <p role="alert" className="font-cuerpo text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 font-titulo text-3xl font-bold uppercase tracking-wide">Mi cuenta</h1>
      <p className="mb-8 font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
        Datos personales. El número de socio no se puede modificar.
      </p>

      <Tarjeta>
        <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
          <div className="mb-2 flex items-center justify-between rounded-lg bg-hueso px-4 py-3 dark:bg-carbon">
            <span className="font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
              Número de socio
            </span>
            <span className="font-dato text-sm font-medium">{perfil.idSocio}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CampoTexto
              etiqueta="Nombre"
              value={perfil.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              required
            />
            <CampoTexto
              etiqueta="Apellido"
              value={perfil.apellido}
              onChange={(e) => actualizarCampo('apellido', e.target.value)}
              required
            />
          </div>

          <CampoTexto etiqueta="Email" value={perfil.email} disabled />

          <CampoTexto
            etiqueta="Teléfono"
            value={perfil.telefono ?? ''}
            onChange={(e) => actualizarCampo('telefono', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <CampoTexto
              etiqueta="Ciudad"
              value={perfil.ciudad ?? ''}
              onChange={(e) => actualizarCampo('ciudad', e.target.value)}
            />
            <CampoTexto
              etiqueta="Provincia"
              value={perfil.provincia ?? ''}
              onChange={(e) => actualizarCampo('provincia', e.target.value)}
            />
          </div>

          <CampoTexto
            etiqueta="Dirección"
            value={perfil.direccion ?? ''}
            onChange={(e) => actualizarCampo('direccion', e.target.value)}
          />

          {error && (
            <p role="alert" className="font-cuerpo text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {mensaje && (
            <p role="status" className="font-cuerpo text-sm text-green-700 dark:text-green-400">
              {mensaje}
            </p>
          )}

          <Boton type="submit" cargando={guardando} className="mt-2 w-fit">
            Guardar cambios
          </Boton>
        </form>
      </Tarjeta>
    </div>
  );
}
