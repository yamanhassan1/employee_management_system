# Queues (BullMQ)

Background job processing powered by [BullMQ](https://docs.bullmq.io/) + Redis.

## Why this folder exists

Long-running or fire-and-forget work must NEVER block the Express request
lifecycle. Queues decouple the API from side effects (email sending, cleanup,
notifications) so the API stays fast and resilient.

## Queues planned

| Queue | Purpose | Worker |
|---|---|---|
| `email-queue` | Welcome, verification, password-reset emails | `workers/email.worker.js` |
| `cleanup-queue` | Expired refresh tokens, stale sessions, orphaned files | `workers/cleanup.worker.js` |
| `notification-queue` | Fanned-out real-time notifications | `workers/notification.worker.js` |

## File layout

```
queues/
├── index.js              # Queue registry + exports
├── producers/
│   ├── email.producer.js
│   ├── cleanup.producer.js
│   └── notification.producer.js
└── workers/
    ├── email.worker.js
    ├── cleanup.worker.js
    └── notification.worker.js
```

## Usage pattern

Producer (in a service):

```js
const { emailQueue } = require('../queues');
await emailQueue.add('send-welcome', { userId, email }, { attempts: 3, backoff: 5000 });
```

Worker (separate process):

```js
const { emailQueue } = require('../queues');
emailQueue.process('send-welcome', async (job) => { /* send email */ });
```

## Best practices

- Use `attempts` + `backoff` for transient failures.
- Keep jobs idempotent (safe to re-run).
- Store only IDs in the job payload, not full documents.
- Monitor queue length and failed-job rates in production.

## Status

> Scaffolded. BullMQ dependency + concrete producers/workers are added in the
> **Redis & BullMQ** phase (TODO Phase 8).
