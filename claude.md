# CLAUDE.md

<!--
This file loads into context on EVERY message in this project.
Apply the Golden Test before adding any rule:
"Would removing this cause Claude to make mistakes?" If not — cut it.
Do not restate language defaults Claude already knows. Only write rules
that override defaults or encode decisions specific to this project.
-->

---

# Section A — General Engineering Rules

## 1) Architecture & Separation of Concerns (YOU MUST FOLLOW)

- Follow the project's architecture layer boundaries strictly: presentation → domain → data
- Never bypass layers or mix responsibilities
- UI/presentation layer has ZERO business logic — only rendering, interaction, and state observation
- Business logic lives in the domain layer
- Data access (APIs, databases, storage) lives in the data layer
- Do not introduce new abstractions or patterns without justification

## 2) Shared Code (IMPORTANT)

- Any reusable logic, utility, constant, extension, or helper used in 2+ places goes in `core/`
- Check `core/` before creating new shared code — never duplicate across features

## 3) Error Handling

- Errors flow cleanly across layers — never skip layers
- Handle null, empty, loading, and error states explicitly — no silent failures
- Catch errors at the boundary (data layer), not deep inside business logic

## 4) Change Discipline

- Make the smallest change that solves the problem
- Fix root causes, not symptoms
- Don't refactor unrelated code unless explicitly requested
- Never break existing functionality, APIs, flows, or UX unless explicitly instructed
- Read relevant code before modifying it — state assumptions when unclear

## 5) Dependencies

- Don't add new packages without justification
- Any new package must be: latest stable, well-maintained, production-grade

## 6) Security

- Never hardcode secrets, tokens, or credentials
- Never log sensitive information
- Validate all external and API input
- Proactively flag security risks when spotted

## 7) Testing

- Write tests for domain and data layer logic
- Bug fixes must include a reproducing test
- Tests must be deterministic — no flaky or timing-dependent tests
- One behavior per test case

## 8) Workflow (Mandatory)

- Before marking any task done → run the `/code-review` skill

---

# Section B — MERN Stack Specific Rules

<!--
Rules below only cover things that OVERRIDE defaults or encode project decisions.
Follow Airbnb ESLint config defaults for JS/TS style unless a rule here says otherwise.
-->

## 1) State Management (Frontend)

- Use **Redux Toolkit** for global/shared state — not Context API for business state, not Zustand or Jotai
- Local UI state (toggles, form inputs) may use `useState` — never for server or business data
- Use **RTK Query** for all server state, caching, and data fetching — no raw `useEffect` + `fetch` for API calls
- Keep Redux slices feature-scoped — one slice per feature domain

## 2) Backend Structure

- Follow MVC: `routes/` → `controllers/` → `services/` → `models/`
- Controllers handle HTTP only — extract all business logic into `services/`
- Never write Mongoose queries directly in controllers or routes — all DB access goes in `services/` or a dedicated `repositories/` layer
- Route files only register paths and middleware — no logic

## 3) MongoDB / Mongoose

- Define schemas with strict validation — use `required`, `enum`, `min/max`, and custom validators
- Never use `{ strict: false }` on schemas
- Use lean queries (`.lean()`) for read-only operations to avoid unnecessary Mongoose overhead
- Index fields used in frequent queries — document why each index exists

## 4) Feature Folder Structure

```
features/{feature_name}/
  routes/
  controllers/
  services/
  models/
```

## 5) Error Handling Contract

- Express: use a centralized error-handling middleware — never `res.status(500).send(err)` inline
- All async route handlers must be wrapped with an async error catcher (e.g., `asyncHandler`)
- Services throw typed/structured errors; controllers catch and forward to the error middleware
- Return consistent error response shape: `{ success: false, message: string, code?: string }`

## 6) API Design

- RESTful endpoints — use correct HTTP verbs and status codes
- Validate request body/params with **Zod** or **express-validator** at the route/controller boundary
- Never trust client input — sanitize and validate before passing to services

## 7) Authentication & Security

- Use **JWT** with short-lived access tokens and refresh token rotation — never store tokens in `localStorage` (use `httpOnly` cookies)
- Hash passwords with **bcrypt** (min 12 rounds) — never store plain or weakly hashed passwords
- Protect routes with auth middleware — never check auth inside a service
- Set security headers with **helmet** and enable CORS explicitly
