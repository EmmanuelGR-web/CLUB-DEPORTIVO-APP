'use client'

import { useState } from 'react'
import { Table, Form, Button } from 'react-bootstrap'
import Tarjeta from '../comun/Tarjeta'
import EstadoBadge from '../comun/EstadoBadge'
import { categorias } from '../../utilidades/categorias'
import { coincide } from '../../utilidades/texto'

const textoMedio = (medio) => (medio.tipo === 'tarjeta' ? 'Tarjeta' : 'Efectivo')

function ListaSocios({ perfiles, onAbrir }) {
  const [busqueda, setBusqueda] = useState('')
  const filtrados = perfiles.filter((p) => coincide(`${p.nombreCompleto} ${p.dni} ${p.numeroSocio} ${p.email}`, busqueda))

  return (
    <Tarjeta titulo="Padrón de socios">
      <Form.Control
        type="search"
        className="mb-3"
        placeholder="Buscar por nombre, DNI, número de socio o correo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar socios"
      />
      <Table responsive hover className="align-middle mb-0">
        <thead>
          <tr className="text-uppercase small">
            <th scope="col">Socio</th>
            <th scope="col">N° de socio</th>
            <th scope="col">Categoría</th>
            <th scope="col">Medio de pago</th>
            <th scope="col">Estado</th>
            <th scope="col" className="text-end">
              Ficha
            </th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((p) => (
            <tr key={p.id}>
              <td>
                <div className="fw-semibold">{p.nombreCompleto}</div>
                <div className="small text-body-secondary text-break">
                  DNI {p.dni} · {p.correoInstitucional}
                </div>
              </td>
              <td className="font-numeros">{p.numeroSocio}</td>
              <td>
                <span className={`badge rounded-pill text-${categorias[p.categoria].texto}`} style={{ backgroundImage: categorias[p.categoria].degradado }}>
                  {p.categoria}
                </span>
              </td>
              <td className="text-nowrap">
                {textoMedio(p.medioPago)}
                {p.medioPago.debitoAutomatico && <div className="small text-body-secondary">Débito automático</div>}
              </td>
              <td>
                <EstadoBadge estado={p.estado} />
              </td>
              <td className="text-end">
                <Button size="sm" variant="secondary" className="rounded-pill px-3 text-nowrap" onClick={() => onAbrir(p.id)}>
                  Ver ficha
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Tarjeta>
  )
}

export default ListaSocios
