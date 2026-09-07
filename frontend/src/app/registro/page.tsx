'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contextos/AuthContexto';
import { ErrorApi } from '@/servicios/clienteApi';
import { CampoTexto } from '@/componentes/ui/CampoTexto';
import { Boton } from '@/componentes/ui/Boton';
import { ConmutadorTema } from '@/componentes/ui/ConmutadorTema';

export default function PaginaRegistro() {
  const { registrarse } = useAuth();
  const [datos, setDatos] = useState({
    nombre: '',
    apellido: '',
    email: '',
    contrasena: '',
    telefono: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function actualizarCampo(campo: keyof typeof datos, valor: string) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError('');
    setCargando(true);
    try {
      await registrarse(datos);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-hueso px-4 py-10 dark:bg-carbon">
      <div className="absolute right-4 top-4">
        <ConmutadorTema />
      </div>

      <div className="w-full max-w-sm" style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)' }}>
        <div className="mb-8 text-center">
          <h1 className="font-titulo text-3xl font-bold uppercase tracking-wide">Creá tu cuenta</h1>
        </div>

        <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <CampoTexto
              etiqueta="Nombre"
              value={datos.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              required
            />
            <CampoTexto
              etiqueta="Apellido"
              value={datos.apellido}
              onChange={(e) => actualizarCampo('apellido', e.target.value)}
              required
            />
          </div>
          <CampoTexto
            etiqueta="Email"
            type="email"
            value={datos.email}
            onChange={(e) => actualizarCampo('email', e.target.value)}
            required
            autoComplete="email"
          />
          <CampoTexto
            etiqueta="Teléfono (opcional)"
            type="tel"
            value={datos.telefono}
            onChange={(e) => actualizarCampo('telefono', e.target.value)}
          />
          <CampoTexto
            etiqueta="Contraseña"
            type="password"
            value={datos.contrasena}
            onChange={(e) => actualizarCampo('contrasena', e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <Boton type="submit" cargando={cargando} className="mt-2 w-full">
            Crear cuenta
          </Boton>
        </form>

        <p className="mt-6 text-center font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
          ¿Ya sos socio?{' '}
          <Link href="/login" className="font-medium text-rojo-club dark:text-dorado">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
