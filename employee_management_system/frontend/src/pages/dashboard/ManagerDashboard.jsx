import SharedDashboard from './SharedDashboard'

export default function ManagerDashboard() {
  return (
    <SharedDashboard
      title="Manager Dashboard"
      badgeClass="manager"
      actionTitle="Team Management"
      actionDescription="Manage your team members here"
      actionButtons={[
        { label: 'View Team (Coming Soon)', disabled: true },
        { label: 'Reports (Coming Soon)', disabled: true },
      ]}
    />
  )
}
