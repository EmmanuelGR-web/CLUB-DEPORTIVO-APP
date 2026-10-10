import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Socio } from './entidades/socio.entity';
import { CategoriaSocio } from './entidades/categoria-socio.entity';
import { SociosService } from './socios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Socio, CategoriaSocio])],
  providers: [SociosService],
  exports: [SociosService],
})
export class SociosModule {}
