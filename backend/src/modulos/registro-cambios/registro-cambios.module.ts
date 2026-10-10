import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroCambio } from './registro-cambio.entity';
import { RegistroCambiosService } from './registro-cambios.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroCambio])],
  providers: [RegistroCambiosService],
  exports: [RegistroCambiosService],
})
export class RegistroCambiosModule {}
