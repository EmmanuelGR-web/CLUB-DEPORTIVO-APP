# Backend - Club Atlético San Martín de Tucumán

API construida con **NestJS + TypeScript + PostgreSQL (TypeORM)**.

## Requisitos previos

- Node.js 20 o superior
- PostgreSQL (local, o una cuenta gratuita en [Supabase](https://supabase.com) o [Railway](https://railway.app))

## Instalación

```bash
cd backend
npm install
cp .env.example .env
# completar .env con los datos de tu base de datos
```

## Ejecutar la base de datos

Abrí el archivo `migraciones/001_crear_tablas_base.sql` y ejecutalo contra tu base
(por ejemplo, pegándolo en el "SQL Editor" de Supabase, o con `psql`).

## Levantar el servidor en modo desarrollo

```bash
npm run start:dev
```

- API disponible en: `http://localhost:3000`
- Documentación interactiva (Swagger): `http://localhost:3000/documentacion`

## Estructura de carpetas

```
src/
├── main.ts                # arranque de la aplicación
├── app.module.ts           # módulo raíz, conecta todos los módulos
├── config/                 # configuración de base de datos y variables de entorno
├── comun/                  # piezas compartidas: guards, decoradores, enums
└── modulos/
    ├── autenticacion/      # login y generación de JWT
    └── socios/              # gestión de datos de socios
```

## Convenciones del proyecto

- Todo el código (variables, funciones, comentarios) está en **español**.
- Cada módulo sigue el patrón: `entidad → dto → service → controller → module`.
- Las contraseñas nunca se guardan en texto plano (se usa `bcrypt`).
- Los endpoints protegidos usan `JwtAuthGuard` + `RolesGuard` en conjunto.
- Los cambios de estructura de base de datos se hacen con migraciones SQL
  numeradas en `/migraciones`, nunca modificando la base "a mano".
