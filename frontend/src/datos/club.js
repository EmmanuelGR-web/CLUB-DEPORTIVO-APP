import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp } from 'react-icons/fa'
import { SiNike, SiAdidas, SiPuma, SiUnderarmour, SiNewbalance, SiReebok, SiFila, SiRedbull } from 'react-icons/si'

export const redes = [
  { id: 'facebook', nombre: 'Facebook', url: '#', icono: FaFacebookF },
  { id: 'instagram', nombre: 'Instagram', url: '#', icono: FaInstagram },
  { id: 'twitter', nombre: 'X / Twitter', url: '#', icono: FaTwitter },
  { id: 'youtube', nombre: 'YouTube', url: '#', icono: FaYoutube },
  { id: 'whatsapp', nombre: 'WhatsApp', url: '#', icono: FaWhatsapp },
]

export const sponsors = [
  { id: 'nike', nombre: 'Nike', url: 'https://www.nike.com', icono: SiNike },
  { id: 'adidas', nombre: 'Adidas', url: 'https://www.adidas.com', icono: SiAdidas },
  { id: 'puma', nombre: 'Puma', url: 'https://www.puma.com', icono: SiPuma },
  { id: 'under-armour', nombre: 'Under Armour', url: 'https://www.underarmour.com', icono: SiUnderarmour },
  { id: 'new-balance', nombre: 'New Balance', url: 'https://www.newbalance.com', icono: SiNewbalance },
  { id: 'reebok', nombre: 'Reebok', url: 'https://www.reebok.com', icono: SiReebok },
  { id: 'fila', nombre: 'Fila', url: 'https://www.fila.com', icono: SiFila },
  { id: 'red-bull', nombre: 'Red Bull', url: 'https://www.redbull.com', icono: SiRedbull },
]

export const contactoClub = {
  direccion: 'Av. Mate de Luna 1919, San Miguel de Tucumán',
  telefono: '(0381) 421-1919',
  email: 'contacto@clubdeportivo.com.ar',
  horario: 'Lunes a viernes de 9 a 20 h · Sábados de 9 a 13 h',
  enlaceExterno: {
    texto: 'Secretaría de Estado de Deportes de Tucumán',
    url: 'https://guiadetramites.tucuman.gob.ar/organismo/17941/secretaria-de-estado-de-deportes.html',
  },
}
