import { InputHTMLAttributes, forwardRef } from 'react';

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string;
}

export const CampoTexto = forwardRef<HTMLInputElement, CampoTextoProps>(
  ({ etiqueta, error, id, className = '', ...resto }, ref) => {
    const idCampo = id ?? etiqueta.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={idCampo} className="font-cuerpo text-sm font-medium">
          {etiqueta}
        </label>
        <input
          ref={ref}
          id={idCampo}
          className={`rounded-lg border border-carbon/15 bg-white px-3.5 py-2.5 font-cuerpo text-sm
            placeholder:text-carbon/40 focus:border-rojo-club
            dark:border-white/15 dark:bg-carbon-suave dark:text-hueso dark:placeholder:text-hueso/40
            dark:focus:border-dorado ${error ? 'border-red-500' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${idCampo}-error` : undefined}
          {...resto}
        />
        {error && (
          <p id={`${idCampo}-error`} className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

CampoTexto.displayName = 'CampoTexto';
