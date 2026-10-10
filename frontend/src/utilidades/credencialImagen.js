import { categorias } from './categorias'
import { barrasCarnet, idQrCarnet } from './carnet'

const ANCHO = 1712
const ALTO = 1080
const grafito = '#1e1b24'
const gris = '#6b6475'
const colorBarra = { primary: '#d7263d', dark: grafito }

const cargarImagen = (src) =>
  new Promise((resolver, rechazar) => {
    const imagen = new Image()
    imagen.onload = () => resolver(imagen)
    imagen.onerror = rechazar
    imagen.src = src
  })

const dibujarCubriendo = (ctx, imagen, x, y, w, h) => {
  const escala = Math.max(w / imagen.width, h / imagen.height)
  const iw = imagen.width * escala
  const ih = imagen.height * escala
  ctx.drawImage(imagen, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih)
}

const degradadoCategoria = (ctx, x, y, w, h, tonos) => {
  const d = ctx.createLinearGradient(x, y, x + w, y + h)
  d.addColorStop(0, tonos[0])
  d.addColorStop(0.55, tonos[1])
  d.addColorStop(1, tonos[2])
  return d
}

const caminoEscudo = (ctx, x, y, w, h) => {
  ctx.beginPath()
  ctx.moveTo(x + w / 2, y)
  ctx.lineTo(x + w, y + h * 0.12)
  ctx.lineTo(x + w, y + h * 0.62)
  ctx.lineTo(x + w / 2, y + h)
  ctx.lineTo(x, y + h * 0.62)
  ctx.lineTo(x, y + h * 0.12)
  ctx.closePath()
}

const escribir = (ctx, texto, x, y, { fuente, color = grafito, espaciado = 0, alinear = 'left' }) => {
  ctx.font = fuente
  ctx.fillStyle = color
  ctx.textAlign = alinear
  ctx.letterSpacing = `${espaciado}px`
  ctx.fillText(texto, x, y)
  ctx.letterSpacing = '0px'
}

const iniciales = (nombre) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()

export const imagenCredencial = async (socio) => {
  await Promise.all([
    document.fonts.load('700 40px Rajdhani'),
    document.fonts.load('600 40px Rajdhani'),
    document.fonts.load('700 40px "JetBrains Mono"'),
    document.fonts.load('500 40px "JetBrains Mono"'),
  ])
  const [hinchada, escudo, foto] = await Promise.all([
    cargarImagen('/revista/tapa.jpeg'),
    cargarImagen('/logo.png'),
    socio.foto ? cargarImagen(socio.foto) : Promise.resolve(null),
  ])
  const categoria = categorias[socio.categoria]
  const colorEncabezado = categoria.texto === 'white' ? '#ffffff' : grafito

  const lienzo = document.createElement('canvas')
  lienzo.width = ANCHO
  lienzo.height = ALTO
  const ctx = lienzo.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ANCHO, ALTO)
  ctx.beginPath()
  ctx.roundRect(0, 0, ANCHO, ALTO, 56)
  ctx.clip()

  const altoEncabezado = 210
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, altoEncabezado, ANCHO, ALTO - altoEncabezado)
  ctx.clip()
  dibujarCubriendo(ctx, hinchada, 0, altoEncabezado, ANCHO, ALTO - altoEncabezado)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.fillRect(0, altoEncabezado, ANCHO, ALTO - altoEncabezado)
  ctx.restore()

  ctx.fillStyle = degradadoCategoria(ctx, 0, 0, ANCHO, altoEncabezado, categoria.tonos)
  ctx.fillRect(0, 0, ANCHO, altoEncabezado)
  escribir(ctx, `SOCIO ${socio.categoria.toUpperCase()}`, 70, 85, { fuente: '700 34px Rajdhani', color: colorEncabezado, espaciado: 9 })
  escribir(ctx, `N° ${socio.numeroSocio}`, 70, 160, { fuente: '700 62px "JetBrains Mono"', color: colorEncabezado })
  escribir(ctx, 'CLUB', ANCHO - 230, 95, { fuente: '700 30px Rajdhani', color: colorEncabezado, espaciado: 6, alinear: 'right' })
  escribir(ctx, 'DEPORTIVO', ANCHO - 230, 132, { fuente: '700 30px Rajdhani', color: colorEncabezado, espaciado: 6, alinear: 'right' })
  ctx.save()
  ctx.beginPath()
  ctx.rect(ANCHO - 200, 30, 150, 150)
  ctx.clip()
  dibujarCubriendo(ctx, escudo, ANCHO - 200, 30, 150, 150)
  ctx.restore()

  const [rx, ry, rw, rh] = [70, 265, 280, 345]
  caminoEscudo(ctx, rx, ry, rw, rh)
  ctx.fillStyle = degradadoCategoria(ctx, rx, ry, rw, rh, categoria.tonos)
  ctx.fill()
  caminoEscudo(ctx, rx + 12, ry + 14, rw - 24, rh - 28)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.save()
  caminoEscudo(ctx, rx + 24, ry + 28, rw - 48, rh - 56)
  ctx.clip()
  ctx.fillStyle = '#7a0f2e'
  ctx.fillRect(rx, ry, rw, rh)
  if (foto) dibujarCubriendo(ctx, foto, rx + 24, ry + 28, rw - 48, rh - 56)
  else escribir(ctx, iniciales(socio.nombreCompleto), rx + rw / 2, ry + rh / 2 + 20, { fuente: '700 90px Rajdhani', color: '#ffffff', alinear: 'center' })
  ctx.restore()

  const dx = 420
  const etiqueta = (texto, x, y) => escribir(ctx, texto, x, y, { fuente: '600 24px Rajdhani', color: gris, espaciado: 5 })
  const valor = (texto, x, y, mono) => escribir(ctx, String(texto).toUpperCase(), x, y, { fuente: mono ? '700 50px "JetBrains Mono"' : '700 52px Rajdhani' })
  etiqueta('NOMBRE', dx, 325)
  valor(socio.nombreCompleto, dx, 380)
  etiqueta('DNI', dx, 450)
  valor(socio.dni, dx, 505, true)
  etiqueta('INGRESO', dx, 575)
  valor(socio.anioIngreso, dx, 630, true)
  etiqueta('ESTADO', dx + 260, 575)
  valor(socio.estado, dx + 260, 630)

  const qr = document.getElementById(idQrCarnet)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(ANCHO - 390, 265, 320, 320, 28)
  ctx.fill()
  if (qr) ctx.drawImage(qr, ANCHO - 365, 290, 270, 270)

  const barras = barrasCarnet(socio.numeroSocio)
  const total = barras.reduce((suma, b) => suma + b.ancho, 0)
  const [bx, by, bw, bh] = [70, 745, ANCHO - 140, 130]
  let cursor = bx
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(bx, by, bw, bh, 10)
  ctx.clip()
  barras.forEach((barra) => {
    const ancho = (bw * barra.ancho) / total
    if (barra.color !== 'white') {
      ctx.fillStyle = colorBarra[barra.color]
      ctx.fillRect(cursor, by, ancho + 0.5, bh)
    }
    cursor += ancho
  })
  ctx.restore()
  escribir(ctx, socio.numeroSocio, ANCHO / 2, 945, { fuente: '500 36px "JetBrains Mono"', color: gris, espaciado: 22, alinear: 'center' })

  return lienzo.toDataURL('image/jpeg', 0.92)
}
