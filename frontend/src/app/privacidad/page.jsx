'use client'

import { useRouter } from 'next/navigation'
import { Container, Image, Button } from 'react-bootstrap'
import { FaArrowLeft } from 'react-icons/fa'
import { useTituloPagina } from '@/hooks/useTituloPagina'
import PiePagina from '@/componentes/layout/PiePagina'
import PoliticaPrivacidad, { actualizacionPrivacidad } from '@/componentes/comun/PoliticaPrivacidad'
import { huboNavegacionInterna } from '@/hooks/useNavegacionInterna'

// Política de privacidad del portal según la Ley 25.326. "Volver" lleva a
// la pantalla de la que se vino; si se entró directo con el link, al inicio.
export default function PaginaPrivacidad() {
  useTituloPagina('Política de privacidad')
  const router = useRouter()

  const volver = () => {
    if (huboNavegacionInterna()) router.back()
    else router.push('/')
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-column">
      <main className="flex-grow-1 py-4">
        <Container style={{ maxWidth: 860 }}>
          <Button variant="outline-secondary" size="sm" className="rounded-pill px-3 d-inline-flex align-items-center gap-2 mb-4" onClick={volver}>
            <FaArrowLeft aria-hidden="true" /> Volver
          </Button>

          <article className="bg-body rounded-4 shadow-sm p-4 p-md-5">
            <header className="d-flex align-items-center gap-3 mb-4">
              <Image src="/logo.png" alt="Escudo del Club Deportivo" width={64} height={64} className="object-fit-contain flex-shrink-0" />
              <div>
                <h1 className="h3 fw-bolder text-uppercase fst-italic mb-1">Política de privacidad</h1>
                <p className="small text-body-secondary mb-0">Última actualización: {actualizacionPrivacidad}</p>
              </div>
            </header>
            <PoliticaPrivacidad />
          </article>
        </Container>
      </main>
      <PiePagina />
    </div>
  )
}
