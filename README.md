# Club Atlético San Martín de Tucumán — Sistema de Gestión de Socios

Proyecto de tesis — Tecnicatura Universitaria en Programación, UTN FRT.
Autor: Emmanuel Gonzalez.

## Estado del proyecto: Fase 1 de 6

- [x] **Fase 1** — Esqueleto backend (NestJS) + base de datos (PostgreSQL) + autenticación con roles
- [ ] Fase 2 — Módulo de socios completo (carnet, código de barras, antigüedad)
- [ ] Fase 3 — Módulo de pagos y cuotas
- [ ] Fase 4 — Información del club (fixture, plantel, historia, museo, complejo)
- [ ] Fase 5 — Frontend (panel socio + panel admin)
- [ ] Fase 6 — Chatbot asistente, modo oscuro, documentación final

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | NestJS (Node.js) + TypeScript |
| Base de datos | PostgreSQL (recomendado: Supabase o Railway) |
| ORM | TypeORM |
| Autenticación | JWT (JSON Web Tokens) + bcrypt |
| Frontend | React + Next.js |
| Almacenamiento de imágenes | Supabase Storage / Cloudflare R2 |
| Hosting backend | Railway o Render |
| Hosting frontend | Vercel |

## Estructura del repositorio

```
club-san-martin/
├── backend/     → API REST (ver backend/README.md)
├── frontend/    → Aplicación web (se agrega en la Fase 5)
└── docs/        → Manuales de usuario y guías del proyecto
```

## Documentación

- [Manual de usuario (Español)](docs/manual-usuario-es.md)
- [Manual de usuario (English)](docs/manual-usuario-en.md)
- [Guía de commits y flujo de Git](docs/guia-commits.md)
- [README del backend](backend/README.md)

## Principios de diseño aplicados

- **SOLID**: cada módulo tiene una responsabilidad (Single Responsibility),
  los guards son extensibles sin modificar código existente (Open/Closed),
  y los servicios dependen de abstracciones (repositorios de TypeORM) en
  vez de detalles concretos de la base de datos (Dependency Inversion).
- **Seguridad de datos económicos**: solo el rol `admin_principal` puede
  acceder a información financiera del club, controlado por `RolesGuard`.
- **Escalabilidad**: índices en las columnas de búsqueda frecuente,
  tipo `NUMERIC` para montos de dinero (nunca `float`), y migraciones
  SQL versionadas pensando en 20.000+ socios.
