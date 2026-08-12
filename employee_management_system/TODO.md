# TODO - Fix & Enhance Employee Management System

## Critical Bug Fixes
- [x] 1. Add `/auth/me` endpoint (getCurrentUser controller + route)
- [x] 2. Add `resetLoginAttempts()` method to User model
- [x] 3. Apply `authorize` middleware for role-based access
- [x] 4. Fix register to restrict role (employee only via public registration)
- [x] 5. Make `deviceId` optional in login schema
- [x] 6. Add JWT secret defaults in env.js

## Role-Based Relationships & Models
- [x] 7. Create `Department` model (name, description, head)
- [x] 8. Create `EmployeeProfile` model (user, department, manager, jobTitle)
- [x] 9. Enhance `User` model with department + reportsTo (manager) references
- [x] 10. Admin-only user management APIs (list, update role, assign manager/dept)
- [x] 11. `getCurrentUser` returns populated department/manager

## Frontend ↔ Backend Alignment
- [x] 12. Fix `authInstance.js` (axios-style errors + auto token refresh)
- [x] 13. Remove role selector from RegisterForm (backend forces employee)
- [x] 14. Expose all backend API methods in AuthContext
- [x] 15. AdminDashboard: real user + department management UI
- [x] 16. ManagerDashboard: view departments
- [x] 17. EmployeeDashboard: show profile relationships
- [x] 18. SharedDashboard: display department, manager, job title
- [x] 19. Add CSS for admin table & department management

## Testing
- [x] 20. All 16 API tests pass; frontend build succeeds

## Dashboard
### Manager Dashboard
- [x] 21. Show Total Employees stat
- [x] 22. Show Online Users stat
- [x] 23. Show Active Projects stat
- [x] 24. Show Pending Tasks stat
- [x] 25. Add Analytics Charts

### Employee Dashboard
- [x] 26. Show Assigned Tasks
- [x] 27. Show Notifications
- [x] 28. Show Recent Activity
- [x] 29. Add Calendar view

## User Profile (self-service)
- [x] 30. Allow users to update their own name, email, password, and job title
- [x] 31. Save profile changes to the database (PATCH /auth/me)
- [x] 32. Verify current password before allowing a password change
- [x] 33. Revoke other sessions after a password change for security

## Routing / Auth Guard Fixes
- [x] 34. Add `GuestRoute` so authenticated users are not shown login/register/forgot-password pages
- [x] 35. Show a loader during session restore on refresh (prevents flashing auth pages)
- [x] 36. Redirect authenticated users to their role dashboard when visiting auth pages
