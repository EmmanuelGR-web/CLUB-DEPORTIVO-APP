import { Body, Controller, HttpCode, Module, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsArray, IsIn, IsObject, IsOptional } from 'class-validator';
import { IaService } from './ia.service';

class LecturaDto {
  @IsIn(['dni', 'comprobante']) tipo: 'dni' | 'comprobante';
  @IsArray() archivos: { dataUrl: string }[];
  @IsOptional() @IsObject() contexto?: { hoy?: string };
}

@ApiTags('Lectura con IA')
@Controller('ia')
export class IaController {
  constructor(private readonly ia: IaService) {}

  @Post('leer-documento')
  @HttpCode(200)
  @Throttle({ general: { limit: 15, ttl: 60_000 } })
  @ApiOperation({ summary: 'Lee un DNI (frente y dorso) o un comprobante de pago con Gemini' })
  leer(@Body() datos: LecturaDto) {
    return this.ia.leer(datos.tipo, datos.archivos, datos.contexto?.hoy);
  }
}

@Module({
  controllers: [IaController],
  providers: [IaService],
})
export class IaModule {}
