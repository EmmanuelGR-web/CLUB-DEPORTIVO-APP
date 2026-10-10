// =====================================================================
// beneficios.module.ts
// -----------------------------------------------------------------------
// Beneficios para socios. Los ve cualquier usuario con sesión; los
// publican, editan o borran el personal administrativo y la
// administración principal.
// =====================================================================

import { Body, Controller, Delete, Get, HttpCode, Injectable, Module, NotFoundException, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Repository, UpdateDateColumn } from 'typeorm';
import { JwtAuthGuard } from '../../comun/guards/jwt-auth.guard';
import { RolesGuard } from '../../comun/guards/roles.guard';
import { Roles } from '../../comun/decoradores/roles.decorator';
import { Rol } from '../../comun/enums/rol.enum';

@Entity('beneficios')
export class Beneficio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 60 })
  titulo: string;

  @Column({ length: 80 })
  detalle: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ length: 120, default: '' })
  extra: string;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}

class BeneficioDto {
  @IsString() @MinLength(3, { message: 'El título tiene al menos 3 caracteres.' }) @MaxLength(60) titulo: string;
  @IsString() @MinLength(3, { message: 'Contá el beneficio en pocas palabras.' }) @MaxLength(80) detalle: string;
  @IsString() @MinLength(20, { message: 'La descripción tiene al menos 20 caracteres.' }) @MaxLength(1000) descripcion: string;
  @IsOptional() @IsString() @MaxLength(120) extra?: string;
  @IsOptional() @IsInt() @Min(0) orden?: number;
}

@Injectable()
export class BeneficiosService {
  constructor(@InjectRepository(Beneficio) private readonly repositorio: Repository<Beneficio>) {}

  listar() {
    return this.repositorio.find({ order: { orden: 'ASC', creadoEn: 'ASC' } });
  }

  async crear(datos: BeneficioDto) {
    // Los nuevos van al final de la lista.
    const ultimo = await this.repositorio.maximum('orden');
    return this.repositorio.save(this.repositorio.create({ ...datos, extra: datos.extra ?? '', orden: datos.orden ?? (ultimo ?? 0) + 1 }));
  }

  async modificar(id: string, datos: BeneficioDto) {
    const beneficio = await this.repositorio.findOne({ where: { id } });
    if (!beneficio) throw new NotFoundException('El beneficio no existe.');
    Object.assign(beneficio, datos, { extra: datos.extra ?? '' });
    return this.repositorio.save(beneficio);
  }

  async borrar(id: string) {
    const resultado = await this.repositorio.delete(id);
    if (!resultado.affected) throw new NotFoundException('El beneficio no existe.');
  }
}

@ApiTags('Beneficios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('beneficios')
export class BeneficiosController {
  constructor(private readonly beneficios: BeneficiosService) {}

  @Get()
  @ApiOperation({ summary: 'Beneficios vigentes para socios' })
  listar() {
    return this.beneficios.listar();
  }

  @Post()
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  @ApiOperation({ summary: '[Personal del club] Publica un beneficio' })
  crear(@Body() datos: BeneficioDto) {
    return this.beneficios.crear(datos);
  }

  @Patch(':id')
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  modificar(@Param('id', ParseUUIDPipe) id: string, @Body() datos: BeneficioDto) {
    return this.beneficios.modificar(id, datos);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  async borrar(@Param('id', ParseUUIDPipe) id: string) {
    await this.beneficios.borrar(id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Beneficio])],
  controllers: [BeneficiosController],
  providers: [BeneficiosService],
})
export class BeneficiosModule {}
