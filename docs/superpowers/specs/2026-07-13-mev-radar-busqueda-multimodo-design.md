# MEV Radar — Búsqueda multi-modo, multi-departamento y login simplificado

**Fecha:** 2026-07-13
**Estado:** Aprobado (pendiente implementación)

## Objetivo

Extender la búsqueda de MEV Radar con tres capacidades:

- **A. Modo de búsqueda:** buscar por **carátula**, **nº de expediente** o **nº de receptoría** (hoy solo carátula).
- **B. Todos los departamentos:** opción de recorrer los 23 departamentos judiciales, no solo el seleccionado.
- **C. Login simplificado:** quitar el campo "Creado en" y loguear siempre con `aa` (TODOS los Deptos).

## Hallazgos de recon (verificados en vivo 2026-07-13)

Formulario de `busqueda.asp` — radios `input[name=radio]` y su campo asociado:

| Modo | Radio (`radio`) | Campo de texto |
|------|-----------------|----------------|
| Carátula | `xCa` | `input[name=caratula]` |
| Nº expediente | `xNc` | `input[name=NCausa]` |
| Nº receptoría | `xNr` | `input[name=NInterno]` |

Otros: `xSb` (set) y `xNs` (novedades) — **fuera de alcance**.

Login (`loguin.asp`), `select[name=DeptoRegistrado]`: la opción **"- TODOS los Deptos" tiene value `aa`**. Verificado: loguear con `aa` valida cualquier usuario y da acceso a los 23 departamentos (navegación a La Plata y San Isidro OK). El `DeptoRegistrado` del login es independiente del departamento donde se busca (`DtoJudElegido`).

## A. Modo de búsqueda

### Backend

`searchOrganism` y `collectOrganismRows` (`src/mev/search-runner.ts`) reciben un nuevo parámetro `modo: 'caratula' | 'expediente' | 'receptoria'`.

```ts
const MODO_FIELD = {
  caratula:   { radio: 'xCa', field: 'caratula' },
  expediente: { radio: 'xNc', field: 'NCausa' },
  receptoria: { radio: 'xNr', field: 'NInterno' },
} as const;
```

En `searchOrganism`: en vez de fijar `xCa` + `caratula`, usa `MODO_FIELD[modo].radio` y `MODO_FIELD[modo].field`. El `input[name=TipoCausa]` (Ac/Ar/Am) se mantiene igual en todos los modos.

### Filtro

El filtro de palabra completa (`filterResults`) existe para descartar substrings en carátulas (caso "LANCELOTTI" cuando buscás "LOTTI"). **Solo aplica en modo `caratula`.**

En modos `expediente`/`receptoria` (búsqueda numérica exacta) **no se filtra**: todas las filas parseadas son matches. `runSearch` decide:

```ts
const { matches, discarded } =
  modo === 'caratula'
    ? filterResults(collected.rows, termino)
    : { matches: collected.rows, discarded: [] };
```

### API

`GET /api/search` agrega el query param `modo` (default `caratula`). Se valida contra los tres valores permitidos.

### UI (`src/app/(app)/buscar/page.tsx`)

- Tres pestañas/radios arriba del campo: **Carátula · Nº expediente · Nº receptoría**.
- El `placeholder`/rótulo del input cambia según el modo: "Búsqueda" (carátula, genérico), "Número de expediente", "Número de receptoría".
- Estado `modo` en el componente; se pasa a `start(...)`.

## B. Todos los departamentos

### UI

- Un checkbox **"Buscar en todos los departamentos"** junto al selector.
- Al tildarlo: el `<select>` de departamento se deshabilita y se muestra un **aviso**: "Se recorren los 23 departamentos. Puede tardar 20-40 minutos."
- Estado `todosLosDeptos: boolean`.

### Backend

`GET /api/search` acepta `todos=1`. Cuando está activo:

- El runner recorre `DEPARTAMENTOS` (los 23) en **serie**.
- Por cada departamento: abre una `MevSession` nueva (login con `aa` + navegación a `depto.code`), corre el barrido de organismos, y la cierra.
- Se abre una sesión por departamento (login ~4s; despreciable frente al barrido). Alternativa descartada por complejidad: reusar sesión vía "Cambiar Jurisdicción".

### Progreso (SSE)

Se agrega la dimensión departamento a los eventos:

- Nuevo evento `department`: `{ index, total, name }` — emitido al empezar cada departamento (con `todos=1`).
- El evento `organism` no cambia de forma; el cliente asocia cada organismo al último `department` recibido.
- `done` reporta `totalMatches` acumulado de todos los departamentos.

Con `todos=1` la barra/loader muestra: "Departamento {index}/{total} · organismo {i}/{n}".

Un único registro `Search` por corrida (con `departamento = 'TODOS'`); los `SearchResult` guardan su `organismoCode`/`organismoName` como hoy (se puede prefijar el nombre del organismo con el departamento para el historial).

## C. Login simplificado

- **UI login (`src/app/login/page.tsx`):** se elimina el `<select>` "Creado en". Quedan usuario + contraseña.
- **API (`src/app/api/auth/mev-login/route.ts`):** ya no recibe `deptoRegistrado`; usa siempre `aa`. Valida contra MEV con `aa` y guarda `mevDeptoRegistrado = 'aa'`.
- `DEPTOS_REGISTRADOS` e `isDeptoRegistrado` quedan sin uso en el login; se pueden dejar o limpiar (decisión de implementación).
- Usuarios existentes: al próximo login se les regraba `mevDeptoRegistrado = 'aa'` automáticamente. Las búsquedas usan `aa`, que ya sabemos que funciona.

## Manejo de errores

- Modo inválido → 400. `todos` sin ser `1`/ausente → se ignora (single depto).
- En modo "todos", si falla el login/barrido de UN departamento, se emite un `organism` con `error` para ese departamento y se continúa con el siguiente (no aborta toda la corrida).
- Aborto del cliente (cerrar pestaña): corta el barrido en curso vía `AbortSignal`, incluyendo el loop de departamentos.

## Testing

- **Unit:** `search-runner` con página falsa — verificar que cada `modo` setea el radio/campo correcto y que el filtro se aplica solo en `caratula`.
- **Integración (flag `MEV_LIVE=1`):** búsqueda por expediente y por receptoría en Morón devuelven filas; búsqueda por carátula en un depto distinto de Morón funciona.
- **Manual:** login sin "Creado en"; toggle "todos los departamentos" con progreso por departamento.

## Fuera de alcance

- Modos `xSb` (set) y `xNs` (novedades).
- Concurrencia entre departamentos (se hace en serie a propósito, para no sobrecargar MEV).
- Búsqueda multi-campo combinada (carátula + expediente a la vez).
