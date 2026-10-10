import { Controller, Get, Module, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Archivo } from './archivo.entity';
import { ArchivosService } from './archivos.service';
import { JwtAuthGuard } from '../../comun/guards/jwt-auth.guard';
import { UsuarioActual, UsuarioAutenticado } from '../../comun/decoradores/usuario-actual.decorator';

@ApiTags('Archivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('archivos')
export class ArchivosController {
  constructor(private readonly archivos: ArchivosService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Devuelve un comprobante o adjunto para verlo o descargarlo' })
  abrir(@Param('id', ParseUUIDPipe) id: string, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.archivos.abrir(id, usuario);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Archivo])],
  controllers: [ArchivosController],
  providers: [ArchivosService],
  exports: [ArchivosService],
})
export class ArchivosModule {}
