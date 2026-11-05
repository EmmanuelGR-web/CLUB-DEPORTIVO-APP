import { SetMetadata } from '@nestjs/common';
import { Rol } from '../enums/rol.enum';

export const CLAVE_ROLES = 'roles';
export const Roles = (...roles: Rol[]) => SetMetadata(CLAVE_ROLES, roles);
