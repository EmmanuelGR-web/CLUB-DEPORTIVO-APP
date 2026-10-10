'use client';

// =====================================================================
// TemaContexto.tsx
// -----------------------------------------------------------------------
// Maneja el modo oscuro/claro de toda la app. Guarda la preferencia
// del usuario en localStorage para que se mantenga entre visitas,
// y respeta la preferencia del sistema operativo como valor inicial
// si el usuario todavía no eligió nada explícitamente.
// =====================================================================

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Tema = 'claro' | 'oscuro';

interface TemaContextoValor {
  tema: Tema;
  alternarTema: () => void;
}

const TemaContexto = createContext<TemaContextoValor | undefined>(undefined);

const CLAVE_ALMACENAMIENTO = 'club-san-martin:tema';

export function TemaProveedor({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>('claro');
  const [montado, setMontado] = useState(false);

  // Al cargar la página, revisa si el usuario ya había elegido un
  // tema antes; si no, usa la preferencia del sistema operativo.
  useEffect(() => {
    const temaGuardado = localStorage.getItem(CLAVE_ALMACENAMIENTO) as Tema | null;
    if (temaGuardado) {
      setTema(temaGuardado);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTema('oscuro');
    }
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!montado) return;
    // "dark" lo usa Tailwind (panel admin) y data-bs-theme lo usa
    // Bootstrap (portal de socios); se actualizan juntos.
    document.documentElement.classList.toggle('dark', tema === 'oscuro');
    document.documentElement.setAttribute('data-bs-theme', tema === 'oscuro' ? 'dark' : 'light');
    localStorage.setItem(CLAVE_ALMACENAMIENTO, tema);
  }, [tema, montado]);

  const alternarTema = () => {
    setTema((actual) => (actual === 'claro' ? 'oscuro' : 'claro'));
  };

  return <TemaContexto.Provider value={{ tema, alternarTema }}>{children}</TemaContexto.Provider>;
}

export function useTema() {
  const contexto = useContext(TemaContexto);
  if (!contexto) {
    throw new Error('useTema debe usarse dentro de un TemaProveedor');
  }
  return contexto;
}
