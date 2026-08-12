# Sockets (Socket.IO)

Real-time collaboration layer.

## Why this folder exists

Dashboards, Kanban boards, and notifications need live updates. Socket.IO
pushes events from the server to subscribed clients instead of polling.

## Planned namespaces & events

| Namespace | Events | Purpose |
|---|---|---|
| `/notifications` | `notification:new`, `notification:read` | Push unread-count updates |
| `/projects` | `board:changed`, `task:moved`, `task:updated` | Live Kanban sync per project room |

## File layout

```
sockets/
├── index.js              # Socket.IO server bootstrap (attach to HTTP server)
├── auth.js               # Middleware: JWT → socket.data.user
├── notifications.namespace.js
└── projects.namespace.js
```

## Auth flow

```
Client connects  ──►  handshake auth { token }
        │
        ▼
socket.io middleware (auth.js) verifies JWT
        │
        ▼
socket.data.user = { id, role }   (room join allowed)
```

## Room strategy

- Each project is a room named `project:{id}`.
- Only project members join the room → efficient fan-out (no global broadcast).
- Notifications are per-user rooms `user:{id}`.

## Status

> Scaffolded. Socket.IO dependency + handlers are added in the
> **Notifications** phase (TODO Phase 11).
