'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSesion } from '../../contextos/SesionContexto'
import { useDatosEnVivo } from '../../hooks/useDatosEnVivo'
import { useTituloPagina } from '../../hooks/useTituloPagina'
import { useVista } from '../../hooks/useVista'
import PantallaCarga from '../comun/PantallaCarga'
import MensajesInternos from '../comun/MensajesInternos'
import PanelLayout from '../layout/PanelLayout'
import ResumenGestion from '../empleado/ResumenGestion'
import Solicitudes from '../empleado/Solicitudes'
import DetalleSolicitud from '../empleado/DetalleSolicitud'
import ListaSocios from '../empleado/ListaSocios'
import FichaSocio from '../empleado/FichaSocio'
import MensajesSocios from '../empleado/MensajesSocios'
import RegistroCambios from '../empleado/RegistroCambios'
import NuevoSocio from '../empleado/NuevoSocio'
import DatosEmpleado from '../empleado/DatosEmpleado'
import ControlJornada from '../empleado/ControlJornada'
import GestionNoticias from '../admin/GestionNoticias'
import GestionBeneficios from '../admin/GestionBeneficios'
import { barraInferior, menuEmpleado } from '../../datos/menus'
import BarraInferior from '../comun/BarraInferior'
import { textoAusencia, textoRegreso } from '../../utilidades/personal'
import { alertaAviso, alertaError } from '../../utilidades/alertas'
import {
  jornadaApi,
  leidoInternoApi,
  nuevoInternoApi,
  obtenerPanelGestion,
  resolverSolicitudApi,
  responderInternoApi,
  responderSocioApi,
} from '../../servicios/gestionApi'

const titulos = {
  resumen: 'Panel administrativo',
  solicitudes: 'Solicitudes',
  socios: 'Socios',
  mensajes: 'Mensajes de socios',
  cambios: 'Registro de cambios',
  interno: 'Administración principal',
  nuevo: 'Nuevo socio',
  noticias: 'Noticias',
  beneficios: 'Beneficios',
  datos: 'Mis datos',
}

function ContenidoEmpleado({ datos, recargar, actualizado, cambiarDatos }) {
  const { seccion, ficha: fichaAbierta, ir, volver, puedeVolver } = useVista('resumen', Object.keys(titulos))
  const [revisando, setRevisando] = useState(null)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const { cerrarSesion } = useSesion()
  const router = useRouter()
  const { empleado } = datos

  // Si la dirección le carga una licencia o vacaciones que empiezan hoy,
  // la sesión se cierra en el próximo refresco.
  useEffect(() => {
    if (!datos.ausencia) return
    jornadaApi('salida').catch(() => {})
    cerrarSesion()
    router.replace('/login')
    alertaAviso(`${textoAusencia(datos.ausencia)}. ${textoRegreso(datos.ausencia).replace('Vuelve', 'Vas a poder ingresar')}.`, 'Tu acceso está pausado')
  }, [datos.ausencia, cerrarSesion, router])

  const revisar = (solicitud) => {
    setRevisando(solicitud)
    setMostrarDetalle(true)
  }

  const resolver = async (solicitud, estado, motivo) => {
    try {
      const actualizada = await resolverSolicitudApi(solicitud.id, estado, motivo)
      setRevisando(actualizada)
      recargar()
    } catch (problema) {
      alertaError(problema.message, 'No se pudo resolver la solicitud')
    }
  }

  const responderSocio = async (socio, hiloId, mensaje) => {
    const conversaciones = await responderSocioApi(hiloId, mensaje)
    cambiarDatos((actual) => ({ ...actual, conversaciones }))
  }

  const abrirInterno = (id) => {
    cambiarDatos((actual) => ({ ...actual, hilosInternos: actual.hilosInternos.map((h) => (h.id === id ? { ...h, leidoPor: { ...h.leidoPor, empleado: true } } : h)) }))
    leidoInternoApi(id).catch(() => {})
  }

  const responderInterno = async (id, mensaje) => {
    const hilosInternos = await responderInternoApi(id, mensaje)
    cambiarDatos((actual) => ({ ...actual, hilosInternos }))
  }

  const crearInterno = async (mensaje) => {
    const { id, hilos } = await nuevoInternoApi(mensaje)
    cambiarDatos((actual) => ({ ...actual, hilosInternos: hilos }))
    return id
  }

  const pendientes = datos.solicitudes.filter((s) => s.estado === 'Pendiente').length
  const sinResponder = datos.conversaciones.filter((c) => c.sinResponder).length
  const internosSinLeer = datos.hilosInternos.filter((h) => !h.leidoPor.empleado).length
  const contadores = { solicitudes: pendientes, mensajes: sinResponder, interno: internosSinLeer }
  const items = menuEmpleado.map((item) => ({ ...item, contador: contadores[item.id] }))

  return (
    <PanelLayout
      titulo={titulos[seccion]}
      usuario={{ nombre: empleado.nombre, foto: null }}
      detalle={`Código ${empleado.codigo} · ${empleado.sector}`}
      items={items}
      activo={seccion}
      onActualizar={recargar}
      actualizado={actualizado}
      extra={<ControlJornada />}
      alSalir={() => jornadaApi('salida').catch(() => {})}
      onSeleccionar={(id) => ir(id)}
      onVolver={puedeVolver ? volver : undefined}
      barraInferior={<BarraInferior items={barraInferior} activo={seccion} onSeleccionar={(id) => ir(id)} />}
    >
      {seccion === 'resumen' && <ResumenGestion {...datos} onIr={ir} onRevisar={revisar} />}
      {seccion === 'solicitudes' && <Solicitudes solicitudes={datos.solicitudes} onRevisar={revisar} />}
      {seccion === 'socios' &&
        (fichaAbierta ? (
          <FichaSocio key={fichaAbierta} socioId={fichaAbierta} onVolver={volver} onCambio={recargar} />
        ) : (
          <ListaSocios perfiles={datos.perfiles} onAbrir={(id) => ir('socios', id)} />
        ))}
      {seccion === 'mensajes' && <MensajesSocios conversaciones={datos.conversaciones} onResponder={responderSocio} />}
      {seccion === 'cambios' && <RegistroCambios registros={datos.registros} />}
      {seccion === 'interno' && (
        <MensajesInternos rol="empleado" hilos={datos.hilosInternos} onAbrir={abrirInterno} onResponder={responderInterno} onCrear={crearInterno} />
      )}
      {seccion === 'nuevo' && <NuevoSocio onCreado={recargar} />}
      {seccion === 'noticias' && <GestionNoticias />}
      {seccion === 'beneficios' && <GestionBeneficios />}
      {seccion === 'datos' && <DatosEmpleado empleado={empleado} />}

      <DetalleSolicitud solicitud={revisando} mostrar={mostrarDetalle} onCerrar={() => setMostrarDetalle(false)} onResolver={resolver} />
    </PanelLayout>
  )
}

function PanelEmpleado() {
  useTituloPagina('Panel administrativo')
  const leer = useCallback(obtenerPanelGestion, [])
  const [datos, recargar, actualizado, error, cambiarDatos] = useDatosEnVivo(leer)
  if (!datos) return <PantallaCarga error={error} onReintentar={recargar} />
  return <ContenidoEmpleado datos={datos} recargar={recargar} actualizado={actualizado} cambiarDatos={cambiarDatos} />
}

export default PanelEmpleado
