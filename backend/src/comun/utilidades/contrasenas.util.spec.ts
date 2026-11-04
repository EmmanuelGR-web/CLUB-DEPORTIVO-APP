import { REGLA_CONTRASENA, cifrarContrasena, compararContrasena, contrasenaTemporal } from './contrasenas.util';

describe('contrasenas.util', () => {
  describe('REGLA_CONTRASENA', () => {
    it.each(['clave1234', 'Ñandú2026', 'socio123', 'a1b2c3d4'])('acepta %p', (clave) => {
      expect(REGLA_CONTRASENA.test(clave)).toBe(true);
    });

    it.each([
      ['abcdefgh', 'sin números'],
      ['12345678', 'sin letras'],
      ['abc123', 'menos de 8 caracteres'],
      ['a1'.repeat(37), 'más de 72 caracteres'],
      ['', 'vacía'],
    ])('rechaza %p (%s)', (clave) => {
      expect(REGLA_CONTRASENA.test(clave)).toBe(false);
    });
  });

  describe('contrasenaTemporal', () => {
    const muestras = Array.from({ length: 200 }, () => contrasenaTemporal());

    it('tiene 10 caracteres y cumple la regla del portal', () => {
      for (const clave of muestras) {
        expect(clave).toHaveLength(10);
        expect(REGLA_CONTRASENA.test(clave)).toBe(true);
      }
    });

    it('no usa caracteres que se confunden al dictarla (0, O, 1, l, I)', () => {
      for (const clave of muestras) expect(clave).toMatch(/^[a-hj-km-np-z2-9]+$/);
    });

    it('no se repite', () => {
      expect(new Set(muestras).size).toBe(muestras.length);
    });
  });

  it('cifra con bcrypt costo 12 y compara bien', async () => {
    const hash = await cifrarContrasena('clave1234');
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
    expect(hash).not.toContain('clave1234');
    await expect(compararContrasena('clave1234', hash)).resolves.toBe(true);
    await expect(compararContrasena('clave12345', hash)).resolves.toBe(false);
  });
});
