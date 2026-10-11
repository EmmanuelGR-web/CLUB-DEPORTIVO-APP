'use client'

import Link from 'next/link'
import { Container, Image, Button } from 'react-bootstrap'
import { FaArrowLeft } from 'react-icons/fa'
import { useTituloPagina } from '@/hooks/useTituloPagina'
import PiePagina from '@/componentes/layout/PiePagina'
import { contactoClub } from '@/datos/club'

const actualizada = '10 de octubre de 2026'

function Seccion({ titulo, children }) {
  return (
    <section className="mb-4">
      <h2 className="h5 fw-bold text-secondary">{titulo}</h2>
      {children}
    </section>
  )
}

// Política de privacidad del portal según la Ley 25.326 de Protección de
// los Datos Personales. El socio la acepta al registrarse.
export default function PaginaPrivacidad() {
  useTituloPagina('Política de privacidad')

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-column">
      <main className="flex-grow-1 py-4">
        <Container style={{ maxWidth: 860 }}>
          <Button as={Link} href="/" variant="outline-secondary" size="sm" className="rounded-pill px-3 d-inline-flex align-items-center gap-2 mb-4">
            <FaArrowLeft aria-hidden="true" /> Volver al inicio
          </Button>

          <article className="bg-body rounded-4 shadow-sm p-4 p-md-5">
            <header className="d-flex align-items-center gap-3 mb-4">
              <Image src="/logo.png" alt="Escudo del Club Deportivo" width={64} height={64} className="object-fit-contain flex-shrink-0" />
              <div>
                <h1 className="h3 fw-bolder text-uppercase fst-italic mb-1">Política de privacidad</h1>
                <p className="small text-body-secondary mb-0">Última actualización: {actualizada}</p>
              </div>
            </header>

            <Seccion titulo="Quién es responsable de tus datos">
              <p>
                El Club Deportivo, con domicilio en {contactoClub.direccion}, es responsable de la base de datos de socios y del tratamiento de los datos que
                cargás en este portal. Para cualquier consulta podés escribir a <a href={`mailto:${contactoClub.email}`}>{contactoClub.email}</a> o acercarte a la
                secretaría ({contactoClub.horario}).
              </p>
            </Seccion>

            <Seccion titulo="Qué datos guardamos">
              <ul>
                <li>Identidad: nombre, apellido, DNI, fecha de nacimiento y las fotos del frente y dorso del documento.</li>
                <li>Contacto: dirección, teléfono y correo electrónico.</li>
                <li>La foto de tu carnet digital.</li>
                <li>
                  Medio de pago: si elegís tarjeta, solo el emisor, la marca y los últimos 4 números. El número completo, el vencimiento y el código de seguridad
                  no se guardan.
                </li>
                <li>Las cuotas, los pagos que informás con sus comprobantes y los mensajes con la administración.</li>
                <li>El registro de los cambios que se hacen en tu cuenta, con fecha, hora y quién los hizo.</li>
              </ul>
            </Seccion>

            <Seccion titulo="Para qué los usamos">
              <p>
                Para darte de alta como socio, emitir tu carnet, calcular y cobrar la cuota social, validar los pagos, responder tus consultas y avisarte novedades
                del club. No los vendemos ni los cedemos a terceros con fines comerciales.
              </p>
              <p className="mb-0">
                Las fotos del DNI y de los comprobantes se envían a la inteligencia artificial de Google (Gemini) solo para leerlas y completar los datos
                automáticamente. Siempre podés revisar y corregir lo que se leyó.
              </p>
            </Seccion>

            <Seccion titulo="Cómo los protegemos">
              <ul className="mb-0">
                <li>Todo viaja cifrado por HTTPS y la base de datos está en servidores con conexión cifrada.</li>
                <li>Las contraseñas se guardan cifradas: nadie del club puede verlas.</li>
                <li>La sesión se guarda en una cookie protegida que el sitio no puede leer, y la cuenta se bloquea un rato tras varios intentos fallidos.</li>
                <li>Cada persona del club solo accede a lo que necesita para su tarea, y cada cambio queda registrado.</li>
              </ul>
            </Seccion>

            <Seccion titulo="Cookies">
              <p className="mb-0">
                Usamos una sola cookie, la de tu sesión, para que no tengas que ingresar en cada pantalla. También recordamos en tu navegador si elegiste el modo
                oscuro. No usamos cookies de publicidad ni de seguimiento.
              </p>
            </Seccion>

            <Seccion titulo="Cuánto tiempo los guardamos">
              <p className="mb-0">
                Mientras seas socio. Si te das de baja, conservamos el historial de pagos el tiempo que exigen las normas contables y fiscales, y el resto de los
                datos se elimina cuando lo pidas.
              </p>
            </Seccion>

            <Seccion titulo="Tus derechos">
              <p>
                Podés pedir gratis acceso a tus datos cada seis meses, salvo que tengas un interés legítimo para hacerlo antes (artículo 14, inciso 3, de la Ley
                25.326). También podés pedir que se corrijan, se actualicen o se eliminen. La mayoría de tus datos los podés corregir vos mismo desde{' '}
                <strong>Datos personales</strong> en tu panel; para lo demás, escribinos o acercate a la secretaría.
              </p>
              <p className="small text-body-secondary mb-0">
                La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias
                y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos
                personales.
              </p>
            </Seccion>
          </article>
        </Container>
      </main>
      <PiePagina />
    </div>
  )
}
