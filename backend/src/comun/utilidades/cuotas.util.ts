// =====================================================================
// cuotas.util.ts
// -----------------------------------------------------------------------
// Reglas de la cuota social, en un solo lugar para que el socio, el
// personal y los reportes calculen siempre lo mismo:
//
//   - La cuota se genera sola cada mes desde el mes de alta.
//   - El monto depende de la categoría que tenía el socio ese mes.
//   - El primer mes se cobra doble (inscripción + cuota).
//   - Vence el día 15. El primer vencimiento es el 15 de ese mes o
//     10 días después del alta, lo que llegue más tarde.
//   - Después del vencimiento se suma 0,1 % por día de demora.
// =====================================================================

export const DIA_VENCIMIENTO = 15;
export const INTERES_DIARIO = 0.001;
export const CUOTA_POR_CATEGORIA: Record<string, number> = { Bronce: 15000, Plata: 18000, Oro: 21000 };

const UN_DIA = 24 * 3600 * 1000;

// Años con decimales entre dos fechas, como se usa para la categoría.
export const aniosEntre = (desde: Date, hasta: Date) => (hasta.getTime() - desde.getTime()) / (365.25 * UN_DIA);

export const categoriaPorAntiguedad = (anios: number) => (anios <= 2 ? 'Bronce' : anios <= 10 ? 'Plata' : 'Oro');

export const vencimientoDe = (anio: number, mes: number) => new Date(anio, mes, DIA_VENCIMIENTO, 23, 59, 59);

export function vencimientoInicial(fechaAlta: Date) {
  const diezDias = new Date(fechaAlta.getTime() + 10 * UN_DIA);
  const quince = vencimientoDe(fechaAlta.getFullYear(), fechaAlta.getMonth());
  return diezDias > quince ? diezDias : quince;
}

export const diasDeDemora = (fechaPago: Date, vence: Date) =>
  fechaPago > vence ? Math.ceil((fechaPago.getTime() - vence.getTime()) / UN_DIA) : 0;

export function calcularCuota(base: number, fechaPago: Date, vence: Date) {
  const dias = diasDeDemora(fechaPago, vence);
  const recargo = Math.round(base * INTERES_DIARIO * dias);
  return { base, dias, recargo, total: base + recargo };
}

export const textoPeriodo = (anio: number, mes: number) => `${anio}-${String(mes + 1).padStart(2, '0')}`;

export interface PeriodoCuota {
  periodo: string;
  anio: number;
  mes: number; // 0 a 11
  indice: number; // 0 = mes de alta
  concepto: 'Inscripción y cuota' | 'Cuota mensual';
  base: number;
  vence: Date;
}

// Lista los períodos que el socio tiene que pagar, del más viejo al
// más nuevo, hasta el mes de `hoy` incluido.
export function periodosDesdeAlta(fechaAlta: Date, hoy = new Date()): PeriodoCuota[] {
  const periodos: PeriodoCuota[] = [];
  const mes = new Date(fechaAlta.getFullYear(), fechaAlta.getMonth(), 1);
  let indice = 0;
  while (mes <= hoy) {
    const anio = mes.getFullYear();
    const numeroMes = mes.getMonth();
    const categoria = categoriaPorAntiguedad(aniosEntre(fechaAlta, mes));
    periodos.push({
      periodo: textoPeriodo(anio, numeroMes),
      anio,
      mes: numeroMes,
      indice,
      concepto: indice === 0 ? 'Inscripción y cuota' : 'Cuota mensual',
      base: CUOTA_POR_CATEGORIA[categoria] * (indice === 0 ? 2 : 1),
      vence: indice === 0 ? vencimientoInicial(fechaAlta) : vencimientoDe(anio, numeroMes),
    });
    mes.setMonth(mes.getMonth() + 1);
    indice += 1;
  }
  return periodos;
}
