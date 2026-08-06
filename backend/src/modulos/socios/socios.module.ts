// =====================================================================
// socios.module.ts
// -----------------------------------------------------------------------
// Agrupa las piezas del módulo de socios y registra las entidades
// (tablas) que este módulo necesita para trabajar con TypeORM.
// =====================================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Socio } from './entidades/socio.entity';
import { CategoriaSocio } from './entidades/categoria-socio.entity';
import { SociosService } from './socios.service';
import { SociosController } from './socios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Socio, CategoriaSocio])],
  controllers: [SociosController],
  providers: [SociosService],
  exports: [SociosService], // lo necesita AutenticacionModule para el login
})
export class SociosModule {}
