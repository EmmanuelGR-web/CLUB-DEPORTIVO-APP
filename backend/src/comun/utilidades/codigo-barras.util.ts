// =====================================================================
// codigo-barras.util.ts
// -----------------------------------------------------------------------
// Genera el código único que va impreso/codificado en el carnet físico
// o digital de cada socio, en formato de código de barras.
//
// Es una FUNCIÓN PURA (no depende de la base de datos, ni de NestJS,
// ni de nada externo): dado el mismo idSocio, siempre da el mismo
// resultado. Esto la hace fácil de testear de forma aislada, y es un
// buen ejemplo de Single Responsibility: esta función solo sabe
// generar el código, no sabe nada de cómo se guarda ni se usa después.
//
// Formato elegido: CASM-{idSocio de 9 dígitos}-{dígito verificador}
// Ejemplo: CASM-599000001-7
//
// El "dígito verificador" (checksum) es un número extra calculado a
// partir del idSocio. Sirve para detectar errores de tipeo o de
// lectura del código de barras: si alguien escanea mal un dígito,
// el verificador ya no va a coincidir, y el sistema puede rechazar
// el carnet como inválido antes de buscarlo en la base de datos.
// Es la misma idea que usa el dígito verificador del DNI o del CUIT.
// =====================================================================

const LONGITUD_ID_EN_CODIGO = 9;
const PREFIJO_CLUB = 'CASM'; // Club Atlético San Martín

// Calcula un dígito verificador simple: suma cada dígito del número
// multiplicado por su posición, y se queda con el resto de dividir
// por 7. Es un algoritmo liviano, pensado para detectar errores de
// tipeo comunes (no para seguridad criptográfica).
function calcularDigitoVerificador(idSocio: number): number {
  const digitos = idSocio.toString().split('').map(Number);
  const sumaPonderada = digitos.reduce(
    (acumulado, digito, posicion) => acumulado + digito * (posicion + 1),
    0,
  );
  return sumaPonderada % 7;
}

export function generarCodigoBarras(idSocio: number): string {
  const idFormateado = idSocio.toString().padStart(LONGITUD_ID_EN_CODIGO, '0');
  const digitoVerificador = calcularDigitoVerificador(idSocio);
  return `${PREFIJO_CLUB}-${idFormateado}-${digitoVerificador}`;
}

// Permite validar un código de barras leído (por ejemplo, por un
// lector físico en el mostrador del club) y confirmar que no fue
// alterado ni mal escaneado, ANTES de ir a buscarlo a la base de datos.
export function validarCodigoBarras(codigo: string): boolean {
  const partes = codigo.split('-');
  if (partes.length !== 3 || partes[0] !== PREFIJO_CLUB) return false;

  const idSocio = Number(partes[1]);
  const digitoRecibido = Number(partes[2]);
  if (Number.isNaN(idSocio) || Number.isNaN(digitoRecibido)) return false;

  return calcularDigitoVerificador(idSocio) === digitoRecibido;
}
