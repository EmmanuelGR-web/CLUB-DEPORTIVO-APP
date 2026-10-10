import { leerDocumento } from '../servicios/cuentaApi'

export const leerConIA = async (tipo, archivos, contexto = {}) => {
  try {
    return await leerDocumento(tipo, archivos, contexto)
  } catch (problema) {
    if (problema.estado === 0) throw new Error('No pudimos conectar con el servicio de lectura.', { cause: problema })
    throw problema
  }
}

export const montosCoinciden = (leido, esperado) => leido !== null && Math.abs(leido - esperado) <= 1

export const camposCorregidos = (leidos, finales) =>
  Object.entries(leidos)
    .filter(([campo, valor]) => valor && String(finales[campo] ?? '').trim() !== String(valor).trim())
    .map(([campo]) => campo)
