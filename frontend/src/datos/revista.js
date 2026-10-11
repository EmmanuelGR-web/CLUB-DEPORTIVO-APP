
export const resumenResena =
  'Fundado en 1919 en San Miguel de Tucumán, el club es desde hace más de un siglo un símbolo de identidad para toda la provincia. Generaciones de socios crecieron entre sus canchas, sus tribunas y su sede social.'

export const paginasRevista = [
  {
    tipo: 'tapa',
    edicion: 'Edición Centenario · N° 1',
    titulo: '100 años de pasión',
    bajada: 'La historia rojiblanca contada por su gente',
    imagen: '/revista/tapa.jpeg',
  },
  {
    tipo: 'indice',
    volanta: 'Editorial',
    titulo: 'Un siglo de camiseta',
    texto: [
      'Esta revista es un homenaje a los que hicieron grande al club: los fundadores, los jugadores, los dirigentes y, sobre todo, los hinchas que nunca dejaron de alentar.',
      'Pasá las hojas y recorré más de cien años de historia, del almacén de barrio a la noche de la copa.',
    ],
    sumario: [
      { pagina: 3, titulo: 'Todo empezó en un almacén' },
      { pagina: 4, titulo: 'Barro, caña y corazón' },
      { pagina: 5, titulo: 'Nace La Caldera' },
      { pagina: 6, titulo: '¡Campeones del Regional!' },
      { pagina: 7, titulo: 'El Flaco Aráoz, ídolo eterno' },
      { pagina: 8, titulo: 'Un club, muchos deportes' },
      { pagina: 9, titulo: 'El club de todos' },
    ],
  },
  {
    tipo: 'articulo',
    volanta: '1919 · Los orígenes',
    titulo: 'Todo empezó en un almacén',
    bajada: 'Doce muchachos del barrio se juntaron frente al Almacén Tucumán y decidieron fundar un club.',
    imagen: '/revista/fundacion.jpeg',
    epigrafe: 'Los fundadores, frente al Almacén Tucumán (1919).',
    texto: [
      'Era el otoño de 1919 en San Miguel de Tucumán. Entre bolsas de azúcar y frascos de conserva, empleados, estudiantes y trabajadores de los ingenios firmaron el acta fundacional sobre el mostrador del almacén.',
      'Eligieron el rojo por la pasión y el blanco por la caña recién cosechada. Así nacieron las rayas que hoy nos identifican.',
    ],
    dato: { numero: '12', texto: 'socios fundadores firmaron el acta' },
  },
  {
    tipo: 'articulo',
    volanta: '1920 - 1945 · Los primeros años',
    titulo: 'Barro, caña y corazón',
    bajada: 'Sin tribunas ni vestuarios, el equipo jugaba en una cancha de tierra rodeada de cañaverales.',
    imagen: '/revista/primeros-anios.jpeg',
    epigrafe: 'El plantel campeón de 1938, en la vieja cancha de tierra.',
    texto: [
      'Los partidos se jugaban los domingos, con los cerros del Aconquija de fondo. Los socios traían sus propias sillas y la recaudación apenas alcanzaba para comprar pelotas.',
      'En 1938 llegó el primer título de la Liga Tucumana, con un plantel formado íntegramente por chicos del barrio.',
    ],
    dato: { numero: '1938', texto: 'primer título de la Liga Tucumana' },
  },
  {
    tipo: 'articulo',
    volanta: '1952 · Nuestra casa',
    titulo: 'Nace La Caldera',
    bajada: 'Con el esfuerzo de los socios, el club inauguró su estadio a los pies de los cerros.',
    imagen: '/revista/estadio.jpeg',
    epigrafe: 'Acto inaugural del estadio, el 9 de julio de 1952.',
    texto: [
      'El 9 de julio de 1952, más de 15.000 personas colmaron las tribunas. Cada socio había donado ladrillos, horas de trabajo o parte de su sueldo para levantar la obra.',
      'La hinchada lo bautizó «La Caldera», por el calor de la gente y del verano tucumano.',
    ],
    dato: { numero: '15.000', texto: 'personas en la inauguración' },
  },
  {
    tipo: 'articulo',
    volanta: '1985 · La gloria',
    titulo: '¡Campeones del Regional!',
    bajada: 'Una noche inolvidable: el club levantó la copa y la ciudad salió a festejar.',
    imagen: '/revista/campeones.jpeg',
    epigrafe: 'El capitán levanta la copa del Torneo Regional 1985.',
    texto: [
      'Tras ganar 2 a 1 la final, el capitán Rubén «Tanque» Medina alzó el trofeo bajo una lluvia de papelitos. La caravana recorrió la avenida Mate de Luna hasta el amanecer.',
      'Ese título abrió las puertas del Torneo Nacional y puso al club en boca de todo el país.',
    ],
    dato: { numero: '2-1', texto: 'resultado de la final de 1985' },
  },
  {
    tipo: 'articulo',
    volanta: 'Leyendas',
    titulo: 'El Flaco Aráoz, ídolo eterno',
    bajada: 'Goleador, caudillo y vecino del barrio: nadie defendió la camiseta como él.',
    imagen: '/revista/idolos.jpeg',
    epigrafe: 'Héctor «el Flaco» Aráoz en la cancha del club (1976).',
    texto: [
      'Héctor Aráoz debutó en 1971 y jugó 14 temporadas sin cambiar de club. Rechazó ofertas de Buenos Aires para quedarse en Tucumán.',
      'Hoy la tribuna local lleva su nombre, y su camiseta a bastones horizontales es la más buscada por los coleccionistas.',
    ],
    dato: { numero: '187', texto: 'goles con la camiseta del club' },
  },
  {
    tipo: 'articulo',
    volanta: 'Más que fútbol',
    titulo: 'Un club, muchos deportes',
    bajada: 'Básquet, vóley y hockey sumaron nuevas generaciones a la familia rojiblanca.',
    imagen: '/revista/disciplinas.jpeg',
    epigrafe: 'Nuestros equipos de básquet, vóley y hockey.',
    texto: [
      'En los años 90 se inauguró el gimnasio cubierto y el club empezó a competir en básquet y vóley.',
      'Poco después llegó la cancha sintética para el hockey femenino, hoy una de las ramas con más jugadoras de la provincia.',
    ],
    dato: { numero: '4', texto: 'disciplinas federadas' },
  },
  {
    tipo: 'articulo',
    volanta: 'Hoy',
    titulo: 'El club de todos',
    bajada: 'Más de cien años después, el club sigue creciendo con su gente.',
    imagen: '/jugadores.jpeg',
    epigrafe: 'Presentación de la camiseta oficial, temporada 2024.',
    texto: [
      'El club cuenta con escuelas deportivas para niños, niñas, jóvenes y adultos, espacios recreativos y una sede social pensada para toda la familia.',
      'Los socios que crecieron en sus canchas hoy traen a sus hijos y nietos.',
    ],
    dato: { numero: '+5.000', texto: 'socios activos' },
  },
  {
    tipo: 'contratapa',
    titulo: 'La historia la escribimos juntos',
    texto: 'Sumate a la familia rojiblanca y sé parte de los próximos cien años.',
  },
]
