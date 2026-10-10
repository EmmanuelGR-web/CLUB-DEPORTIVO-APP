'use client'

import { useState } from 'react'
import { Button, Collapse } from 'react-bootstrap'
import { FaChevronDown, FaChevronUp, FaUserCheck } from 'react-icons/fa'

function UsuariosPrueba({ usuarios, onElegir }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="border border-light border-opacity-25 rounded-4 mt-4">
      <Button
        variant="link"
        className="w-100 d-flex align-items-center justify-content-between link-light text-decoration-none px-3 py-2"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-controls="usuarios-prueba"
      >
        <span className="small fw-semibold">Usuarios de prueba</span>
        {abierto ? <FaChevronUp aria-hidden="true" /> : <FaChevronDown aria-hidden="true" />}
      </Button>

      <Collapse in={abierto}>
        <div id="usuarios-prueba">
          <ul className="list-unstyled small px-3 pb-3 mb-0">
            {usuarios.map((usuario) => (
              <li key={usuario.email} className="d-flex align-items-center gap-2 py-2 border-top border-light border-opacity-25">
                <div className="flex-grow-1 text-break">
                  <div className="fw-semibold">{usuario.rolTexto}</div>
                  <div className="text-white-50">
                    {usuario.email} · {usuario.contrasena}
                  </div>
                </div>
                <Button size="sm" variant="outline-light" className="rounded-pill flex-shrink-0" onClick={() => onElegir(usuario)}>
                  <FaUserCheck aria-hidden="true" /> Usar
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </Collapse>
    </div>
  )
}

export default UsuariosPrueba
