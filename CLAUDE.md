# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Layout

```
.
├── shared/                # Contrato TypeScript canónico (verification.types.ts)
├── backend/               # Pipeline async + FastAPI/SSE (uv + Python 3.11+)
└── frontend/              # Angular 21 + Tailwind v4 + NgRx Signal Store
```

Cada sub-proyecto se arranca por separado. No hay build top-level ni manifest compartido.

`shared/verification.types.ts` es la fuente canónica del contrato backend↔frontend. Se mantiene como **copia espejo manual** en:

- `backend/agent/models.py` (pydantic v2)
- `frontend/src/app/models/verification.types.ts` (mirror TS)

Cualquier cambio debe propagarse a los tres lados.

## Backend (`backend/`)

### Setup & run

```powershell
cd backend
copy .env.example .env       # ANTHROPIC_API_KEY requerida
uv sync
uv run uvicorn api.main:app --reload
```

El servidor escucha en `:8000`. Endpoints en [api/routes.py](backend/api/routes.py): `GET /api/health` y `POST /api/verify` (SSE).

### Arquitectura

Dos paquetes:

- **`agent/`** — pipeline puro. `pipeline.run(entrada)` es un async generator que emite tuplas `(event_type, payload)` en este orden:

  1. `status(extract)` → `extracted`
  2. `status(claims)` → `claims`
  3. Por cada claim: `status(search)` → `evidence`
  4. `status(language)` → `language`
  5. `status(verdict)` → `verdict`
  6. `done`

  Cada paso vive en su propio módulo: [extractor.py](backend/agent/extractor.py), [claims.py](backend/agent/claims.py), [search.py](backend/agent/search.py), [language.py](backend/agent/language.py), [verdict.py](backend/agent/verdict.py). Si cualquier paso lanza, el pipeline emite un único evento `error` con el `step` en curso y termina limpio.

- **`api/`** — capa FastAPI. [main.py](backend/api/main.py) configura CORS para `http://localhost:4200`, [routes.py](backend/api/routes.py) envuelve el async generator en un `StreamingResponse text/event-stream`, [sse.py](backend/api/sse.py) formatea los eventos, [schemas.py](backend/api/schemas.py) valida el body (`{ input, locale }` — URL `^https?://...` o texto ≥10 caracteres; `locale ∈ {en,es,pt,fr}`, default `en`).

### Convenciones

- Cliente Anthropic: `AsyncAnthropic` instanciado una vez en [agent/__init__.py](backend/agent/__init__.py); todas las llamadas son `await`.
- Operaciones bloqueantes (`trafilatura`, `DDGS`) se envuelven en `asyncio.to_thread`.
- `MODEL` y `MAX_CLAIMS` son configurables vía env (defaults `claude-sonnet-4-6` y `5`). El resto de presupuestos (tokens, max_chars) son constantes en `agent/__init__.py`.
- **i18n**: `pipeline.run(input, locale)` propaga `locale ∈ {en,es,pt,fr}` a `claims/language/verdict`. Las llamadas a Claude llevan `Respond in <locale_name>` para los campos free-text; los enums (`severity`, `tone`, `verdict`, `status`) se mantienen en inglés canónico. Los mensajes de eventos `status` se traducen con `status_message(key, locale)` desde `agent/__init__.py`.
- Todas las llamadas a Claude usan un system prompt que pide JSON sin markdown. La respuesta se parsea con `parse_json_response()` (helper en `agent/__init__.py`), que tolera fences ```` ``` ```` y preámbulo recortando del primer `{` al último `}`. Si nada parsea, `JSONDecodeError` → evento `error`.
- Logging con el módulo `logging`, nunca `print`.
- Errores de búsqueda DDG se tragan y devuelven lista vacía (no abortan el pipeline).

## Frontend (`frontend/`)

### Setup & run

```powershell
cd frontend
npm install
npm start          # ng serve → http://localhost:4200
npm run build      # ng build (production por defecto)
npm test           # vitest
```

### Arquitectura

- **Angular 21 standalone, zoneless.** `provideZonelessChangeDetection()` en [app.config.ts](frontend/src/app/app.config.ts). Sin NgModules.
- **Estado:** NgRx Signal Store en [core/stores/verification.store.ts](frontend/src/app/core/stores/verification.store.ts). Estado local en componentes con `signal()` / `computed()`.
- **SSE:** [core/services/sse.service.ts](frontend/src/app/core/services/sse.service.ts) usa `fetch + ReadableStream` (no `EventSource`, porque el endpoint es POST). Devuelve un async generator de eventos tipados.
- **i18n:** [core/i18n/translations.ts](frontend/src/app/core/i18n/translations.ts) tiene el diccionario completo (en/es/pt/fr). [core/i18n/i18n.service.ts](frontend/src/app/core/i18n/i18n.service.ts) expone `locale` como signal, `t(key)` reactivo, y `setLocale(l)` con persistencia en `localStorage`. La detección inicial usa `navigator.languages` con fallback `en`. El componente [shared/ui/locale-switcher](frontend/src/app/shared/ui/locale-switcher/locale-switcher.ts) cambia el locale activo. La store envía `{ input, locale }` al backend con el locale actual.
- **Smart vs presentational:** sólo [features/verify/verify-page.ts](frontend/src/app/features/verify/verify-page.ts) inyecta la store. Los 5 componentes en `features/verify/components/` son presentacionales puros (`input()` / `output()`, `ChangeDetectionStrategy.OnPush`); inyectan el `I18nService` de solo lectura para traducir labels.
- **Primitivas UI** en `shared/ui/` (`badge`, `progress-bar`, `chip`, `skeleton`). Único barril `index.ts` permitido. `locale-switcher` también vive ahí pero no se exporta desde el barril (acoplamiento con i18n).
- **Tailwind v4** vía PostCSS ([postcss.config.json](frontend/postcss.config.json)). El estilo global `src/styles.css` configura el modo oscuro automático con `@custom-variant dark (@media (prefers-color-scheme: dark));`.
- **Iconos:** `lucide-angular` registrado globalmente en `app.config.ts`.

### Convenciones obligatorias

- Control flow `@if` / `@for` / `@switch` siempre. **Nunca** `*ngIf` ni `*ngFor`.
- Inputs/outputs signal-based: `input()`, `input.required()`, `output()`. **Nunca** `@Input` ni `@Output`.
- DI siempre con `inject()`. Sin constructor injection.
- `ChangeDetectionStrategy.OnPush` en todos los componentes.
- `RxJS` solo cuando un signal no baste (en este repo: cero usos).
- TypeScript strict.

### Añadir un locale nuevo

1. Añadir el código a `Locale` en `shared/verification.types.ts` (y mirrors en `frontend/src/app/models/verification.types.ts` y `backend/agent/models.py`).
2. Añadir un nombre humano a `LOCALE_NAMES` en `backend/agent/__init__.py` (lo que Claude verá en el prompt: "Respond in &lt;name&gt;").
3. Añadir las cinco entradas a `STATUS_MESSAGES` (extract / claims / search_with_keywords / language / verdict).
4. Añadir el bloque completo al diccionario `TRANSLATIONS` en `frontend/src/app/core/i18n/translations.ts`. El tipo `as const satisfies Record<Locale, ...>` fuerza al compilador a recordártelo.
