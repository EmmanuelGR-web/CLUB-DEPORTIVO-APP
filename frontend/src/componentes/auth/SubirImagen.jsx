'use client'

function SubirImagen({ id, etiqueta, icono: Icono, vista, onElegir, invalido }) {
  const cambiar = (e) => {
    const archivo = e.target.files[0]
    e.target.value = ''
    if (archivo) onElegir(archivo)
  }

  const borde = invalido ? 'border-danger' : vista ? 'border-warning' : 'border-light border-opacity-25'

  return (
    <label
      htmlFor={id}
      className={`position-relative d-flex flex-column align-items-center justify-content-center gap-2 text-center small fw-semibold text-uppercase bg-white bg-opacity-10 border border-2 ${borde} rounded-4 overflow-hidden w-100`}
      style={{ aspectRatio: '16 / 10', cursor: 'pointer' }}
    >
      {vista ? (
        <img src={vista} alt={etiqueta} className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
      ) : (
        <>
          <Icono className="fs-2" aria-hidden="true" />
          <span className="px-2">{etiqueta}</span>
        </>
      )}
      <input id={id} type="file" accept="image/*" capture="environment" onChange={cambiar} className="visually-hidden" />
    </label>
  )
}

export default SubirImagen
