import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hilo, Mensaje } from './mensaje.entity';
import { MensajesService } from './mensajes.service';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hilo, Mensaje]), ArchivosModule],
  providers: [MensajesService],
  exports: [MensajesService],
})
export class MensajesModule {}
