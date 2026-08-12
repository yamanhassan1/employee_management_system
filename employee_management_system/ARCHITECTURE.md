# Enterprise Project Management System — Architecture

> Phase 1 · TODO #1 · Design scalable project architecture

---

## 1. Business Requirement

We are building a **Jira + Trello + Asana**-style Project Management System (PMS) for enterprise teams. It must support:

- Role-based access: **Admin**, **Manager**, **Employee**
- Departments with heads and reporting lines
- Projects, task lists (Kanban columns), tasks, subtasks, labels, attachments, comments
- Dashboards per role with live stats and analytics
- Notifications and activity feeds
- Real-time collaboration (Socket.IO)
- Queue-based background jobs (emails, cleanup) via BullMQ + Redis
- Search, filtering, sorting, pagination
- File uploads via Cloudinary/S3
- Hardened security and observability

**Scale expectations:** hundreds of concurrent users, thousands of projects/tasks, real-time updates, and low-latency dashboards.

---

## 2. Architecture Overview

We use a **monorepo** with two deployable packages (`backend`, `frontend`) plus shared infra. This keeps DX simple while still allowing independent scaling (the backend can be horizontally scaled behind a load balancer; the frontend is a static build served by a CDN/Nginx).

```
┌────────────────────────────────────────────────────────────────────┐
│                         DNS / Load Balancer                        │
└───────────────┬──────────────────────────────┬─────────────────────┘
                │                              │
        ┌───────▼────────┐             ┌───────▼────────┐
        │  Frontend (SPA) │             │   Backend API   │
        │  React + Vite   │  REST/WS    │  Node + Express │
        │  Nginx/CDN      │◄───────────►│  (scale out)    │
        └───────┬────────┘             └───┬───────┬──────┘
                │                          │       │
                │                          │       │
        ┌───────▼────────┐        ┌────────▼───────▼───────┐
        │   Browser      │        │   Redis (cache+queue)  │
        │  Redux Toolkit │        │   Socket.IO adapter    │
        └────────────────┘        └────────┬───────┬───────┘
                                           │       │
                                  ┌────────▼───────▼───────┐
                                  │        MongoDB         │
                                  │  (primary + replicas)  │
                                  └────────┬───────────────┘
                                           │
                                  ┌────────▼───────────────┐
                                  │  BullMQ Workers         │
                                  │  (email, cleanup, ...)  │
                                  └─────────────────────────┘
```

### Request flow

```
Client ──► Axios instance ──► request interceptor (attach token)
        ──► Express middleware chain:
              helmet → cors → rateLimiter → compression → bodyParser
              → authenticate (JWT) → authorize (role) → validate (Zod)
        ──► Controller (thin) ──► Service (business logic) ──► Repository/Model (data)
        ──► ApiResponse wrapper ──► response interceptor (global error mapping)
```

---

## 3. Directory Structure (Target)

### Backend (layered, dependency-injection friendly)

```
backend/
├── src/
│   ├── app.js                  # Express app assembly
│   ├── server.js               # HTTP + Socket.IO bootstrap
│   ├── config/                 # env, db, redis, cloudinary, logger
│   ├── api/
│   │   ├── routes/             # route definitions (thin)
│   │   ├── controllers/        # request/response only (no business logic)
│   │   ├── middlewares/        # authenticate, authorize, validate, rateLimit...
│   │   └── validations/        # Zod schemas per resource
│   ├── services/               # business logic (auth, project, task, dashboard...)
│   ├── repositories/           # data access layer (Mongoose wrappers)
│   ├── models/                 # Mongoose schemas
│   ├── queues/                 # BullMQ producers/workers (email, cleanup)
│   ├── sockets/                # Socket.IO namespaces/handlers
│   ├── integrations/           # cloudinary, email provider, redis client
│   ├── utils/                  # ApiError, ApiResponse, asyncHandler, logger
│   └── types/                  # shared JSdoc/JSDoc or TS definitions
├── tests/                      # unit + integration
├── docker/
├── .env.example
└── package.json
```

**Why layered?** Controllers stay thin, business logic lives in services, data access lives in repositories. This satisfies SOLID (SRP, DIP) and makes unit testing trivial (mock repositories/services).

### Frontend (feature-sliced)

```
frontend/
├── src/
│   ├── app/                    # Redux store, root reducer
│   ├── features/               # feature modules (auth, projects, tasks, notifications...)
│   │   ├── auth/               #   slice, thunks, selectors, components, pages
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── ...
│   ├── components/             # shared UI (Button, Modal, Input, Table...)
│   ├── hooks/                  # useDebounce, useSocket, usePagination...
│   ├── lib/                    # axios instance, socket client, utils
│   ├── routes/                 # route config + guards
│   ├── styles/                 # Tailwind + global css
│   └── main.jsx
├── tailwind.config.js
├── vite.config.js
└── package.json
```

**Why feature-sliced?** Each feature owns its slice, thunks, selectors, and UI. Teams can work in parallel without merge conflicts, and code is colocated by domain — the industry standard (see Redux official style guide).

---

## 4. Database Design (MongoDB + Mongoose)

### Core entities and relationships

```
User ─┬─ reportsTo ──────────► User (manager)
      ├─ department ─────────► Department
      │
Department ── head ──────────► User
      └─ projects ───────────► Project[]

Project ── owner ────────────► User
        ├─ members ──────────► User[]
        ├─ department ───────► Department
        ├─ lists ────────────► TaskList[]
        ├─ labels ───────────► Label[]
        └─ tasks ────────────► Task[]

Task ── project ─────────────► Project
     ├─ taskList ────────────► TaskList
     ├─ assignedTo ──────────► User
     ├─ createdBy ───────────► User
     ├─ labels ──────────────► Label[]
     ├─ subtasks ────────────► Subtask[]
     ├─ comments ────────────► TaskComment[]
     └─ attachments ─────────► Attachment[]

Notification ── user ─────────► User
ActivityLog  ── user ─────────► User
CalendarEvent─ user ─────────► User
```

### Key schema design decisions

| Entity | Important fields | Indexes |
|---|---|---|
| User | name, email, password(hash, select:false), role, reportsTo, department, jobTitle, isVerified, failedLoginAttempts, lockUntil, lastLoginAt | `email` unique, `role`, `department`, `reportsTo` |
| Session | user, deviceId, userAgent, ip, isRevoked, lastActiveAt | `{user, isRevoked}`, `deviceId` |
| RefreshToken | user, tokenHash, session, expiresAt, revokedAt | `tokenHash` unique, `{user, revokedAt}` |
| Project | name, description, status, startDate, endDate, owner, members[], department | `owner`, `members`, `department`, `status`, `name` (text) |
| TaskList | name, position, project | `{project, position}` |
| Task | title, description, status, priority, dueDate, assignedTo, createdBy, project, taskList, labels[], department, position | `project`, `taskList`, `assignedTo`, `status`, `{project, position}` |
| Label | name, color, project | `{project, name}` |
| Subtask | title, completed, task | `task` |
| TaskComment | content, author, task | `task` |
| Attachment | filename, url, size, mimeType, task, uploadedBy | `task` |
| Notification | user, type, title, message, read, data | `{user, read}`, `{user, createdAt}` |
| ActivityLog | user, action, entityType, entityId, details | `{user, createdAt}`, `entityType` |
| CalendarEvent | user, title, date, description, type | `{user, date}` |

**Optimization notes**
- Compound indexes match the most common query patterns (e.g. `{project, position}` for Kanban ordering).
- `select: false` on `password` prevents accidental leakage.
- Use `lean()` for read-only hot paths.
- Consider TTL index on `RefreshToken.expiresAt` for automatic cleanup.

---

## 5. REST API Design

Uniform envelope (already in codebase):

```json
{ "success": true, "statusCode": 200, "message": "...", "data": { } }
```

Errors:

```json
{ "success": false, "statusCode": 404, "message": "Project not found", "errors": null }
```

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /api/v1/auth/register | public | Register employee |
| POST | /api/v1/auth/login | public | Login |
| POST | /api/v1/auth/refresh | public | Rotate refresh token |
| POST | /api/v1/auth/logout | auth | Logout current device |
| POST | /api/v1/auth/logout-all | auth | Logout all devices |
| GET | /api/v1/auth/me | auth | Current user profile |
| GET/PATCH | /api/v1/users | admin | List/update users |
| GET/POST | /api/v1/departments | admin/manager | Departments |
| GET | /api/v1/dashboard/manager | manager/admin | Manager stats |
| GET | /api/v1/dashboard/employee | auth | Employee stats |
| GET/POST | /api/v1/projects | auth | List/create projects |
| GET/PATCH/DELETE | /api/v1/projects/:id | member/owner/admin | Project CRUD |
| POST | /api/v1/projects/:id/lists | member/owner/admin | Add column |
| POST | /api/v1/projects/:id/tasks | member/owner/admin | Add task |
| PATCH | /api/v1/tasks/:taskId/move | member/owner/admin | DnD move |
| GET/PATCH/DELETE | /api/v1/tasks/:taskId | member/owner/admin | Task detail/update/delete |
| POST/DELETE | /api/v1/tasks/:taskId/subtasks | member/owner/admin | Subtasks |
| POST/DELETE | /api/v1/tasks/:taskId/comments | member/owner/admin | Comments |
| POST/DELETE | /api/v1/tasks/:taskId/attachments | member/owner/admin | Attachments |
| GET/PATCH | /api/v1/notifications | auth | Notifications |
| GET/POST/DELETE | /api/v1/calendar | auth | Calendar events |

**REST principles**
- Nouns, not verbs (`/tasks/:id/move` is the one exception as an action).
- HTTP semantics: GET read, POST create, PATCH partial update, DELETE remove.
- Pagination via `?page=&limit=`; filtering via `?status=&priority=`; search via `?search=`.
- All mutations validated by Zod schemas before reaching controllers.

---

## 6. Backend Implementation Strategy

- **Express + Mongoose** with a **service layer**. Controllers parse/respond; services orchestrate; repositories query.
- **Zod** schemas for every payload — applied via a `validate(schema)` middleware.
- **Central error handler** converting known `ApiError`s and unknown errors into the uniform envelope.
- **asyncHandler** wraps async controllers so thrown errors reach the error handler.
- **JWT access token** (short-lived, in memory) + **refresh token** (HTTP-only cookie) with rotation + reuse detection.
- **BullMQ** workers for emails (welcome, verification, password reset) and scheduled cleanup (expired refresh tokens, stale sessions).
- **Socket.IO** for real-time notifications and board sync (rooms per project).
- **Redis** for caching dashboard aggregates, online-user tracking (sorted set), and rate limiting.

---

## 7. Frontend Implementation Strategy

- **React + Vite + Tailwind CSS** for styling (utility-first, consistent design tokens).
- **Redux Toolkit** with **RTK Query** for server state and `createSlice` for local UI state:
  - Auth slice (user, tokens, status)
  - Entities normalized: `projects.byId`, `tasks.byId`, `lists.byId`
  - Memoized selectors via `createSelector`
- **Axios instance** with interceptors for token injection, 401 refresh-and-retry, and global error mapping.
- **React Hook Form + Zod** for forms (register, login, project/task create/edit).
- **Lazy loading** via `React.lazy` + `Suspense` per route.
- Reusable UI components (Modal, Button, Input, Badge, Table, StatCard, Chart).

---

## 8. Redux Toolkit State Design

```
store
├── auth             (user, status, error)
├── api              (RTK Query cached server state)
│   ├── projectsApi
│   ├── tasksApi
│   ├── notificationsApi
│   └── usersApi
├── projects         (normalized entities: byId, listIds, status)
├── tasks            (normalized entities: byId, listIds)
├── notifications    (unreadCount, items)
├── ui               (theme, modals, toasts)
└── search           (query, filters, pagination)
```

**Normalization** avoids nested duplication and makes updates O(1). **Selectors** derived with `createSelector` are memoized, so React only re-renders when relevant data changes.

---

## 9. Axios Integration

- One `axios.create({ baseURL, withCredentials: true })` instance.
- **Request interceptor**: attach `Authorization: Bearer <accessToken>`.
- **Response interceptor**: on `401`, attempt refresh once via a shared promise (deduped), retry the original request; on failure, dispatch `logout`.
- **Cancellation**: `AbortController` per request; RTK Query provides built-in cancellation for stale queries.
- **Global error handling**: map network/4xx/5xx to user-friendly toasts via a listener middleware.

---

## 10. Redis Usage

| Use case | Structure |
|---|---|
| Dashboard stats cache | `GET dashboard:manager:{userId}` JSON, TTL 60s |
| Project details cache | `project:{id}` JSON, invalidate on write |
| Online users | Sorted set `online_users` score=lastSeen; or set per room |
| Session store | `session:{deviceId}` |
| OTP / email tokens | `otp:{email}` TTL 10 min |
| Rate limiting | INCR + EXPIRE sliding window |
| BullMQ | Queue `email-queue`, `cleanup-queue` |

---

## 11. Security Considerations

- **Helmet** sets secure HTTP headers.
- **CORS** restricted to the frontend origin with `credentials: true`.
- **JWT** short-lived access + rotating refresh tokens in HTTP-only, `SameSite=Lax`, `Secure` cookies.
- **Zod** validation on every payload (prevents NoSQL injection via type-safe casting).
- **Rate limiting** (Redis-based) on auth + general APIs.
- **Input sanitization** (strip HTML, escape) to prevent XSS.
- **`select: false`** for sensitive fields; never log passwords/tokens.
- **Role-based authorization** middleware at route level.
- **Audit logging** for admin actions.

---

## 12. Performance Optimizations

- MongoDB compound indexes tuned to query patterns.
- `lean()` + projection on hot read paths.
- Redis caching for expensive dashboard aggregates.
- Pagination everywhere (no unbounded `find()`).
- Gzip/compression middleware on the API.
- Frontend code-splitting + lazy routes.
- Socket.IO room-based fan-out (only members of a project receive its events).
- Debounced search (frontend) + server-side text indexes.

---

## 13. Common Mistakes to Avoid

1. Putting business logic in controllers (hard to test, duplicated).
2. Not indexing the queries you actually run (full collection scans).
3. Storing refresh tokens in `localStorage` (XSS risk) — use HTTP-only cookies.
4. Blocking the event loop with heavy sync work in handlers.
5. Returning entire user objects (password leakage).
6. Forgetting pagination on list endpoints.
7. Unbounded `populate` chains (N+1 / huge payloads).
8. Not invalidating Redis cache on writes.
9. Optimistic UI without rollback on failure.
10. Skipping validation "because the frontend validates too."

---

## 14. Interview Questions (Phase 1)

1. Why separate controllers, services, and repositories?
2. How would you scale a Node/Express API horizontally with WebSockets (sticky sessions vs Socket.IO Redis adapter)?
3. When would you choose MongoDB over PostgreSQL for a PMS?
4. How do you design compound indexes? Give an example for a Kanban board.
5. What is refresh-token rotation and how does it prevent replay attacks?
6. How does RTK Query differ from writing manual thunks?
7. How do you prevent NoSQL injection in Mongoose?
8. How would you implement optimistic UI with rollback for drag-and-drop?
9. What caching strategy would you use for a manager dashboard?
10. How do you secure HTTP-only cookies (flags) and prevent CSRF?

---

## Next TODO

> Phase 1 · **Create backend folder structure** — scaffold the layered backend layout (config, api/routes, api/controllers, api/middlewares, api/validations, services, repositories, models, queues, sockets, integrations, utils).

Say **"next"** to proceed.

