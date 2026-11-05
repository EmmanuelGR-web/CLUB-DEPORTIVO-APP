import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { LimitePedidosGuard } from './comun/guards/limite-pedidos.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuracionBaseDatos from './config/database.config';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';
import { SociosModule } from './modulos/socios/socios.module';
import { PagosModule } from './modulos/pagos/pagos.module';
import { ArchivosModule } from './modulos/archivos/archivos.module';
import { MiCuentaModule } from './modulos/mi-cuenta/mi-cuenta.module';
import { IaModule } from './modulos/ia/ia.module';
import { GestionModule } from './modulos/gestion/gestion.module';
import { AdminModule } from './modulos/admin/admin.module';
import { NoticiasModule } from './modulos/noticias/noticias.module';
import { BeneficiosModule } from './modulos/beneficios/beneficios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync(configuracionBaseDatos),

    ThrottlerModule.forRoot({
      throttlers: [{ name: 'general', ttl: 60_000, limit: 150 }],
      errorMessage: 'Hiciste demasiados pedidos seguidos. Esperá un minuto y probá de nuevo.',
    }),

    AutenticacionModule,
    SociosModule,
    PagosModule,
    ArchivosModule,
    MiCuentaModule,
    IaModule,
    GestionModule,
    AdminModule,
    NoticiasModule,
    BeneficiosModule,

  ],
  providers: [{ provide: APP_GUARD, useClass: LimitePedidosGuard }],
})
export class AppModule {}
