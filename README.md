# mev-radar

Aplicación Next.js (App Router) para consultar y monitorear causas en el MEV (Mesa de Entradas
Virtual) de la SCBA. Usa Postgres + Prisma para persistencia, iron-session para autenticación por
cookie firmada, y Playwright para automatizar el scraping del MEV.

## Requisitos

- [Bun](https://bun.sh) 1.x
- Postgres accesible (local o remoto)

## Variables de entorno

Copiá `.env.example` a `.env` y completá:

| Variable        | Descripción                                                                 |
| --------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`  | Connection string de Postgres, ej. `postgresql://user:pass@localhost:5432/mevradar?schema=public` |
| `SESSION_SECRET`| Secreto usado por iron-session para firmar la cookie `mevradar_session`. Debe tener al menos 32 caracteres. |
| `MEV_CRED_KEY`  | Clave AES-256-GCM (64 caracteres hex = 32 bytes) usada para cifrar las credenciales del MEV que cada usuario guarda. Generarla con: `openssl rand -hex 32` |
| `MEV_BASE_URL`  | URL base del MEV, ej. `https://mev.scba.gov.ar` |

## Desarrollo local

```bash
bun install

# levantar Postgres (ejemplo con Docker, o usar una instancia local ya corriendo)
# createdb mevradar

bun run prisma:migrate   # aplica las migraciones y genera el cliente de Prisma
bun run dev              # http://localhost:3000
```

## Crear el primer admin

No hay UI de registro: el primer usuario admin se crea con un script de seed.

```bash
bun scripts/seed-admin.ts <email> <password> [nombre]

# ejemplo
bun scripts/seed-admin.ts admin@estudio.com "Admin1234!" "Admin"
```

El script crea el usuario (o lo actualiza a rol `admin` si ya existe) junto con una suscripción
activa de 10 años, para que quede operativo de inmediato.

## Calidad de código

```bash
bun run lint        # biome check
bun run lint:fix     # biome check --write
bun run format       # biome format --write
bun run typecheck    # tsc --noEmit
bun run test         # vitest run
```

Los tests con sufijo `.integration.test.ts` hacen requests reales contra el MEV y sólo corren si
se define `MEV_LIVE=1`; en el resto de los casos se skippean automáticamente.

## Middleware de protección

`src/middleware.ts` protege las rutas `/buscar`, `/historial`, `/perfil` y `/admin`:

- Sin sesión (`session.userId` ausente) → redirige a `/login`.
- Con sesión pero rol distinto de `admin` intentando entrar a `/admin` → redirige a `/buscar`.

## Deploy

La app está pensada para correr en un container host con Postgres administrado (Railway, Fly.io,
etc.), usando el `Dockerfile` incluido en la raíz del repo. La imagen base ya trae Playwright con
sus navegadores instalados y en el build se instala Bun.

### Railway

1. Creá un nuevo proyecto y agregá un plugin de **PostgreSQL** (esto provee `DATABASE_URL`
   automáticamente al servicio).
2. Agregá un servicio a partir de este repo, con **Dockerfile** como builder (Railway lo detecta
   solo si hay un `Dockerfile` en la raíz).
3. Configurá las variables de entorno del servicio: `SESSION_SECRET`, `MEV_CRED_KEY`,
   `MEV_BASE_URL` (y `DATABASE_URL` si no quedó ya inyectada por el plugin de Postgres).
4. Al deployar, el contenedor corre `prisma migrate deploy` antes de levantar el servidor
   (ver `CMD` del Dockerfile), así que las migraciones se aplican automáticamente en cada release.
5. Una vez arriba, corré el seed del admin apuntando `DATABASE_URL` a la base de producción:
   `DATABASE_URL=... bun scripts/seed-admin.ts admin@estudio.com <password> "Admin"`
   (por ejemplo desde `railway run` o una shell temporal en el mismo entorno).

### Fly.io

El mismo `Dockerfile` sirve con `fly launch` / `fly deploy`. Agregá una base de datos Postgres con
`fly postgres create`, adjuntala al app (`fly postgres attach`) para setear `DATABASE_URL`, y
configurá el resto de las variables con `fly secrets set SESSION_SECRET=... MEV_CRED_KEY=...
MEV_BASE_URL=...`.
