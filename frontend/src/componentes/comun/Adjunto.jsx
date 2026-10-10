'use client'

import { useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { FaPaperclip } from 'react-icons/fa'
import { descargarArchivo, tamanioLegible } from '../../utilidades/mensajes'
import { alertaError } from '../../utilidades/alertas'

// Enlace a un archivo guardado en el servidor: lo trae recién cuando se toca.
function Adjunto({ archivo, texto, className = 'd-inline-block small link-secondary me-3' }) {
  const [bajando, setBajando] = useState(false)

  const abrir = async () => {
    setBajando(true)
    try {
      await descargarArchivo(archivo)
    } catch (problema) {
      alertaError(problema.message, 'No pudimos abrir el archivo')
    } finally {
      setBajando(false)
    }
  }

  return (
    <button type="button" onClick={abrir} disabled={bajando} className={`btn btn-link p-0 text-start border-0 align-baseline ${className}`}>
      {bajando ? <Spinner size="sm" className="me-1" /> : <FaPaperclip aria-hidden="true" className="me-1" />}
      {texto ?? `${archivo.nombre} (${tamanioLegible(archivo.tamanio)})`}
    </button>
  )
}

export default Adjunto
