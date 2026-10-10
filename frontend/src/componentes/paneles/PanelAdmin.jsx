'use client'

import { useCallback, useState } from 'react'
import { useTituloPagina } from '../../hooks/useTituloPagina'
import { useDatosEnVivo } from '../../hooks/useDatosEnVivo'
import PantallaCarga from '../comun/PantallaCarga'
import PanelLayout from '../layout/PanelLayout'
import ResumenAdmin from '../admin/ResumenAdmin'
import GestionPersonal from '../admin/GestionPersonal'
import Facturacion from '../admin/Facturacion'
import ControlPersonal from '../admin/ControlPersonal'
import GestionNoticias from '../admin/GestionNoticias'
import ListaSocios from '../empleado/ListaSocios'
import FichaSocio from '../empleado/FichaSocio'
import RegistroCambios from '../empleado/RegistroCambios'
import MensajesInternos from '../comun/MensajesInternos'
import { menuAdmin } from '../../datos/menus'
import { ausenciaVigente, fechaDeHoy } from '../../utilidades/personal'
import { presenciaDe } from '../../utilidades/jornada'
import { obtenerPanelAdmin } from '../../servicios/adminApi'
import { leidoInternoApi, nuevoInternoApi, responderInternoApi } from '../../servicios/gestionApi'

const titulos = {
  resumen: 'Panel del administrador principal',
  personal: 'Personal',
  presencia: 'Control del personal',
  socios: 'Socios',
  facturacion: 'Facturación',
  noticias: 'Noticias',
  reportes: 'Reportes',
  interno: 'Mensajes del personal',
}

const direccion = { nombre: 'Laura Gómez', puesto: 'Administradora principal' }

// Además de lo que manda el servidor, cuenta cuántos del personal están
// en actividad hoy y cuántos están conectados ahora.
const leer = async () => {
  const datos = await obtenerPanelAdmin()
  const ahora = Date.now()
  const trabajando = datos.personal.filter((e) => !ausenciaVigente(e, fechaDeHoy(new Date(ahora))))
  return {
    ...datos,
    enActividad: trabajando.length,
    enLinea: trabajando.filter((e) => ['linea', 'descanso'].includes(presenciaDe(e, datos.jornadas, ahora).clave)).length,
  }
}

function ContenidoAdmin({ datos, recargar, actualizado, cambiarDatos }) {
  const [seccion, setSeccion] = useState('resumen')
  const [fichaAbierta, setFichaAbierta] = useState(null)

  const ir = (id) => {
    setSeccion(id)
    setFichaAbierta(null)
  }

  const abrirFicha = (id) => {
    setSeccion('socios')
    setFichaAbierta(id)
  }

  const abrirInterno = (id) => {
    cambiarDatos((actual) => ({ ...actual, hilosInternos: actual.hilosInternos.map((h) => (h.id === id ? { ...h, leidoPor: { ...h.leidoPor, admin: true } } : h)) }))
    leidoInternoApi(id).catch(() => {})
  }

  const responderInterno = async (id, mensaje) => {
    const hilosInternos = await responderInternoApi(id, mensaje)
    cambiarDatos((actual) => ({ ...actual, hilosInternos }))
  }

  const crearInterno = async (mensaje, destino) => {
    const { id, hilos } = await nuevoInternoApi(mensaje, destino)
    cambiarDatos((actual) => ({ ...actual, hilosInternos: hilos }))
    return id
  }

  const contadores = { interno: datos.hilosInternos.filter((h) => !h.leidoPor.admin).length }
  const items = menuAdmin.map((item) => ({ ...item, contador: contadores[item.id] }))

  return (
    <PanelLayout
      titulo={titulos[seccion]}
      usuario={{ nombre: direccion.nombre, foto: null }}
      detalle="Admin principal"
      items={items}
      activo={seccion}
      variante="bordo"
      onActualizar={recargar}
      actualizado={actualizado}
      onSeleccionar={ir}
    >
      {seccion === 'resumen' && <ResumenAdmin {...datos} onIr={ir} />}
      {seccion === 'presencia' && <ControlPersonal personal={datos.personal} jornadas={datos.jornadas} />}
      {seccion === 'personal' && <GestionPersonal personal={datos.personal} jornadas={datos.jornadas} onCambio={recargar} />}
      {seccion === 'socios' &&
        (fichaAbierta ? (
          <FichaSocio key={fichaAbierta} socioId={fichaAbierta} onVolver={() => setFichaAbierta(null)} onCambio={recargar} puedeDarDeBaja />
        ) : (
          <ListaSocios perfiles={datos.perfiles} onAbrir={setFichaAbierta} />
        ))}
      {seccion === 'facturacion' && <Facturacion perfiles={datos.perfiles} autor={`${direccion.nombre} (${direccion.puesto})`} onAbrirFicha={abrirFicha} />}
      {seccion === 'noticias' && <GestionNoticias />}
      {seccion === 'reportes' && <RegistroCambios registros={datos.registros} />}
      {seccion === 'interno' && (
        <MensajesInternos rol="admin" hilos={datos.hilosInternos} personal={datos.personal} onAbrir={abrirInterno} onResponder={responderInterno} onCrear={crearInterno} />
      )}
    </PanelLayout>
  )
}

function PanelAdmin() {
  useTituloPagina('Panel del administrador')
  const leerDatos = useCallback(leer, [])
  const [datos, recargar, actualizado, error, cambiarDatos] = useDatosEnVivo(leerDatos)
  if (!datos) return <PantallaCarga error={error} onReintentar={recargar} />
  return <ContenidoAdmin datos={datos} recargar={recargar} actualizado={actualizado} cambiarDatos={cambiarDatos} />
}

export default PanelAdmin
