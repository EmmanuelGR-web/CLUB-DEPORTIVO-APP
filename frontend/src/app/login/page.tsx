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

      <main className="relative flex min-h-screen w-full overflow-hidden flex-col items-center justify-center bg-hueso px-4 py-8 dark:bg-carbon">
        
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
        <div className="relative z-10 mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-rojo-club/20 bg-white/90 p-8 shadow-2xl backdrop-blur-lg transition-all duration-300 dark:border-dorado/20 dark:bg-carbon-suave/95">
          
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <img 
                src="/logo.png" 
                alt="Escudo de San Martín de Tucumán" 
                className="h-24 w-24 object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="font-titulo text-2xl font-bold uppercase tracking-wide">
              CLUB DEPORTIVO
            </h1>
            <p className="mt-1 font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
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

            <Boton type="submit" cargando={cargando} className="mt-2 w-full shadow-lg">
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </Boton>
          </form>

          <p className="mt-6 text-center font-cuerpo text-sm text-carbon/60 dark:text-hueso/60">
            ¿Todavía no sos socio?{' '}
            <Link href="/registro" className="font-bold text-rojo-club transition-colors hover:text-rojo-profundo hover:underline dark:text-dorado dark:hover:text-yellow-300">
              Creá tu cuenta
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}