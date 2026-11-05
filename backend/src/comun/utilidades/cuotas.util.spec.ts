import {
  CUOTA_MENSUAL,
  aniosEntre,
  calcularCuota,
  categoriaPorAntiguedad,
  diasDeDemora,
  periodosDesdeAlta,
  textoPeriodo,
  vencimientoDe,
  vencimientoInicial,
} from './cuotas.util';

describe('cuotas.util', () => {
  describe('categoriaPorAntiguedad', () => {
    it.each([
      [0, 'Bronce'],
      [2, 'Bronce'],
      [2.01, 'Plata'],
      [10, 'Plata'],
      [10.01, 'Oro'],
      [35, 'Oro'],
    ])('con %p años es %p', (anios, categoria) => {
      expect(categoriaPorAntiguedad(anios)).toBe(categoria);
    });
  });

  it('aniosEntre cuenta años con decimales', () => {
    expect(aniosEntre(new Date(2020, 0, 1), new Date(2021, 0, 1))).toBeCloseTo(1, 2);
    expect(aniosEntre(new Date(2020, 0, 1), new Date(2020, 6, 2))).toBeCloseTo(0.5, 2);
  });

  it('la cuota vence el día 15 a las 23:59:59', () => {
    expect(vencimientoDe(2026, 9)).toEqual(new Date(2026, 9, 15, 23, 59, 59));
  });

  describe('vencimientoInicial', () => {
    it('si el alta es a principio de mes vence el 15', () => {
      expect(vencimientoInicial(new Date(2026, 9, 1, 10))).toEqual(new Date(2026, 9, 15, 23, 59, 59));
    });

    it('si faltan menos de 10 días para el 15 vence 10 días después del alta', () => {
      expect(vencimientoInicial(new Date(2026, 9, 10, 10))).toEqual(new Date(2026, 9, 20, 10));
    });

    it('si el alta es después del 15 también da 10 días', () => {
      expect(vencimientoInicial(new Date(2026, 9, 28, 9))).toEqual(new Date(2026, 10, 7, 9));
    });
  });

  describe('diasDeDemora', () => {
    const vence = new Date(2026, 9, 15, 23, 59, 59);

    it('es 0 si se paga antes o en el momento del vencimiento', () => {
      expect(diasDeDemora(new Date(2026, 9, 3), vence)).toBe(0);
      expect(diasDeDemora(vence, vence)).toBe(0);
    });

    it('cualquier fracción de día cuenta como un día entero', () => {
      expect(diasDeDemora(new Date(2026, 9, 16, 0, 0, 1), vence)).toBe(1);
      expect(diasDeDemora(new Date(2026, 9, 25, 12), vence)).toBe(10);
    });
  });

  describe('calcularCuota', () => {
    const vence = new Date(2026, 9, 15, 23, 59, 59);

    it('sin demora no hay recargo', () => {
      expect(calcularCuota(18000, new Date(2026, 9, 10), vence)).toEqual({ base: 18000, dias: 0, recargo: 0, total: 18000 });
    });

    it('suma 0,1 % por cada día de demora', () => {
      expect(calcularCuota(18000, new Date(2026, 9, 25, 12), vence)).toEqual({ base: 18000, dias: 10, recargo: 180, total: 18180 });
    });

    it('redondea el recargo a pesos enteros', () => {
      expect(calcularCuota(21000, new Date(2026, 9, 16, 8), vence).recargo).toBe(21);
      expect(calcularCuota(15000, new Date(2026, 9, 18, 8), vence).recargo).toBe(45);
    });
  });

  it('textoPeriodo arma AAAA-MM con el mes contado desde 0', () => {
    expect(textoPeriodo(2026, 0)).toBe('2026-01');
    expect(textoPeriodo(2026, 11)).toBe('2026-12');
  });

  describe('periodosDesdeAlta', () => {
    it('genera una cuota por mes desde el alta hasta hoy', () => {
      const periodos = periodosDesdeAlta(new Date(2026, 7, 10, 9), new Date(2026, 10, 4));
      expect(periodos.map((p) => p.periodo)).toEqual(['2026-08', '2026-09', '2026-10', '2026-11']);
      expect(periodos.map((p) => p.indice)).toEqual([0, 1, 2, 3]);
    });

    it('el primer mes es inscripción + cuota y se cobra doble', () => {
      const [primero, segundo] = periodosDesdeAlta(new Date(2026, 7, 10, 9), new Date(2026, 9, 1));
      expect(primero.concepto).toBe('Inscripción y cuota');
      expect(primero.base).toBe(30000);
      expect(primero.vence).toEqual(new Date(2026, 7, 20, 9));
      expect(segundo.concepto).toBe('Cuota mensual');
      expect(segundo.base).toBe(15000);
      expect(segundo.vence).toEqual(new Date(2026, 8, 15, 23, 59, 59));
    });

    it('la cuota es de $15.000 para todas las categorías', () => {
      expect(CUOTA_MENSUAL).toBe(15000);
      const periodos = periodosDesdeAlta(new Date(2016, 2, 1), new Date(2026, 4, 1));
      const base = (periodo: string) => periodos.find((p) => p.periodo === periodo).base;
      expect(categoriaPorAntiguedad(aniosEntre(new Date(2016, 2, 1), new Date(2018, 1, 1)))).toBe('Bronce');
      expect(base('2018-02')).toBe(15000);
      expect(categoriaPorAntiguedad(aniosEntre(new Date(2016, 2, 1), new Date(2018, 3, 1)))).toBe('Plata');
      expect(base('2018-04')).toBe(15000);
      expect(categoriaPorAntiguedad(aniosEntre(new Date(2016, 2, 1), new Date(2026, 3, 1)))).toBe('Oro');
      expect(base('2026-04')).toBe(15000);
      expect(periodos.slice(1).every((p) => p.base === 15000)).toBe(true);
    });

    it('un alta de hoy tiene solo la cuota de este mes', () => {
      const hoy = new Date(2026, 10, 4, 15);
      expect(periodosDesdeAlta(hoy, hoy)).toHaveLength(1);
    });

    it('un alta del 31 no saltea meses cortos', () => {
      const periodos = periodosDesdeAlta(new Date(2026, 0, 31), new Date(2026, 3, 1));
      expect(periodos.map((p) => p.periodo)).toEqual(['2026-01', '2026-02', '2026-03', '2026-04']);
    });

    it('un alta en el futuro no genera cuotas', () => {
      expect(periodosDesdeAlta(new Date(2027, 0, 1), new Date(2026, 10, 4))).toEqual([]);
    });
  });
});
