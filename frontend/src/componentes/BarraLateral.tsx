'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contextos/AuthContexto';
import { ConmutadorTema } from '@/componentes/ui/ConmutadorTema';

const ENLACES = [
  { href: '/mi-carnet', etiqueta: 'Mi carnet' },
  { href: '/pagos', etiqueta: 'Cuota social' },
  { href: '/mi-perfil', etiqueta: 'Mi cuenta' },
];

export function BarraLateral() {
  const rutaActual = usePathname();
  const { usuario, cerrarSesion } = useAuth();

  return (
    <nav className="flex w-full shrink-0 flex-col justify-between border-b border-carbon/10 bg-white p-4 dark:border-white/10 dark:bg-carbon-suave md:min-h-screen md:w-60 md:border-b-0 md:border-r">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <div>
            <img src="/logo.png" alt="Logo del club" className="flex h-9 w-9 items-center justify-center rounded-lg object-contain" />
          </div>
          <span className="font-titulo text-sm font-semibold uppercase leading-tight">
            {usuario?.rol === 'socio' ? 'Panel de socios' : 'Panel administrativo'}
          </span>
        </div>

        <ul className="flex flex-wrap gap-1 md:flex-col">
          {ENLACES.map((enlace) => {
            const activo = rutaActual === enlace.href;
            return (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className={`block rounded-lg px-3 py-2 font-cuerpo text-sm font-medium transition-colors ${
                    activo
                      ? 'bg-rojo-club text-white'
                      : 'text-carbon/70 hover:bg-carbon/5 dark:text-hueso/70 dark:hover:bg-white/5'
                  }`}
                >
                  {enlace.etiqueta}
                </Link>
              </li>
            );
          })}
          {usuario && usuario.rol !== 'socio' && (
            <li>
              <Link
                href="/admin"
                className={`block rounded-lg px-3 py-2 font-cuerpo text-sm font-medium transition-colors ${
                  rutaActual === '/admin'
                    ? 'bg-rojo-club text-white'
                    : 'text-carbon/70 hover:bg-carbon/5 dark:text-hueso/70 dark:hover:bg-white/5'
                }`}
              >
                Administración
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-carbon/10 pt-4 dark:border-white/10">
        <div className="px-2 font-cuerpo text-xs text-carbon/50 dark:text-hueso/50">
          {usuario?.nombre} {usuario?.apellido}
          <br />
          Socio N.º {usuario?.idSocio}
        </div>
        <ConmutadorTema />
        <button
          onClick={cerrarSesion}
          className="rounded-lg px-3 py-2 text-left font-cuerpo text-sm text-carbon/70 hover:bg-carbon/5 dark:text-hueso/70 dark:hover:bg-white/5"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
