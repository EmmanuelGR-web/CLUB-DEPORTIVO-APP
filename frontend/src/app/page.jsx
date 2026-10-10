'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contextos/AuthContexto';

export default function PaginaInicio() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (cargando) return;
    router.replace(usuario ? '/mi-carnet' : '/login');
  }, [usuario, cargando, router]);

  return null;
}
