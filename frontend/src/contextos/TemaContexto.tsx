'use client';

// =====================================================================
// TemaContexto.tsx
// -----------------------------------------------------------------------
// Modo claro / oscuro de todo el portal. Usa el modo nativo de
// Bootstrap (data-bs-theme en <html>) y recuerda la elección. Si el
// usuario nunca eligió, arranca con la preferencia del sistema.
// =====================================================================

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Tema = 'claro' | 'oscuro';

interface TemaContextoValor {
  tema: Tema;
  alternarTema: () => void;
}

const TemaContexto = createContext<TemaContextoValor | undefined>(undefined);

const CLAVE = 'club:tema';

export function TemaProveedor({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>('claro');

  // El layout ya aplicó el tema antes de pintar; acá solo se lee.
  useEffect(() => {
    setTema(document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'oscuro' : 'claro');
  }, []);

  const alternarTema = () => {
    const nuevo = tema === 'claro' ? 'oscuro' : 'claro';
    setTema(nuevo);
    document.documentElement.setAttribute('data-bs-theme', nuevo === 'oscuro' ? 'dark' : 'light');
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      // Sin almacenamiento el tema dura hasta recargar la página.
    }
  };

  return <TemaContexto.Provider value={{ tema, alternarTema }}>{children}</TemaContexto.Provider>;
}

export function useTema() {
  const contexto = useContext(TemaContexto);
  if (!contexto) throw new Error('useTema debe usarse dentro de un TemaProveedor');
  return contexto;
}
