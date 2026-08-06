// =====================================================================
// rol.enum.ts
// -----------------------------------------------------------------------
// Define los distintos "roles" (tipos de usuario) que existen en el
// sistema. Esto se usa junto con el decorador @Roles() y el RolesGuard
// para proteger endpoints según quién puede acceder a qué.
//
// Ejemplo real de tu especificación: los movimientos económicos del
// club SOLO los puede ver ADMIN_PRINCIPAL, no un socio ni un
// administrativo común.
// =====================================================================

export enum Rol {
  SOCIO = 'socio', // usuario común, ve solo su propia información
  ADMINISTRATIVO = 'administrativo', // staff del club: carga fixture, plantel, etc.
  ADMIN_PRINCIPAL = 'admin_principal', // control total, incluida info económica sensible
}
