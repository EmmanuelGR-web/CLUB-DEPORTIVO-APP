import { formatearPesos } from './carnet'
import { formatearFechaConAnio } from './fechas'
import { imagenCredencial } from './credencialImagen'

const colores = { dark: [30, 27, 36], bordo: [122, 15, 46] }

const imagenReducida = (ruta, anchoMaximo) =>
  new Promise((resolver) => {
    const imagen = new Image()
    imagen.onload = () => {
      const escala = Math.min(1, anchoMaximo / imagen.width)
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(imagen.width * escala)
      lienzo.height = Math.round(imagen.height * escala)
      lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
      resolver(lienzo.toDataURL('image/png'))
    }
    imagen.src = ruta
  })

export const descargarCredencial = async (socio) => {
  const [{ jsPDF }, imagen] = await Promise.all([import('jspdf'), imagenCredencial(socio)])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const ancho = 85.6
  const alto = 54
  const x = (210 - ancho) / 2
  const y = 40

  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(...colores.bordo).text('Credencial de socio · Club Deportivo', 105, 20, { align: 'center' })
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(110)
  doc.text('Imprimila al 100 % (tamaño real) y recortala por las líneas punteadas.', 105, 27, { align: 'center' })

  doc.addImage(imagen, 'JPEG', x, y, ancho, alto)
  doc.setLineDashPattern([1, 1], 0).setDrawColor(150).setLineWidth(0.2).roundedRect(x - 1, y - 1, ancho + 2, alto + 2, 3.5, 3.5)
  doc.save(`credencial-${socio.numeroSocio}.pdf`)
}

export const descargarEstadoCuenta = async (socio, pagos, descripcionFiltro) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const escudo = await imagenReducida('/logo.png', 240)
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  doc.addImage(escudo, 'PNG', 14, 10, 24, 14)
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...colores.dark).text('Estado de cuenta', 42, 17)
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(110)
  doc.text(`Emitido el ${formatearFechaConAnio(new Date().toISOString().slice(0, 10))}`, 42, 22)

  doc.setTextColor(...colores.dark).setFontSize(10)
  const ficha = [
    `Socio: ${socio.nombreCompleto}`,
    `N° de socio: ${socio.numeroSocio} · Categoría: ${socio.categoria} · DNI: ${socio.dni}`,
    `Correo institucional: ${socio.correoInstitucional}`,
  ]
  ficha.forEach((linea, i) => doc.text(linea, 14, 34 + i * 5))

  const pagado = pagos.filter((p) => p.estado === 'Aprobado').reduce((s, p) => s + p.monto, 0)
  const pendiente = pagos.filter((p) => p.estado !== 'Aprobado').reduce((s, p) => s + p.monto, 0)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total pagado: ${formatearPesos(pagado)}   ·   Saldo pendiente: ${formatearPesos(pendiente)}`, 14, 52)
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(110).text(`Movimientos incluidos: ${descripcionFiltro}`, 14, 57)

  autoTable(doc, {
    startY: 61,
    head: [['Período', 'Concepto', 'Medio de pago', 'Monto', 'Estado']],
    body: pagos.map((p) => [p.fecha, p.concepto, p.medio, formatearPesos(p.monto), p.estado]),
    headStyles: { fillColor: colores.bordo },
    columnStyles: { 3: { halign: 'right' } },
    didParseCell: ({ section, column, cell }) => {
      if (section === 'body' && column.index === 4) cell.styles.textColor = cell.raw === 'Aprobado' ? [25, 135, 84] : [180, 120, 0]
    },
  })

  doc.save(`estado-de-cuenta-${socio.numeroSocio}.pdf`)
}

export const descargarResumenEconomico = async (resumen, evolucion, autor) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const escudo = await imagenReducida('/logo.png', 240)
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const tabla = (titulo, opciones) => {
    const y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 44
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...colores.bordo).text(titulo, 14, y)
    autoTable(doc, { startY: y + 3, headStyles: { fillColor: colores.bordo }, styles: { fontSize: 9 }, ...opciones })
  }

  doc.addImage(escudo, 'PNG', 14, 10, 24, 14)
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...colores.dark).text('Resumen económico', 42, 17)
  doc.setFont('helvetica', 'normal').setFontSize(10).text(`Período: ${resumen.nombre}`, 42, 23)
  doc.setFontSize(8).setTextColor(110).text(`Emitido el ${new Date().toLocaleString('es-AR')} por ${autor}`, 42, 28)

  tabla('Totales del período', {
    body: [
      ['Cuotas emitidas', `${resumen.padron}`, formatearPesos(resumen.emitido)],
      ['Ingresos cobrados', `${resumen.alDia}`, formatearPesos(resumen.ingresos)],
      ['   de los cuales, recargos por mora', '', formatearPesos(resumen.recargosCobrados)],
      ['Comprobantes en revisión', `${resumen.cantidadEnRevision}`, formatearPesos(resumen.enRevision)],
      ['Cuotas impagas (a cobrar)', `${resumen.cantidadImpagas}`, formatearPesos(resumen.impago)],
      ['Cobranza del período', '', `${resumen.cobranza} %`],
    ],
    head: [['Concepto', 'Socios', 'Importe']],
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
  })
  tabla('Padrón', {
    head: [['Socios en padrón', 'Activos', 'Al día', 'Morosos']],
    body: [[resumen.padron, resumen.activos, resumen.alDia, resumen.morosos.length]],
    columnStyles: { 0: { halign: 'center' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } },
  })
  tabla('Cobrado por medio de pago', {
    head: [['Medio', 'Cuotas', 'Importe']],
    body: resumen.porMedio.length ? resumen.porMedio.map((g) => [g.etiqueta, g.cantidad, formatearPesos(g.monto)]) : [['Sin cobros en el período', '', '']],
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
  })
  tabla('Cuotas emitidas por categoría', {
    head: [['Categoría', 'Socios', 'Importe']],
    body: resumen.porCategoria.map((g) => [g.etiqueta, g.cantidad, formatearPesos(g.monto)]),
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
  })
  tabla('Socios morosos', {
    head: [['Socio', 'N° de socio', 'Días de demora', 'Recargo', 'Deuda']],
    body: resumen.morosos.length
      ? resumen.morosos.map((m) => [m.nombre, m.numeroSocio, m.dias, formatearPesos(m.recargo), formatearPesos(m.total)])
      : [['No hay socios morosos en el período', '', '', '', '']],
    columnStyles: { 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
  })
  tabla('Evolución de los últimos meses', {
    head: [['Mes', 'Cobrado', 'Pendiente de cobro']],
    body: evolucion.map((m) => [m.nombre, formatearPesos(m.ingresos), formatearPesos(m.impago)]),
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
  })

  const paginas = doc.getNumberOfPages()
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i).setFont('helvetica', 'normal').setFontSize(8).setTextColor(130)
    doc.text(`Club Deportivo · Resumen económico ${resumen.nombre} · Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
  }
  doc.save(`resumen-economico-${resumen.periodo}.pdf`)
}
