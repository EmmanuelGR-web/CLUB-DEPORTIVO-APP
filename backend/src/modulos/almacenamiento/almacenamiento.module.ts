// =====================================================================
// almacenamiento.module.ts
// -----------------------------------------------------------------------
// Módulo dedicado exclusivamente a la subida de archivos. Se separa
// del módulo de socios a propósito: mañana, si otras partes de la app
// necesitan subir archivos (por ejemplo, comprobantes de pago en la
// Fase 3), van a poder reutilizar este mismo módulo sin duplicar
// código.
// =====================================================================

import { Module } from '@nestjs/common';
import { AlmacenamientoService } from './almacenamiento.service';

@Module({
  providers: [AlmacenamientoService],
  exports: [AlmacenamientoService],
})
export class AlmacenamientoModule {}
