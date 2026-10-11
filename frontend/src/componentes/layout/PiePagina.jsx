'use client'

import Link from 'next/link'
import { Container } from 'react-bootstrap'
import RedesSociales from '../comun/RedesSociales'
import Sponsors from '../comun/Sponsors'
import { redes, sponsors } from '../../datos/club'

const PiePagina = ({ children }) => {
  return (
    <footer className="text-white">
      {children && (
        <div className="bg-body-tertiary text-body border-top border-warning border-3 py-4">
          <Container>{children}</Container>
        </div>
      )}
      <div className="bg-dark py-2">
        {/* En el celular el link va arriba y los íconos solos en su fila, para que entren en pantallas angostas. */}
        <Container className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
          <Link href="/privacidad" className="small link-light link-opacity-75 link-opacity-100-hover">
            Política de privacidad
          </Link>
          <RedesSociales redes={redes} />
        </Container>
      </div>
      <div className="bg-secondary py-3">
        <Sponsors sponsors={sponsors} />
      </div>
    </footer>
  )
}

export default PiePagina
