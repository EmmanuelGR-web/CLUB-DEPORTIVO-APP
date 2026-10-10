'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Row, Col, Image } from 'react-bootstrap'
import { useTituloPagina } from '@/hooks/useTituloPagina'
import { useSesion } from '@/contextos/SesionContexto'
import { useEsEscritorio } from '@/hooks/useEsEscritorio'
import FormularioLogin from '@/componentes/auth/FormularioLogin'
import PiePagina from '@/componentes/layout/PiePagina'
import { pantallaCargando } from '@/componentes/RutaProtegida'
import { fondoElectrico, tarjetaVidrio } from '@/componentes/auth/estilosAuth'

const conScroll = { overflowY: 'scroll', scrollbarWidth: 'thin', scrollbarColor: '#8b0e25 transparent' }

const fundidoFoto = { backgroundImage: 'linear-gradient(to right, #0b0a0d 0%, rgba(11, 10, 13, 0.6) 18%, transparent 45%)' }

const fundidoFrase = { backgroundImage: 'linear-gradient(to top, rgba(11, 10, 13, 0.9), transparent)' }

function FotoJugadores({ fundido = false }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/jugadores.jpeg" alt="Jugadores del club con la camiseta oficial" className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
      {fundido && <div className="position-absolute top-0 start-0 w-100 h-100" style={fundidoFoto} />}
      <div className="position-absolute bottom-0 start-0 w-100 p-4 p-lg-5" style={fundidoFrase}>
        <p className="h2 fw-bolder text-uppercase fst-italic mb-2">Más de 100 años de pasión</p>
        <p className="mb-0 text-white-50">Tu carnet, tus pagos y los beneficios del club, en un solo lugar.</p>
      </div>
    </>
  )
}

export default function PaginaLogin() {
  useTituloPagina('Iniciar sesión')
  const { usuario, lista } = useSesion()
  const esEscritorio = useEsEscritorio()
  const router = useRouter()

  useEffect(() => {
    if (lista && usuario) router.replace(usuario.ruta)
  }, [lista, usuario, router])

  if (!lista || usuario) return pantallaCargando

  const formulario = (
    <div className="w-100 m-auto" style={{ maxWidth: 400 }}>
      <header className="text-center mb-3">
        <span className="d-block fw-bolder text-uppercase fs-4">Club Deportivo</span>
        <Image src="/logo.png" alt="Escudo del Club Deportivo" width={90} height={90} className="object-fit-cover my-2" />
        <h1 className="h4 fw-bold fst-italic mb-0">Ingresá al portal con tu cuenta</h1>
      </header>

      <div className={`${tarjetaVidrio} p-4`}>
        <FormularioLogin />
      </div>
    </div>
  )

  return (
    <div className="bg-black min-vh-100 d-flex flex-column" data-bs-theme="light">
      <main className="flex-grow-1 d-flex flex-column text-white" style={fondoElectrico}>
        {esEscritorio ? (
          <Row className="g-0">
            <Col lg={6} className="vh-100 d-flex flex-column px-3 py-4" style={conScroll}>
              {formulario}
            </Col>
            <Col lg={6} className="position-relative vh-100">
              <FotoJugadores fundido />
            </Col>
          </Row>
        ) : (
          <>
            <div className="d-none d-md-block position-relative" style={{ height: '38vh' }}>
              <FotoJugadores />
            </div>
            <div className="flex-grow-1 d-flex px-3 py-3">{formulario}</div>
          </>
        )}
      </main>
      <PiePagina />
    </div>
  )
}
