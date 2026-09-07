'use client';

import { useTema } from '@/contextos/TemaContexto';

export function ConmutadorTema() {
  const { tema, alternarTema } = useTema();
  const esModoOscuro = tema === 'oscuro';

  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      {/* Texto opcional (puedes ocultarlo si quieres solo el botón) */}
      <span className={`text-sm font-cuerpo transition-colors duration-300 ${
        esModoOscuro ? 'text-hueso/80' : 'text-carbon/80'
      }`}>
        {esModoOscuro ? 'Modo oscuro' : 'Modo claro'}
      </span>

      {/* Contenedor del Switch (Botón deslizante) */}
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only peer" // Oculta el checkbox nativo
          checked={esModoOscuro}
          onChange={alternarTema}
          aria-label="Alternar modo oscuro"
        />
        
        {/* El riel del interruptor (fondo) */}
        <div className={`
          w-12 h-7 rounded-full transition-colors duration-300 ease-in-out
          bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rojo-club/50
          dark:bg-carbon peer-checked:bg-rojo-club peer-checked:after:translate-x-full
          peer-checked:after:border-white
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-200
          after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6
          after:transition-all after:duration-300 dark:peer-checked:bg-rojo-club
          after:shadow-md
        `}></div>
        
        {/* Iconos dentro del círculo que se desliza */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
          {/* Icono Sol (visible en modo claro) */}
          <svg 
            className={`w-3.5 h-3.5 text-yellow-500 transition-all duration-300 ${esModoOscuro ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <circle cx="12" cy="12" r="5" strokeWidth="2" />
            <path strokeWidth="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          
          {/* Icono Luna (visible en modo oscuro) */}
          <svg 
            className={`w-3.5 h-3.5 text-white transition-all duration-300 ${esModoOscuro ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeWidth="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>
      </div>
    </label>
  );
}