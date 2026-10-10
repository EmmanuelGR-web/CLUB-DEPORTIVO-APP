// =====================================================================
// migrar.js
// -----------------------------------------------------------------------
// Aplica un script de /migraciones dentro de una transacción: si alguna
// sentencia falla, no queda nada a medias.
//
//   npm run migrar -- migraciones/003_portal_del_socio.sql
// =====================================================================

const fs = require('node:fs');
const { Client } = require('pg');

const archivo = process.argv[2];
if (!archivo) {
  console.error('Indicá el archivo: npm run migrar -- migraciones/00X_nombre.sql');
  process.exit(1);
}

const host = process.env.DB_HOST ?? 'localhost';
const cliente = new Client({
  host,
  port: Number(process.env.DB_PUERTO ?? 5432),
  user: process.env.DB_USUARIO,
  password: process.env.DB_CONTRASENA,
  database: process.env.DB_NOMBRE,
  ssl: process.env.DB_SSL === 'true' || host.includes('supabase') ? { rejectUnauthorized: false } : false,
});

(async () => {
  await cliente.connect();
  try {
    await cliente.query('BEGIN');
    await cliente.query(fs.readFileSync(archivo, 'utf8'));
    await cliente.query('COMMIT');
    console.log(`Migración aplicada: ${archivo}`);
  } catch (error) {
    await cliente.query('ROLLBACK');
    console.error(`No se aplicó nada: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await cliente.end();
  }
})();
