import { useState, useEffect } from 'react'
import SharedDashboard from './SharedDashboard'
import useAuth from '../../hooks/useAuth'
import TaskList from '../../components/dashboard/TaskList'
import NotificationList from '../../components/dashboard/NotificationList'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import MiniCalendar from '../../components/dashboard/MiniCalendar'

export default function EmployeeDashboard() {
  const { getEmployeeDashboard } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const dashData = await getEmployeeDashboard()
      setData(dashData)
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  return (
    <SharedDashboard
      title="Employee Dashboard"
      badgeClass="employee"
      actionTitle="My Work"
      actionDescription="Manage your tasks, notifications, activity, and schedule"
    >
      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="spinner"><div className="loading" /></div>
      ) : (
        <>
          <TaskList tasks={data?.tasks || []} />

          <div className="employee-grid">
            <NotificationList
              notifications={data?.notifications || []}
              unreadCount={data?.unreadCount || 0}
            />
            <ActivityFeed activities={data?.activity || []} />
          </div>

          <MiniCalendar events={data?.calendarEvents || []} />
        </>
      )}
    </SharedDashboard>
  )
}
