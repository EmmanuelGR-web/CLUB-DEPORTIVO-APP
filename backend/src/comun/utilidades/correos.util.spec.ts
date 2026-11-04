import { correoInstitucional, correoPersonal } from './correos.util';

describe('correos.util', () => {
  describe('correoInstitucional', () => {
    it('usa nombre.apellido y los últimos 4 números del socio', () => {
      expect(correoInstitucional('Lucía Herrera', '599000006')).toBe('lucia.herrera.0006@socios.clubdeportivo.com.ar');
    });

    it('sin número de socio no agrega sufijo', () => {
      expect(correoInstitucional('Juan Pérez')).toBe('juan.perez@socios.clubdeportivo.com.ar');
    });

    it('quita acentos, eñes, símbolos y espacios de más', () => {
      expect(correoInstitucional('  José   Muñoz-Ibáñez ', '12')).toBe('jose.munozibanez.12@socios.clubdeportivo.com.ar');
    });
  });

  describe('correoPersonal', () => {
    it('usa el primer nombre y el primer apellido', () => {
      expect(correoPersonal('Pedro Luis', 'Díaz Gómez')).toBe('pedro.diaz@clubdeportivo.com.ar');
    });

    it('normaliza mayúsculas, acentos y apóstrofos', () => {
      expect(correoPersonal('ÁNGELA', "O'Brien")).toBe('angela.obrien@clubdeportivo.com.ar');
    });
  });
});
