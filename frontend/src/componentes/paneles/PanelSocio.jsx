'use client'

import { useCallback, useState } from 'react'
import { Row, Col, Button, Alert } from 'react-bootstrap'
import PanelLayout from '../layout/PanelLayout'
import PantallaCarga from '../comun/PantallaCarga'
import EstadoMembresia from '../socio/EstadoMembresia'
import CarnetDigital from '../socio/CarnetDigital'
import PagosFiltrables from '../socio/PagosFiltrables'
import MedioPago from '../socio/MedioPago'
import Beneficios from '../socio/Beneficios'
import DatosPersonales from '../socio/DatosPersonales'
import FotoPerfil from '../socio/FotoPerfil'
import CambiarContrasena from '../socio/CambiarContrasena'
import InformarPago from '../socio/InformarPago'
import Bandeja from '../socio/Bandeja'
import Tarjeta from '../comun/Tarjeta'
import { useDatosEnVivo } from '../../hooks/useDatosEnVivo'
import { useTituloPagina } from '../../hooks/useTituloPagina'
import { useSesion } from '../../contextos/SesionContexto'
import { menuSocio } from '../../datos/menus'
import { beneficios } from '../../datos/socio'
import { descargarCredencial } from '../../utilidades/pdf'
import { formatearPesos } from '../../utilidades/carnet'
import { alertaError, alertaExito } from '../../utilidades/alertas'
import {
  crearHilo,
  guardarCambiosCuenta,
  informarPagoApi,
  marcarHiloLeido,
  obtenerHilos,
  obtenerHistorial,
  obtenerPerfil,
  responderHilo,
} from '../../servicios/cuentaApi'

const titulos = { resumen: 'Mi resumen', datos: 'Datos personales', pagos: 'Facturas y pagos', bandeja: 'Bandeja de entrada' }

const leer = async () => {
  const [socio, hilos, historial] = await Promise.all([obtenerPerfil(), obtenerHilos(), obtenerHistorial()])
  return { socio, hilos, historial }
}

function ContenidoSocio({ datos, recargar, actualizado, cambiarDatos }) {
  const { socio, hilos, historial } = datos
  const { actualizarUsuario } = useSesion()
  const [seccion, setSeccion] = useState('resumen')
  const [descargando, setDescargando] = useState(false)

  const sinLeer = hilos.filter((h) => !h.leido).length
  const items = menuSocio.map((item) => (item.id === 'bandeja' ? { ...item, contador: sinLeer } : item))
  // Si hay más de una cuota abierta, primero se informa la más vieja.
  const cuotaAbierta = socio.pagos.filter((p) => ['Pendiente', 'Vencido', 'En revisión'].includes(p.estado)).at(-1)

  const guardarCambios = async (cambios, seccionCambiada) => {
    const { resultado, perfil } = await guardarCambiosCuenta(cambios, seccionCambiada)
    cambiarDatos((actual) => ({ ...actual, socio: perfil }))
    actualizarUsuario({ nombre: perfil.nombreCompleto })
    recargar()
    return resultado
  }

  const informarPago = async (cuota, datosPago) => {
    const perfil = await informarPagoApi({ periodo: cuota.periodo, ...datosPago })
    cambiarDatos((actual) => ({ ...actual, socio: perfil }))
    alertaExito('El personal del club va a revisar tu comprobante. Te avisamos por tu bandeja de entrada.', 'Comprobante enviado')
  }

  const abrirHilo = async (id) => {
    cambiarDatos((actual) => ({ ...actual, hilos: actual.hilos.map((h) => (h.id === id ? { ...h, leido: true } : h)) }))
    marcarHiloLeido(id).catch(() => {})
  }

  const responder = async (id, mensaje) => {
    const nuevos = await responderHilo(id, mensaje)
    cambiarDatos((actual) => ({ ...actual, hilos: nuevos }))
  }

  const crear = async (mensaje) => {
    const { id, hilos: nuevos } = await crearHilo(mensaje)
    cambiarDatos((actual) => ({ ...actual, hilos: nuevos }))
    return id
  }

  const bajarCredencial = async () => {
    setDescargando(true)
    try {
      await descargarCredencial(socio)
    } catch {
      alertaError('No pudimos generar la credencial. Probá de nuevo.')
    } finally {
      setDescargando(false)
    }
  }

  return (
    <PanelLayout
      titulo={titulos[seccion]}
      usuario={{ nombre: socio.nombreCompleto, foto: socio.foto }}
      detalle={`Socio ${socio.categoria} · N° ${socio.numeroSocio}`}
      items={items}
      activo={seccion}
      onSeleccionar={setSeccion}
      onActualizar={recargar}
      actualizado={actualizado}
    >
      {seccion === 'resumen' && (
        <>
          {socio.estado === 'En validación' && (
            <Alert variant="info" className="d-flex flex-wrap align-items-center gap-2">
              Estamos validando tus datos. Cuando el personal apruebe tu alta, tu carnet digital queda activo.
            </Alert>
          )}
          {socio.debeCambiarContrasena && (
            <Alert variant="warning" className="d-flex flex-wrap align-items-center gap-2">
              Tu contraseña actual es tu número de DNI. Te recomendamos cambiarla por una propia.
              <Button size="sm" variant="secondary" className="rounded-pill ms-auto" onClick={() => setSeccion('datos')}>
                Cambiarla ahora
              </Button>
            </Alert>
          )}
          {cuotaAbierta && cuotaAbierta.estado !== 'En revisión' && (
            <Alert variant={cuotaAbierta.estado === 'Vencido' ? 'danger' : 'warning'} className="d-flex flex-wrap align-items-center gap-2">
              {cuotaAbierta.estado === 'Vencido'
                ? `Tu cuota ${cuotaAbierta.fecha} está vencida: ${formatearPesos(cuotaAbierta.monto)} con recargo por ${cuotaAbierta.diasDemora} días de demora.`
                : `Tenés la cuota ${cuotaAbierta.fecha} pendiente: ${formatearPesos(cuotaAbierta.monto)}. Vence el día 15.`}
              <Button size="sm" variant="secondary" className="rounded-pill ms-auto" onClick={() => setSeccion('pagos')}>
                Informar pago
              </Button>
            </Alert>
          )}
          <Row className="g-4 mb-4">
            <Col xl={5}>
              <EstadoMembresia socio={socio} />
            </Col>
            <Col xl={7}>
              <CarnetDigital socio={socio} />
              <Button variant="secondary" className="rounded-pill px-4 mt-3" onClick={bajarCredencial} disabled={descargando}>
                {descargando ? 'Generando…' : 'Descargar credencial para imprimir'}
              </Button>
            </Col>
          </Row>

          <Tarjeta titulo="Mis movimientos" className="mb-4">
            <PagosFiltrables socio={socio} porPagina={6} />
          </Tarjeta>

          <h2 className="h6 fw-bold text-uppercase text-center text-secondary mb-3">Beneficios exclusivos</h2>
          <Beneficios beneficios={beneficios} />
        </>
      )}

      {seccion === 'datos' && (
        <>
          <FotoPerfil socio={socio} onGuardar={guardarCambios} />
          <DatosPersonales socio={socio} onGuardar={guardarCambios} historial={historial} />
          <div className="mt-4">
            <CambiarContrasena socio={socio} onCambiada={recargar} />
          </div>
        </>
      )}

      {seccion === 'pagos' && (
        <>
          {cuotaAbierta && <InformarPago key={cuotaAbierta.periodo + cuotaAbierta.estado} cuota={cuotaAbierta} onInformar={informarPago} />}
          <MedioPago socio={socio} onGuardar={guardarCambios} />
          <Tarjeta titulo="Historial de pagos">
            <PagosFiltrables socio={socio} />
          </Tarjeta>
        </>
      )}

      {seccion === 'bandeja' && <Bandeja socio={socio} hilos={hilos} onAbrir={abrirHilo} onResponder={responder} onCrear={crear} />}
    </PanelLayout>
  )
}

function PanelSocio() {
  useTituloPagina('Panel del socio')
  const leerDatos = useCallback(leer, [])
  const [datos, recargar, actualizado, error, cambiarDatos] = useDatosEnVivo(leerDatos)
  if (!datos) return <PantallaCarga error={error} onReintentar={recargar} />
  return <ContenidoSocio datos={datos} recargar={recargar} actualizado={actualizado} cambiarDatos={cambiarDatos} />
}

export default PanelSocio
