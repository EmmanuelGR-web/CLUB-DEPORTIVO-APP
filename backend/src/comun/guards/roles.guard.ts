// =====================================================================
// roles.guard.ts
// -----------------------------------------------------------------------
// Este guard trabaja EN CONJUNTO con el decorador @Roles().
// Se fija qué roles se pusieron como requisito en el endpoint (con
// @Roles(...)) y los compara contra el rol del usuario que está
// haciendo la petición (que ya sabemos gracias al JwtAuthGuard).
//
// Ejemplo de la regla de negocio que pediste:
// "El socio no puede ver los movimientos económicos del club,
//  solo el admin principal puede".
//
// Esto se traduce en código así, en el controlador correspondiente:
//
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Rol.ADMIN_PRINCIPAL)
//   @Get('movimientos-economicos')
//
// Principio SOLID aplicado: Open/Closed. Este guard NO necesita
// modificarse cada vez que agregamos un endpoint nuevo con reglas
// de rol distintas; simplemente se le "configura" con el decorador.
// =====================================================================

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CLAVE_ROLES } from '../decoradores/roles.decorator';
import { Rol } from '../enums/rol.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    // Buscamos qué roles se exigieron con @Roles() en este endpoint.
    const rolesRequeridos = this.reflector.getAllAndOverride<Rol[]>(CLAVE_ROLES, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);

    // Si el endpoint no tiene @Roles(), significa que cualquier
    // usuario autenticado puede entrar (no hay restricción extra).
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    // Tomamos el usuario que el JwtAuthGuard ya dejó "enganchado"
    // en la petición, y comparamos su rol contra los permitidos.
    const { usuario } = contexto.switchToHttp().getRequest();
    return rolesRequeridos.some((rolPermitido) => usuario?.rol === rolPermitido);
  }
}
