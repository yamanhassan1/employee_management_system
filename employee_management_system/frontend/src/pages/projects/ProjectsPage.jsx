import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import useAuth from '../../hooks/useAuth'

const STATUS_COLORS = {
  active: '#22c55e',
  completed: '#6366f1',
  on_hold: '#f59e0b',
  cancelled: '#ef4444',
}

export default function ProjectsPage() {
const { listProjects, createProject, deleteProject } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)

  // Create modal state
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', status: 'active' })

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await listProjects()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      await createProject({ name: form.name, description: form.description, status: form.status })
      setMsg('Project created')
      setShowCreate(false)
      setForm({ name: '', description: '', status: 'active' })
      loadProjects()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create project')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? All tasks, lists, labels, comments and attachments will be permanently removed.')) return
    try {
      await deleteProject(id)
      setMsg('Project deleted')
      loadProjects()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete project')
    }
  }

  const openBoard = (id) => navigate(`/projects/${id}`)

  return (
    <div className="page-container">
      <Navbar />
      <main className="page-main">
        <div className="projects-header">
          <div>
            <h1 className="projects-title">Projects</h1>
            <p className="text-muted">Manage your projects, boards, and tasks.</p>
          </div>
          <button className="btn primary" style={{ width: 'auto', marginTop: 0 }} onClick={() => setShowCreate(true)}>
            + New Project
          </button>
        </div>

        {msg && <div className="form-msg">{msg}</div>}
        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <div className="spinner"><span className="loading" /></div>
        ) : projects.length === 0 ? (
          <div className="dashboard-card empty-state">
            <p className="text-muted">No projects yet. Create your first project to get started.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((p) => (
              <div key={p._id} className="project-card" onClick={() => openBoard(p._id)}>
                <div className="project-card-top">
                  <span className="project-status" style={{ background: STATUS_COLORS[p.status] || '#6366f1' }}>
                    {p.status?.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="project-card-title">{p.name}</h3>
                <p className="project-card-desc">{p.description || 'No description'}</p>
                <div className="project-card-meta">
                  {p.department && <span className="project-tag">{p.department.name}</span>}
                  <span className="project-members-count">{p.members?.length || 0} members</span>
                </div>
                <div className="project-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn small" onClick={() => openBoard(p._id)}>Open</button>
                  <button className="btn small danger" onClick={() => handleDelete(p._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Project</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                  placeholder="What is this project about?"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button type="submit" className="btn primary">Create Project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
