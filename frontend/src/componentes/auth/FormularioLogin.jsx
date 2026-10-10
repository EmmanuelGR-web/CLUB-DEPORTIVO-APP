'use client'

import { useState } from 'react'
import { Form, FloatingLabel, Button, Spinner } from 'react-bootstrap'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useSesion } from '../../contextos/SesionContexto'
import { usuariosDemo } from '../../datos/usuarios'
import RecuperarContrasena from './RecuperarContrasena'
import UsuariosPrueba from './UsuariosPrueba'
import { alertaAviso, alertaBienvenida, alertaError } from '../../utilidades/alertas'

function FormularioLogin() {
  const { iniciarSesion } = useSesion()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [recordar, setRecordar] = useState(false)
  const [verContrasena, setVerContrasena] = useState(false)
  const [validado, setValidado] = useState(false)
  const [recuperar, setRecuperar] = useState(false)
  const [ingresando, setIngresando] = useState(false)

  const emailInvalido = validado && !/^\S+@\S+\.\S+$/.test(email)
  const contrasenaInvalida = validado && contrasena.length < 6

  const enviar = async (e) => {
    e.preventDefault()
    setValidado(true)
    if (!/^\S+@\S+\.\S+$/.test(email) || contrasena.length < 6) return

    setIngresando(true)
    const usuario = await iniciarSesion(email, contrasena, recordar)
    setIngresando(false)
    if (!usuario) {
      alertaError('Revisá el correo y la contraseña e intentá de nuevo.', 'Datos incorrectos')
      return
    }
    if (usuario.bloqueado) {
      alertaAviso(usuario.bloqueado, 'Tu acceso está pausado')
      return
    }
    if (usuario.errorConexion) {
      alertaError(usuario.errorConexion, 'No pudimos verificar tu cuenta')
      return
    }
    alertaBienvenida(`¡Hola, ${usuario.nombre.split(' ')[0]}!`)
    router.replace(usuario.ruta)
  }

  const usarUsuario = (usuario) => {
    setEmail(usuario.email)
    setContrasena(usuario.contrasena)
  }

  return (
    <>
      <Form noValidate onSubmit={enviar}>
        <FloatingLabel controlId="login-email" label="Correo electrónico" className="text-body mb-3">
          <Form.Control
            type="email"
            placeholder="nombre@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={emailInvalido}
            autoComplete="email"
          />
          <Form.Control.Feedback type="invalid" className="text-warning fw-semibold">
            Ingresá un correo electrónico válido.
          </Form.Control.Feedback>
        </FloatingLabel>

        <FloatingLabel controlId="login-contrasena" label="Contraseña" className="text-body mb-3">
          <Form.Control
            type={verContrasena ? 'text' : 'password'}
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            isInvalid={contrasenaInvalida}
            autoComplete="current-password"
            className="pe-5"
            style={{ backgroundImage: 'none' }}
          />
          <Button
            variant="link"
            className="position-absolute top-0 end-0 link-secondary mt-2 me-2"
            onClick={() => setVerContrasena(!verContrasena)}
            aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {verContrasena ? <FaEyeSlash /> : <FaEye />}
          </Button>
          <Form.Control.Feedback type="invalid" className="text-warning fw-semibold">
            La contraseña tiene al menos 6 caracteres.
          </Form.Control.Feedback>
        </FloatingLabel>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 small">
          <Form.Check id="login-recordar" label="Mantener sesión iniciada" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
          <Button variant="link" className="link-light p-0 small" onClick={() => setRecuperar(true)}>
            ¿Olvidaste tu contraseña?
          </Button>
        </div>

        <Button type="submit" variant="light" size="lg" className="w-100 rounded-pill fw-bold text-uppercase text-secondary shadow" disabled={ingresando}>
          {ingresando ? (
            <>
              <Spinner size="sm" className="me-2" /> Ingresando…
            </>
          ) : (
            'Ingresar'
          )}
        </Button>

        <p className="text-center small mt-4 mb-0">
          ¿No tenés tu cuenta club?{' '}
          <Link href="/registro" className="link-warning fw-bold text-uppercase">
            Registrate acá
          </Link>
        </p>
      </Form>

      <UsuariosPrueba usuarios={usuariosDemo} onElegir={usarUsuario} />
      <RecuperarContrasena mostrar={recuperar} onCerrar={() => setRecuperar(false)} />
    </>
  )
}

export default FormularioLogin
