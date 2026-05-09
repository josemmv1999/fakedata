# TODO

Roadmap de mejoras para el verificador de hechos. Las marcas `[x]` son cosas
hechas en esta sesión; el resto está pendiente. Orden = prioridad sugerida.

## Coste por consulta (objetivo: < 1 céntimo)

Línea base ≈ 4 céntimos/consulta con `claude-sonnet-4-6` en los tres pasos.
Palancas, de mayor a menor impacto:

- [x] **Haiku para `claims` y `language`.** Ya hecho: `FAST_MODEL`
  (`claude-haiku-4-5-20251001`) cubre los dos pasos baratos; `MODEL` (sonnet)
  sólo se usa en `verdict`. Reducción esperada: ~60-70%.
- [ ] **Cache de resultados en base de datos.** El mayor ahorro real: si la
  misma URL o headline ya se verificó, devolver el veredicto cacheado y
  saltarse el pipeline entero.
  - Esquema mínimo: `(input_hash, locale, verdict_json, created_at, model)`.
  - Backend: SQLite vía `aiosqlite` o `databases` (dev) → Postgres (prod).
  - Hash: `sha256(normalize(input))` donde `normalize` colapsa espacios y
    quita query strings irrelevantes (`utm_*`, `fbclid`, etc.).
  - TTL: 7 días por defecto, override por env. Refresh asíncrono opcional.
  - Endpoint: `GET /api/verify/{hash}` para enlaces compartibles.
  - UI: chip "verificado hace 2 días" en la tarjeta de veredicto.
- [ ] **Prompt caching de Anthropic** en el system prompt del veredicto
  (es lo más largo y se repite). Marcando `cache_control` se reduce el coste
  de input ~90% en hits.
- [ ] **Reusar la extracción de claims entre locales.** Si llega la misma URL
  en `es` y `en`, el contenido extraído es el mismo: cachear `extracted` y
  `claims` (sin localizar) y sólo regenerar el veredicto en el idioma pedido.
- [ ] **Reducir presupuestos de tokens** una vez tengamos métricas reales.
  Hoy: `CLAIM=512`, `LANGUAGE=512`, `VERDICT=1024`. Probable que el veredicto
  baste con 768.
- [ ] **Búsqueda gratuita.** DDGS ya es gratis. Si añadimos un buscador de
  pago (Brave, Tavily) hacerlo sólo como fallback.
- [ ] **Métricas.** Loguear tokens in/out por paso a una tabla `usage` para
  poder optimizar con datos.

## Caching / persistencia

- [ ] Tabla `verifications` con el resultado completo (extracted, claims,
  evidence, language, verdict). Permite reconstrucción y depuración.
- [ ] Página `/v/{hash}` con un veredicto concreto, compartible. Muy útil
  para SEO y para difusión en redes.
- [ ] "Historial" del usuario en localStorage con los últimos 10 hashes.
- [ ] Cron de invalidación: re-verificar entradas con > 30 días si tienen
  tráfico.

## Backend mock / DX

- [x] **Mock backend en `backend/mock_api.py`.** Sirve la misma API SSE en
  `:8001` con datos hardcodeados. `uv run uvicorn mock_api:app --port 8001
  --reload`. El veredicto varía por hash del input para poder probar los
  cuatro estados (true / false / partially_true / unverified). Cero llamadas
  a Anthropic, cero tokens.
- [ ] Configuration de Angular dedicada (`environment.mock.ts` +
  `npm run start:mock`) para alternar sin editar a mano.
- [ ] Modo "lento" en el mock para depurar estados de carga (sleep mayor).
- [ ] Modo "error" en el mock (`?fail=language`) para probar el render de
  errores por paso.
- [ ] Tests E2E (Playwright) que arranquen el mock y la app y verifiquen
  el flujo completo.

## UX/UI — hacer la web más atractiva

La página funciona pero se siente sobria. Ideas en orden de impacto/esfuerzo:

### Quick wins (1-2 horas cada una)
- [ ] **Header persistente** con logo (texto + icono lucide), enlaces "How it
  works" / "About" / "GitHub", el `LocaleSwitcher` y un toggle dark/light
  manual (hoy es solo `prefers-color-scheme`).
- [ ] **Footer minimalista** con disclaimer ("AI-generated, not legal
  advice"), link a privacidad y créditos.
- [ ] **Animación del input** al enviar: el botón se transforma en un
  indicador de progreso radial mientras se hace el stream.
- [ ] **Contador animado** en la confidence ring (de 0 al valor final, easing
  cubic-out, ~700ms — ya existe la transición del dashoffset, falta el número).
- [ ] **Tooltip enriquecido en chips de fuente** con favicon grande, título
  completo y snippet (hoy es un `title` HTML plano).
- [ ] **Badge de calidad por dominio** en cada chip (verde si reuters/apnews/
  bbc/etc., ámbar si dominio desconocido, rojo si está en blocklist). Lista
  curada en `frontend/src/app/core/domain-reputation.ts`.
- [ ] **Sticky verdict card** en mobile cuando el usuario hace scroll.

### Medianas (medio día cada una)
- [ ] **Galería pública de verificaciones recientes** en la empty-state
  (depende de la cache en BBDD). Da social proof y SEO.
- [ ] **Botón "compartir"** en la verdict-card que copia un enlace `/v/{hash}`
  o genera una imagen Open Graph (verdict + confidence + dominio fuente).
- [ ] **Vista comparativa** "lo que dice el texto vs lo que dicen las
  fuentes", lado a lado.
- [ ] **Export PDF** del veredicto para uso periodístico/educativo.
- [ ] **Onboarding tour** (3 pasos) la primera vez con `localStorage` flag.
- [ ] **Animación de entrada escalonada** de las claims (stagger 80ms entre
  items con `animate-fade-in-up`).

### Grandes (1-3 días cada una)
- [ ] **Extensión de navegador** (Chrome + Firefox) con menú contextual
  "Verificar esta página" sobre cualquier URL.
- [ ] **Embed widget** (iframe + `<script>` snippet) para que medios y blogs
  embeban verificaciones en sus artículos.
- [ ] **Feedback "¿Te ha sido útil?"** (👍 / 👎 + comentario) → tabla
  `feedback` que alimente mejoras del prompt.

### Polish visual fino
- [ ] **Microinteracciones** en hover de las claims (lift sutil, shadow
  acentuado).
- [ ] **Skeleton más rico** para la verdict-card (placeholder del ring +
  líneas de texto).
- [ ] **Mesh gradient animado** en el fondo (movimiento muy lento, 30s loop)
  con respeto a `prefers-reduced-motion`.
- [ ] **Empty state ilustrado**: sustituir el bloque "Try one" por tres
  cards con ilustración (lucide o SVG inline).
- [ ] **Tipografía**: probar `Crimson Pro` o `Newsreader` para `summary` y
  `recommendation` (registro editorial); mantener Fraunces para títulos.

## Mobile polish

- [x] **Overflow horizontal en pantallas pequeñas** corregido: `overflow-x-
  hidden` en el wrapper, `break-words` en h1, summary, red flags,
  recommendation, claims y reason; `min-w-0 flex-1` en spans dentro de
  flex containers.
- [ ] Probar en iPhone SE (375px) y Galaxy Fold (280px abierto).
- [ ] Verdict ring en mobile: hoy es `h-20 w-20`, en pantallas < 360px se
  apreta. Considerar `h-16 w-16` por debajo de `xs`.
- [ ] Header en mobile: el `flex-col-reverse` deja el switcher arriba pero
  pegado al borde. Dar más respiración (`mt-2`).
- [ ] Touch targets ≥ 44px en los chips de claims (hoy `py-1` ≈ 28px).

## Features nuevas

- [ ] **Multi-input**: pegar varios artículos a la vez y comparar veredictos.
- [ ] **Subida de imagen** (OCR) para verificar capturas de redes sociales.
- [ ] **Detección de deepfakes** (paso opcional) si el input es vídeo/imagen.
- [ ] **Watchlist**: el usuario marca un dominio y le notifica cuando se
  publican artículos sospechosos en él.
- [ ] **API pública** con rate limiting + API keys, para periodistas y otros
  servicios.

## Tech debt / quality

- [ ] **Tests backend**: pytest + httpx test client para `/api/verify` con
  el mock pipeline mockeado. Cobertura mínima de los happy paths.
- [ ] **Tests frontend**: vitest + Angular testing utilities para el store
  (transiciones de estado por evento) y el `parseEventChunk` del SSE.
- [ ] **Lint**: ruff en backend, eslint estricto en frontend con
  `prefer-readonly`, `no-floating-promises`.
- [ ] **Pre-commit hooks** (ruff, prettier, tsc).
- [ ] **CI**: GitHub Actions con `uv sync && uv run pytest` y `npm ci &&
  npm run build && npm test`.
- [ ] **Schemas centralizados**: hoy `shared/verification.types.ts` se
  espeja a mano en backend y frontend. Investigar `pydantic-to-typescript`
  o un script `make sync-types` que falle si divergen.

## Deployment

- [ ] **Dockerfile** del backend (multi-stage con uv) y `docker-compose.yml`
  con backend + Postgres.
- [ ] **Frontend**: Cloudflare Pages o Vercel. Build estático Angular.
- [ ] **Backend**: Fly.io / Railway / Render con health check en `/api/health`.
- [ ] **Env vars en producción**: `ANTHROPIC_API_KEY`, `MODEL`, `FAST_MODEL`,
  `MAX_CLAIMS`, `DATABASE_URL`, `CACHE_TTL_HOURS`, `SENTRY_DSN`.
- [ ] **Rate limiting**: `slowapi` o reverse proxy. Crítico antes de abrir al
  público.
- [ ] **CORS**: ahora mismo `allow_origins=["http://localhost:4200"]`. Pasar
  a env var con la URL de producción.
- [ ] **Observabilidad**: Sentry (frontend + backend), métricas de tokens
  por consulta, dashboard básico de uso.
- [ ] **Privacidad / GDPR**: política, consentimiento de cookies si añadimos
  analítica, plazo de retención del cache.
