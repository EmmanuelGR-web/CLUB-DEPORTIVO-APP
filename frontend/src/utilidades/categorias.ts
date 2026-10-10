// =====================================================================
// categorias.ts
// -----------------------------------------------------------------------
// Estilo visual de cada categoría de socio. Los rangos de años son los
// mismos que carga la migración 001 en la tabla categorias_socio.
// =====================================================================

export interface EstiloCategoria {
  degradado: string;
  texto: 'white' | 'dark';
  rango: string;
}

export const CATEGORIAS: Record<string, EstiloCategoria> = {
  Bronce: {
    degradado: 'linear-gradient(135deg, #c7843f 0%, #8a4b17 100%)',
    texto: 'white',
    rango: 'hasta 4 años',
  },
  Plata: {
    degradado: 'linear-gradient(135deg, #e4e6ea 0%, #9aa1ab 100%)',
    texto: 'dark',
    rango: 'de 5 a 14 años',
  },
  Oro: {
    degradado: 'linear-gradient(135deg, #f3d77a 0%, #c9952a 100%)',
    texto: 'dark',
    rango: '15 años o más',
  },
};

const SIN_CATEGORIA: EstiloCategoria = {
  degradado: 'linear-gradient(135deg, #d7263d 0%, #7a0f2e 100%)',
  texto: 'white',
  rango: '',
};

export function estiloCategoria(categoria: string): EstiloCategoria {
  return CATEGORIAS[categoria] ?? SIN_CATEGORIA;
}

// Cuántos años faltan para subir de categoría (null si ya es Oro).
export function proximaCategoria(antiguedadAnios: number): { nombre: string; faltan: number } | null {
  if (antiguedadAnios < 5) return { nombre: 'Plata', faltan: 5 - antiguedadAnios };
  if (antiguedadAnios < 15) return { nombre: 'Oro', faltan: 15 - antiguedadAnios };
  return null;
}
