export const diferenciaExacta = (desde, hasta = new Date()) => {
  let anios = hasta.getFullYear() - desde.getFullYear()
  let meses = hasta.getMonth() - desde.getMonth()
  let dias = hasta.getDate() - desde.getDate()
  if (dias < 0) {
    meses -= 1
    dias += new Date(hasta.getFullYear(), hasta.getMonth(), 0).getDate()
  }
  if (meses < 0) {
    anios -= 1
    meses += 12
  }
  return { anios, meses, dias }
}

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`

export const textoAntiguedad = (desde, hasta = new Date()) => {
  const { anios, meses, dias } = diferenciaExacta(desde, hasta)
  const partes = [anios && plural(anios, 'año', 'años'), meses && plural(meses, 'mes', 'meses'), dias && plural(dias, 'día', 'días')].filter(Boolean)
  if (partes.length === 0) return 'Desde hoy'
  return partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}`
}
