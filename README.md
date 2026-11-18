# Veritas — News fact-checker

Pega una URL o un titular y la app extrae las afirmaciones, busca evidencia en la web abierta, analiza el lenguaje, emite un veredicto calibrado y sugiere medios de confianza para que tú mismo contrastes. Todo en streaming (Server-Sent Events) y en cuatro idiomas (en / es / pt / fr).

## Stack

- **Shared** — TypeScript canónico (`shared/verification.types.ts`).
- **Backend** — Python 3.11+, FastAPI, async pipeline. SSE (`text/event-stream`). LLM intercambiable: Anthropic (Sonnet + Haiku, two-model split) u Ollama local (API compatible con OpenAI). Caché en SQLite (`aiosqlite`).
- **Frontend** — Angular 21 standalone + zoneless, Tailwind v4, NgRx Signal Store, lucide-angular.

## Estructura

```
.
├── shared/                # Tipos canónicos (mirror manual a backend y frontend)
├── backend/
│   ├── api/               # FastAPI: rutas, SSE, schemas
│   ├── agent/             # Pipeline async (extract → claims → search → language → verdict)
│   ├── mock_api.py        # Backend mock standalone (sin tokens)
│   └── pyproject.toml     # Gestionado con uv
└── frontend/
    ├── src/app/           # Angular 21 standalone
    └── package.json
```

`shared/verification.types.ts` es la fuente canónica del contrato. Se replica **a mano** en:

- `backend/agent/models.py` (pydantic v2)
- `frontend/src/app/models/verification.types.ts`

Cualquier cambio se propaga a los tres archivos.

## Arrancar

Necesitas **tres terminales** si quieres trabajar con backend real, mock y frontend simultáneamente. Si solo te interesa diseñar UI sin gastar tokens, basta con mock + frontend.

### Requisitos

- **Python 3.11+** y [`uv`](https://docs.astral.sh/uv/) (`winget install --id=astral-sh.uv` en Windows o `irm https://astral.sh/uv/install.ps1 | iex`).
- **Node.js 20+** y `npm`.
- Una **API key de Anthropic** o un **Ollama** local (sólo para el backend real; ver [Proveedor de LLM](#proveedor-de-llm)).

### 1. Backend real (puerto `:8000`)

```powershell
cd backend
copy .env.example .env       # rellena ANTHROPIC_API_KEY
uv sync                      # crea .venv y resuelve dependencias
uv run uvicorn api.main:app --reload
```

Sirve en `http://localhost:8000`. Llama al LLM configurado y a DuckDuckGo Search; con Anthropic consume tokens. La caché SQLite (`backend/cache.db`) se crea al primer arranque.

### 2. Backend mock (puerto `:8001`) — opcional, sin tokens

Misma API SSE pero con datos hardcodeados. Útil para diseñar la UI o demos sin gastar nada. El veredicto varía con `md5(input) % 4` para que puedas probar los cuatro estados (`true / false / partially_true / unverified`) cambiando el input.

```powershell
cd backend
uv run uvicorn mock_api:app --port 8001 --reload
```

⚠️ **Comprobar antes de probar el real:** `Invoke-WebRequest http://localhost:8000/api/health`. Debe responder `{"status":"ok"}` **sin** campo `mode`. Si responde `{"status":"ok","mode":"mock"}`, has lanzado el mock en `:8000` por error — mátalo y arranca `api.main:app`.

### 3. Frontend (puerto `:4200`)

```powershell
cd frontend
npm install
npm start                    # = ng serve
```

Sirve en `http://localhost:4200`. Por defecto apunta a `:8000` (real). En modo desarrollo (`ng serve`) el frontend muestra un **toggle LIVE / MOCK en el header** (oculto en builds de producción) que cambia entre `:8000` y `:8001` en runtime — se persiste en `localStorage` (`verifier.apiMode`). No hace falta reiniciar nada para alternar, pero los dos backends tienen que estar arriba para que el switch funcione en los dos sentidos.

## Variables de entorno (`backend/.env`)

| Variable               | Default                                       | Descripción                                                              |
| ---------------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| `LLM_PROVIDER`         | `anthropic`                                   | `anthropic` u `ollama`.                                                  |
| `ANTHROPIC_API_KEY`    | _(requerida con Anthropic)_                   | Clave de API de Anthropic.                                               |
| `ANTHROPIC_MODEL`      | `claude-sonnet-4-6`                           | Modelo principal — sólo se usa en el paso de veredicto (el más crítico). |
| `ANTHROPIC_FAST_MODEL` | `claude-haiku-4-5-20251001`                   | Modelo barato — se usa en `claims` y `language`. ~10× más barato.        |
| `OLLAMA_BASE_URL`      | `http://localhost:11434/v1`                   | Endpoint OpenAI-compatible de Ollama.                                    |
| `OLLAMA_MODEL`         | `hf.co/bartowski/Qwen_Qwen3-14B-GGUF:Q4_K_M`  | Modelo local para el veredicto.                                          |
| `OLLAMA_FAST_MODEL`    | `hf.co/bartowski/Qwen_Qwen3-14B-GGUF:Q4_K_M`  | Modelo local para `claims` y `language`.                                 |
| `MAX_CLAIMS`           | `5`                                           | Tope de claims a evaluar por consulta.                                   |
| `CACHE_ENABLED`        | `true`                                        | Activa la caché de resultados completos.                                 |
| `CACHE_DB_PATH`        | `cache.db`                                    | Ruta del SQLite (relativa a `backend/`).                                 |
| `CACHE_TTL_HOURS`      | `168` (7 días)                                | TTL por entrada. Pasado el TTL, miss y se vuelve a verificar.            |

El mock backend ignora todas estas variables.

## Endpoints (real + mock)

| Método | Ruta            | Respuesta                                                                                                       |
| ------ | --------------- | --------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/health`   | `{"status":"ok"}` (real) o `{"status":"ok","mode":"mock"}` (mock).                                              |
| `POST` | `/api/verify`   | `text/event-stream`. Body: `{"input":"<URL o texto ≥10 chars>","locale":"en\|es\|pt\|fr"}`. `locale` default `en`. |

## Flujo SSE

Eventos en este orden (real y mock idénticos):

```
status(extract) → extracted
status(claims)  → claims
[ status(search) → evidence ] × N        ← una vez por claim
status(language) → language
status(verdict)  → verdict
done
```

Si entra una **caché HIT** en el real, en lugar del flujo completo se emite:

```
cached → extracted → claims → evidence × N → language → verdict → done
```

(Sin `status(...)` — el frontend usa `cached` como señal de "salta la animación, ya hay resultado"). Hit cuesta 0 tokens.

Si cualquier paso lanza una excepción, el pipeline emite **un único** evento `error` con el `step` en el que falló y termina limpio (no devuelve 500 a mitad de stream).

## Idiomas

App multilingüe en **en / es / pt / fr**. El idioma inicial se detecta de `navigator.languages` (fallback `en`) y se persiste en `localStorage` cuando el usuario lo cambia desde el selector del header.

El locale activo se manda al backend en cada `POST /api/verify`. Claude responde en ese idioma para los campos free-text (`summary`, `recommendation`, `red_flags`, `reason`, `further_reading[].rationale`, ejemplos del análisis de lenguaje). Los enums (`severity`, `tone`, `verdict`, `status`) se mantienen en inglés canónico y los traduce el frontend.

### Añadir un locale nuevo

1. Añade el código a `Locale` en `shared/verification.types.ts` (y mirrors).
2. Añade el nombre humano a `LOCALE_NAMES` en `backend/agent/__init__.py`.
3. Añade las cinco entradas a `STATUS_MESSAGES` (extract / claims / search_with_keywords / language / verdict).
4. Añade un bloque a `TRUSTED_SOURCES` en `backend/agent/__init__.py` (3-8 medios fiables, mezcla de generalistas y fact-checkers).
5. Añade el bloque completo a `TRANSLATIONS` en `frontend/src/app/core/i18n/translations.ts`. El tipo `as const satisfies Record<Locale, ...>` te avisa en compile time si te dejas claves.

## Caché de resultados

Vive en `backend/cache.db` (SQLite, gitignored). Esquema:

```
verifications (
    input_hash TEXT,           -- sha256(normalize(input))
    locale     TEXT,            -- en / es / pt / fr
    payload    TEXT,            -- JSON con extracted, claims, evidence, language, verdict
    model      TEXT,            -- modelo que produjo el verdict
    created_at INTEGER,         -- unix epoch
    PRIMARY KEY (input_hash, locale)
)
```

`normalize()` colapsa espacios y elimina query strings de tracking comunes (`utm_*`, `fbclid`, `gclid`, etc.) antes del hash, para que dos URLs equivalentes compartan entrada de caché.

Hit = replay instantáneo de los eventos guardados + un `cached` event al inicio con `created_at`, `age_seconds` y `model`. La UI muestra un chip `⚡ cacheado hace 2h` en la verdict-card.

## Coste por consulta

Con la configuración actual (5 claims × 5 fuentes × 400 chars de snippet, two-model split):

| Componente                         | Coste aprox. |
| ---------------------------------- | ------------ |
| `claims` (Haiku)                   | ~$0.002      |
| `language` (Haiku)                 | ~$0.004      |
| `verdict` (Sonnet)                 | ~$0.029      |
| **Total uncached**                 | **~$0.035**  |
| **Cache HIT**                      | **$0.000**   |

Palancas para bajarlo en `backend/agent/__init__.py`: `WEB_SEARCH_MAX_RESULTS`, `SNIPPET_MAX_CHARS`, `MAX_CLAIMS`, `VERDICT_TOKENS`. Cada -1 en results o -100 chars en snippet ahorra ~$0.005.

## Tema oscuro / claro

Toggle manual en el header (system / light / dark). Persiste en `localStorage` (`verifier.theme`). El modo `system` sigue `prefers-color-scheme` con un listener reactivo. Se aplica con la clase `.dark` en `<html>` antes del primer paint (script inline en `index.html`) para evitar flash.

## Tipos compartidos

`shared/verification.types.ts` se considera fuente canónica. Por **contrato del repo**, cualquier cambio en uno de los tres archivos siguientes obliga a propagarlo a los otros dos:

- `shared/verification.types.ts`
- `backend/agent/models.py` (pydantic v2)
- `frontend/src/app/models/verification.types.ts`

No hay generación automática (todavía); queda pendiente investigar `pydantic-to-typescript` o un script `make sync-types` que falle el build si divergen.

## Testing (placeholder)

```powershell
# Frontend
cd frontend
npm test                     # vitest

# Backend — tests aún no escritos
```

## Pitfalls comunes

- **`Failed to fetch` en la UI** — comprueba que ambos backends que necesitas estén arriba. El toggle LIVE/MOCK no levanta nada por ti.
- **Health check del real responde con `"mode":"mock"`** — has lanzado `mock_api:app` en `:8000`. Mata el proceso y arranca `api.main:app`.
- **Cambias `MAX_CLAIMS`, `LLM_PROVIDER` o un `*_MODEL` y no surte efecto** — uvicorn `--reload` no recarga constantes que se evalúan en import. Reinicia el servidor entero (Ctrl+C + relanzar).
- **Cambios en `shared/verification.types.ts` no aparecen en frontend o backend** — son mirrors manuales, hay que copiar a los dos sitios.

## Proveedor de LLM

`LLM_PROVIDER` elige el backend de modelos al arrancar. `agent/__init__.py` expone un único `chat()` que abstrae las dos APIs:

- **`anthropic`** — `AsyncAnthropic`. Haiku para `claims` y `language`, Sonnet para `verdict`.
- **`ollama`** — `AsyncOpenAI` apuntando a `OLLAMA_BASE_URL`. Coste cero; útil para desarrollar con datos reales sin gastar tokens. A los modelos Qwen3 se les añade `/no_think` para que no emitan bloques de razonamiento.

> La caché no distingue proveedor: si cambias de Ollama a Anthropic, borra `cache.db` o desactiva la caché mientras pruebas.

## Decisiones de diseño

- **Pipeline, no agente.** Los pasos son fijos (extraer → claims → buscar → lenguaje → veredicto). Un agente con herramientas y bucle de decisión sería más flexible, pero también más caro, más lento y más difícil de depurar. Para verificar noticias prima la previsibilidad y el coste acotado por consulta.
- **Dos modelos.** El paso que decide (veredicto) usa el modelo bueno; los pasos de extracción, el barato. Reduce el coste ~60-70 % sin tocar la calidad del veredicto.
- **SSE sobre `POST` con `fetch` + `ReadableStream`.** `EventSource` sólo admite `GET` y el input puede ser un texto largo. El usuario ve el progreso paso a paso en lugar de esperar 15-30 s a ciegas.
- **El modelo no inventa enlaces.** `further_reading` se elige de una lista cerrada por idioma (`TRUSTED_SOURCES`) y la URL la pone el backend, nunca el modelo.
- **Grounding.** El prompt del veredicto incluye la fecha actual y obliga a juzgar sólo con la evidencia recogida: sin evidencia → `unverified`, nunca `false` por desconocimiento del modelo. Las fuentes se marcan como `trusted` / `unknown` según `TRUSTED_SOURCES`.
- **Sin autoconfirmación.** Los resultados de búsqueda del mismo dominio que la URL verificada se descartan.
- **Keywords en el idioma del artículo.** El texto de cada claim se muestra en el idioma de la UI, pero las keywords de búsqueda van en el idioma original para encontrar mejor evidencia.
- **Enums canónicos.** `verdict`, `status`, `tone` y `severity` siempre en inglés; la traducción es cosa del frontend. El free-text llega ya en el idioma pedido.
- **Caché por resultado completo.** Una URL o texto ya verificado se reproduce al instante y gratis; la clave normaliza la entrada (tracking params, `www.`, espacios).

## Limitaciones conocidas

Proyecto de portfolio, no desplegado. Antes de abrirlo al público haría falta:

- **SSRF**: el extractor descarga cualquier URL `http(s)`, incluidas direcciones internas. Falta bloquear IPs privadas / loopback / link-local (también tras redirects) y limitar el tamaño de la respuesta.
- **Rate limiting** y control de coste por IP o API key.
- **Prompt injection**: el texto del artículo va al prompt. Se indica al modelo que es contenido no fiable, pero no es una defensa completa.

Y a nivel de calidad de la IA:

- **Salida estructurada nativa** (tool use forzado en Anthropic, JSON schema en Ollama) en lugar de pedir JSON por prompt y parsearlo; los reintentos actuales reenvían el mismo prompt sin el error.
- **Evals**: un conjunto de noticias con veredicto esperado para medir si un cambio de prompt o de modelo mejora o empeora.
- **Evidencia superficial**: el veredicto ve snippets de 400 caracteres sin fecha. El siguiente nivel es leer el texto completo de las fuentes top.
- **Cruce claim ↔ evaluación por texto**: si el modelo reformula la claim en `claim_evaluations`, se pierde su estado en la UI. Debería cruzarse por índice.
- **`confidence`** es la estimación del modelo, no una probabilidad calibrada.
- **Tests**: no hay tests todavía. Los primeros candidatos son las funciones puras: `parse_json_response`, `normalize_input`, los `_sanitize` y el parser SSE del frontend.

## Roadmap

Próximos hitos: salida estructurada nativa y evals, lectura del texto completo de las fuentes top, métricas de tokens por consulta y una página `/v/{hash}` compartible.
