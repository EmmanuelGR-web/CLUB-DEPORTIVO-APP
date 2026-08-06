# Guía de commits y flujo de Git

Esta guía es para que vayas versionando tu trabajo de forma prolija y real
a medida que estudiás, probás y ajustás cada parte del proyecto.

## Convención de mensajes (Conventional Commits en español)

```
tipo: descripción corta en minúscula

[cuerpo opcional explicando el porqué]
```

Tipos más usados en este proyecto:

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Funcionalidad nueva (ej: `feat: agrego login con JWT`) |
| `fix` | Corrección de un error |
| `refactor` | Reordenar/mejorar código sin cambiar su comportamiento |
| `docs` | Cambios en documentación (README, comentarios) |
| `test` | Agregar o modificar tests |
| `chore` | Tareas de mantenimiento (dependencias, configuración) |
| `style` | Formato de código, sin cambios de lógica |

Ejemplos reales para esta Fase 1:

```bash
git commit -m "chore: estructura inicial del proyecto backend con NestJS"
git commit -m "feat: configuracion de conexion a PostgreSQL con TypeORM"
git commit -m "feat: entidad Socio y CategoriaSocio"
git commit -m "feat: modulo de autenticacion con JWT y bcrypt"
git commit -m "feat: guards de roles para proteger endpoints por tipo de usuario"
git commit -m "docs: migracion SQL inicial y README del backend"
```

## Flujo de ramas sugerido

```
main                    → versión estable, solo se mergea desde develop
 └── develop             → integración de todas las features
      ├── feature/autenticacion
      ├── feature/socios
      ├── feature/pagos
      └── feature/panel-admin
```

Flujo de trabajo real:

```bash
git checkout -b feature/autenticacion
# ... trabajás, probás, entendés el código ...
git add .
git commit -m "feat: login con JWT y validacion de contrasena"
git checkout develop
git merge feature/autenticacion
```

## Recomendación para tus 60hs de trabajo

Lo que realmente cuenta como tus horas de trabajo es el tiempo que le
dediques a **entender** cada módulo, **probarlo** localmente, **romperlo
a propósito** para ver qué pasa, y **adaptarlo** a decisiones tuyas
(nombres, validaciones extra, ajustes de la lógica de categorías, etc.).
Ese proceso real es el que después vas a poder explicar con soltura
frente al tribunal — y es el que efectivamente convierte este código
en "tuyo".
