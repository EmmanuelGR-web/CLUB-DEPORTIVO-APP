'use client'

import { ausenciaProgramada, ausenciaVigente, textoRegreso } from '../../utilidades/personal'
import { colorEstado } from '../../utilidades/jornada'
import { formatearFechaConAnio } from '../../utilidades/fechas'

function SituacionAhora({ empleado, hoy, presencia }) {
  const ausencia = ausenciaVigente(empleado, hoy)
  const programada = ausenciaProgramada(empleado, hoy)

  if (ausencia) {
    return (
      <div>
        <span className={`badge rounded-pill ${ausencia.motivo === 'Suspensión' ? 'bg-danger-subtle text-danger-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}`}>
          {ausencia.motivo}
        </span>
        <div className="small text-body-secondary text-nowrap mt-1">{textoRegreso(ausencia)}</div>
      </div>
    )
  }

  return (
    <div>
      {presencia && (
        <span className="d-inline-flex align-items-center gap-2 fw-semibold text-nowrap">
          <span className={`rounded-circle d-inline-block bg-${colorEstado[presencia.clave]}`} style={{ width: 10, height: 10 }} aria-hidden="true" />
          {presencia.etiqueta}
        </span>
      )}
      {programada && (
        <div className="small text-body-secondary mt-1">
          {programada.motivo} desde el {formatearFechaConAnio(programada.desde)}
        </div>
      )}
    </div>
  )
}

export default SituacionAhora
