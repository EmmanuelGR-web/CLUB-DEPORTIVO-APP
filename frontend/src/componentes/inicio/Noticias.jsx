'use client'

import { useState } from 'react'
import { Modal, Badge, Button, Image } from 'react-bootstrap'
import Link from 'next/link'
import TarjetaNoticia from './TarjetaNoticia'
import EstadoConsulta from '../comun/EstadoConsulta'
import { formatearFecha } from '../../utilidades/fechas'
import { coloresCategoria } from '../../datos/noticias'

const colorDe = (categoria) => coloresCategoria[categoria] ?? { bg: 'secondary' }

function Noticias({ noticias, cargando, error, onReintentar }) {
 
  const [abierta, setAbierta] = useState(null)
  const [mostrar, setMostrar] = useState(false)
  const abrir = (noticia) => {
    setAbierta(noticia)
    setMostrar(true)
  }
  const cerrar = () => setMostrar(false)

  return (
    <aside id="noticias" className="sticky-lg-top" style={{ top: '1rem' }}>
      <span className="text-uppercase fw-bold text-primary small">Actualidad</span>
      <h2 className="fw-bolder text-uppercase fst-italic mb-3">Noticias</h2>

      <EstadoConsulta cargando={cargando} error={error} vacio={noticias.length === 0} onReintentar={onReintentar} textoVacio="Todavía no hay noticias publicadas." />
      <div className="d-flex flex-column gap-3">
        {noticias.map((noticia) => (
          <TarjetaNoticia key={noticia.id} noticia={noticia} onAbrir={abrir} />
        ))}
      </div>

      <Modal show={mostrar} onHide={cerrar} centered>
        {abierta && (
          <>
            <Modal.Header closeButton className="bg-dark text-white" closeVariant="white">
              <Modal.Title className="h5 fw-bold">{abierta.titulo}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Badge
                  bg={colorDe(abierta.categoria).bg}
                  text={colorDe(abierta.categoria).text}
                  className={`text-uppercase ${colorDe(abierta.categoria).borde ? 'border' : ''}`}
                >
                  {abierta.categoria}
                </Badge>
                <small className="text-body-secondary">{formatearFecha(String(abierta.fecha).slice(0, 10))}</small>
              </div>
              {abierta.imagen && <Image src={abierta.imagen} alt={abierta.titulo} loading="lazy" fluid rounded className="mb-3" />}
              {abierta.cuerpo.map((parrafo, i) => (
                <p key={i}>{parrafo}</p>
              ))}
              {abierta.enlace && (
                <Button as={Link} href={abierta.enlace.ruta} variant="primary" className="rounded-pill px-4" onClick={cerrar}>
                  {abierta.enlace.texto}
                </Button>
              )}
            </Modal.Body>
          </>
        )}
      </Modal>
    </aside>
  )
}

export default Noticias
