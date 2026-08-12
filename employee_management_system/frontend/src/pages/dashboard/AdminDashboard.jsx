import { useState, useEffect } from 'react'
import SharedDashboard from './SharedDashboard'
import useAuth from '../../hooks/useAuth'
import { ROLES } from '../../utils/constants'

export default function AdminDashboard() {
  const { listUsers, updateUserRole, updateUserManager, updateUserDepartment, listDepartments, createDepartment, deleteDepartment } = useAuth()
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)

const [newDeptName, setNewDeptName] = useState('')
  const [newDeptDesc, setNewDeptDesc] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [userList, deptList] = await Promise.all([listUsers(), listDepartments()])
      setUsers(userList)
      setDepartments(deptList)
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, { role })
      setMsg('Role updated')
      loadData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update role')
    }
  }

  const handleManagerChange = async (userId, managerId) => {
    try {
      await updateUserManager(userId, { managerId })
      setMsg('Manager assigned')
      loadData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to assign manager')
    }
  }

  const handleDepartmentChange = async (userId, departmentId) => {
    try {
      await updateUserDepartment(userId, { departmentId })
      setMsg('Department assigned')
      loadData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to assign department')
    }
  }

  const handleCreateDepartment = async (e) => {
    e.preventDefault()
    try {
      await createDepartment({ name: newDeptName, description: newDeptDesc })
      setNewDeptName('')
      setNewDeptDesc('')
      setMsg('Department created')
      loadData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create department')
    }
  }

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Delete this department? Users will be detached.')) return
    try {
      await deleteDepartment(deptId)
      setMsg('Department deleted')
      loadData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete department')
    }
  }

  // Users eligible to be a manager (manager/admin)
  const potentialManagers = users.filter((u) => u.role === 'manager' || u.role === 'admin')

  return (
    <SharedDashboard
      title="Admin Dashboard"
      badgeClass="admin"
      actionTitle="Admin Actions"
      actionDescription="Manage users, roles, and departments"
    >
      <div className="dashboard-card">
        <h3>User Management</h3>
        {msg && <div className="form-msg">{msg}</div>}
        {error && <div className="form-error">{error}</div>}
        {loading ? (
          <p className="text-muted">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-muted">No users found</p>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Manager</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={u.department?._id || ''} onChange={(e) => handleDepartmentChange(u._id, e.target.value)}>
                        <option value="">— None —</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={u.reportsTo?._id || ''} onChange={(e) => handleManagerChange(u._id, e.target.value)}>
                        <option value="">— None —</option>
                        {potentialManagers.map((m) => (
                          <option key={m._id} value={m._id}>{m.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className="user-email">{u.isVerified ? 'Verified' : 'Unverified'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-card">
        <h3>Departments</h3>
        {departments.length === 0 ? (
          <p className="text-muted">No departments yet</p>
        ) : (
          <div className="dept-list">
            {departments.map((d) => (
              <div key={d._id} className="dept-item">
                <div className="dept-info">
                  <strong>{d.name}</strong>
                  {d.description && <p className="text-muted">{d.description}</p>}
                  {d.head && <p className="text-muted">Head: {d.head.name}</p>}
                </div>
                <button onClick={() => handleDeleteDepartment(d._id)} className="btn small danger">Delete</button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleCreateDepartment} className="dept-form">
          <input
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="Department name"
            required
          />
          <input
            value={newDeptDesc}
            onChange={(e) => setNewDeptDesc(e.target.value)}
            placeholder="Description (optional)"
          />
          <button type="submit" className="btn primary">Create Department</button>
        </form>
      </div>
    </SharedDashboard>
  )
}
