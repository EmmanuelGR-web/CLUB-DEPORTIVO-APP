// =====================================================================
// app.module.ts
// -----------------------------------------------------------------------
// Este es el MÓDULO RAÍZ: el "índice" que conecta todos los módulos
// de la aplicación (autenticación, socios, pagos, etc). Cada vez que
// se cree un módulo nuevo (por ejemplo en la Fase 2 o 3), se importa
// acá dentro del arreglo "imports".
//
// Principio SOLID aplicado: Single Responsibility.
// Este archivo NO tiene lógica de negocio, solo se encarga de
// "ensamblar" la aplicación. Cada módulo es responsable de su propio
// dominio (socios, pagos, autenticación, etc.).
// =====================================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuracionBaseDatos from './config/database.config';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';
import { SociosModule } from './modulos/socios/socios.module';
import { PagosModule } from './modulos/pagos/pagos.module';

@Module({
  imports: [
    // ConfigModule.forRoot carga las variables del archivo .env
    // y las deja disponibles en toda la app a través de ConfigService.
    ConfigModule.forRoot({
      isGlobal: true, // así no hay que importar ConfigModule en cada módulo
      envFilePath: '.env',
    }),

    // Conexión a la base de datos PostgreSQL usando TypeORM.
    // La configuración detallada vive en config/database.config.ts
    TypeOrmModule.forRootAsync(configuracionBaseDatos),

    // --- Módulos de dominio ---
    AutenticacionModule,
    SociosModule,
    PagosModule,

    // A medida que avancemos con las siguientes fases, acá se van
    // agregando: DisciplinasModule, ClubInfoModule, BeneficiosModule,
    // AdminModule, ChatbotModule, etc.
  ],
})
export class AppModule {}
