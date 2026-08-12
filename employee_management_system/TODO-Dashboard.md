# Dashboard Feature - Implementation Tracking

## Backend: Models (with relations)
- [x] 1. Create `Task` model (assignedTo -> User, createdBy -> User, project ref)
- [x] 2. Create `Project` model (owner -> User, members -> User[], department ref)
- [x] 3. Create `Notification` model (user -> User)
- [x] 4. Create `ActivityLog` model (user -> User)
- [x] 5. Create `CalendarEvent` model (user -> User)

## Project Management Module (Projects → Task Lists → Tasks → Subtasks/Labels/Attachments/Comments)
- [x] 6. Backend models: taskList, subtask, taskComment, attachment, label; task.model enhanced (labels, taskList, priority, status)
- [x] 7. Backend controller: project.controller.js (full CRUD projects, lists, tasks, subtasks, labels, comments, attachments)
- [x] 8. Backend routes: project.routes.js (registered in routes/index.js under /projects)
- [x] 9. Route ordering fixed: static /tasks, /task-lists, /subtasks, /comments, /attachments, /labels before /:id
- [x] 10. Verify backend syntax (controller, routes, index all pass node --check)

## Frontend: API Layer
- [x] 11. Add project endpoints to `constants.js`
- [x] 12. Add project methods to `authInstance.js`
- [x] 13. Expose project methods in `AuthContext.jsx`

## Frontend: Pages
- [x] 14. Create `ProjectsPage` (project list + create project modal + delete)
- [x] 15. Create `ProjectBoard` (kanban: task lists, tasks, task modal with subtasks/labels/comments/attachments/priority/status)
- [x] 16. Wire routes in `AppRoutes.jsx` (/projects, /projects/:id)
- [x] 17. Add Projects link in `Navbar.jsx`
- [x] 18. Add CSS for project pages, board, modals, task detail

## Verification
- [x] 19. Frontend build succeeds (56 modules, no errors)

## Drag & Drop (Trello-like)
- [x] 20. Backend: add `moveTask` controller (update taskList + position + status on drop)
- [x] 21. Backend: add `PATCH /tasks/:taskId/move` route (before /:id)
- [x] 22. Frontend: add `moveTask` to constants.js, authInstance.js, AuthContext.jsx
- [x] 23. Frontend: native HTML5 drag-and-drop on task cards + board columns
- [x] 24. Frontend: optimistic UI update + persist to DB on every drop
- [x] 25. Backend: status auto-mapping from list name (Todo→pending, In Progress→in_progress, Testing→in_review, Completed→completed)
- [x] 26. CSS for drag states (dragging, drop-highlight)
- [x] 27. Verify backend syntax + frontend build
</content>
