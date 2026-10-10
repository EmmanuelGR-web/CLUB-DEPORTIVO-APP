// =====================================================================
// formato.ts
// -----------------------------------------------------------------------
// Funciones chicas para mostrar montos, fechas y períodos siempre igual
// en todo el portal (formato argentino).
// =====================================================================

const pesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

export function formatearPesos(monto: string | number): string {
  return pesos.format(Number(monto));
}

// Las fechas sin hora ("2026-10-15") se interpretan como UTC y pueden
// mostrarse un día antes en Argentina; por eso se arman a mano.
function aFecha(valor: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [anio, mes, dia] = valor.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
  }
  return new Date(valor);
}

export function formatearFecha(valor: string): string {
  return aFecha(valor).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatearFechaLarga(valor: string): string {
  return aFecha(valor).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// "2026-10" → "Octubre 2026". Si el período viene en otro formato se
// devuelve tal cual, para no inventar nada.
export function formatearPeriodo(periodo: string): string {
  const coincide = /^(\d{4})-(\d{2})$/.exec(periodo);
  if (!coincide) return periodo;
  const mes = MESES[Number(coincide[2]) - 1];
  return mes ? `${mes[0].toUpperCase()}${mes.slice(1)} ${coincide[1]}` : periodo;
}

export function diasHasta(valor: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((aFecha(valor).getTime() - hoy.getTime()) / 86_400_000);
}

export function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}
