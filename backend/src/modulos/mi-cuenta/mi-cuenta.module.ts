import { Module } from '@nestjs/common';
import { MiCuentaController } from './mi-cuenta.controller';
import { MiCuentaService } from './mi-cuenta.service';
import { PerfilesModule } from '../perfiles/perfiles.module';
import { SociosModule } from '../socios/socios.module';
import { PagosModule } from '../pagos/pagos.module';
import { RegistroCambiosModule } from '../registro-cambios/registro-cambios.module';
import { MensajesModule } from '../mensajes/mensajes.module';

@Module({
  imports: [PerfilesModule, SociosModule, PagosModule, RegistroCambiosModule, MensajesModule],
  controllers: [MiCuentaController],
  providers: [MiCuentaService],
})
export class MiCuentaModule {}
