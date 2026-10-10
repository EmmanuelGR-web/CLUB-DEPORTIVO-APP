// =====================================================================
// sembrar.js
// -----------------------------------------------------------------------
// Carga el padrón de prueba: los usuarios del portal (socio, personal
// administrativo y administración principal), socios de ejemplo con
// sus cuotas pagadas, una en revisión y un alta esperando validación,
// la nómina del personal y las noticias.
//
//   npm run sembrar
//
// Se puede correr las veces que haga falta: los usuarios se buscan por
// email y sus pagos, mensajes y registros se vuelven a armar desde cero.
// No toca ninguna otra cuenta. Usa las mismas reglas de cuotas que el
// backend (por eso compila antes de correr).
// =====================================================================

const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const { periodosDesdeAlta, calcularCuota } = require('../dist/comun/utilidades/cuotas.util');
const { correoInstitucional, CORREO_ADMINISTRACION } = require('../dist/comun/utilidades/correos.util');

const tarjeta = (emisor, red, ultimos4, debitoAutomatico) => ({ tipo: 'tarjeta', emisor, red, ultimos4, debitoAutomatico });
const efectivo = { tipo: 'efectivo', debitoAutomatico: false };

const USUARIOS = [
  {
    email: 'socio@club.com', contrasena: 'socio123', rol: 'socio',
    nombre: 'Juan', apellido: 'Pérez', dni: '12345678', fechaNacimiento: '1990-06-15',
    direccion: 'Av. Aconquija 1450, Yerba Buena', telefono: '381 555-7788',
    fechaAlta: '2020-03-10', medioPago: tarjeta('macro', 'visa', '4242', true), conBandeja: true,
  },
  {
    email: 'administrativo@club.com', contrasena: 'admin123', rol: 'administrativo',
    nombre: 'Pedro', apellido: 'Díaz', dni: '28456123', fechaNacimiento: '1985-03-12',
    direccion: 'San Martín 980, San Miguel de Tucumán', telefono: '381 444-1201', fechaAlta: '2016-08-15', medioPago: efectivo,
  },
  {
    email: 'administrador@club.com', contrasena: 'principal123', rol: 'admin_principal',
    nombre: 'Laura', apellido: 'Gómez', dni: '25789456', fechaNacimiento: '1979-11-04',
    direccion: 'Av. Solano Vera 1200, Yerba Buena', telefono: '381 444-1100', fechaAlta: '2008-02-01', medioPago: efectivo,
  },
];

// Socios de ejemplo del padrón. Entran con la contraseña "socio123".
const SOCIOS_EJEMPLO = [
  { nombre: 'Ricardo', apellido: 'Álvarez', dni: '20145879', fechaNacimiento: '1968-04-02', direccion: 'Av. Mate de Luna 2150, San Miguel de Tucumán', telefono: '381 421-5566', email: 'ricardo.alvarez@mail.com', fechaAlta: '2009-04-18', medioPago: tarjeta('bna', 'visa', '4410', true) },
  { nombre: 'Marta', apellido: 'Giménez', dni: '23987451', fechaNacimiento: '1974-09-21', direccion: 'Crisóstomo Álvarez 870, San Miguel de Tucumán', telefono: '381 430-1122', email: 'marta.gimenez@mail.com', fechaAlta: '2013-08-05', medioPago: efectivo, mesActual: { estado: 'aprobado', medio: 'Efectivo', dia: 8 } },
  { nombre: 'Lucas', apellido: 'Herrera', dni: '36214578', fechaNacimiento: '1992-01-15', direccion: 'Santiago del Estero 1540, San Miguel de Tucumán', telefono: '381 512-7788', email: 'lucas.herrera@mail.com', fechaAlta: '2017-02-22', medioPago: efectivo },
  { nombre: 'Sofía', apellido: 'Romero', dni: '39874512', fechaNacimiento: '1996-06-30', direccion: 'Aconquija 3200, Yerba Buena', telefono: '381 655-9021', email: 'sofia.romero@mail.com', fechaAlta: '2019-11-10', medioPago: tarjeta('macro', 'mastercard', '5588', false), mesActual: { estado: 'pendiente', medio: 'Transferencia', dia: 7, conComprobante: true } },
  { nombre: 'Tomás', apellido: 'Acosta', dni: '42563987', fechaNacimiento: '2000-03-08', direccion: 'Las Piedras 640, San Miguel de Tucumán', telefono: '381 587-3344', email: 'tomas.acosta@mail.com', fechaAlta: '2022-06-30', medioPago: tarjeta('mercadopago', 'visa', '7731', true) },
  { nombre: 'Valentina', apellido: 'Ruiz', dni: '44125896', fechaNacimiento: '2003-11-12', direccion: 'Bernabé Aráoz 300, San Miguel de Tucumán', telefono: '381 699-4455', email: 'valentina.ruiz@mail.com', fechaAlta: '2025-01-15', medioPago: efectivo },
  { nombre: 'Joaquín', apellido: 'Molina', dni: '46987123', fechaNacimiento: '2006-08-19', direccion: 'Perú 1100, Yerba Buena', telefono: '381 700-8812', email: 'joaquin.molina@mail.com', fechaAlta: '2026-03-02', medioPago: tarjeta('uala', 'mastercard', '2044', true) },
  { nombre: 'Camila', apellido: 'Sosa', dni: '45321789', fechaNacimiento: '2004-02-27', direccion: 'Lamadrid 455, San Miguel de Tucumán', telefono: '381 622-1098', email: 'camila.sosa@mail.com', fechaAlta: '2026-09-22', medioPago: efectivo, estado: 'En validación' },
].map((s) => ({ ...s, contrasena: 'socio123', rol: 'socio' }));

const BANDEJA_INICIAL = [
  { fecha: '2026-09-25', asunto: 'Entradas para el partido del domingo', texto: 'Ya podés retirar tu entrada anticipada para el partido ante Deportivo Aconquija presentando tu carnet digital.', leido: false },
  { fecha: '2026-09-20', asunto: 'Nuevo beneficio en la tienda', texto: 'Este mes tenés 20 % de descuento en la camiseta alternativa, solo para socios.', leido: false },
  { fecha: '2026-09-01', asunto: 'Bienvenida a la temporada', texto: 'Gracias por acompañar al club un año más. ¡Nos vemos en La Caldera!', leido: true },
];

const COMPROBANTE_SOFIA = `data:image/svg+xml;base64,${Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300"><rect width="480" height="300" fill="#fbf5ea"/><rect width="480" height="56" fill="#7a0f2e"/><text x="24" y="36" font-family="Arial" font-size="20" fill="#fff">Comprobante de transferencia</text><text x="24" y="104" font-family="Arial" font-size="16" fill="#1e1b24">Origen: Sofía Romero · Banco Macro</text><text x="24" y="136" font-family="Arial" font-size="16" fill="#1e1b24">Destino: Club Deportivo · CBU 0000003100012345678901</text><text x="24" y="168" font-family="Arial" font-size="16" fill="#1e1b24">Concepto: cuota social</text><text x="24" y="220" font-family="Arial" font-size="28" font-weight="bold" fill="#7a0f2e">$ 18.000</text><text x="24" y="270" font-family="Arial" font-size="13" fill="#6b6475">Operación N° 88412037 · Transferencia inmediata</text></svg>',
).toString('base64')}`;

// Nómina del club. Solo Pedro Díaz tiene usuario del portal en la demo.
const PERSONAL = [
  { codigo: 'A01', nombre: 'Pedro Díaz', dni: '30125478', rol: 'Administrativo', sector: 'Atención al socio', correo: 'pedro.diaz@clubdeportivo.com.ar', telefono: 'Interno 214', dias: 'Lunes a viernes', entrada: '09:00', salida: '17:00', ingreso: '2019-03-01', usuario: 'administrativo@club.com' },
  { codigo: 'A02', nombre: 'Ana García', dni: '32874105', rol: 'Administrativo', sector: 'Atención al socio', correo: 'ana.garcia@clubdeportivo.com.ar', telefono: 'Interno 215', dias: 'Lunes a viernes', entrada: '13:00', salida: '21:00', ingreso: '2021-07-12' },
  { codigo: 'A03', nombre: 'Roberto Díaz', dni: '27455890', rol: 'Tesorería', sector: 'Tesorería', correo: 'roberto.diaz@clubdeportivo.com.ar', telefono: 'Interno 230', dias: 'Lunes a viernes', entrada: '08:00', salida: '16:00', ingreso: '2016-02-01' },
  { codigo: 'A04', nombre: 'Silvia Fernández', dni: '25698741', rol: 'Recepción', sector: 'Recepción', correo: 'silvia.fernandez@clubdeportivo.com.ar', telefono: 'Interno 201', dias: 'Fines de semana', entrada: '08:00', salida: '14:00', ingreso: '2018-05-20', ausencia: { motivo: 'Licencia médica', desde: '2026-09-14', hasta: '2026-10-12', nota: 'Reposo por cirugía de rodilla.' } },
  { codigo: 'A05', nombre: 'Martín Suárez', dni: '35987412', rol: 'Mantenimiento', sector: 'Mantenimiento', correo: 'martin.suarez@clubdeportivo.com.ar', telefono: 'Interno 250', dias: 'Lunes a sábado', entrada: '06:00', salida: '14:00', ingreso: '2022-10-03' },
];

const NOTICIAS = [
  { categoria: 'Fútbol', fecha: '2026-09-25', titulo: 'Próximo partido de local', resumen: 'El primer equipo recibe este domingo a las 17 h en La Caldera.', cuerpo: ['El primer equipo de fútbol vuelve a jugar de local este domingo a las 17 h en La Caldera, por la fecha 12 del torneo.', 'Las entradas anticipadas para socios se retiran en la sede de lunes a viernes de 9 a 20 h presentando el carnet y la cuota al día.'] },
  { categoria: 'Institucional', fecha: '2026-09-22', titulo: 'Abrieron las inscripciones 2027', resumen: 'Ya podés anotarte en las escuelas deportivas y categorías formativas.', cuerpo: ['Están abiertas las inscripciones 2027 para las escuelas deportivas de fútbol, básquet, vóley y hockey, desde los 5 años.', 'Los socios tienen prioridad de cupo hasta el 31 de octubre. Después se abre la inscripción general.'], enlace: { texto: 'Anotate acá', ruta: '/registro' } },
  { categoria: 'Tienda', fecha: '2026-09-18', titulo: 'Nueva camiseta oficial', resumen: 'Ya está disponible en la tienda del club la nueva indumentaria.', imagen: '/jugadores.jpeg', cuerpo: ['La nueva camiseta titular mantiene los bastones rojos y blancos de siempre y suma detalles en bordó en el cuello y las mangas.', 'Ya está a la venta en la tienda del club, con 15 % de descuento para socios.'] },
  { categoria: 'Básquet', fecha: '2026-09-15', titulo: 'Triunfo en el clásico', resumen: 'El equipo de básquet ganó 78 a 71 en un estadio cubierto repleto.', cuerpo: ['En un partido parejo hasta el último cuarto, el equipo de básquet se quedó con el clásico por 78 a 71 ante un estadio cubierto repleto.', 'Con este resultado, el club quedó segundo en la tabla de la Liga Tucumana.'] },
];

const hoy = new Date();
const fechaDelMes = (dia) => new Date(hoy.getFullYear(), hoy.getMonth(), Math.min(dia, hoy.getDate()), 12);
const numeroComprobante = (id, fecha) => `REC-${fecha.getFullYear()}-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

async function sembrar() {
  const host = process.env.DB_HOST ?? 'localhost';
  const db = new Client({
    host,
    port: Number(process.env.DB_PUERTO ?? 5432),
    user: process.env.DB_USUARIO,
    password: process.env.DB_CONTRASENA,
    database: process.env.DB_NOMBRE,
    ssl: process.env.DB_SSL === 'true' || host.includes('supabase') ? { rejectUnauthorized: false } : false,
  });
  await db.connect();

  try {
    await db.query('BEGIN');
    const { rows: categorias } = await db.query('SELECT id, nombre FROM categorias_socio');

    for (const u of [...USUARIOS, ...SOCIOS_EJEMPLO]) {
      const hash = await bcrypt.hash(u.contrasena, 10);
      const { rows } = await db.query(
        `INSERT INTO socios (nombre, apellido, email, contrasena_hash, dni, telefono, fecha_nacimiento, direccion, fecha_alta, rol, estado, medio_pago, debe_cambiar_contrasena, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, FALSE, TRUE)
         ON CONFLICT (email) DO UPDATE SET
           nombre = EXCLUDED.nombre, apellido = EXCLUDED.apellido, contrasena_hash = EXCLUDED.contrasena_hash,
           dni = EXCLUDED.dni, telefono = EXCLUDED.telefono, fecha_nacimiento = EXCLUDED.fecha_nacimiento,
           direccion = EXCLUDED.direccion, fecha_alta = EXCLUDED.fecha_alta, rol = EXCLUDED.rol, estado = EXCLUDED.estado,
           medio_pago = EXCLUDED.medio_pago, foto_carnet_url = NULL, foto_actualizada = NULL, debe_cambiar_contrasena = FALSE,
           activo = TRUE, actualizado_en = now()
         RETURNING id, id_socio`,
        [u.nombre, u.apellido, u.email, hash, u.dni, u.telefono, u.fechaNacimiento, u.direccion, u.fechaAlta, u.rol, u.estado ?? 'Activo', JSON.stringify(u.medioPago)],
      );
      const { id, id_socio: numero } = rows[0];
      const nombreCompleto = `${u.nombre} ${u.apellido}`;

      // Se rehace todo lo que depende del socio.
      await db.query('DELETE FROM pagos WHERE socio_id = $1', [id]);
      await db.query('DELETE FROM hilos WHERE socio_id = $1', [id]);
      await db.query('DELETE FROM registro_cambios WHERE socio_id = $1', [id]);

      const periodos = periodosDesdeAlta(new Date(`${u.fechaAlta}T12:00:00`), hoy);
      const debita = u.medioPago.tipo === 'tarjeta' && u.medioPago.debitoAutomatico;
      const medioHistorico = u.medioPago.tipo === 'tarjeta' ? 'Tarjeta' : 'Efectivo';

      if (u.rol === 'socio' && u.estado !== 'En validación') {
        for (const p of periodos) {
          const esActual = p.anio === hoy.getFullYear() && p.mes === hoy.getMonth();
          // Los meses anteriores quedan pagados; el actual depende del socio.
          if (esActual && !debita && !u.mesActual) continue;
          const pagoId = randomUUID();
          const actual = esActual ? u.mesActual : null;
          const fechaPago = actual ? fechaDelMes(actual.dia) : debita ? new Date(p.anio, p.mes, 1, 12) : new Date(p.anio, p.mes, Math.min(10, 28), 12);
          const cuota = calcularCuota(p.base, fechaPago, p.vence);
          const estado = actual?.estado ?? 'aprobado';
          let comprobanteId = null;
          let verificacion = null;
          if (actual?.conComprobante) {
            comprobanteId = randomUUID();
            await db.query('INSERT INTO archivos (id, nombre, tipo, tamanio, datos, subido_por) VALUES ($1, $2, $3, $4, $5, $6)', [
              comprobanteId, 'comprobante-sofia-romero.svg', 'image/svg+xml', 1400, COMPROBANTE_SOFIA, id,
            ]);
            const fechaTexto = fechaPago.toISOString().slice(0, 10);
            verificacion = { leido: true, esComprobante: true, monto: cuota.total, fecha: fechaTexto, numeroOperacion: '88412037', origen: 'Sofía Romero · Banco Macro', destino: 'Club Deportivo', observaciones: '', montoEsperado: cuota.total, coincideMonto: true, coincideFecha: true };
          }
          await db.query(
            `INSERT INTO pagos (id, socio_id, periodo, concepto, base, recargo, dias_demora, monto, medio_pago, estado, fecha_pago, informado_en, comprobante_id, verificacion_ia, numero_comprobante, resuelto_por, resuelto_en)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11, $12, $13, $14, $15, $16)`,
            [
              pagoId, id, p.periodo, p.concepto, p.base, cuota.recargo, cuota.dias, cuota.total,
              actual?.medio ?? (debita ? 'Tarjeta' : medioHistorico), estado, fechaPago, comprobanteId, verificacion,
              estado === 'aprobado' ? numeroComprobante(pagoId, fechaPago) : null,
              estado === 'aprobado' ? (debita && !actual ? 'Débito automático' : 'Pedro Díaz (A01)') : null,
              estado === 'aprobado' ? fechaPago : null,
            ],
          );
        }
      }

      if (u.rol === 'socio') {
        const para = correoInstitucional(nombreCompleto, String(numero));
        const mensajes = u.conBandeja
          ? BANDEJA_INICIAL
          : [{ fecha: u.fechaAlta, asunto: u.estado === 'En validación' ? 'Recibimos tu solicitud de alta' : 'Bienvenida al club', texto: u.estado === 'En validación' ? `Hola, ${u.nombre}. Gracias por asociarte al club. El personal va a validar tus datos con las fotos de tu DNI y te avisamos por acá cuando tu carnet digital quede activo.` : `Hola, ${u.nombre}. Ya sos parte del club: tu carnet digital está en el panel de socio.`, leido: true }];
        for (const m of mensajes) {
          const { rows: hilo } = await db.query(
            `INSERT INTO hilos (socio_id, tipo, asunto, leido_por_socio, leido_por_club, creado_en, actualizado_en)
             VALUES ($1, 'socio', $2, $3, TRUE, $4, $4) RETURNING id`,
            [id, m.asunto, m.leido, `${m.fecha}T10:00:00-03:00`],
          );
          await db.query('INSERT INTO mensajes (hilo_id, del_club, de, para, texto, fecha) VALUES ($1, TRUE, $2, $3, $4, $5)', [
            hilo[0].id, CORREO_ADMINISTRACION, para, m.texto, `${m.fecha}T10:00:00-03:00`,
          ]);
        }
      }

      if (u.estado === 'En validación') {
        await db.query(
          `INSERT INTO registro_cambios (fecha, socio_id, socio_nombre, seccion, autor, cambios, pendiente)
           VALUES ($1, $2, $3, 'Alta de socio', 'Socio', $4, TRUE)`,
          [`${u.fechaAlta}T15:10:00-03:00`, id, nombreCompleto, JSON.stringify([{ campo: 'Estado', anterior: '—', nuevo: 'Registrado desde la web' }])],
        );
      }

      const nombreCategoria = (() => {
        const anios = (hoy - new Date(`${u.fechaAlta}T12:00:00`)) / (365.25 * 24 * 3600 * 1000);
        return anios <= 2 ? 'Bronce' : anios <= 10 ? 'Plata' : 'Oro';
      })();
      await db.query('UPDATE socios SET categoria_id = $1 WHERE id = $2', [categorias.find((c) => c.nombre === nombreCategoria)?.id ?? null, id]);
      console.log(`  ✔ ${u.rol.padEnd(15)} ${u.email.padEnd(28)} N.º ${numero}`);
    }

    // Personal del club y su canal interno con la dirección.
    await db.query('DELETE FROM hilos WHERE personal_id IS NOT NULL');
    for (const persona of PERSONAL) {
      const { rows: usuario } = persona.usuario ? await db.query('SELECT id FROM socios WHERE email = $1', [persona.usuario]) : { rows: [] };
      const { rows } = await db.query(
        `INSERT INTO personal (codigo, usuario_id, nombre, dni, rol, sector, correo, telefono, dias, entrada, salida, ingreso, ausencia)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (codigo) DO UPDATE SET
           usuario_id = EXCLUDED.usuario_id, nombre = EXCLUDED.nombre, dni = EXCLUDED.dni, rol = EXCLUDED.rol, sector = EXCLUDED.sector,
           correo = EXCLUDED.correo, telefono = EXCLUDED.telefono, dias = EXCLUDED.dias, entrada = EXCLUDED.entrada,
           salida = EXCLUDED.salida, ingreso = EXCLUDED.ingreso, ausencia = EXCLUDED.ausencia, actualizado_en = now()
         RETURNING id`,
        [persona.codigo, usuario[0]?.id ?? null, persona.nombre, persona.dni, persona.rol, persona.sector, persona.correo, persona.telefono, persona.dias, persona.entrada, persona.salida, persona.ingreso, persona.ausencia ? JSON.stringify(persona.ausencia) : null],
      );
      await db.query('DELETE FROM jornadas WHERE personal_id = $1', [rows[0].id]);
      if (persona.codigo === 'A01') {
        const { rows: hilo } = await db.query(
          `INSERT INTO hilos (tipo, personal_id, asunto, leido_por_socio, leido_por_club, creado_en, actualizado_en)
           VALUES ('interno', $1, 'Cierre de padrón de octubre', FALSE, TRUE, '2026-09-26T09:30:00-03:00', '2026-09-26T09:30:00-03:00') RETURNING id`,
          [rows[0].id],
        );
        await db.query('INSERT INTO mensajes (hilo_id, del_club, de, para, texto, fecha) VALUES ($1, TRUE, $2, $3, $4, $5)', [
          hilo[0].id,
          'direccion@clubdeportivo.com.ar',
          persona.correo,
          'Pedro: antes del 5 de octubre necesito el listado de socios con cuotas vencidas para enviar los avisos. Cualquier duda me escribís por acá.',
          '2026-09-26T09:30:00-03:00',
        ]);
      }
      console.log(`  ✔ personal         ${persona.codigo} ${persona.nombre}`);
    }

    await db.query('DELETE FROM noticias');
    for (const n of NOTICIAS) {
      await db.query('INSERT INTO noticias (categoria, fecha, titulo, resumen, cuerpo, imagen, enlace) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
        n.categoria, n.fecha, n.titulo, n.resumen, JSON.stringify(n.cuerpo), n.imagen ?? null, n.enlace ? JSON.stringify(n.enlace) : null,
      ]);
    }
    console.log(`  ✔ ${NOTICIAS.length} noticias`);

    await db.query('COMMIT');
    console.log('\nDatos de prueba cargados.');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('\nNo se cargó nada:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

sembrar();
