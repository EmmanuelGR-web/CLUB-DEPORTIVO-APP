import { FaFutbol, FaBasketballBall, FaVolleyballBall, FaSwimmer } from 'react-icons/fa'
import { MdSportsHockey, MdSportsTennis } from 'react-icons/md'

export const disciplinas = [
  {
    id: 'futbol',
    nombre: 'Fútbol',
    icono: FaFutbol,
    imagen: '/disciplinas/futbol.jpg',
    descripcion: 'Categorías desde infantiles hasta primera división, con los profes de la escuela del club.',
    categorias: 'Infantiles (5 a 12) · Juveniles · Primera',
    dias: 'Lunes a viernes, de 17 a 20 h',
  },
  {
    id: 'basquet',
    nombre: 'Básquet',
    icono: FaBasketballBall,
    imagen: '/disciplinas/basquet.jpeg',
    descripcion: 'Mini, formativas y primera, masculino y femenino, en el estadio cubierto.',
    categorias: 'Mini (6 a 12) · Formativas · Primera',
    dias: 'Lunes, miércoles y viernes, de 18 a 21 h',
  },
  {
    id: 'voley',
    nombre: 'Vóley',
    icono: FaVolleyballBall,
    imagen: '/disciplinas/voley.jpg',
    descripcion: 'El equipo femenino juega la final del Apertura. También hay categorías mixtas.',
    categorias: 'Sub-12 · Sub-16 · Primera femenina',
    dias: 'Martes y jueves, de 18 a 21 h',
  },
  {
    id: 'hockey',
    nombre: 'Hockey',
    icono: MdSportsHockey,
    imagen: '/disciplinas/hockey.jpg',
    descripcion: 'Una de las ramas con más jugadoras de la provincia, en cancha sintética.',
    categorias: 'Sub-8 a Primera · Mamis hockey',
    dias: 'Martes, jueves y sábados',
  },
  {
    id: 'natacion',
    nombre: 'Natación',
    icono: FaSwimmer,
    imagen: '/disciplinas/natacion.jpg',
    descripcion: 'Escuela de natación y equipo de competición en la pileta climatizada.',
    categorias: 'Escuelita (4 a 10) · Competición · Adultos',
    dias: 'Lunes a sábado, turnos de 8 a 21 h',
  },
  {
    id: 'tenis',
    nombre: 'Tenis',
    icono: MdSportsTennis,
    imagen: '/disciplinas/tenis.jpeg',
    descripcion: 'Clases grupales e individuales en canchas de polvo de ladrillo.',
    categorias: 'Infantiles · Juveniles · Adultos',
    dias: 'Todos los días, con turno previo',
  },
]
