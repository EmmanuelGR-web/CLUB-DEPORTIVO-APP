'use client'

import { useCallback, useEffect, useState } from 'react'
import { Row, Col, Button, Alert, Modal, Image } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import EstadoBadge from '../comun/EstadoBadge'
import EstadoConsulta from '../comun/EstadoConsulta'
import DatosPersonales from '../socio/DatosPersonales'
import MedioPago from '../socio/MedioPago'
import PagosFiltrables from '../socio/PagosFiltrables'
import { corregirSocio, darDeBajaApi, obtenerFicha, restablecerContrasenaApi } from '../../servicios/gestionApi'
import { alertaError, alertaExito, confirmarBorrado } from '../../utilidades/alertas'
import { categorias } from '../../utilidades/categorias'
import { formatearPesos } from '../../utilidades/carnet'

function FichaSocio({ socioId, onVolver, onCambio, puedeDarDeBaja = false }) {
  const [ficha, setFicha] = useState(null)
  const [error, setError] = useState('')
  const [confirmar, setConfirmar] = useState(false)
  const [aviso, setAviso] = useState('')

  const cargar = useCallback(async () => {
    setError('')
    try {
      setFicha(await obtenerFicha(socioId))
    } catch (problema) {
      setError(problema.message)
    }
  }, [socioId])

  useEffect(() => {
    cargar()
  }, [cargar])

  const guardar = async (cambios, seccion) => {
    const { resultado, perfil, historial } = await corregirSocio(socioId, cambios, seccion)
    setFicha({ perfil, historial })
    onCambio()
    return resultado
  }

  const restablecer = async () => {
    setConfirmar(false)
    try {
      const { dni, perfil, historial } = await restablecerContrasenaApi(socioId)
      setFicha({ perfil, historial })
      setAviso(`Listo. ${perfil.nombreCompleto} ya puede ingresar con su DNI (${dni}) como contraseña. Al entrar se le va a sugerir cambiarla.`)
      onCambio()
    } catch (problema) {
      alertaError(problema.message, 'No se pudo restablecer la contraseña')
    }
  }

  const darDeBaja = async () => {
    const { perfil } = ficha
    const confirmada = await confirmarBorrado({
      titulo: `¿Dar de baja a ${perfil.nombreCompleto}?`,
      texto: `Deja de figurar en el padrón del club (N° ${perfil.numeroSocio}). Sus pagos quedan como historial.`,
      boton: 'Sí, dar de baja',
      accion: () => darDeBajaApi(perfil.id),
    })
    if (!confirmada) return
    alertaExito(`${perfil.nombreCompleto} ya no figura en el padrón.`, 'Baja registrada')
    onCambio()
    onVolver()
  }

  if (!ficha) {
    return (
      <>
        <Button variant="link" className="link-secondary p-0 mb-3" onClick={onVolver}>
          ← Volver al padrón
        </Button>
        <EstadoConsulta cargando={!error} error={error} onReintentar={cargar} />
      </>
    )
  }

  const { perfil, historial } = ficha
  const deuda = perfil.pagos.filter((p) => ['Pendiente', 'Vencido'].includes(p.estado)).reduce((total, p) => total + p.monto, 0)
  const estilo = categorias[perfil.categoria]

  return (
    <>
      <Button variant="link" className="link-secondary p-0 mb-3" onClick={onVolver}>
        ← Volver al padrón
      </Button>

      <Tarjeta className="mb-4">
        <Row className="g-3 align-items-center">
          <Col xs="auto">
            {perfil.foto ? (
              <Image src={perfil.foto} alt={`Foto de ${perfil.nombreCompleto}`} width={84} height={84} roundedCircle className="object-fit-cover border border-3 border-secondary" />
            ) : (
              <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center font-credencial fw-bold fs-3" style={{ width: 84, height: 84 }}>
                {perfil.nombreCompleto
                  .split(' ')
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')}
              </div>
            )}
          </Col>
          <Col>
            <h2 className="h4 fw-bold text-secondary mb-1">{perfil.nombreCompleto}</h2>
            <div className="d-flex flex-wrap align-items-center gap-2 small">
              <span className="font-numeros">N° {perfil.numeroSocio}</span>
              <span className={`badge rounded-pill text-${estilo.texto}`} style={{ backgroundImage: estilo.degradado }}>
                {perfil.categoria}
              </span>
              <EstadoBadge estado={perfil.estado} />
              <span className="text-body-secondary text-break">{perfil.correoInstitucional}</span>
            </div>
          </Col>
          <Col md="auto" className="text-md-end">
            <div className="small text-body-secondary">Deuda actual</div>
            <div className={`font-credencial fw-bold fs-3 ${deuda ? 'text-danger' : 'text-success'}`}>{deuda ? formatearPesos(deuda) : 'Al día'}</div>
          </Col>
        </Row>
      </Tarjeta>

      {aviso && (
        <Alert variant="success" dismissible onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      )}

      <Tarjeta titulo="Acceso al portal" className="mb-4">
        <p className="small text-body-secondary">
          Si el socio no recuerda su contraseña, restablecela: pasa a ser su número de DNI y después la puede cambiar desde su panel.
        </p>
        {perfil.debeCambiarContrasena && <p className="small text-danger">La contraseña está restablecida al DNI y el socio todavía no la cambió.</p>}
        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setConfirmar(true)}>
          Restablecer contraseña
        </Button>
      </Tarjeta>

      {puedeDarDeBaja && (
        <Tarjeta titulo="Baja del socio" className="mb-4">
          <p className="small text-body-secondary">Saca al socio del padrón del club. Sus movimientos dejan de figurar en la facturación.</p>
          <Button variant="outline-danger" className="rounded-pill px-4" onClick={darDeBaja}>
            Dar de baja
          </Button>
        </Tarjeta>
      )}

      <div className="mb-4">
        <DatosPersonales
          socio={perfil}
          onGuardar={guardar}
          historial={historial}
          textoEditar="Corregir datos"
          textoGuardado="Datos del socio corregidos. El cambio quedó registrado con tu nombre."
          vistaPersonal
        />
      </div>
      <MedioPago socio={perfil} onGuardar={guardar} />
      <Tarjeta titulo="Movimientos">
        <PagosFiltrables socio={perfil} />
      </Tarjeta>

      <Modal show={confirmar} onHide={() => setConfirmar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-secondary">Restablecer contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          La contraseña de <strong>{perfil.nombreCompleto}</strong> va a pasar a ser su DNI (<span className="font-numeros">{perfil.dni}</span>). La anterior deja de
          funcionar. ¿Confirmás?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setConfirmar(false)}>
            Cancelar
          </Button>
          <Button variant="secondary" className="rounded-pill px-4" onClick={restablecer}>
            Restablecer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default FichaSocio
