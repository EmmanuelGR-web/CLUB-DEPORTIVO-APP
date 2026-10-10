import { Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ArchivoDto {
  @IsString() @MaxLength(200) nombre: string;
  @IsString() @MaxLength(100) tipo: string;
  @IsInt() tamanio: number;
  @ApiProperty({ description: 'data URL de una imagen o un PDF' })
  @IsString() dataUrl: string;
}

export class GuardarCambiosDto {
  @ApiProperty({ example: { telefono: '381 555-1234' }, description: 'Campos a cambiar: nombre, apellido, dni, fechaNacimiento, direccion, telefono, email, medioPago, foto' })
  @IsObject() cambios: Record<string, unknown>;

  @ApiProperty({ example: 'Datos personales' })
  @IsIn(['Datos personales', 'Medio de pago', 'Foto de perfil']) seccion: string;
}

export class CambiarContrasenaDto {
  @IsString() actual: string;
  @IsString() @MinLength(6, { message: 'La contraseña nueva tiene que tener al menos 6 caracteres.' }) nueva: string;
}

export class InformarPagoDto {
  @Matches(/^\d{4}-\d{2}$/) periodo: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Elegí la fecha en que pagaste.' }) fechaPago: string;
  @IsString() medio: string;
  @ValidateNested() @Type(() => ArchivoDto) comprobante: ArchivoDto;
  @ApiPropertyOptional({ description: 'Lo que leyó la IA del comprobante' })
  @IsOptional() @IsObject() verificacionIA?: Record<string, unknown>;
}

export class MensajeDto {
  @IsOptional() @IsString() @MaxLength(80) asunto?: string;
  @IsString() @MaxLength(1000) texto: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ArchivoDto) adjuntos?: ArchivoDto[];
}
