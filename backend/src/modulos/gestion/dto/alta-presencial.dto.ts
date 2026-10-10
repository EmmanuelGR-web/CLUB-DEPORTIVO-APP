import { IsEmail, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

// Alta que hace el personal en la sede: el DNI se verificó en persona.
export class AltaPresencialDto {
  @IsString() @MinLength(2, { message: 'Ingresá el nombre.' }) @MaxLength(100) nombre: string;
  @IsString() @MinLength(2, { message: 'Ingresá el apellido.' }) @MaxLength(100) apellido: string;
  @Matches(/^\d{1,2}\.?\d{3}\.?\d{3}$/, { message: 'El DNI tiene 7 u 8 números.' }) dni: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ingresá una fecha de nacimiento válida.' }) fechaNacimiento: string;
  @IsString() @MinLength(5, { message: 'Ingresá la dirección.' }) @MaxLength(200) direccion: string;
  @Matches(/^[\d\s()+-]{8,20}$/, { message: 'Ingresá un teléfono válido.' }) telefono: string;
  @IsEmail({}, { message: 'Ingresá un correo electrónico válido.' }) email: string;
  @IsOptional() @IsString() @Matches(/^data:image\/(jpeg|png|webp);base64,/) @MaxLength(200_000) foto?: string | null;
  @IsObject() medioPago: Record<string, unknown>;
}
