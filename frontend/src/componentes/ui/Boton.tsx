import { ButtonHTMLAttributes, forwardRef } from 'react';

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'fantasma';
  cargando?: boolean;
}

// forwardRef: permite que un formulario (o cualquier padre) pueda
// enfocar este botón programáticamente si hace falta, sin romper
// el tipado de TypeScript.
export const Boton = forwardRef<HTMLButtonElement, BotonProps>(
  ({ variante = 'primario', cargando, children, className = '', disabled, ...resto }, ref) => {
    const estilosBase =
      'inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-cuerpo font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

    const estilosPorVariante = {
      primario: 'bg-rojo-club text-white hover:bg-rojo-profundo',
      secundario:
        'bg-transparent border border-rojo-club text-rojo-club hover:bg-rojo-club/10 dark:border-dorado dark:text-dorado dark:hover:bg-dorado/10',
      fantasma: 'bg-transparent text-carbon hover:bg-carbon/5 dark:text-hueso dark:hover:bg-white/5',
    };

    return (
      <button
        ref={ref}
        className={`${estilosBase} ${estilosPorVariante[variante]} ${className}`}
        disabled={disabled || cargando}
        {...resto}
      >
        {cargando ? 'Un momento…' : children}
      </button>
    );
  },
);

Boton.displayName = 'Boton';
