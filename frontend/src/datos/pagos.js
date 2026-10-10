import { SiVisa, SiMastercard, SiAmericanexpress, SiMercadopago } from 'react-icons/si'
import { FaUniversity, FaWallet } from 'react-icons/fa'

export const redesTarjeta = {
  visa: { nombre: 'Visa', icono: SiVisa, color: '#1a1f71', largo: 16, cvv: 3 },
  mastercard: { nombre: 'Mastercard', icono: SiMastercard, color: '#eb001b', largo: 16, cvv: 3 },
  amex: { nombre: 'American Express', icono: SiAmericanexpress, color: '#2e77bc', largo: 15, cvv: 4 },
}

export const emisores = [
  { id: 'bna', nombre: 'Banco Nación', icono: FaUniversity, color: '#0072bc', redes: ['visa', 'mastercard'], tipos: ['Crédito', 'Débito'] },
  { id: 'macro', nombre: 'Banco Macro', icono: FaUniversity, color: '#003d7c', redes: ['visa', 'mastercard', 'amex'], tipos: ['Crédito', 'Débito'] },
  { id: 'mercadopago', nombre: 'Mercado Pago', icono: SiMercadopago, color: '#00b1ea', redes: ['mastercard'], tipos: ['Prepaga'] },
  { id: 'uala', nombre: 'Ualá', icono: FaWallet, color: '#3a3af2', redes: ['mastercard'], tipos: ['Prepaga'] },
]
