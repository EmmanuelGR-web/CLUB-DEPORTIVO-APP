import {
  detectarRed,
  erroresTarjeta,
  formatearNumero,
  formatearVencimiento,
  pasaLuhn,
  resumirTarjeta,
  revisarNumeroTarjeta,
  vencimientoValido,
} from './tarjetas'

const VISA = '4242424242424242'
const MASTERCARD = '5555555555554444'
const MASTERCARD_SERIE_2 = '2223003122003222'
const AMEX = '378282246310005'

describe('detectarRed', () => {
  it.each([
    [VISA, 'visa'],
    [MASTERCARD, 'mastercard'],
    [MASTERCARD_SERIE_2, 'mastercard'],
    [AMEX, 'amex'],
    ['6011111111111117', null],
    ['', null],
  ])('%p es %p', (numero, red) => {
    expect(detectarRed(numero)).toBe(red)
  })

  it('ignora espacios y guiones', () => {
    expect(detectarRed('4242 4242-4242 4242')).toBe('visa')
  })
})

describe('pasaLuhn', () => {
  it.each([VISA, MASTERCARD, MASTERCARD_SERIE_2, AMEX, '4242 4242 4242 4242'])('acepta %p', (numero) => {
    expect(pasaLuhn(numero)).toBe(true)
  })

  it.each(['4242424242424241', '5555555555554445', '', 'abcd'])('rechaza %p', (numero) => {
    expect(pasaLuhn(numero)).toBe(false)
  })
})

describe('formatearNumero', () => {
  it('agrupa de a 4 y corta en 16 números', () => {
    expect(formatearNumero('42424242424242429999')).toBe('4242 4242 4242 4242')
  })

  it('American Express va en grupos de 4, 6 y 5', () => {
    expect(formatearNumero(AMEX)).toBe('3782 822463 10005')
  })

  it('formatea mientras se escribe', () => {
    expect(formatearNumero('424242')).toBe('4242 42')
  })
})

describe('vencimiento', () => {
  const hoy = new Date(2026, 10, 4)

  it('pone la barra MM/AA mientras se escribe', () => {
    expect(formatearVencimiento('1')).toBe('1')
    expect(formatearVencimiento('112')).toBe('11/2')
    expect(formatearVencimiento('11/2799')).toBe('11/27')
  })

  it.each(['11/26', '01/27', '10/36'])('%p es válido', (texto) => {
    expect(vencimientoValido(texto, hoy)).toBe(true)
  })

  it.each([
    ['10/26', 'ya vencida'],
    ['13/27', 'mes inexistente'],
    ['00/27', 'mes inexistente'],
    ['12/36', 'más de 10 años'],
    ['1127', 'sin barra'],
  ])('%p no es válido (%s)', (texto) => {
    expect(vencimientoValido(texto, hoy)).toBe(false)
  })
})

describe('revisarNumeroTarjeta', () => {
  it('una tarjeta correcta no tiene error', () => {
    expect(revisarNumeroTarjeta(VISA, 'bna')).toBe('')
    expect(revisarNumeroTarjeta(AMEX, 'macro')).toBe('')
  })

  it('avisa cuando el emisor no trabaja con esa red', () => {
    expect(revisarNumeroTarjeta(VISA, 'mercadopago')).toBe('Mercado Pago no acepta tarjetas Visa.')
    expect(revisarNumeroTarjeta(AMEX, 'bna')).toBe('Banco Nación no acepta tarjetas American Express.')
  })

  it('avisa si falta o sobra algún número', () => {
    expect(revisarNumeroTarjeta('424242424242', 'bna')).toBe('Una tarjeta Visa tiene 16 números.')
  })

  it('avisa si no pasa el control de Luhn', () => {
    expect(revisarNumeroTarjeta('4242424242424241', 'bna')).toBe('El número de tarjeta no es válido. Revisalo.')
  })

  it('avisa si la red no es Visa, Mastercard ni Amex', () => {
    expect(revisarNumeroTarjeta('6011111111111117', 'macro')).toMatch(/No reconocemos la red/)
  })
})

describe('erroresTarjeta', () => {
  const completa = {
    emisor: 'macro',
    tipo: 'Crédito',
    numero: AMEX,
    titular: 'Juan Pérez',
    vencimiento: '12/30',
    cvv: '1234',
    debitoAutomatico: true,
  }

  it('una tarjeta completa no marca ningún campo', () => {
    expect(Object.values(erroresTarjeta(completa)).some(Boolean)).toBe(false)
  })

  it('Amex pide 4 números de seguridad y el resto 3', () => {
    expect(erroresTarjeta({ ...completa, cvv: '123' }).cvv).toBe(true)
    expect(erroresTarjeta({ ...completa, numero: VISA, cvv: '123' }).cvv).toBe(false)
  })

  it('marca los campos vacíos o cortos', () => {
    const errores = erroresTarjeta({ ...completa, emisor: '', tipo: '', titular: ' Jo ' })
    expect(errores).toMatchObject({ emisor: true, tipo: true, titular: true })
  })
})

describe('resumirTarjeta', () => {
  it('solo guarda la marca, la red y los últimos 4 números', () => {
    const resumen = resumirTarjeta({ emisor: 'bna', numero: '4242 4242 4242 4242', cvv: '123', vencimiento: '12/30', debitoAutomatico: false })
    expect(resumen).toEqual({ tipo: 'tarjeta', debitoAutomatico: false, emisor: 'bna', red: 'visa', ultimos4: '4242' })
    expect(JSON.stringify(resumen)).not.toMatch(/4242424242424242|123|12\/30/)
  })
})
