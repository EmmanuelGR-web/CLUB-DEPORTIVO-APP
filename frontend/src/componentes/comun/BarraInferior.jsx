'use client'

// Barra fija de abajo, como en las apps del celular. Se oculta en
// pantallas grandes, donde está la barra lateral.
function BarraInferior({ items, activo, onSeleccionar }) {
  return (
    <nav className="barra-inferior" aria-label="Accesos rápidos">
      {items.map(({ id, etiqueta, icono: Icono, central, contador }) => {
        const esActivo = id === activo
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSeleccionar(id)}
            aria-current={esActivo ? 'page' : undefined}
            className={`${central ? 'boton-central' : ''} ${esActivo ? 'activo' : ''}`}
          >
            {central ? (
              <span className="circulo">
                <Icono aria-hidden="true" />
              </span>
            ) : (
              <span className="position-relative">
                <Icono aria-hidden="true" />
                {contador > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style={{ fontSize: '0.6rem' }}>
                    {contador}
                  </span>
                )}
              </span>
            )}
            {etiqueta}
          </button>
        )
      })}
    </nav>
  )
}

export default BarraInferior
