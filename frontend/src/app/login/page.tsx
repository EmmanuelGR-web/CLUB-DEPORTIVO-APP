'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contextos/AuthContexto';
import { ErrorApi } from '@/servicios/clienteApi';
import { CampoTexto } from '@/componentes/ui/CampoTexto';
import { Boton } from '@/componentes/ui/Boton';
import { ConmutadorTema } from '@/componentes/ui/ConmutadorTema';

export default function PaginaLogin() {
  const { iniciarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError('');
    setCargando(true);
    try {
      await iniciarSesion(email, contrasena);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      {/* Animación de fondo */}
      <style>{`
        @keyframes gradientMove {
          0% { 
            background-position: 0% 50%; 
            transform: rotate(0deg);
          }
          50% { 
            background-position: 100% 50%; 
            transform: rotate(0.5deg);
          }
          100% { 
            background-position: 0% 50%; 
            transform: rotate(0deg);
          }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <main className="relative flex h-screen w-full overflow-hidden flex-col items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
        
        {/* Capa de fondo animado con colores del club */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `
              linear-gradient(-45deg, 
                rgba(220, 38, 38, 0.15) 0%, 
                rgba(234, 179, 8, 0.15) 25%,
                rgba(220, 38, 38, 0.15) 50%,
                rgba(234, 179, 8, 0.15) 75%,
                rgba(220, 38, 38, 0.15) 100%
              )
            `,
            backgroundSize: '400% 400%',
            animation: 'gradientMove 10s ease infinite, pulseGlow 5s ease-in-out infinite',
          }}
        />

        {/* Capa de ruido para textura */}
        <div className="absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.06]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* Botón de tema */}
        <div className="absolute right-4 top-4 z-20">
          <ConmutadorTema />
        </div>

        {/* Tarjeta del Formulario */}
        <div className="relative z-10 mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-lg transition-all duration-300 border border-red-200 dark:bg-gray-800/90 dark:border-red-800">
          
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <img 
                src="/logo.png" 
                alt="Escudo de San Martín de Tucumán" 
                className="h-24 w-24 object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="font-titulo text-2xl font-bold uppercase tracking-wide text-gray-800 dark:text-white">
              CLUB DEPORTIVO
            </h1>
            <p className="mt-1 font-cuerpo text-sm text-gray-600 dark:text-gray-300">
              Portal de socios
            </p>
          </div>

          <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
            <CampoTexto
              etiqueta="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
            <CampoTexto
              etiqueta="Contraseña"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <p role="alert" className="animate-pulse text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <Boton type="submit" cargando={cargando} className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg">
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </Boton>
          </form>

          <p className="mt-6 text-center font-cuerpo text-sm text-gray-600 dark:text-gray-300">
            ¿Todavía no sos socio?{' '}
            <Link href="/registro" className="font-bold text-red-600 hover:text-red-700 hover:underline dark:text-crimson-800 dark:hover:text-red-300 transition-colors">
              Creá tu cuenta
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}