// =====================================================================
// database.config.ts
// -----------------------------------------------------------------------
// Acá se define CÓMO nos conectamos a la base de datos PostgreSQL.
// Usamos variables de entorno (.env) para no dejar contraseñas ni
// datos sensibles escritos directamente en el código.
//
// Esto se puede usar tanto local (postgres en tu compu) como apuntando
// a un servicio en la nube como Supabase o Railway, solo cambiando
// las variables del .env, sin tocar código.
// =====================================================================

import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { Socio } from '../modulos/socios/entidades/socio.entity';
import { CategoriaSocio } from '../modulos/socios/entidades/categoria-socio.entity';
import { Cuota } from '../modulos/pagos/entidades/cuota.entity';
import { Pago } from '../modulos/pagos/entidades/pago.entity';

// Opciones asíncronas: esperamos a que ConfigModule cargue el .env
// antes de intentar conectarnos a la base.
const configuracionBaseDatos: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: config.get<number>('DB_PUERTO', 5432),
    username: config.get<string>('DB_USUARIO', 'postgres'),
    password: config.get<string>('DB_CONTRASENA', ''),
    database: config.get<string>('DB_NOMBRE', 'club_san_martin'),

    // Lista de entidades (tablas) que TypeORM debe reconocer.
    // A medida que sumemos módulos (pagos, disciplinas, etc.) se
    // van agregando sus entidades acá.
    entities: [Socio, CategoriaSocio, Cuota, Pago],

    // IMPORTANTE: synchronize en false. Con 20.000+ socios y datos
    // reales de dinero, NUNCA se debe dejar que TypeORM modifique
    // la estructura de la tabla automáticamente. Los cambios de
    // estructura se hacen a través de migraciones controladas
    // (ver carpeta /migraciones).
    synchronize: false,

    // Muestra las consultas SQL en consola solo en desarrollo,
    // útil para aprender y depurar mientras programás.
    logging: config.get<string>('ENTORNO') === 'desarrollo',
  }),
};

export default configuracionBaseDatos;

// registerAs permite además leer esta configuración como un bloque
// nombrado "database" en cualquier parte de la app si se necesita.
export const configuracionDB = registerAs('database', () => ({
  host: process.env.DB_HOST,
  puerto: process.env.DB_PUERTO,
}));
