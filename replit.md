# SkyCast - Weather Application

## Overview

SkyCast (Weather+) is a smart weather web application that provides standard weather forecasts along with personalized recommendations (what to wear, activity scores, etc.). The app allows users to search for cities, save favorites, view detailed weather data with charts, and interact with an AI weather assistant. The UI is multilingual, primarily featuring Kazakh language text.

Key features:
- City search via Open-Meteo geocoding API
- Current weather, hourly (24h), and daily (7-day) forecasts
- Smart insights: clothing recommendations, comfort/activity index
- Favorite cities management
- AI-powered weather assistant chat
- Responsive design with mobile navigation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled with Vite
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support), custom weather-focused color palette
- **Charts**: Recharts for temperature and precipitation visualizations
- **Animations**: Framer Motion for page transitions and weather card animations
- **Date Handling**: date-fns for formatting
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express 5 on Node.js with TypeScript (tsx runner)
- **Architecture**: Monolithic server serving both API and static frontend assets
- **API Pattern**: RESTful endpoints under `/api/` prefix with Zod validation schemas defined in `shared/routes.ts`
- **Weather Data**: Proxied from Open-Meteo free API (no API key needed) — fetches current, hourly, and daily forecast data
- **City Geocoding**: Proxied from Open-Meteo geocoding API for city search
- **AI Assistant**: OpenAI-compatible API (via Replit AI Integrations) for weather Q&A
- **Development**: Vite dev server with HMR middleware in development; static file serving in production
- **Build**: Custom build script using esbuild for server bundling and Vite for client bundling, outputs to `dist/`

### Shared Layer
- `shared/schema.ts` — Drizzle ORM table definitions and Zod schemas (single source of truth for types)
- `shared/routes.ts` — API route contracts with Zod response schemas (used by both client hooks and server routes)

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (connected via `DATABASE_URL` environment variable)
- **Schema Push**: `npm run db:push` uses drizzle-kit to push schema to database
- **Tables**:
  - `cities` — Saved/favorite cities with coordinates, name, country, admin region
  - `conversations` — AI chat conversation metadata
  - `messages` — Individual messages within conversations (user/assistant roles)
- **Storage Layer**: `server/storage.ts` provides a `DatabaseStorage` class implementing `IStorage` interface for city CRUD operations
- **Seeding**: `server/seed.ts` pre-populates default cities (London, New York, Tokyo, Sydney, Almaty, Astana) if database is empty

### Replit Integrations
Located in `server/replit_integrations/` and `client/replit_integrations/`:
- **Chat**: OpenAI-powered conversational AI with conversation persistence
- **Audio**: Voice recording, streaming playback, and speech-to-text capabilities
- **Image**: AI image generation via gpt-image-1
- **Batch**: Batch processing utilities with rate limiting and retries

## External Dependencies

### APIs
- **Open-Meteo Forecast API** (`api.open-meteo.com/v1/forecast`) — Free weather data, no API key required. Provides current conditions, hourly, and daily forecasts
- **Open-Meteo Geocoding API** — City search/autocomplete functionality
- **OpenAI-compatible API** (via Replit AI Integrations) — Powers the weather assistant chatbot. Uses environment variables `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Database
- **PostgreSQL** — Required. Connection string via `DATABASE_URL` environment variable. Uses `connect-pg-simple` for session storage and `pg` Pool for Drizzle ORM

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — API key for AI features (optional, for assistant)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Base URL for AI API (optional, for assistant)

### Key npm Packages
- `drizzle-orm` / `drizzle-kit` / `drizzle-zod` — Database ORM and schema management
- `express` v5 — HTTP server
- `recharts` — Data visualization
- `framer-motion` — Animations
- `wouter` — Client-side routing
- `zod` — Runtime schema validation
- `@tanstack/react-query` — Async state management
- Full shadcn/ui component library with Radix UI primitives