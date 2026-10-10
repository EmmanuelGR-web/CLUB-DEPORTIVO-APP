'use client'

import Link from 'next/link'
import { Container, Image, Button } from 'react-bootstrap'
import { FaArrowLeft } from 'react-icons/fa'
import { useTituloPagina } from '@/hooks/useTituloPagina'
import FormularioRegistro from '@/componentes/auth/FormularioRegistro'
import PiePagina from '@/componentes/layout/PiePagina'
import { fondoElectrico } from '@/componentes/auth/estilosAuth'

export default function PaginaRegistro() {
  useTituloPagina('Asociate')

  return (
    <div className="bg-black min-vh-100 d-flex flex-column" data-bs-theme="light">
      <main className="flex-grow-1 text-white py-4" style={fondoElectrico}>
        <Container style={{ maxWidth: 1080 }}>
          <Button
            as={Link}
            href="/login"
            variant="outline-light"
            size="sm"
            className="rounded-pill px-3 d-inline-flex align-items-center gap-2 border-opacity-25 mb-4"
          >
            <FaArrowLeft aria-hidden="true" /> Volver al ingreso
          </Button>

          <header className="d-flex align-items-center gap-3 mb-4">
            <Image src="/logo.png" alt="Escudo del Club Deportivo" width={72} height={72} className="object-fit-cover flex-shrink-0" />
            <div>
              <span className="d-block fw-bolder text-uppercase fs-4 lh-1">Club Deportivo</span>
              <h1 className="h5 fw-semibold text-uppercase text-white-50 mb-0">Registro de nuevo socio</h1>
            </div>
          </header>

          <FormularioRegistro />
        </Container>
      </main>
      <PiePagina />
    </div>
  )
}
