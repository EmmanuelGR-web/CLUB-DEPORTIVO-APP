// =====================================================================
// roles.decorator.ts
// -----------------------------------------------------------------------
// Este decorador se usa ARRIBA de cualquier método de un controlador
// para indicar qué roles tienen permiso de entrar a ese endpoint.
//
// Ejemplo de uso:
//
//   @Roles(Rol.ADMIN_PRINCIPAL)
//   @Get('movimientos-economicos')
//   verMovimientos() { ... }
//
// Con esto, solo un usuario con rol ADMIN_PRINCIPAL va a poder acceder,
// aunque esté logueado con un token válido. El que hace cumplir esta
// regla es el RolesGuard (ver comun/guards/roles.guard.ts).
// =====================================================================

import { SetMetadata } from '@nestjs/common';
import { Rol } from '../enums/rol.enum';

export const CLAVE_ROLES = 'roles';
export const Roles = (...roles: Rol[]) => SetMetadata(CLAVE_ROLES, roles);
