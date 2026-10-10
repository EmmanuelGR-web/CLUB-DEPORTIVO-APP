'use client'

function Indicador({ valor, etiqueta, detalle, destacado = false, onClick, tamano = '3rem' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-100 h-100 text-start rounded-4 shadow-sm border-0 p-4 ${destacado ? 'text-white' : 'bg-body text-body'}`}
      style={destacado ? { backgroundImage: 'linear-gradient(145deg, #d7263d 0%, #7a0f2e 60%, #2a0710 100%)' } : undefined}
    >
      <div className={`font-credencial fw-bold lh-1 mb-2 ${destacado ? '' : 'text-secondary'}`} style={{ fontSize: tamano }}>
        {valor}
      </div>
      <div className="fw-bold text-uppercase small">{etiqueta}</div>
      {detalle && <div className={`small ${destacado ? 'opacity-75' : 'text-body-secondary'}`}>{detalle}</div>}
    </button>
  )
}

export default Indicador
