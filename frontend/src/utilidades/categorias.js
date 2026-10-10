export const categorias = {
  Bronce: { degradado: 'linear-gradient(135deg, #8a4b21, #cd7f32 55%, #7a3f16)', texto: 'white', rgb: [205, 127, 50], tonos: ['#8a4b21', '#cd7f32', '#7a3f16'] },
  Plata: { degradado: 'linear-gradient(135deg, #8e9299, #e3e6ea 55%, #9ea3ab)', texto: 'dark', rgb: [192, 196, 202], tonos: ['#8e9299', '#e3e6ea', '#9ea3ab'] },
  Oro: { degradado: 'linear-gradient(135deg, #a67c00, #f5d76e 55%, #b8860b)', texto: 'dark', rgb: [212, 175, 55], tonos: ['#a67c00', '#f5d76e', '#b8860b'] },
}

export const categoriaPorAntiguedad = (anios) => (anios <= 2 ? 'Bronce' : anios <= 10 ? 'Plata' : 'Oro')

export const cuotaPorCategoria = { Bronce: 15000, Plata: 18000, Oro: 21000 }
