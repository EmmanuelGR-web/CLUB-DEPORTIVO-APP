const cargarImagen = (archivo) =>
  new Promise((resolver, rechazar) => {
    const imagen = new Image()
    imagen.onload = () => resolver(imagen)
    imagen.onerror = () => rechazar(new Error('No pudimos abrir la imagen.'))
    imagen.src = URL.createObjectURL(archivo)
  })

const dibujar = (imagen, ladoMaximo, calidad) => {
  const escala = Math.min(1, ladoMaximo / Math.max(imagen.width, imagen.height))
  const lienzo = document.createElement('canvas')
  lienzo.width = Math.round(imagen.width * escala)
  lienzo.height = Math.round(imagen.height * escala)
  const ctx = lienzo.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, lienzo.width, lienzo.height)
  ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
  return lienzo.toDataURL('image/jpeg', calidad)
}

export const comprimirParaApi = async (archivo, { ladoMaximo = 900, maximoCaracteres = 70000 } = {}) => {
  if (!archivo.type.startsWith('image/')) throw new Error('El archivo tiene que ser una imagen.')
  const imagen = await cargarImagen(archivo)
  let lado = ladoMaximo
  try {
    while (lado >= 300) {
      for (const calidad of [0.8, 0.7, 0.6, 0.5]) {
        const dataUrl = dibujar(imagen, lado, calidad)
        if (dataUrl.length <= maximoCaracteres) return dataUrl
      }
      lado = Math.round(lado * 0.8)
    }
  } finally {
    URL.revokeObjectURL(imagen.src)
  }
  throw new Error('La imagen es demasiado detallada para el servidor. Probá con otra.')
}

export const pesoAproximado = (dataUrl) => `${Math.round((dataUrl.length * 0.75) / 1024)} KB`
