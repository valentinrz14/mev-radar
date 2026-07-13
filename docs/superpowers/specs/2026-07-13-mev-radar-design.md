# MEV Radar — Diseño

**Fecha:** 2026-07-13
**Estado:** Aprobado para plan de implementación (pendiente review del usuario)

## 1. Problema

Un estudio de abogados necesita ubicar causas en la Mesa de Entradas Virtual (MEV)
de la Suprema Corte de Buenos Aires (`https://mev.scba.gov.ar`). Hoy, para encontrar
dónde tramita una causa, un abogado debe entrar organismo por organismo (hay 23 solo
en el fuero Civil de Morón) y buscar la carátula a mano. Es lento y tedioso.

**MEV Radar** automatiza eso: el abogado escribe un apellido, y la herramienta recorre
todos los organismos del departamento, filtra las coincidencias reales y arma un
informe con dónde está cada causa, con acceso directo al detalle.

## 2. Hallazgos de la recon (sitio real, verificado 2026-07-13)

El flujo completo es automatizable con Playwright, **sin captcha**:

1. **Login** — `POST loguin.asp`
   - `input[name=usuario]`, `input[name=clave]` (password)
   - `select[name=DeptoRegistrado]` = "Creado en" → Morón = `MO`
2. **Selección de organismo** — `POST POSLoguin.asp`
   - `input[name=TipoDto]` radios: `SCJ` (Suprema Corte), `LPC` (Casación Penal),
     `PZ` (Justicia de Paz), `CC` (Departamento Judicial → Cámaras/Juzgados)
   - `select[name=DtoJudElegido]` = departamento → Morón = `19`
   - Checkboxes `TipoF=FF` (Fuero Familia), `TipoP=PP` (Fuero Penal) → **v1 los deja sin marcar** (fuero Civil)
   - `input[name=Aceptar]` (submit)
3. **Búsqueda** — `busqueda.asp` → `POST Busqueda.asp`, `form[name=form1]`
   - `select[name=JuzgadoElegido]` = lista de organismos del departamento
     (23 en el Civil de Morón; valores tipo `GAM415`, `GAM430`, …)
   - `input[name=radio]` radios de tipo de búsqueda: `xCa` (carátula), `xNc`
     (nº expediente), `xNr` (receptoría), `xSb` (set), `xNs` (novedades)
   - `input[name=caratula]` = término de búsqueda (para `xCa`)
   - `input[name=TipoCausa]`: `Ac` (activos), `Ar` (archivados), `Am` (ambos → default)
   - `input[name=Buscar]` (submit)
4. **Resultados** — cada fila trae:
   - Carátula (texto largo, ej. `LOTTI JUAN C/ ... S/ DAÑOS Y PERJUICIOS`)
   - Estado / situación (ej. `FUERA DEL ORGANISMO`)
   - Receptoría, Nº de expediente, fecha de inicio, último movimiento + fecha
   - **Link al detalle**: `<a href="procesales.asp?nidCausa=<id>&pidJuzgado=<code>">`
   - Total de resultados: texto `Total Expedientes : N`

**Comportamientos a manejar:**
- **MEV busca por substring puro.** Buscar `LOTTI` en una sola sala devolvió **20
  resultados, ninguno "Lotti" real**: ANGELOTTI, BELLOTTI, BERTOLOTTI, LANCELOTTI,
  PERLOTTI, MERLOTTI, TOLOTTI, etc. → **el filtro de palabra completa es esencial.**
- **Tope de 1000 resultados.** Con apellidos muy comunes MEV rebota con
  "Los resultados exceden el límite permitido: 1000". Hay que detectarlo y avisar.
- Algunas búsquedas re-renderizan la misma URL (no navegan) → esperar por selector,
  no solo por `loadstate`.

## 3. Alcance

### v1 (este spec)
- Login propio de la app para cada abogado.
- Cada abogado guarda **sus** credenciales MEV (encriptadas).
- Búsqueda por **carátula** en **un departamento elegido** (Morón por defecto),
  recorriendo **todos los organismos del fuero Civil** de ese departamento.
- Filtro de **palabra completa** (descarta substrings tipo LANCELOTTI).
- Progreso en vivo (loader + animación + contador de organismos y coincidencias).
- Notificación del navegador + sonido al terminar.
- Cada resultado es **clickeable → link crudo a MEV** (`procesales.asp?nidCausa=...&
  pidJuzgado=...`, abre en pestaña nueva). Si el abogado no tiene sesión MEV abierta,
  MEV lo rebota — es comportamiento esperado y aceptado, no hacemos nada extra.
- Historial de búsquedas por abogado.
- **Suscripción mensual por abogado** + **panel de admin** con los días restantes de
  cada usuario (ver sección 6).

### Fuera de alcance (v2+, contemplado en arquitectura)
- Búsqueda multi-campo en cascada: si completan carátula + expediente + receptoría,
  buscar primero por carátula, luego por expediente, luego por receptoría.
- Fueros Familia y Penal (checkboxes `TipoF`/`TipoP`), y Suprema Corte / Casación / Paz.
- **Búsqueda en TODOS los departamentos (alto valor comercial).** Es el caso de uso
  estrella para abogados de **sucesiones**, que hoy hacen ~700 búsquedas a mano por toda
  la provincia. La arquitectura ya es genérica por código de departamento, así que es
  "encender" el modo multi-departamento en la UI. **Implicancias de escala a resolver
  antes de habilitarlo:** cientos de organismos por corrida ⇒ (a) barra de progreso a dos
  niveles (departamento N/23 · organismo M/K), (b) checkpointing para reanudar si se corta,
  (c) rate-limiting/jitter y sesiones re-logueables para corridas largas (decenas de
  minutos), (d) manejo del tope de 1000 por organismo a gran escala. Fuerte candidato a
  ser el foco del v2.

## 4. Arquitectura

Monorepo **Next.js (TypeScript)** corriendo como servidor Node de larga vida
(Railway / Fly / VPS — **no** Vercel serverless, porque Playwright necesita navegador
real y jobs largos).

```
Browser (React + Tailwind)
   │  login propio · form de búsqueda · lista en vivo (SSE) · notificación+sonido
   ▼
Next.js API routes (Node)
   ├─ /api/auth/*          → login propio (sesión de la app)
   ├─ /api/mev-credentials → guardar/actualizar credenciales MEV (encriptadas)
   └─ /api/search (SSE)    → dispara el job y streamea eventos de progreso
   ▼
Motor de scraping (Playwright, Chromium headless)
   ├─ MevSession       → login + navegación + mantener sesión por abogado
   ├─ OrganismCatalog  → lee la lista de organismos de un departamento
   ├─ SearchRunner     → recorre organismos, busca carátula, parsea resultados
   ├─ ResultFilter     → filtro palabra-completa (normaliza acentos/case)
   └─ Queue            → concurrencia limitada (2–3 búsquedas simultáneas)
   ▼
Postgres (Prisma)
   ├─ User             → abogados de la app (login propio)
   ├─ MevCredential    → usuario/clave MEV encriptados (por User)
   ├─ Search           → una búsqueda (término, depto, estado, timestamps)
   └─ SearchResult     → coincidencias (carátula, organismo, expte, nidCausa, …)
```

### Unidades (una responsabilidad cada una)
- **MevSession** — dado (credencialesMEV, departamento), logea y deja la sesión lista
  en `busqueda.asp`. Sabe re-loguear si la sesión cayó. No sabe de búsquedas.
- **OrganismCatalog** — lee `select[name=JuzgadoElegido]` → `[{code, name}]`. Entrada:
  una página en `busqueda.asp`. Salida: lista de organismos. Sin estado propio.
- **SearchRunner** — dado (session, término, organismos[]), por cada organismo hace la
  búsqueda por carátula y parsea la tabla → `RawResult[]`. Emite eventos por organismo.
- **ResultFilter** — dado (RawResult[], término), separa en `matches` (palabra completa)
  y `discarded`. Función pura, testeable sin red.
- **Queue** — limita cuántos jobs de scraping corren a la vez.

### Flujo de una búsqueda (SSE)
1. `POST /api/search` con `{ departamento, termino, estado }`. Se crea `Search` en DB
   y se abre stream SSE.
2. El server encola el job. Al arrancar: `MevSession` logea con las credenciales MEV
   del abogado y entra al departamento.
3. `OrganismCatalog` lee los organismos → emite `{ type: "start", total: 23 }`.
4. Por cada organismo: `SearchRunner` busca → `ResultFilter` filtra → emite
   `{ type: "organism", index, name, matches: [...], discardedCount }`.
   - Si MEV devuelve "excede 1000" → emite `{ type: "organism", ..., error: "demasiados
     resultados, agregá más texto" }` y sigue con el resto.
5. Al terminar: `{ type: "done", totalMatches }`. Se persisten `SearchResult`.
6. El frontend, al recibir `done`, dispara `Notification` + reproduce el sonido.

### Filtro palabra-completa
Normaliza carátula y término (minúsculas, sin acentos/diacríticos) y matchea el término
como **palabra suelta** con límites de palabra. Ej. término `lotti`:
- ✅ `lotti juan c/ ...`, `... c/ lotti maria s/ ...`
- ❌ `lancelotti`, `angelotti`, `perlotti`
Los descartados se guardan (`discarded`) y se muestran colapsados por si quieren revisar.

### Detalle de causa (click en un resultado)
Cada resultado enlaza directo a `https://mev.scba.gov.ar/procesales.asp?nidCausa=...&
pidJuzgado=...` (target `_blank`). No se hace fetch ni render propio: si el abogado no
tiene sesión MEV abierta, MEV lo rebota, y eso es aceptado por el estudio.

## 5. Modelo de datos (Prisma, esquema inicial)

- **User**: `id`, `email`, `passwordHash`, `nombre`, `role` (`lawyer|admin`), `createdAt`
- **MevCredential**: `id`, `userId`, `mevUsuario`, `mevClaveEncrypted`,
  `mevDeptoRegistrado`, `updatedAt` — clave encriptada con secreto del server (AES-GCM).
- **Search**: `id`, `userId`, `departamento`, `termino`, `estado`, `status`
  (`running|done|error`), `totalMatches`, `createdAt`, `finishedAt`
- **SearchResult**: `id`, `searchId`, `organismoCode`, `organismoName`, `caratula`,
  `estado`, `receptoria`, `nroExpediente`, `fechaInicio`, `ultimoMovimiento`,
  `nidCausa`, `pidJuzgado`
- **Subscription**: `id`, `userId`, `plan`, `status` (`active|expired|canceled`),
  `startsAt`, `expiresAt`, `createdAt` — un abogado activo tiene `expiresAt` en el futuro;
  los "días restantes" = `expiresAt - hoy`.

## 6. Suscripción mensual y panel de admin

**Modelo:** cada abogado tiene una `Subscription` con `expiresAt`. Al loguearse y al
disparar una búsqueda, el server valida que la suscripción esté `active` y `expiresAt >
hoy`. Si venció, se le muestra un aviso y se bloquea la búsqueda (el login sigue
permitido para que vea su estado).

**Panel de admin** (`role = admin`, ruta `/admin`):
- Tabla de todos los abogados con: nombre, email, estado de suscripción, `expiresAt` y
  **días restantes** (badge en verde/amarillo/rojo según queden > 7 / 1–7 / 0 días).
- Acciones: dar de alta un abogado, renovar/extender suscripción (+30 días), activar/
  desactivar, resetear contraseña.
- Aviso visual de los que están por vencer (≤ 7 días) y los vencidos.
- (Opcional v2) recordatorio automático por email al abogado y al admin cuando faltan
  N días. En v1 el aviso es dentro del panel.

**Cobro:** v1 es gestión manual — el admin renueva los 30 días cuando el estudio paga
(transferencia / MercadoPago por fuera). Integración de pago automático (MercadoPago /
Stripe) queda para v2.

## 7. Estimación de horas y modelo de cobro

Estimación de esfuerzo para el v1 completo (rango bajo–alto según imprevistos):

| Bloque | Horas |
|---|---|
| Setup (Next.js, Tailwind, Prisma, Postgres, Playwright, deploy) | 6–10 |
| Login propio + sesiones + roles | 8–12 |
| Credenciales MEV (encriptado + UI) | 4–6 |
| Motor Playwright (session, catálogo, runner, filtro, cola, reintentos) | 25–40 |
| Progreso en vivo (SSE + lista en vivo + loader/animación) | 12–18 |
| Notificación navegador + sonido | 2–3 |
| Resultados clickeables (link crudo a MEV) | 1 |
| Historial de búsquedas | 4–6 |
| Suscripción + panel de admin | 12–18 |
| Testing (filtro, parser, integración) | 10–15 |
| Deploy, hardening, ajustes, bugfixing | 10–15 |
| Reuniones y revisiones con el cliente | 8–12 |
| **Total** | **~100–155 h** |

**Costos mensuales recurrentes** (a cubrir con la suscripción): hosting + base
(Railway/Fly ≈ USD 20–40/mes) + mantenimiento/soporte + margen. MEV puede cambiar el
HTML sin aviso y romper el scraper → hay un costo real de mantenimiento continuo.

**Modelo de cobro sugerido (a definir con números del usuario):**
- **Setup inicial** (one-time) que cubra las ~100–155 h de desarrollo, **más**
- **Suscripción mensual** por abogado (o por estudio) que cubra hosting + soporte +
  mantenimiento del scraper + margen recurrente.
- El panel de admin habilita/renueva mes a mes según el pago.

## 8. Manejo de errores

- **Credenciales MEV inválidas** → detectar que no llegó a la pantalla post-login →
  marcar `Search` como `error` y avisar al abogado "revisá tus credenciales MEV".
- **Sesión caída a mitad** → `MevSession` re-loguea y reintenta ese organismo (máx N).
- **Timeout / organismo lento** → reintento con backoff; si falla, se registra el
  organismo como fallido en el informe (no aborta toda la búsqueda).
- **"Excede 1000"** → resultado por-organismo con aviso, no corta la búsqueda global.
- **Sin resultados en un organismo** → simplemente 0 coincidencias, no es error.

## 9. Testing

- **ResultFilter**: tests unitarios con los casos reales de la recon (los 20 falsos
  positivos de `LOTTI` deben dar 0 matches; una carátula con `LOTTI` suelto debe matchear).
- **Parser de resultados**: test contra el HTML capturado en la recon (`results_lotti.html`).
- **SearchRunner / MevSession**: test de integración contra MEV con las credenciales de
  prueba, en un solo organismo, detrás de un flag (no en CI por defecto).

## 10. Seguridad

- Credenciales MEV encriptadas en reposo (AES-GCM con clave del server, fuera de la DB).
- Login propio con hash de contraseña (bcrypt/argon2) y sesiones.
- Concurrencia limitada + jitter entre requests para no comportarse como abuso hacia MEV.
- Uso autorizado: cada abogado usa su propia cuenta MEV; el estudio contrató el desarrollo.

## 11. Addendum (2026-07-13) — Autenticación unificada con MEV

Cambio sobre el diseño original de auth:

- **Abogado**: entra a la app con su **usuario y contraseña de MEV** (los mismos del portal) + "Creado en". El backend los **valida en vivo contra MEV** (Playwright) en cada login; si es correcto, guarda la clave **encriptada** (para las búsquedas) y crea la sesión. No hay contraseña propia de la app. Se identifica por su `mevUsuario` (único), que el admin pre-registra.
- **Admin**: login separado en **`/admin/login`** con **email + contraseña** (bcrypt). El admin nunca ve la contraseña MEV (queda encriptada).
- **Alta de abogado** (admin): usuario MEV + nombre + email (opcional). Sin contraseña. El abogado "activa" su acceso en su primer login exitoso (ahí se guarda la clave). El panel muestra estado *Activado* / *Pendiente 1er ingreso*.
- **Modelo**: se fusionó `MevCredential` dentro de `User` (`mevUsuario`, `mevClaveEncrypted`, `mevDeptoRegistrado`, con `email`/`passwordHash` opcionales solo para admin). Migración `20260713174120_auth_mev_login`.
- **Eliminado**: login viejo email+contraseña para abogados, página `/perfil` y `/api/mev-credentials`.
- **Middleware**: `/` redirige según sesión (login / buscar / admin); `/admin/login` público; área admin solo rol admin.
