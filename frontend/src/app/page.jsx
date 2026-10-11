'use client'

import { Container, Row, Col } from 'react-bootstrap'
import BarraNavegacion from '@/componentes/layout/BarraNavegacion'
import PiePagina from '@/componentes/layout/PiePagina'
import Telon from '@/componentes/inicio/Telon'
import BannerVideo from '@/componentes/inicio/BannerVideo'
import ResenaHistorica from '@/componentes/inicio/ResenaHistorica'
import Noticias from '@/componentes/inicio/Noticias'
import Calendario from '@/componentes/inicio/Calendario'
import Disciplinas from '@/componentes/inicio/Disciplinas'
import Galeria from '@/componentes/inicio/Galeria'
import Contacto from '@/componentes/inicio/Contacto'
import BarraProgreso from '@/componentes/comun/BarraProgreso'
import BotonVolverArriba from '@/componentes/comun/BotonVolverArriba'
import { enlacesInicio } from '@/datos/menus'
import { resumenResena, paginasRevista } from '@/datos/revista'
import { listarNoticias } from '@/servicios/adminApi'
import { proximosPartidos, tablaPosiciones, ultimosResultados } from '@/servicios/deportesApi'
import { useConsulta } from '@/hooks/useConsulta'
import { disciplinas } from '@/datos/disciplinas'
import { fotosGaleria } from '@/datos/galeria'
import { contactoClub } from '@/datos/club'
import { useTituloPagina } from '@/hooks/useTituloPagina'

const consultarPartidos = async () => {
  const [proximos, ultimos, tabla] = await Promise.all([proximosPartidos(), ultimosResultados(), tablaPosiciones()])
  return { partidos: [...ultimos, ...proximos], tabla }
}

// Página pública del club: historia, noticias, calendario, disciplinas,
// galería y contacto. Las noticias son las que publica la administración.
export default function PaginaInicio() {
  useTituloPagina('Inicio')
  const noticias = useConsulta(listarNoticias, 'No pudimos cargar las noticias')
  const futbol = useConsulta(consultarPartidos, 'No pudimos cargar los partidos')

  return (
    <>
      <Telon imagen="/telon.jpeg" />
      <BarraProgreso />
      <BarraNavegacion enlaces={enlacesInicio} />
      <BannerVideo video="/videobanner.mp4" titulo="Club Deportivo" lema="Más de 100 años de historia, pasión y comunidad tucumana" />
      <div className="bg-body-tertiary py-5">
        <Container>
          <Row className="g-4">
            <Col lg={8} xl={9} className="d-flex flex-column gap-4">
              <ResenaHistorica resumen={resumenResena} paginas={paginasRevista} />
              <Calendario eventos={futbol.datos?.partidos ?? []} tabla={futbol.datos?.tabla ?? []} cargando={futbol.cargando} error={futbol.error} onReintentar={futbol.recargar} />
              <Row className="g-4">
                <Col xl={6}>
                  <Disciplinas disciplinas={disciplinas} />
                </Col>
                <Col xl={6}>
                  <Galeria fotos={fotosGaleria} />
                </Col>
              </Row>
            </Col>
            <Col lg={4} xl={3}>
              <Noticias noticias={noticias.datos ?? []} cargando={noticias.cargando} error={noticias.error} onReintentar={noticias.recargar} />
            </Col>
          </Row>
        </Container>
      </div>
      <PiePagina>
        <Contacto datos={contactoClub} />
      </PiePagina>
      <BotonVolverArriba />
    </>
  )
}
