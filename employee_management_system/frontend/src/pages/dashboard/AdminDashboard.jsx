import SharedDashboard from './SharedDashboard'

export default function AdminDashboard() {
  return (
    <SharedDashboard
      title="Admin Dashboard"
      badgeClass="admin"
      actionTitle="Admin Actions"
      actionDescription="Admin-specific management tools go here"
      actionButtons={[
        { label: 'Create User (Coming Soon)', disabled: true },
        { label: 'Manage Roles (Coming Soon)', disabled: true },
      ]}
    />
  )
}
