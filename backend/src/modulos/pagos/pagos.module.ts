import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './entidades/pago.entity';
import { PagosService } from './pagos.service';
import { Archivo } from '../archivos/archivo.entity';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Archivo]), ArchivosModule],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
