'use client'

import { useEffect } from 'react'

export function useTituloPagina(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | Club Deportivo` : 'Portal de socios | Club Deportivo'
  }, [titulo])
}
