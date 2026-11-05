import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { Socio } from '../modulos/socios/entidades/socio.entity';
import { CategoriaSocio } from '../modulos/socios/entidades/categoria-socio.entity';
import { Pago } from '../modulos/pagos/entidades/pago.entity';
import { Archivo } from '../modulos/archivos/archivo.entity';
import { RegistroCambio } from '../modulos/registro-cambios/registro-cambio.entity';
import { Hilo, Mensaje } from '../modulos/mensajes/mensaje.entity';
import { Personal, Jornada } from '../modulos/personal/personal.entity';
import { Noticia } from '../modulos/noticias/noticia.entity';
import { Beneficio } from '../modulos/beneficios/beneficios.module';

const configuracionBaseDatos: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: config.get<number>('DB_PUERTO', 5432),
    username: config.get<string>('DB_USUARIO', 'postgres'),
    password: config.get<string>('DB_CONTRASENA', ''),
    database: config.get<string>('DB_NOMBRE', 'club_san_martin'),

    ssl: config.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,

    entities: [Socio, CategoriaSocio, Pago, Archivo, RegistroCambio, Hilo, Mensaje, Personal, Jornada, Noticia, Beneficio],

    synchronize: false,

    logging: config.get<string>('ENTORNO') === 'desarrollo',
  }),
};

export default configuracionBaseDatos;

export const configuracionDB = registerAs('database', () => ({
  host: process.env.DB_HOST,
  puerto: process.env.DB_PUERTO,
}));
