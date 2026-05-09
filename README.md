# Verificador de noticias

Pipeline de fact-checking en streaming. Pega una URL o un titular en castellano y la app extrae afirmaciones, busca evidencia, analiza el lenguaje y emite un veredicto.

## Estructura

```
.
├── shared/                # Tipos canónicos compartidos (TypeScript)
├── backend/               # Pipeline async + API FastAPI con SSE
└── frontend/              # Angular 21 + Tailwind v4 + NgRx Signal Store
```

El backend y el frontend son sub-proyectos independientes; cada uno tiene su propio gestor de dependencias y se arranca por separado.

El contrato `shared/verification.types.ts` se mantiene como copia espejo manual en `backend/agent/models.py` (pydantic) y en `frontend/src/app/models/verification.types.ts`. Cualquier cambio debe replicarse en los tres archivos.

## Arrancar

Necesitas dos terminales: una para el backend, otra para el frontend.

### Backend (FastAPI + SSE, puerto 8000)

Requisitos: Python 3.11+ y [uv](https://docs.astral.sh/uv/) instalado (`winget install --id=astral-sh.uv` o `irm https://astral.sh/uv/install.ps1 | iex`).

```powershell
cd backend
copy .env.example .env       # rellena ANTHROPIC_API_KEY
uv sync                      # crea .venv y resuelve dependencias
uv run uvicorn api.main:app --reload
```

El servidor escucha en `http://localhost:8000`. Endpoints:

- `GET /api/health` → `{"status":"ok"}`
- `POST /api/verify` → `text/event-stream`. Body: `{"input":"<url o texto ≥10 chars>", "locale":"en|es|pt|fr"}`. `locale` por defecto `en`.

Variables de `.env`:

| Variable            | Default                  | Descripción                         |
| ------------------- | ------------------------ | ----------------------------------- |
| `ANTHROPIC_API_KEY` | _(requerida)_            | Clave de API de Anthropic.          |
| `MODEL`             | `claude-sonnet-4-6`      | Modelo de Claude para las 3 llamadas. |
| `MAX_CLAIMS`        | `5`                      | Tope de claims a evaluar por run.   |

### Frontend (Angular 21, puerto 4200)

```powershell
cd frontend
npm install
npm start
```

La SPA se sirve en `http://localhost:4200`. La URL de la API se configura en `src/environments/environment.ts` (`apiUrl`). El backend debe estar corriendo en paralelo.

### Idiomas

La app es multilingüe (inglés, español, portugués, francés). El idioma se detecta del navegador la primera vez (`navigator.languages`, fallback `en`) y se guarda en `localStorage` tras el primer cambio manual. El selector está arriba a la derecha de la página principal.

El locale activo se envía al backend en cada `POST /api/verify`, y Claude responde en ese idioma para todos los campos free-text (`summary`, `recommendation`, `red_flags`, ejemplos de manipulación, razones de cada claim). Los enums (`severity`, `tone`, `verdict`, `status`) se mantienen en inglés canónico y los traduce el frontend.

## Flujo de verificación

El pipeline emite estos eventos SSE en orden:

```
status(extract) → extracted
status(claims)  → claims
[ status(search) → evidence ] × N      ← una vez por claim
status(language) → language
status(verdict)  → verdict
done
```

Si cualquier paso falla, el pipeline emite un único evento `error` con el `step` en que ocurrió y termina limpio (no devuelve 500 a mitad de stream).
