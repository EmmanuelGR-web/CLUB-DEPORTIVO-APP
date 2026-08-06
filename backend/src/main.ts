// =====================================================================
// main.ts
// -----------------------------------------------------------------------
// Este es el ARCHIVO DE ARRANQUE de toda la aplicación backend.
// Acá se "prende" el servidor, se configuran cosas globales (como
// la validación automática de datos que llegan del frontend, y el
// CORS para que React pueda hablarle a esta API) y se pone a escuchar
// peticiones en el puerto configurado.
// =====================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function iniciarAplicacion() {
  // Creamos la aplicación a partir del módulo raíz (AppModule).
  const app = await NestFactory.create(AppModule);

  // Traemos el servicio de configuración para leer variables del .env
  const configuracion = app.get(ConfigService);
  const puerto = configuracion.get<number>('PUERTO') ?? 3000;

  // Habilitamos CORS: sin esto, el navegador bloquea las peticiones
  // que vengan desde el frontend (que corre en otro dominio/puerto).
  app.enableCors({
    origin: true, // en producción conviene restringir esto al dominio real del frontend
    credentials: true,
  });

  // ValidationPipe global: valida automáticamente TODOS los datos que
  // llegan en el body de las peticiones, usando las reglas que definimos
  // en cada DTO (Data Transfer Object) con class-validator.
  // Si algo no cumple las reglas, Nest devuelve un error 400 automático,
  // así no tenemos que validar "a mano" en cada controlador.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos que no estén definidos en el DTO
      forbidNonWhitelisted: true, // rechaza la petición si mandan campos de más
      transform: true, // convierte automáticamente tipos (ej: string a number)
    }),
  );

  // Documentación automática de la API con Swagger.
  // Una vez levantado el server, se puede ver en: http://localhost:3000/documentacion
  const documentoSwagger = new DocumentBuilder()
    .setTitle('API - Club Atlético San Martín de Tucumán')
    .setDescription(
      'API para la gestión de socios, pagos, disciplinas deportivas y administración del club',
    )
    .setVersion('0.1')
    .addBearerAuth() // permite probar endpoints protegidos con JWT desde la interfaz de Swagger
    .build();
  const documento = SwaggerModule.createDocument(app, documentoSwagger);
  SwaggerModule.setup('documentacion', app, documento);

  await app.listen(puerto);
  console.log(`✅ API del club corriendo en: http://localhost:${puerto}`);
  console.log(`📄 Documentación disponible en: http://localhost:${puerto}/documentacion`);
}

iniciarAplicacion();
