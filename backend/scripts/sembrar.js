// =====================================================================
// sembrar.js
// -----------------------------------------------------------------------
// Carga los usuarios de prueba y un historial de cuotas para poder
// mostrar la app sin tener que registrarse ni cargar pagos a mano.
//
//   npm run sembrar
//
// Se puede correr las veces que haga falta: los usuarios se buscan por
// email (si existen se les restablece la contraseña), las cuotas por
// período, y los pagos del socio de prueba se vuelven a armar desde
// cero. No toca ninguna otra cuenta ni sus pagos.
// =====================================================================

const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');
const { Client } = require('pg');

const USUARIOS = [
  {
    email: 'socio@club.com',
    contrasena: 'socio123',
    nombre: 'Lucía',
    apellido: 'Herrera',
    rol: 'socio',
    fechaAlta: '2019-03-01', // 7 años: socio Plata, camino a Oro
    telefono: '381 555-0101',
    ciudad: 'San Miguel de Tucumán',
    provincia: 'Tucumán',
    direccion: 'Av. Mate de Luna 2150',
    fechaNacimiento: '1994-06-12',
  },
  {
    email: 'administrativo@club.com',
    contrasena: 'admin123',
    nombre: 'Martín',
    apellido: 'Díaz',
    rol: 'administrativo',
    fechaAlta: '2016-08-15',
    ciudad: 'San Miguel de Tucumán',
    provincia: 'Tucumán',
  },
  {
    email: 'administrador@club.com',
    contrasena: 'principal123',
    nombre: 'Graciela',
    apellido: 'Paz',
    rol: 'admin_principal',
    fechaAlta: '2008-02-01',
    ciudad: 'Yerba Buena',
    provincia: 'Tucumán',
  },
];

// La cuota vence el 15 de cada mes.
const CUOTAS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'].map((periodo) => ({
  periodo,
  monto: 15000,
  vencimiento: `${periodo}-15`,
}));

// Historial del socio de prueba: un poco de todo para ver cada estado.
// Las cuotas que no aparecen acá (2026-10) quedan sin pagar.
const PAGOS_SOCIO = [
  { periodo: '2026-05', medio: 'efectivo', estado: 'aprobado', fecha: '2026-05-10' },
  { periodo: '2026-06', medio: 'transferencia', estado: 'aprobado', fecha: '2026-06-12' },
  { periodo: '2026-07', medio: 'debito', estado: 'aprobado', fecha: '2026-07-14' },
  { periodo: '2026-08', medio: 'transferencia', estado: 'rechazado', fecha: '2026-08-20', observacion: 'El comprobante de la transferencia no se lee. Volvé a informar el pago.' },
  { periodo: '2026-09', medio: 'credito', estado: 'pendiente', fecha: '2026-09-14' },
];

const numeroComprobante = (idPago, fecha) =>
  `REC-${fecha.slice(0, 4)}-${idPago.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

function aniosDesde(fecha) {
  const alta = new Date(fecha);
  const hoy = new Date();
  let anios = hoy.getFullYear() - alta.getFullYear();
  if (hoy < new Date(hoy.getFullYear(), alta.getMonth(), alta.getDate())) anios -= 1;
  return anios;
}

async function sembrar() {
  const host = process.env.DB_HOST ?? 'localhost';
  const cliente = new Client({
    host,
    port: Number(process.env.DB_PUERTO ?? 5432),
    user: process.env.DB_USUARIO,
    password: process.env.DB_CONTRASENA,
    database: process.env.DB_NOMBRE,
    ssl: process.env.DB_SSL === 'true' || host.includes('supabase') ? { rejectUnauthorized: false } : false,
  });
  await cliente.connect();

  try {
    await cliente.query('BEGIN');

    const { rows: categorias } = await cliente.query('SELECT id, anios_minimos, anios_maximos FROM categorias_socio');
    const categoriaPara = (anios) =>
      categorias.find((c) => anios >= c.anios_minimos && (c.anios_maximos === null || anios <= c.anios_maximos))?.id ?? null;

    const idsPorEmail = {};
    for (const usuario of USUARIOS) {
      const hash = await bcrypt.hash(usuario.contrasena, 10);
      const { rows } = await cliente.query(
        `INSERT INTO socios (nombre, apellido, email, contrasena_hash, telefono, fecha_nacimiento, ciudad, provincia, direccion, fecha_alta, categoria_id, rol)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (email) DO UPDATE SET
           contrasena_hash = EXCLUDED.contrasena_hash,
           rol = EXCLUDED.rol,
           fecha_alta = EXCLUDED.fecha_alta,
           categoria_id = EXCLUDED.categoria_id,
           activo = TRUE,
           actualizado_en = now()
         RETURNING id, id_socio`,
        [
          usuario.nombre,
          usuario.apellido,
          usuario.email,
          hash,
          usuario.telefono ?? null,
          usuario.fechaNacimiento ?? null,
          usuario.ciudad ?? null,
          usuario.provincia ?? null,
          usuario.direccion ?? null,
          usuario.fechaAlta,
          categoriaPara(aniosDesde(usuario.fechaAlta)),
          usuario.rol,
        ],
      );
      idsPorEmail[usuario.email] = rows[0].id;
      console.log(`  ✔ ${usuario.rol.padEnd(15)} ${usuario.email.padEnd(26)} N.º ${rows[0].id_socio}`);
    }

    const idsPorPeriodo = {};
    for (const cuota of CUOTAS) {
      const { rows } = await cliente.query(
        `INSERT INTO cuotas (periodo, monto, fecha_vencimiento) VALUES ($1, $2, $3)
         ON CONFLICT (periodo) DO UPDATE SET periodo = EXCLUDED.periodo
         RETURNING id`,
        [cuota.periodo, cuota.monto, cuota.vencimiento],
      );
      idsPorPeriodo[cuota.periodo] = rows[0].id;
    }
    console.log(`  ✔ ${CUOTAS.length} cuotas (${CUOTAS[0].periodo} a ${CUOTAS.at(-1).periodo})`);

    const idSocio = idsPorEmail['socio@club.com'];
    await cliente.query('DELETE FROM pagos WHERE socio_id = $1', [idSocio]);
    for (const pago of PAGOS_SOCIO) {
      const id = randomUUID();
      const { rows } = await cliente.query('SELECT monto FROM cuotas WHERE id = $1', [idsPorPeriodo[pago.periodo]]);
      await cliente.query(
        `INSERT INTO pagos (id, socio_id, cuota_id, monto, medio_pago, estado, fecha_pago, numero_comprobante, observacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          idSocio,
          idsPorPeriodo[pago.periodo],
          rows[0].monto,
          pago.medio,
          pago.estado,
          `${pago.fecha}T12:00:00-03:00`,
          pago.estado === 'aprobado' ? numeroComprobante(id, pago.fecha) : null,
          pago.observacion ?? null,
        ],
      );
    }
    console.log(`  ✔ ${PAGOS_SOCIO.length} pagos del socio de prueba`);

    await cliente.query('COMMIT');
    console.log('\nDatos de prueba cargados.');
  } catch (error) {
    await cliente.query('ROLLBACK');
    console.error('\nNo se cargó nada:', error.message);
    process.exitCode = 1;
  } finally {
    await cliente.end();
  }
}

sembrar();
