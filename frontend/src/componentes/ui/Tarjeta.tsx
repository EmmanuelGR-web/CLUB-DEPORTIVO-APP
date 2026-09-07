import { HTMLAttributes } from 'react';

export function Tarjeta({ className = '', ...resto }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-carbon/10 bg-white p-6 shadow-sm
        dark:border-white/10 dark:bg-carbon-suave ${className}`}
      {...resto}
    />
  );
}
