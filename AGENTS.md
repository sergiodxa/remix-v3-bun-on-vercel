# Agent Guide

## Stack Overview

- Runs on Bun 1.x deployed to Vercel. The single serverless entry point is `api/index.ts`, wired up through `vercel.json` rewrites.
- Server routing uses `@remix-run/fetch-router` resources that map REST-style actions (`index`, `show`, `create`, `update`, `destroy`) to controllers in `server/controllers`.
- Persistent data lives in `todos.json` and is read/written with `Bun.file` through the `TodoModel` (`server/models/todo.ts`), which also handles filtering, pagination, and zod validation.
- The browser UI is plain JavaScript using `@remix-run/dom`, `@remix-run/events`, and `htm` templates under `public/`. `public/index.html` loads everything with import maps and Tailwind via CDN.

## Bun-First Workflow

- Use `bun install`, `bun run <script>`, `bun <file>`, `bun build`, and `bun test` instead of npm/yarn/pnpm tooling. Bun already loads `.env`.
- Prefer Bun-native APIs (`Bun.file`, `Bun.$`, etc.) over Node equivalents such as `fs` or `child_process`.
- Vercel runs the fetch handler directly, so helpers like `Bun.serve()` are not used here; do not introduce Express or other Node servers.

## Server Conventions

- Define routers in `public/routes.js` with `resources(...)` so both server (`api/index.ts`) and client code share the same URLs.
- Controllers (e.g., `server/controllers/todos.ts`) satisfy `RouteHandlers<typeof routes.resource>` by exporting an object with `handlers` that return `Response` objects. Always set pagination metadata with headers the way `index` currently does.
- Validate inbound data with `zod` before passing it to models. For updates, mirror the pattern that parses optional fields (`title`, `completedAt`) and handles errors with a 400 response.
- Log failures with contextual errors (`console.error(new Error("...", { cause }))`) for easier debugging while keeping responses concise.

## Data Layer Patterns

- `TodoModel` encapsulates all file I/O: call `ensure()` before reads, use `write()` for persistence, and reuse `TodoSchema` from `public/todo.js` to keep server/client types in sync.
- Use `match-sorter` for fuzzy searching and the built-in pagination helper when returning collections. If you add new models, follow the same static-class structure and reuse shared schemas.

## Client Architecture

- Components under `public/components` are `@remix-run/dom` handles. They receive a `this` context with `signal`, `context`, and `update()`—follow the existing pattern when creating new components.
- `TodosClient` (`public/clients/todo.js`) is the single source of truth for network calls. It extends `EventTarget`, defines typed events via `@remix-run/events`, and always merges abort signals with `AbortSignal.any`. New client-side logic should funnel through this class or similar service objects.
- State updates happen through events listened to with `events(model, [...])`. Update the UI by mutating local state and calling `this.update()`. Keep Tailwind utility classes for styling to match the rest of the app.
- Shared contracts live in `public/todo.js` (zod schema + typedef). Reuse these when validating client data.

## Development & Testing

- Install dependencies with `bun install`.
- Run the app locally with `vercel dev`, which serves the static assets in `public/` and the serverless API in `api/`.
- No automated tests exist yet, but when adding them, place them in `tests/` or alongside code and run with `bun test`.

## Contribution Tips

- Stick to modern JS with JSDoc annotations instead of converting files to TypeScript.
- When adding API endpoints, update `public/routes.js`, create a matching controller, and expose any new schemas under `public/` so both the server and client stay in sync.
- Use the event-driven client model—avoid ad-hoc fetches in UI components. Extend `TodosClient` or create sibling clients for new domains.
- Format with Prettier (configured for tabs via `.prettierrc`); keep using `htm` template literals and preserve existing Tailwind class conventions.
