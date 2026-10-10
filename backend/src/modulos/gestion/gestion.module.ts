import { Module } from '@nestjs/common';
import { GestionController } from './gestion.controller';
import { GestionService } from './gestion.service';
import { SociosModule } from '../socios/socios.module';
import { PerfilesModule } from '../perfiles/perfiles.module';
import { PagosModule } from '../pagos/pagos.module';
import { RegistroCambiosModule } from '../registro-cambios/registro-cambios.module';
import { MensajesModule } from '../mensajes/mensajes.module';
import { PersonalModule } from '../personal/personal.module';

@Module({
  imports: [SociosModule, PerfilesModule, PagosModule, RegistroCambiosModule, MensajesModule, PersonalModule],
  controllers: [GestionController],
  providers: [GestionService],
  exports: [GestionService],
})
export class GestionModule {}
