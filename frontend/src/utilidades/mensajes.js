// Adjuntos de mensajes y comprobantes: las imágenes se achican en el
// navegador antes de subirlas y los PDF tienen un tope de tamaño.
import { abrirArchivo } from '../servicios/cuentaApi'

export const maximoOriginal = 10 * 1024 * 1024
export const maximoPdf = 1.5 * 1024 * 1024
export const textoLimite = 'Imágenes de hasta 10 MB (se optimizan solas) o PDF de hasta 1,5 MB'
const ladoMaximo = 1600
export const maximoAdjuntos = 3

const leerComoDataUrl = (archivo) =>
  new Promise((resolver, rechazar) => {
    const lector = new FileReader()
    lector.onload = () => resolver(lector.result)
    lector.onerror = () => rechazar(new Error(`No pudimos leer "${archivo.name}".`))
    lector.readAsDataURL(archivo)
  })

const bytesDe = (dataUrl) => Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75)

const optimizarImagen = (dataUrl) =>
  new Promise((resolver, rechazar) => {
    const imagen = new Image()
    imagen.onload = () => {
      const escala = Math.min(1, ladoMaximo / Math.max(imagen.width, imagen.height))
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(imagen.width * escala)
      lienzo.height = Math.round(imagen.height * escala)
      const ctx = lienzo.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, lienzo.width, lienzo.height)
      ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
      resolver(lienzo.toDataURL('image/jpeg', 0.82))
    }
    imagen.onerror = () => rechazar(new Error('No pudimos abrir la imagen.'))
    imagen.src = dataUrl
  })

export const leerAdjunto = async (archivo) => {
  const esImagen = archivo.type.startsWith('image/')
  if (!esImagen && archivo.type !== 'application/pdf') throw new Error(`"${archivo.name}" tiene que ser una imagen o un PDF.`)
  if (archivo.size > (esImagen ? maximoOriginal : maximoPdf)) {
    throw new Error(`"${archivo.name}" es muy pesado. ${textoLimite}.`)
  }
  const original = await leerComoDataUrl(archivo)
  if (!esImagen) return { nombre: archivo.name, tipo: archivo.type, tamanio: archivo.size, dataUrl: original }

  const dataUrl = await optimizarImagen(original)
  const nombre = archivo.name.replace(/\.[^.]+$/, '') + '.jpg'
  return { nombre, tipo: 'image/jpeg', tamanio: bytesDe(dataUrl), dataUrl }
}

export const tamanioLegible = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`)

// Trae el archivo del servidor y lo descarga con su nombre.
export const descargarArchivo = async (archivo) => {
  const { dataUrl, nombre } = await abrirArchivo(archivo.id)
  const enlace = document.createElement('a')
  enlace.href = dataUrl
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
}
