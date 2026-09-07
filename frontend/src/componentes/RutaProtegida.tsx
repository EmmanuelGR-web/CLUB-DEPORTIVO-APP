'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contextos/AuthContexto';

export function RutaProtegida({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace('/login');
    }
  }, [usuario, cargando, router]);

  // Mientras se confirma si hay sesión, no se muestra nada (evita el
  // "parpadeo" de mostrar contenido protegido por una fracción de
  // segundo antes de redirigir).
  if (cargando || !usuario) return null;

  return <>{children}</>;
}
