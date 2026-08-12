// Format a date as a relative string (e.g., "2 hours ago")
export function toRelativeString(dateStr) {
  const date = new Date(dateStr)
  const now = Date.now()
  const diff = now - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return date.toLocaleDateString()
}

export const DASHBOARD_ICONS = {
  employees: '👥',
  online: '🟢',
  projects: '📁',
  tasks: '✅',
  notifications: '🔔',
  activity: '📊',
  calendar: '📅',
}
