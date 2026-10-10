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
import { json } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function iniciarAplicacion() {
  // Creamos la aplicación a partir del módulo raíz (AppModule).
  const app = await NestFactory.create(AppModule);

  // Los comprobantes, adjuntos y fotos del DNI viajan como data URL
  // dentro del JSON: el límite por defecto (100 KB) no alcanza.
  app.use(json({ limit: '12mb' }));

  // Traemos el servicio de configuración para leer variables del .env
  const configuracion = app.get(ConfigService);
  // Render (y otros hostings) asignan el puerto en PORT.
  const puerto = configuracion.get<number>('PUERTO') ?? configuracion.get<number>('PORT') ?? 3000;

  // Habilitamos CORS: sin esto, el navegador bloquea las peticiones
  // que vengan desde el frontend (que corre en otro dominio/puerto).
  // En producción CORS_ORIGENES lista los dominios permitidos separados
  // por coma (ej: https://club-deportivo.vercel.app). Sin la variable
  // se acepta cualquier origen, cómodo para desarrollo local.
  const origenes = configuracion
    .get<string>('CORS_ORIGENES', '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origenes.length > 0 ? origenes : true,
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
    .setTitle('API - CLUB DEPORTIVO')
    .setDescription(
      'API para la gestión de socios, pagos, disciplinas deportivas y administración de CLUB DEPORTIVO',
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
