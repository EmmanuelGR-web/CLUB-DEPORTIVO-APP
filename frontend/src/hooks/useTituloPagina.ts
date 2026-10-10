'use client';

import { useEffect } from 'react';

// Las páginas del portal son de cliente, así que el título de la
// pestaña se cambia acá en vez de con `metadata`.
export function useTituloPagina(titulo: string) {
  useEffect(() => {
    document.title = `${titulo} | Club Deportivo`;
  }, [titulo]);
}
