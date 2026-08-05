import { ROLE_DASHBOARD_ROUTE } from './constants'

export function getDashboardRoute(role) {
  return ROLE_DASHBOARD_ROUTE[role] || ROLE_DASHBOARD_ROUTE.employee
}
