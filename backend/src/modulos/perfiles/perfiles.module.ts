import { Module } from '@nestjs/common';
import { PerfilesService } from './perfiles.service';
import { SociosModule } from '../socios/socios.module';
import { PagosModule } from '../pagos/pagos.module';
import { RegistroCambiosModule } from '../registro-cambios/registro-cambios.module';

@Module({
  imports: [SociosModule, PagosModule, RegistroCambiosModule],
  providers: [PerfilesService],
  exports: [PerfilesService],
})
export class PerfilesModule {}
