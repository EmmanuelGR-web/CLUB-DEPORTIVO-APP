// =====================================================================
// actualizar-socio.dto.ts
// -----------------------------------------------------------------------
// Define qué campos puede modificar un socio de sus propios datos.
// A propósito, este DTO NO incluye "idSocio" ni "rol": como pediste,
// el número de socio es inmutable, y el rol solo lo puede cambiar
// un admin a través de otro endpoint separado y protegido.
//
// Gracias al ValidationPipe con "forbidNonWhitelisted: true" que
// configuramos en main.ts, si alguien intenta mandar "idSocio" en
// el body igual, la petición se rechaza automáticamente.
// =====================================================================

import { IsOptional, IsString, IsDateString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ActualizarSocioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  provincia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;
}
