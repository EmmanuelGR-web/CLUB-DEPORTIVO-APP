'use client'

import { useState } from 'react'
import { Row, Col, Form, Button, Alert, Collapse } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import CampoContrasena from '../auth/CampoContrasena'
import { cambiarContrasenaApi } from '../../servicios/cuentaApi'

const vacio = { actual: '', nueva: '', repetir: '' }

function CambiarContrasena({ socio, onCambiada }) {
  const [abierto, setAbierto] = useState(Boolean(socio.debeCambiarContrasena))
  const [valores, setValores] = useState(vacio)
  const [validado, setValidado] = useState(false)
  const [actualIncorrecta, setActualIncorrecta] = useState(false)
  const [aviso, setAviso] = useState('')

  const errores = {
    actual: !valores.actual || actualIncorrecta,
    nueva: valores.nueva.length < 6 || valores.nueva === valores.actual,
    repetir: valores.repetir !== valores.nueva || !valores.repetir,
  }
  const cambiar = (campo) => (valor) => {
    setValores({ ...valores, [campo]: valor })
    if (campo === 'actual') setActualIncorrecta(false)
  }

  const guardar = async (e) => {
    e.preventDefault()
    setValidado(true)
    if (Object.values(errores).some(Boolean)) return
    try {
      await cambiarContrasenaApi(valores.actual, valores.nueva)
    } catch (problema) {
      if (problema.datos?.campo === 'actual') setActualIncorrecta(true)
      else setAviso(problema.message)
      return
    }
    setValores(vacio)
    setValidado(false)
    setAbierto(false)
    setAviso('Tu contraseña se cambió. La próxima vez ingresá con la nueva.')
    onCambiada()
  }

  return (
    <Tarjeta titulo="Contraseña" className="mb-4">
      {socio.debeCambiarContrasena && (
        <Alert variant="warning" className="small">
          Tu contraseña actual es tu <strong>número de DNI</strong>. Te recomendamos cambiarla por una propia.
        </Alert>
      )}
      {aviso && (
        <Alert variant={aviso.startsWith('Tu contraseña se cambió') ? 'success' : 'warning'} dismissible onClose={() => setAviso('')} className="small">
          {aviso}
        </Alert>
      )}

      {!abierto && (
        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setAbierto(true)}>
          Cambiar contraseña
        </Button>
      )}

      <Collapse in={abierto}>
        <div>
          <Form noValidate onSubmit={guardar}>
            <Row className="g-md-3">
              <Col md={4}>
                <CampoContrasena
                  id="contrasena-actual"
                  etiqueta="Contraseña actual"
                  valor={valores.actual}
                  onCambiar={cambiar('actual')}
                  invalido={validado && errores.actual}
                  mensaje={actualIncorrecta ? 'La contraseña actual no es correcta.' : 'Escribí tu contraseña actual.'}
                  autoComplete="current-password"
                />
              </Col>
              <Col md={4}>
                <CampoContrasena
                  id="contrasena-nueva"
                  etiqueta="Nueva contraseña"
                  valor={valores.nueva}
                  onCambiar={cambiar('nueva')}
                  invalido={validado && errores.nueva}
                  mensaje="Al menos 6 caracteres y distinta de la actual."
                />
              </Col>
              <Col md={4}>
                <CampoContrasena
                  id="contrasena-repetir"
                  etiqueta="Repetir nueva"
                  valor={valores.repetir}
                  onCambiar={cambiar('repetir')}
                  invalido={validado && errores.repetir}
                  mensaje="Las contraseñas no coinciden."
                />
              </Col>
            </Row>
            <div className="d-flex gap-2">
              <Button type="submit" variant="secondary" className="rounded-pill px-4">
                Guardar contraseña
              </Button>
              <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
            </div>
          </Form>
        </div>
      </Collapse>
    </Tarjeta>
  )
}

export default CambiarContrasena
