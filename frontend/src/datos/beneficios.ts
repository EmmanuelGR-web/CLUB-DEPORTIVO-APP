// Beneficios que se muestran en el resumen del socio. Por ahora son
// fijos; cuando el club los cargue desde el panel admin se van a leer
// de la API con la misma forma.

export interface Beneficio {
  id: string;
  titulo: string;
  detalle: string;
  descripcion: string;
  extra: string;
}

export const BENEFICIOS: Beneficio[] = [
  {
    id: 'platea',
    titulo: 'Platea preferencial',
    detalle: '30% en entradas',
    descripcion: 'Descuento en la platea para todos los partidos de local del torneo. Se aplica en boletería o en la venta online con tu número de socio.',
    extra: 'Hasta 2 entradas por partido',
  },
  {
    id: 'tienda',
    titulo: 'Tienda oficial',
    detalle: '15% en indumentaria',
    descripcion: 'Camisetas, buzos y accesorios oficiales con descuento todo el año en el local del estadio.',
    extra: 'No acumulable con otras promociones',
  },
  {
    id: 'pileta',
    titulo: 'Natatorio',
    detalle: 'Pileta libre sin cargo',
    descripcion: 'Acceso a la pileta libre de lunes a viernes de 8 a 12 h y fines de semana en temporada de verano.',
    extra: 'Con apto médico vigente',
  },
  {
    id: 'escuelas',
    titulo: 'Escuelas deportivas',
    detalle: '20% en la cuota',
    descripcion: 'Descuento en la cuota mensual de fútbol, básquet, vóley, hockey y natación para el socio y su grupo familiar directo.',
    extra: 'Grupo familiar a cargo',
  },
  {
    id: 'gimnasio',
    titulo: 'Gimnasio del club',
    detalle: '2x1 los martes',
    descripcion: 'Los martes podés entrar con un acompañante al gimnasio del complejo sin costo adicional.',
    extra: 'Turno mañana y tarde',
  },
  {
    id: 'confiteria',
    titulo: 'Confitería',
    detalle: '10% de lunes a jueves',
    descripcion: 'Descuento en la confitería del club presentando el carnet digital desde el celular.',
    extra: 'Excepto días de partido',
  },
];
