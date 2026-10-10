// =====================================================================
// registrar-socio.dto.ts
// -----------------------------------------------------------------------
// Datos del alta online. Además de los datos personales llegan la
// selfie del carnet, el medio de pago y lo que leyó la IA del DNI
// (para que el personal vea qué se leyó y qué corrigió el socio).
// =====================================================================

import { IsEmail, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegistrarSocioDto {
  @ApiProperty({ example: 'Lucía' })
  @IsString() @MinLength(2, { message: 'Ingresá tu nombre.' }) @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Herrera' })
  @IsString() @MinLength(2, { message: 'Ingresá tu apellido.' }) @MaxLength(100)
  apellido: string;

  @ApiProperty({ example: '38123456' })
  @Matches(/^\d{1,2}\.?\d{3}\.?\d{3}$/, { message: 'El DNI tiene 7 u 8 números.' })
  dni: string;

  @ApiProperty({ example: '1994-06-12' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ingresá una fecha de nacimiento válida.' })
  fechaNacimiento: string;

  @ApiProperty({ example: 'Av. Mate de Luna 2150, San Miguel de Tucumán' })
  @IsString() @MinLength(5, { message: 'Ingresá tu dirección.' }) @MaxLength(200)
  direccion: string;

  @ApiProperty({ example: '381 555-0101' })
  @IsString() @Matches(/^[\d\s()+-]{8,20}$/, { message: 'Ingresá un teléfono válido.' })
  telefono: string;

  @ApiProperty({ example: 'lucia@correo.com' })
  @IsEmail({}, { message: 'Ingresá un correo electrónico válido.' })
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString() @MinLength(6, { message: 'La contraseña tiene que tener al menos 6 caracteres.' })
  contrasena: string;

  @ApiProperty({ description: 'Selfie para el carnet (data URL JPEG)' })
  @IsString() @Matches(/^data:image\/(jpeg|png|webp);base64,/, { message: 'Falta la foto de perfil.' }) @MaxLength(200_000)
  foto: string;

  @ApiProperty({ example: { tipo: 'efectivo', debitoAutomatico: false } })
  @IsObject()
  medioPago: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Lo que leyó la IA del DNI y qué campos se corrigieron' })
  @IsOptional() @IsObject()
  lecturaIA?: Record<string, unknown>;
}
