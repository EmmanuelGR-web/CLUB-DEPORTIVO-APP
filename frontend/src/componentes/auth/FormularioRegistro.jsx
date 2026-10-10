'use client'

import { useState } from 'react'
import { Form, Row, Col, Button, Alert, Collapse, Spinner, Badge } from 'react-bootstrap'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaIdCard, FaCreditCard, FaMoneyBillWave, FaCheckCircle, FaUserPlus, FaRobot, FaMagic } from 'react-icons/fa'
import SubirImagen from './SubirImagen'
import CamaraSelfie from './CamaraSelfie'
import OpcionPago from './OpcionPago'
import CampoContrasena from './CampoContrasena'
import DatosTarjeta from './DatosTarjeta'
import { contactoClub } from '../../datos/club'
import { erroresTarjeta, resumirTarjeta, revisarNumeroTarjeta, tarjetaVacia } from '../../utilidades/tarjetas'
import { camposCorregidos, leerConIA } from '../../utilidades/lecturaIA'
import { leerAdjunto } from '../../utilidades/mensajes'
import { formatearFechaConAnio } from '../../utilidades/fechas'
import { registrarSocio } from '../../servicios/cuentaApi'
import { tarjetaVidrio } from './estilosAuth'
import { alertaAviso, alertaError, alertaMensaje } from '../../utilidades/alertas'

const edadValida = (fecha) => {
  const nacimiento = new Date(`${fecha}T12:00:00`)
  const anios = (Date.now() - nacimiento) / (365.25 * 24 * 3600 * 1000)
  return anios >= 0 && anios < 110
}

const camposDni = [
  { nombre: 'nombre', etiqueta: 'Nombre', autoComplete: 'given-name', valido: (v) => v.trim().length >= 2, mensaje: 'Ingresá tu nombre.' },
  { nombre: 'apellido', etiqueta: 'Apellido', autoComplete: 'family-name', valido: (v) => v.trim().length >= 2, mensaje: 'Ingresá tu apellido.' },
  {
    nombre: 'dni',
    etiqueta: 'Número de DNI',
    inputMode: 'numeric',
    valido: (v) => /^\d{7,8}$/.test(v.replace(/\./g, '')),
    mensaje: 'El DNI tiene 7 u 8 números.',
  },
  { nombre: 'fechaNacimiento', etiqueta: 'Fecha de nacimiento', tipo: 'date', valido: edadValida, mensaje: 'Ingresá una fecha de nacimiento válida.' },
  { nombre: 'direccion', etiqueta: 'Dirección', autoComplete: 'street-address', valido: (v) => v.trim().length >= 5, mensaje: 'Ingresá tu dirección.' },
]

const camposContacto = [
  {
    nombre: 'telefono',
    etiqueta: 'Teléfono de contacto',
    tipo: 'tel',
    autoComplete: 'tel',
    ejemplo: '381 555-1234',
    valido: (v) => v.replace(/\D/g, '').length >= 8,
    mensaje: 'Ingresá un teléfono válido.',
  },
  {
    nombre: 'email',
    etiqueta: 'Correo electrónico',
    tipo: 'email',
    autoComplete: 'email',
    ejemplo: 'nombre@correo.com',
    valido: (v) => /^\S+@\S+\.\S+$/.test(v),
    mensaje: 'Ingresá un correo electrónico válido.',
  },
]

const mediosPago = [
  { valor: 'tarjeta', etiqueta: 'Tarjeta', icono: FaCreditCard },
  { valor: 'efectivo', etiqueta: 'Efectivo', icono: FaMoneyBillWave },
]

const vacio = { nombre: '', apellido: '', dni: '', fechaNacimiento: '', direccion: '', telefono: '', email: '', contrasena: '', repetir: '' }

function Titulo({ children }) {
  return <h2 className="h6 fw-bold text-uppercase mb-3">{children}</h2>
}

function CampoTexto({ campo, valor, onCambiar, invalido, leido, mensaje }) {
  return (
    <Form.Group className="mb-3" controlId={`registro-${campo.nombre}`}>
      <Form.Label className="d-flex align-items-center gap-2">
        {campo.etiqueta} *
        {leido !== undefined && (
          <Badge bg={valor === leido ? 'warning' : 'light'} text="dark" className="d-inline-flex align-items-center gap-1">
            <FaMagic aria-hidden="true" /> {valor === leido ? 'Leído por IA' : 'Corregido'}
          </Badge>
        )}
      </Form.Label>
      <Form.Control
        type={campo.tipo ?? 'text'}
        inputMode={campo.inputMode}
        autoComplete={campo.autoComplete}
        placeholder={campo.ejemplo}
        value={valor}
        onChange={(e) => onCambiar(campo.nombre, e.target.value)}
        isInvalid={invalido}
      />
      <Form.Control.Feedback type="invalid" className="text-warning fw-semibold">
        {mensaje ?? campo.mensaje}
      </Form.Control.Feedback>
    </Form.Group>
  )
}

const textoDuplicado = (campo) => `Ya hay un socio registrado con ese ${campo === 'email' ? 'correo' : 'DNI'}. Si es tuyo, ingresá con tu cuenta.`

function FormularioRegistro() {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [datos, setDatos] = useState(vacio)
  const [imagenes, setImagenes] = useState({ frente: null, dorso: null })
  const [selfie, setSelfie] = useState(null)
  const [lectura, setLectura] = useState('pendiente')
  const [leidos, setLeidos] = useState({})
  const [lecturaIA, setLecturaIA] = useState(null)
  const [avisoLectura, setAvisoLectura] = useState('')
  const [pago, setPago] = useState('')
  const [tarjeta, setTarjeta] = useState(tarjetaVacia)
  const [terminos, setTerminos] = useState(false)
  const [validado, setValidado] = useState(false)
  const [registrado, setRegistrado] = useState(null)
  const [duplicado, setDuplicado] = useState(null)

  const cambiar = (campo, valor) => {
    setDatos((actual) => ({ ...actual, [campo]: valor }))
    if (campo === duplicado) setDuplicado(null)
  }

  const leerDocumento = async ({ frente, dorso }) => {
    setLectura('leyendo')
    setAvisoLectura('')
    try {
      const resultado = await leerConIA('dni', [{ dataUrl: frente }, { dataUrl: dorso }])
      if (!resultado.esDni) {
        setAvisoLectura('Las fotos no parecen de un DNI argentino. Probá con otras o completá tus datos a mano.')
        alertaAviso('Las fotos no parecen de un DNI argentino. Probá con otras o completá tus datos a mano.', 'No pudimos leer tu DNI')
        setLectura('error')
        return
      }
      const encontrados = Object.fromEntries(['nombre', 'apellido', 'dni', 'fechaNacimiento', 'direccion'].filter((c) => resultado[c]).map((c) => [c, resultado[c]]))
      setLeidos(encontrados)
      setDatos((actual) => ({ ...actual, ...encontrados }))
      setLecturaIA({ fecha: new Date().toISOString(), leidos: encontrados, vencimiento: resultado.vencimiento, observaciones: resultado.observaciones })
      const avisos = [
        !resultado.legible && 'Algunos datos no se leyeron bien: revisalos.',
        resultado.vencimiento &&
          resultado.vencimiento < new Date().toISOString().slice(0, 10) &&
          `Tu DNI figura vencido desde el ${formatearFechaConAnio(resultado.vencimiento)}.`,
        resultado.observaciones,
      ].filter(Boolean)
      setAvisoLectura(avisos.join(' '))
      setLectura('lista')
    } catch (problema) {
      setAvisoLectura(`${problema.message} Completá tus datos a mano.`)
      alertaAviso(`${problema.message} Completá tus datos a mano.`, 'No pudimos leer tu DNI')
      setLectura('error')
    }
  }

  const elegirImagen = (campo) => async (archivo) => {
    try {
      const { dataUrl } = await leerAdjunto(archivo)
      const nuevas = { ...imagenes, [campo]: dataUrl }
      setImagenes(nuevas)
      if (nuevas.frente && nuevas.dorso) leerDocumento(nuevas)
    } catch (problema) {
      setAvisoLectura(problema.message)
      alertaError(problema.message, 'No pudimos usar esa foto')
    }
  }

  const errores = {
    ...Object.fromEntries([...camposDni, ...camposContacto].map((c) => [c.nombre, !c.valido(datos[c.nombre])])),
    contrasena: datos.contrasena.length < 6,
    repetir: datos.repetir !== datos.contrasena || datos.repetir === '',
    frente: !imagenes.frente,
    dorso: !imagenes.dorso,
    selfie: !selfie,
    pago: !pago,
    terminos: !terminos,
  }
  const errorNumero = revisarNumeroTarjeta(tarjeta.numero, tarjeta.emisor)
  if (pago === 'tarjeta') Object.assign(errores, erroresTarjeta(tarjeta))
  if (duplicado) errores[duplicado] = true
  const hayErrores = Object.values(errores).some(Boolean)
  const marcar = (campo) => validado && errores[campo]

  const armarMedioPago = () => (pago === 'tarjeta' ? resumirTarjeta(tarjeta) : { tipo: 'efectivo', debitoAutomatico: false })

  const enviar = async (e) => {
    e.preventDefault()
    setValidado(true)
    if (hayErrores) {
      if (duplicado) alertaError(textoDuplicado(duplicado), 'Ya estás registrado')
      else alertaError('Revisá los campos marcados antes de continuar.', 'Faltan datos')
      return
    }

    const { nombre, apellido, dni, fechaNacimiento, direccion, telefono, email } = datos
    setEnviando(true)
    try {
      await registrarSocio({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.replace(/\D/g, ''),
        fechaNacimiento,
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        email: email.trim().toLowerCase(),
        contrasena: datos.contrasena,
        foto: selfie,
        medioPago: armarMedioPago(),
        lecturaIA: lecturaIA ? { ...lecturaIA, corregidos: camposCorregidos(lecturaIA.leidos, datos) } : undefined,
      })
    } catch (problema) {
      if (problema.datos?.duplicado) {
        setDuplicado(problema.datos.duplicado)
        alertaError(textoDuplicado(problema.datos.duplicado), 'Ya estás registrado')
      } else {
        alertaError(problema.message, 'No pudimos completar el registro')
      }
      return
    } finally {
      setEnviando(false)
    }
    const nombrePila = nombre.trim().split(' ')[0]
    setRegistrado(nombrePila)
    const { isConfirmed } = await alertaMensaje({
      titulo: `¡Bienvenido/a, ${nombrePila}!`,
      texto: 'Recibimos tu solicitud. El personal del club va a validar tus datos y te avisaremos cuando tu carnet digital esté activo.',
      boton: 'Ir a ingresar',
    })
    if (isConfirmed) router.push('/login')
  }

  if (registrado) {
    return (
      <div className={`${tarjetaVidrio} text-center p-5 mx-auto`} style={{ maxWidth: 520 }}>
        <img src={selfie} alt="Tu foto de perfil" width={110} height={110} className="rounded-circle object-fit-cover border border-3 border-warning mb-3" />
        <h2 className="fw-bold d-flex align-items-center justify-content-center gap-2">
          <FaCheckCircle className="text-warning" aria-hidden="true" /> ¡Bienvenido/a, {registrado}!
        </h2>
        <p className="text-white-50">
          Recibimos tu solicitud. El personal del club va a validar tus datos y te avisaremos por correo cuando tu carnet digital esté activo.
        </p>
        <Button as={Link} href="/login" variant="light" size="lg" className="rounded-pill px-5 fw-bold text-uppercase text-secondary">
          Ir a ingresar
        </Button>
      </div>
    )
  }

  return (
    <Form noValidate onSubmit={enviar}>
      <Row className="g-4">
        <Col lg={5}>
          <div className={`${tarjetaVidrio} p-4 h-100`}>
            <Titulo>1. Verificación de identidad *</Titulo>
            <Row className="g-3 mb-2">
              <Col xs={6}>
                <SubirImagen
                  id="dni-frente"
                  etiqueta="Frente del DNI"
                  icono={FaIdCard}
                  vista={imagenes.frente}
                  onElegir={elegirImagen('frente')}
                  invalido={marcar('frente')}
                />
              </Col>
              <Col xs={6}>
                <SubirImagen
                  id="dni-dorso"
                  etiqueta="Dorso del DNI"
                  icono={FaIdCard}
                  vista={imagenes.dorso}
                  onElegir={elegirImagen('dorso')}
                  invalido={marcar('dorso')}
                />
              </Col>
            </Row>
            <p className="small text-white-50 mb-4">
              {lectura === 'lista'
                ? '✓ Datos leídos. Revisalos a la derecha.'
                : lectura === 'error'
                  ? 'No se pudo completar la lectura automática.'
                  : 'Con las dos fotos, la IA lee tu DNI y completa tus datos personales.'}
            </p>

            <Titulo>2. Foto de perfil *</Titulo>
            <div className="mb-2">
              <CamaraSelfie foto={selfie} onCapturar={setSelfie} invalido={marcar('selfie')} />
            </div>
            <p className="small text-white-50 text-center mb-4">Es la foto que va a aparecer en tu carnet digital.</p>

            <Titulo>3. Método de pago *</Titulo>
            <Row className="g-3">
              {mediosPago.map((medio) => (
                <Col xs={6} key={medio.valor}>
                  <OpcionPago {...medio} elegido={pago} onElegir={setPago} invalido={marcar('pago')} />
                </Col>
              ))}
            </Row>

            <Collapse in={pago === 'tarjeta'}>
              <div>
                <DatosTarjeta tarjeta={tarjeta} onCambiar={setTarjeta} marcar={marcar} mensajes={{ numero: errorNumero }} />
              </div>
            </Collapse>
            <Collapse in={pago === 'efectivo'}>
              <div>
                <p className="small text-white-50 border-top border-light border-opacity-25 pt-3 mt-3 mb-0">
                  Abonás la inscripción en la secretaría de la sede ({contactoClub.direccion}), {contactoClub.horario.toLowerCase()}.
                </p>
              </div>
            </Collapse>
          </div>
        </Col>

        <Col lg={7}>
          <div className={`${tarjetaVidrio} p-4 h-100`}>
            <Titulo>4. Datos personales</Titulo>

            {lectura === 'pendiente' && (
              <div className="text-center text-white-50 py-5">
                <FaRobot className="display-4 text-warning mb-3" aria-hidden="true" />
                <p className="mb-0">
                  Subí el <strong className="text-white">frente y el dorso de tu DNI</strong> y nuestra IA va a completar tus datos automáticamente.
                </p>
              </div>
            )}

            {lectura === 'leyendo' && (
              <div className="text-center py-5" role="status">
                <Spinner animation="grow" variant="warning" className="mb-3" />
                <p className="mb-0">La IA está leyendo tu DNI…</p>
              </div>
            )}

            {['lista', 'error'].includes(lectura) && (
              <>
                {lectura === 'lista' && (
                  <Alert variant="light" className="small py-2 d-flex align-items-center gap-2">
                    <FaMagic className="text-warning flex-shrink-0" aria-hidden="true" />
                    Completamos estos datos con tu DNI. Si alguno está mal, podés corregirlo.
                  </Alert>
                )}
                {avisoLectura && (
                  <Alert variant="warning" className="small py-2 d-flex flex-wrap align-items-center gap-2">
                    {avisoLectura}
                    {lectura === 'error' && imagenes.frente && imagenes.dorso && (
                      <Button size="sm" variant="dark" className="rounded-pill ms-auto" onClick={() => leerDocumento(imagenes)}>
                        Reintentar lectura
                      </Button>
                    )}
                  </Alert>
                )}

                {camposDni.map((campo) => (
                  <CampoTexto
                    key={campo.nombre}
                    campo={campo}
                    valor={datos[campo.nombre]}
                    onCambiar={cambiar}
                    invalido={marcar(campo.nombre)}
                    leido={leidos[campo.nombre]}
                    mensaje={duplicado === campo.nombre ? `Ya hay un socio registrado con este ${campo.etiqueta.toLowerCase()}.` : undefined}
                  />
                ))}
                {camposContacto.map((campo) => (
                  <CampoTexto
                    key={campo.nombre}
                    campo={campo}
                    valor={datos[campo.nombre]}
                    onCambiar={cambiar}
                    invalido={marcar(campo.nombre)}
                    mensaje={duplicado === campo.nombre ? `Ya hay un socio registrado con este ${campo.etiqueta.toLowerCase()}.` : undefined}
                  />
                ))}

                <Row className="g-md-3">
                  <Col md={6}>
                    <CampoContrasena
                      id="registro-contrasena"
                      etiqueta="Contraseña"
                      valor={datos.contrasena}
                      onCambiar={(v) => cambiar('contrasena', v)}
                      invalido={marcar('contrasena')}
                      mensaje="Al menos 6 caracteres."
                    />
                  </Col>
                  <Col md={6}>
                    <CampoContrasena
                      id="registro-repetir"
                      etiqueta="Repetir contraseña"
                      valor={datos.repetir}
                      onCambiar={(v) => cambiar('repetir', v)}
                      invalido={marcar('repetir')}
                      mensaje="Las contraseñas no coinciden."
                    />
                  </Col>
                </Row>

                <Form.Check
                  id="registro-terminos"
                  className={`mb-4 ${marcar('terminos') ? 'text-warning' : ''}`}
                  checked={terminos}
                  onChange={(e) => setTerminos(e.target.checked)}
                  label="Acepto los términos y condiciones del club"
                />

                <Button
                  type="submit"
                  variant="light"
                  size="lg"
                  className="w-100 rounded-pill fw-bold text-uppercase text-secondary shadow d-inline-flex align-items-center justify-content-center gap-2"
                  disabled={enviando}
                >
                  {enviando ? <Spinner size="sm" /> : <FaUserPlus aria-hidden="true" />} {enviando ? 'Enviando…' : 'Completar registro'}
                </Button>
              </>
            )}

            <p className="text-center small mt-4 mb-0">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="link-warning fw-bold text-uppercase">
                Ingresá acá
              </Link>
            </p>
          </div>
        </Col>
      </Row>
    </Form>
  )
}

export default FormularioRegistro
