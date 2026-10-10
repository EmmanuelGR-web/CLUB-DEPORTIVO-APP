'use client'

import { Form, Row, Col, InputGroup } from 'react-bootstrap'
import { emisores, redesTarjeta } from '../../datos/pagos'
import { detectarRed, formatearNumero, formatearVencimiento, soloNumeros } from '../../utilidades/tarjetas'

function Campo({ id, etiqueta, invalido, mensaje, children, ayuda }) {
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label className="small">{etiqueta} *</Form.Label>
      {children}
      {invalido ? <div className="small text-warning fw-semibold mt-1">{mensaje}</div> : ayuda && <Form.Text className="text-white-50">{ayuda}</Form.Text>}
    </Form.Group>
  )
}

function Logo({ icono: Icono, color, nombre, tamanio = 'fs-5' }) {
  return (
    <span className={`d-inline-flex align-items-center justify-content-center bg-white rounded-2 px-2 ${tamanio}`} title={nombre} style={{ color }}>
      <Icono aria-label={nombre} />
    </span>
  )
}

function DatosTarjeta({ tarjeta, onCambiar, marcar, mensajes, conDebito = true }) {
  const emisor = emisores.find((e) => e.id === tarjeta.emisor)
  const red = detectarRed(tarjeta.numero)
  const largoCvv = red ? redesTarjeta[red].cvv : 3

  const cambiarEmisor = (id) => {
    const nuevo = emisores.find((e) => e.id === id)
    onCambiar({ ...tarjeta, emisor: id, tipo: nuevo.tipos.length === 1 ? nuevo.tipos[0] : '' })
  }

  return (
    <div className="border-top border-light border-opacity-25 pt-3 mt-3">
      <Form.Label className="small">Banco o billetera *</Form.Label>
      <Row className="g-2 mb-2">
        {emisores.map((e) => {
          const activo = tarjeta.emisor === e.id
          const borde = activo ? 'border-warning bg-warning bg-opacity-25' : marcar('emisor') ? 'border-danger' : 'border-light border-opacity-25'
          return (
            <Col xs={6} key={e.id}>
              <label
                className={`h-100 d-flex align-items-center gap-2 small fw-semibold bg-white bg-opacity-10 border border-2 ${borde} rounded-3 p-2`}
                style={{ cursor: 'pointer' }}
              >
                <Logo icono={e.icono} color={e.color} nombre={e.nombre} />
                {e.nombre}
                <input type="radio" name="emisor" checked={activo} onChange={() => cambiarEmisor(e.id)} className="visually-hidden" />
              </label>
            </Col>
          )
        })}
      </Row>
      {marcar('emisor') && <div className="small text-warning fw-semibold mb-2">Elegí quién emite la tarjeta.</div>}

      {emisor && (
        <div className="d-flex flex-wrap align-items-center gap-2 small text-white-50 mb-3">
          Acepta
          {emisor.redes.map((r) => (
            <Logo key={r} {...redesTarjeta[r]} />
          ))}
          · {emisor.tipos.join(' o ')}
        </div>
      )}

      <Campo id="tarjeta-tipo" etiqueta="Tipo de tarjeta" invalido={marcar('tipo')} mensaje="Elegí el tipo de tarjeta.">
        <Form.Select value={tarjeta.tipo} onChange={(e) => onCambiar({ ...tarjeta, tipo: e.target.value })} isInvalid={marcar('tipo')} disabled={!emisor}>
          <option value="">{emisor ? 'Seleccioná una opción' : 'Primero elegí el banco o la billetera'}</option>
          {emisor?.tipos.map((tipo) => (
            <option key={tipo}>{tipo}</option>
          ))}
        </Form.Select>
      </Campo>

      <Campo id="tarjeta-numero" etiqueta="Número de tarjeta" invalido={marcar('numero')} mensaje={mensajes.numero}>
        <InputGroup>
          <Form.Control
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            value={tarjeta.numero}
            onChange={(e) => onCambiar({ ...tarjeta, numero: formatearNumero(e.target.value) })}
            isInvalid={marcar('numero')}
          />
          <InputGroup.Text className="bg-white px-2">
            {red ? <Logo {...redesTarjeta[red]} tamanio="fs-3 px-0" /> : <span className="small text-body-tertiary px-1">Marca</span>}
          </InputGroup.Text>
        </InputGroup>
      </Campo>

      <Campo
        id="tarjeta-titular"
        etiqueta="Nombre del titular"
        invalido={marcar('titular')}
        mensaje="Tal como figura en la tarjeta: solo letras, hasta 26 caracteres."
        ayuda="Tal como figura impreso en la tarjeta."
      >
        <Form.Control
          autoComplete="cc-name"
          placeholder="JUAN P GARCIA"
          maxLength={26}
          value={tarjeta.titular}
          onChange={(e) => onCambiar({ ...tarjeta, titular: e.target.value.toUpperCase().replace(/[^A-ZÑ ]/g, '') })}
          isInvalid={marcar('titular')}
        />
      </Campo>

      <Row className="g-3">
        <Col xs={6}>
          <Campo id="tarjeta-vencimiento" etiqueta="Vencimiento" invalido={marcar('vencimiento')} mensaje="Fecha MM/AA vigente.">
            <Form.Control
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/AA"
              value={tarjeta.vencimiento}
              onChange={(e) => onCambiar({ ...tarjeta, vencimiento: formatearVencimiento(e.target.value) })}
              isInvalid={marcar('vencimiento')}
            />
          </Campo>
        </Col>
        <Col xs={6}>
          <Campo id="tarjeta-cvv" etiqueta="Código de seguridad" invalido={marcar('cvv')} mensaje={`${largoCvv} números.`}>
            <Form.Control
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder={'•'.repeat(largoCvv)}
              value={tarjeta.cvv}
              onChange={(e) => onCambiar({ ...tarjeta, cvv: soloNumeros(e.target.value).slice(0, largoCvv) })}
              isInvalid={marcar('cvv')}
            />
          </Campo>
        </Col>
      </Row>

      {conDebito && (
        <Form.Check
          type="switch"
          id="tarjeta-debito"
          className="mb-3"
          checked={tarjeta.debitoAutomatico}
          onChange={(e) => onCambiar({ ...tarjeta, debitoAutomatico: e.target.checked })}
          label="Debitar la cuota automáticamente cada mes"
        />
      )}

      <p className="small text-white-50 d-flex align-items-center gap-2 mb-0">
        Simulación: de la tarjeta solo se guardan la marca y los últimos 4 números.
      </p>
    </div>
  )
}

export default DatosTarjeta
