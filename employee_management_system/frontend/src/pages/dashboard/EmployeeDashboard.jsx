import SharedDashboard from './SharedDashboard'

export default function EmployeeDashboard() {
  return (
    <SharedDashboard
      title="Employee Dashboard"
      badgeClass="employee"
      actionTitle="Account Settings"
      actionDescription="Manage your account preferences"
      actionButtons={[
        { label: 'Change Password (Coming Soon)', disabled: true },
        { label: 'Profile Settings (Coming Soon)', disabled: true },
      ]}
    />
  )
}
