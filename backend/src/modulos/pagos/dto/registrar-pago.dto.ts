// =====================================================================
// registrar-pago.dto.ts
// -----------------------------------------------------------------------
// Datos que el socio envía al declarar el pago de una cuota. Notar
// que el socio NO puede elegir el "estado" del pago (aprobado,
// rechazado): eso queda afuera de este DTO a propósito, porque esa
// decisión le corresponde únicamente al club (un socio no puede
// "auto-aprobarse" un pago).
// =====================================================================

import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedioPago } from '../entidades/medio-pago.enum';

export class RegistrarPagoDto {
  @ApiProperty({ description: 'id de la cuota que se está pagando' })
  @IsUUID()
  cuotaId: string;

  @ApiProperty({ enum: MedioPago, example: MedioPago.TRANSFERENCIA })
  @IsEnum(MedioPago, { message: 'Medio de pago inválido' })
  medioPago: MedioPago;

  @ApiPropertyOptional({ description: 'URL del comprobante, si corresponde (ej: transferencia)' })
  @IsOptional()
  @IsString()
  comprobanteUrl?: string;
}
