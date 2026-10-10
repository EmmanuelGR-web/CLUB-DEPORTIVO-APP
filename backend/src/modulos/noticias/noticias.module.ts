import { Body, Controller, Delete, Get, HttpCode, Injectable, Module, NotFoundException, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Repository } from 'typeorm';
import { Noticia } from './noticia.entity';
import { JwtAuthGuard } from '../../comun/guards/jwt-auth.guard';
import { RolesGuard } from '../../comun/guards/roles.guard';
import { Roles } from '../../comun/decoradores/roles.decorator';
import { Rol } from '../../comun/enums/rol.enum';

export const CATEGORIAS_NOTICIA = ['Fútbol', 'Básquet', 'Vóley', 'Hockey', 'Institucional', 'Tienda'];

class NoticiaDto {
  @IsString() @MinLength(5, { message: 'El título tiene al menos 5 caracteres.' }) @MaxLength(90) titulo: string;
  @IsIn(CATEGORIAS_NOTICIA) categoria: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Indicá la fecha.' }) fecha: string;
  @IsString() @MinLength(10, { message: 'El resumen tiene al menos 10 caracteres.' }) @MaxLength(140) resumen: string;
  @IsArray() @ArrayMinSize(1, { message: 'Escribí el texto de la noticia.' }) @IsString({ each: true }) cuerpo: string[];
  @IsOptional() @IsString() @MaxLength(300_000) imagen?: string | null;
}

@Injectable()
export class NoticiasService {
  constructor(@InjectRepository(Noticia) private readonly repositorio: Repository<Noticia>) {}

  listar() {
    return this.repositorio.find({ order: { fecha: 'DESC', creadoEn: 'DESC' } });
  }

  crear(datos: NoticiaDto) {
    return this.repositorio.save(this.repositorio.create({ ...datos, imagen: datos.imagen || null }));
  }

  async modificar(id: string, datos: NoticiaDto) {
    const noticia = await this.repositorio.findOne({ where: { id } });
    if (!noticia) throw new NotFoundException('La noticia no existe.');
    Object.assign(noticia, datos, { imagen: datos.imagen || null });
    return this.repositorio.save(noticia);
  }

  async borrar(id: string) {
    const resultado = await this.repositorio.delete(id);
    if (!resultado.affected) throw new NotFoundException('La noticia no existe.');
  }
}

@ApiTags('Noticias')
@Controller('noticias')
export class NoticiasController {
  constructor(private readonly noticias: NoticiasService) {}

  @Get()
  @ApiOperation({ summary: 'Noticias del club, de la más nueva a la más vieja (público)' })
  listar() {
    return this.noticias.listar();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  @ApiOperation({ summary: '[Personal del club] Publica una noticia' })
  crear(@Body() datos: NoticiaDto) {
    return this.noticias.crear(datos);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  modificar(@Param('id', ParseUUIDPipe) id: string, @Body() datos: NoticiaDto) {
    return this.noticias.modificar(id, datos);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRATIVO, Rol.ADMIN_PRINCIPAL)
  async borrar(@Param('id', ParseUUIDPipe) id: string) {
    await this.noticias.borrar(id);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Noticia])],
  controllers: [NoticiasController],
  providers: [NoticiasService],
})
export class NoticiasModule {}
