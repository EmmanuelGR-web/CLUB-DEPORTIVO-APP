'use client'

function Tarjeta({ titulo, children, className = '' }) {
  return (
    <section className={`bg-body rounded-4 shadow-sm p-4 ${className}`}>
      {titulo && (
        <h2 className="h6 fw-bold text-uppercase text-secondary border-start border-4 border-primary ps-2 mb-3">{titulo}</h2>
      )}
      {children}
    </section>
  )
}

export default Tarjeta
