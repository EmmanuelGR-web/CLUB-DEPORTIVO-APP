'use client'

import { useEffect, useRef, useState } from 'react'
import { Modal, Button, Alert, Spinner } from 'react-bootstrap'
import { FaCamera } from 'react-icons/fa'

const tamanio = 320
const calidad = 0.75

function CamaraSelfie({ foto, onCapturar, invalido, variante = 'oscura', deshabilitado = false, textoVacio = 'Sacate una selfie' }) {
  const [abierta, setAbierta] = useState(false)
  const [lista, setLista] = useState(false)
  const [error, setError] = useState(false)
  const video = useRef(null)
  const flujo = useRef(null)

  const apagar = () => {
    flujo.current?.getTracks().forEach((pista) => pista.stop())
    flujo.current = null
  }

  useEffect(() => {
    if (!abierta) return
    let cancelada = false
    const pedirCamara = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 720, height: 720 }, audio: false })
      : Promise.reject(new Error('Sin cámara'))

    pedirCamara
      .then((stream) => {
        if (cancelada) return stream.getTracks().forEach((pista) => pista.stop())
        flujo.current = stream
        video.current.srcObject = stream
      })
      .catch(() => setError(true))

    return () => {
      cancelada = true
      apagar()
    }
  }, [abierta])

  const cerrar = () => {
    setAbierta(false)
    setLista(false)
    setError(false)
  }

  const sacarFoto = () => {
    const v = video.current
    const lado = Math.min(v.videoWidth, v.videoHeight)
    const lienzo = document.createElement('canvas')
    lienzo.width = tamanio
    lienzo.height = tamanio
    const ctx = lienzo.getContext('2d')
    ctx.translate(tamanio, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(v, (v.videoWidth - lado) / 2, (v.videoHeight - lado) / 2, lado, lado, 0, 0, tamanio, tamanio)
    onCapturar(lienzo.toDataURL('image/jpeg', calidad))
    cerrar()
  }

  const desdeArchivo = (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    const imagen = new Image()
    imagen.onload = () => {
      const lado = Math.min(imagen.width, imagen.height)
      const lienzo = document.createElement('canvas')
      lienzo.width = tamanio
      lienzo.height = tamanio
      lienzo.getContext('2d').drawImage(imagen, (imagen.width - lado) / 2, (imagen.height - lado) / 2, lado, lado, 0, 0, tamanio, tamanio)
      URL.revokeObjectURL(imagen.src)
      onCapturar(lienzo.toDataURL('image/jpeg', calidad))
    }
    imagen.src = URL.createObjectURL(archivo)
    cerrar()
  }

  const borde = invalido ? 'border-danger' : foto ? 'border-warning' : variante === 'clara' ? 'border-secondary border-opacity-25' : 'border-light border-opacity-25'
  const colores = variante === 'clara' ? 'text-secondary bg-secondary bg-opacity-10' : 'text-white bg-white bg-opacity-10'

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        disabled={deshabilitado}
        className={`position-relative d-flex flex-column align-items-center justify-content-center gap-2 mx-auto small fw-semibold text-uppercase ${colores} border border-2 ${borde} ${deshabilitado ? 'opacity-75' : ''} rounded-circle overflow-hidden`}
        style={{ width: 150, height: 150 }}
      >
        {foto ? (
          <>
            <img src={foto} alt="Tu selfie" className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
            <span className="position-absolute bottom-0 start-50 translate-middle-x mb-2 badge rounded-pill bg-dark bg-opacity-75">
              {deshabilitado ? 'Bloqueada' : 'Cambiar'}
            </span>
          </>
        ) : (
          <>
            {variante !== 'clara' && <FaCamera className="fs-2" aria-hidden="true" />}
            {textoVacio}
          </>
        )}
      </button>

      <Modal show={abierta} onHide={cerrar} centered contentClassName="bg-dark text-white">
        <Modal.Header closeButton closeVariant="white" className="border-0">
          <Modal.Title className="h5 fw-bold">Tu foto de perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {error ? (
            <>
              <Alert variant="warning" className="text-start">
                No pudimos usar la cámara. Revisá que el navegador tenga permiso o elegí una foto tuya.
              </Alert>
              <label className="btn btn-light rounded-pill px-4">
                Elegir o sacar foto
                <input type="file" accept="image/*" capture="user" onChange={desdeArchivo} className="visually-hidden" />
              </label>
            </>
          ) : (
            <>
              <div className="position-relative ratio ratio-1x1 rounded-circle overflow-hidden mx-auto mb-3 bg-black" style={{ maxWidth: 300 }}>
                <video
                  ref={video}
                  autoPlay
                  playsInline
                  muted
                  onLoadedData={() => setLista(true)}
                  className="object-fit-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {!lista && (
                  <div className="d-flex align-items-center justify-content-center">
                    <Spinner animation="border" variant="light" />
                  </div>
                )}
              </div>
              <p className="small text-white-50">Ubicá tu cara dentro del círculo, con buena luz y sin anteojos de sol.</p>
              <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={sacarFoto} disabled={!lista}>
                Sacar foto
              </Button>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  )
}

export default CamaraSelfie
