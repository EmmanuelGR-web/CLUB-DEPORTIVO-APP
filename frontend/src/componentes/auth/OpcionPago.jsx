'use client'

function OpcionPago({ valor, etiqueta, icono: Icono, elegido, onElegir, invalido }) {
  const activo = elegido === valor
  const borde = activo ? 'border-warning bg-warning bg-opacity-25' : invalido ? 'border-danger' : 'border-light border-opacity-25'

  return (
    <label
      className={`h-100 d-flex flex-column align-items-center justify-content-center gap-2 text-center small fw-semibold text-uppercase bg-white bg-opacity-10 border border-2 ${borde} rounded-4 p-3`}
      style={{ cursor: 'pointer' }}
    >
      {Icono && <Icono className="fs-2" aria-hidden="true" />}
      {etiqueta}
      <input type="radio" name="pago" value={valor} checked={activo} onChange={() => onElegir(valor)} className="visually-hidden" />
    </label>
  )
}

export default OpcionPago
