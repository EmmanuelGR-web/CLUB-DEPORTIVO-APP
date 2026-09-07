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
    <nav className="flex h-full w-56 flex-col justify-between border-r border-carbon/10 bg-white p-4 dark:border-white/10 dark:bg-carbon-suave">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <div>
            <img src="/logo.png" alt="logo" className="flex h-9 w-9 items-center justify-center rounded-" />
          </div>
          <span className="font-titulo text-sm font-semibold uppercase leading-tight">
          Panel de socios
          </span>
        </div>

        <ul className="flex flex-col gap-1">
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
