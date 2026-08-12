import { useState, useEffect } from 'react'
import SharedDashboard from './SharedDashboard'
import useAuth from '../../hooks/useAuth'
import StatCard from '../../components/dashboard/StatCard'
import AnalyticsChart from '../../components/dashboard/AnalyticsChart'
import { DASHBOARD_ICONS } from '../../utils/dateUtils'

export default function ManagerDashboard() {
  const { getManagerDashboard } = useAuth()
  const [data, setData] = useState(null)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const dashData = await getManagerDashboard()
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

  const stats = data?.stats || {}
  const analytics = data?.analytics || { tasksByStatus: [], projectsByStatus: [] }

  return (
    <SharedDashboard
      title="Manager Dashboard"
      badgeClass="manager"
      actionTitle="Team Management"
      actionDescription="Overview of your team, projects, and performance analytics"
    >
      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="spinner"><div className="loading" /></div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="stats-grid">
            <StatCard label="Total Employees" value={stats.totalEmployees ?? 0} icon={DASHBOARD_ICONS.employees} accent="blue" />
            <StatCard label="Online Users" value={stats.onlineUsers ?? 0} icon={DASHBOARD_ICONS.online} accent="green" />
            <StatCard label="Active Projects" value={stats.activeProjects ?? 0} icon={DASHBOARD_ICONS.projects} accent="purple" />
            <StatCard label="Pending Tasks" value={stats.pendingTasks ?? 0} icon={DASHBOARD_ICONS.tasks} accent="orange" />
          </div>

          {/* Analytics Charts */}
          <div className="analytics-grid">
            <div className="dashboard-card">
              <AnalyticsChart title="Tasks by Status" data={analytics.tasksByStatus} />
            </div>
            <div className="dashboard-card">
              <AnalyticsChart title="Projects by Status" data={analytics.projectsByStatus} />
            </div>
          </div>

          {/* Team list */}
          {data?.team?.length > 0 && (
            <div className="dashboard-card">
              <h3>Recent Employees</h3>
              <div className="team-list">
                {data.team.map((u) => (
                  <div key={u._id} className="team-item">
                    <div className="team-avatar">{u.name?.charAt(0) || '?'}</div>
                    <div className="team-info">
                      <strong>{u.name}</strong>
                      <span className="text-muted">{u.email}</span>
                    </div>
                    {u.department && <span className="task-tag">{u.department.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Departments (existing) */}
          <DepartmentSection departments={departments} setDepartments={setDepartments} />
        </>
      )}
    </SharedDashboard>
  )
}

function DepartmentSection({ departments, setDepartments }) {
  const { listDepartments } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const deptList = await listDepartments()
        setDepartments(deptList)
      } catch { /* ignore */ }
    }
    load()
  }, [listDepartments, setDepartments])

  return (
    <div className="dashboard-card">
      <h3>Departments</h3>
      {departments.length === 0 ? (
        <p className="text-muted">No departments available</p>
      ) : (
        <div className="dept-list">
          {departments.map((d) => (
            <div key={d._id} className="dept-item">
              <div className="dept-info">
                <strong>{d.name}</strong>
                {d.description && <p className="text-muted">{d.description}</p>}
                {d.head && <p className="text-muted">Head: {d.head.name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
