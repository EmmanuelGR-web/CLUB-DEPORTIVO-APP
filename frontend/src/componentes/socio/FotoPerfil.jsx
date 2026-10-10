'use client'

import { useState } from 'react'
import { Alert } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import CamaraSelfie from '../auth/CamaraSelfie'
import { formatearFechaConAnio } from '../../utilidades/fechas'

const mesesEntreCambiosDeFoto = 6

function FotoPerfil({ socio, onGuardar, sinLimite = false }) {
  const [aviso, setAviso] = useState('')
  const bloqueadaHasta = !sinLimite && socio.proximoCambioDeFoto ? new Date(socio.proximoCambioDeFoto) : null

  const cambiar = async (foto) => {
    try {
      await onGuardar({ foto }, 'Foto de perfil')
      setAviso('Tu foto se actualizó. Ya aparece en tu carnet digital.')
    } catch (problema) {
      setAviso(problema.message)
    }
  }

  return (
    <Tarjeta titulo="Foto de perfil" className="mb-4">
      {aviso && (
        <Alert variant={aviso.startsWith('Tu foto') ? 'success' : 'warning'} dismissible onClose={() => setAviso('')} className="py-2">
          {aviso}
        </Alert>
      )}

      <div className="d-flex flex-wrap align-items-center gap-4">
        <CamaraSelfie
          foto={socio.foto}
          onCapturar={cambiar}
          variante="clara"
          deshabilitado={Boolean(bloqueadaHasta)}
          textoVacio="Cargar foto"
        />

        <div className="flex-grow-1" style={{ minWidth: 220 }}>
          {!socio.foto && (
            <p className="mb-2">
              Todavía no tenés foto. <strong>Cargá una</strong> desde la cámara o desde tus archivos: es la que va a aparecer en tu carnet digital.
            </p>
          )}
          {socio.foto && !bloqueadaHasta && <p className="mb-2">Podés cambiar tu foto ahora. Tocá la imagen para sacarte una nueva.</p>}
          {bloqueadaHasta && (
            <p className="mb-2">
              Vas a poder cambiarla a partir del <strong>{formatearFechaConAnio(bloqueadaHasta.toISOString().slice(0, 10))}</strong>.
            </p>
          )}
          <p className="small text-body-secondary mb-0">
            La foto del carnet se puede cambiar una vez cada {mesesEntreCambiosDeFoto} meses.
          </p>
        </div>
      </div>
    </Tarjeta>
  )
}

export default FotoPerfil
