import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import useAuth from '../../hooks/useAuth'

const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' }
const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', in_review: 'In Review', completed: 'Completed' }
const PRIORITY_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' }

// Infer a task status from the target list name (mirrors backend STATUS_BY_LIST)
const INFER_STATUS = {
  todo: 'pending',
  'to do': 'pending',
  pending: 'pending',
  'in progress': 'in_progress',
  in_progress: 'in_progress',
  progress: 'in_progress',
  testing: 'in_review',
  'in review': 'in_review',
  in_review: 'in_review',
  'code review': 'in_review',
  review: 'in_review',
  completed: 'completed',
  done: 'completed',
  finished: 'completed',
}

function inferStatus(listId, lists = []) {
  const list = lists.find((l) => l._id === listId)
  if (!list?.name) return null
  return INFER_STATUS[list.name.trim().toLowerCase()] || null
}

function TaskModal({ task, labels, onClose, onUpdated, onDeleted }) {
  const { getTask, updateTask, createSubtask, updateSubtask, deleteSubtask, createComment, deleteComment, createAttachment, deleteAttachment, user } = useAuth()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newSubtask, setNewSubtask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [newAttachment, setNewAttachment] = useState('')

  const loadDetail = async () => {
    try {
      setLoading(true)
      const data = await getTask(task._id)
      setDetail(data)
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load task')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDetail() }, [task._id])

  const updateField = async (payload) => {
    try {
      await updateTask(task._id, payload)
      await loadDetail()
      onUpdated()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update task')
    }
  }

  const addSubtask = async (e) => {
    e.preventDefault()
    if (!newSubtask.trim()) return
    try {
      await createSubtask(task._id, { title: newSubtask })
      setNewSubtask('')
      loadDetail()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add subtask')
    }
  }

  const toggleSubtask = async (st) => {
    try {
      await updateSubtask(st._id, { completed: !st.completed })
      loadDetail()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update subtask')
    }
  }

  const removeSubtask = async (id) => {
    try {
      await deleteSubtask(id)
      loadDetail()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete subtask')
    }
  }

  const addComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      await createComment(task._id, { content: newComment })
      setNewComment('')
      loadDetail()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add comment')
    }
  }

  const removeComment = async (id) => {
    try {
      await deleteComment(id)
      loadDetail()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete comment')
    }
  }

  const addAttachment = async (e) => {
    e.preventDefault()
    if (!newAttachment.trim()) return
    try {
      await createAttachment(task._id, { filename: newAttachment.split('/').pop() || newAttachment, url: newAttachment })
      setNewAttachment('')
      loadDetail()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add attachment')
    }
  }

  const removeAttachment = async (id) => {
    try {
      await deleteAttachment(id)
      loadDetail()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete attachment')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task and all its subtasks, comments and attachments?')) return
    try {
      await onDeleted()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete task')
    }
  }

  const toggleLabel = async (labelId) => {
    const current = (detail?.task?.labels || []).map((l) => (typeof l === 'string' ? l : l._id))
    const has = current.includes(labelId)
    const next = has ? current.filter((id) => id !== labelId) : [...current, labelId]
    await updateField({ labels: next })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task.title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        {loading ? <div className="spinner"><span className="loading" /></div> : detail && (
          <div className="task-detail">
            <div className="task-detail-grid">
              <div className="task-detail-main">
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    defaultValue={detail.task.description}
                    onBlur={(e) => { if (e.target.value !== detail.task.description) updateField({ description: e.target.value }) }}
                    rows="3"
                  />
                </div>

                <h4>Labels</h4>
                <div className="label-picker">
                  {labels.map((l) => {
                    const active = (detail.task.labels || []).some((x) => (typeof x === 'string' ? x : x._id) === l._id)
                    return (
                      <button
                        key={l._id}
                        type="button"
                        className={`label-chip ${active ? 'active' : ''}`}
                        style={{ borderColor: l.color, color: l.color }}
                        onClick={() => toggleLabel(l._id)}
                      >
                        {l.name}
                      </button>
                    )
                  })}
                </div>

                <h4>Subtasks</h4>
                <div className="subtask-list">
                  {detail.subtasks.length === 0 && <p className="text-muted">No subtasks</p>}
                  {detail.subtasks.map((st) => (
                    <div key={st._id} className="subtask-item">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(st)} />
                        <span style={{ textDecoration: st.completed ? 'line-through' : 'none' }}>{st.title}</span>
                      </label>
                      <button className="btn small danger" onClick={() => removeSubtask(st._id)}>×</button>
                    </div>
                  ))}
                  <form onSubmit={addSubtask} className="inline-form">
                    <input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add a subtask..." />
                    <button className="btn small" type="submit">Add</button>
                  </form>
                </div>

                <h4>Attachments</h4>
                <div className="attachment-list">
                  {detail.attachments.length === 0 && <p className="text-muted">No attachments</p>}
                  {detail.attachments.map((a) => (
                    <div key={a._id} className="attachment-item">
                      <a href={a.url} target="_blank" rel="noreferrer">{a.filename}</a>
                      <button className="btn small danger" onClick={() => removeAttachment(a._id)}>×</button>
                    </div>
                  ))}
                  <form onSubmit={addAttachment} className="inline-form">
                    <input value={newAttachment} onChange={(e) => setNewAttachment(e.target.value)} placeholder="Paste attachment URL..." />
                    <button className="btn small" type="submit">Add</button>
                  </form>
                </div>

                <h4>Comments</h4>
                <div className="comment-list">
                  {detail.comments.length === 0 && <p className="text-muted">No comments</p>}
                  {detail.comments.map((c) => (
                    <div key={c._id} className="comment-item">
                      <div className="comment-meta">
                        <strong>{c.author?.name || 'Unknown'}</strong>
                        <span>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p>{c.content}</p>
                      {(c.author?._id === user?._id || user?.role === 'admin') && (
                        <button className="btn small danger" onClick={() => removeComment(c._id)}>Delete</button>
                      )}
                    </div>
                  ))}
                  <form onSubmit={addComment} className="inline-form">
                    <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." />
                    <button className="btn small" type="submit">Post</button>
                  </form>
                </div>
              </div>

              <div className="task-detail-side">
                <div className="form-group">
                  <label>Status</label>
                  <select value={detail.task.status} onChange={(e) => updateField({ status: e.target.value })}>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={detail.task.priority} onChange={(e) => updateField({ priority: e.target.value })}>
                    {Object.entries(PRIORITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign to</label>
                  <input
                    defaultValue={detail.task.assignedTo?._id || ''}
                    onBlur={(e) => { if (e.target.value !== (detail.task.assignedTo?._id || '')) updateField({ assignedTo: e.target.value || null }) }}
                    placeholder="User ID"
                  />
                </div>
                <button className="btn danger full-width" onClick={handleDelete}>Delete Task</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectBoard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, createTaskList, createTask, deleteTask, deleteTaskList, moveTask, user } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [newListName, setNewListName] = useState('')
  const [showNewList, setShowNewList] = useState(false)
  const [taskDrafts, setTaskDrafts] = useState({})
  const [dragTaskId, setDragTaskId] = useState(null)
  const [dragOverListId, setDragOverListId] = useState(null)

  const loadProject = async () => {
    try {
      setLoading(true)
      const d = await getProject(id)
      setData(d)
      setError(null)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProject() }, [id])

  const addList = async (e) => {
    e.preventDefault()
    if (!newListName.trim()) return
    try {
      await createTaskList(id, { name: newListName })
      setNewListName('')
      setShowNewList(false)
      loadProject()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create list')
    }
  }

  const addTask = async (listId, e) => {
    e.preventDefault()
    const title = (taskDrafts[listId] || '').trim()
    if (!title) return
    try {
      await createTask(id, { title, taskList: listId })
      setTaskDrafts({ ...taskDrafts, [listId]: '' })
      loadProject()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create task')
    }
  }

  const removeList = async (listId) => {
    if (!window.confirm('Delete this list? Tasks will be moved out of the list.')) return
    try {
      await deleteTaskList(listId)
      loadProject()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete list')
    }
  }

  const removeTask = async (taskId) => {
    try {
      await deleteTask(taskId)
      setSelectedTask(null)
      loadProject()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete task')
    }
  }

// ---- Drag & Drop (Trello-like) ----
  const handleDragStart = (taskId) => {
    setDragTaskId(taskId)
  }

  const handleDragOver = (e, listId) => {
    e.preventDefault()
    if (dragOverListId !== listId) setDragOverListId(listId)
  }

  const handleDragLeave = () => {
    setDragOverListId(null)
  }

  // Optimistically reorder tasks in state, then persist to the DB.
  const handleDrop = async (e, targetListId) => {
    e.preventDefault()
    const taskId = dragTaskId
    setDragTaskId(null)
    setDragOverListId(null)

    if (!taskId || !data) return

    const sourceListId = data.tasks.find((t) => t._id === taskId)?.taskList?._id || data.tasks.find((t) => t._id === taskId)?.taskList
    if (sourceListId === targetListId) return // no-op

    // Capture previous state for rollback
    const prevTasks = data.tasks

    // Optimistic UI: update in-memory tasks
    const updatedTasks = data.tasks.map((t) =>
      t._id === taskId
        ? { ...t, taskList: targetListId, status: inferStatus(targetListId, data?.lists) }
        : t
    )
    setData({ ...data, tasks: updatedTasks })

    try {
      await moveTask(taskId, { taskList: targetListId })
    } catch (err) {
      // Rollback on failure
      setData({ ...data, tasks: prevTasks })
      setError(err?.response?.data?.message || 'Failed to move task')
    }
  }

  const handleDragEnd = () => {
    setDragTaskId(null)
    setDragOverListId(null)
  }

  const canManage = data?.project && (user?.role === 'admin' || data.project.owner?._id === user?._id || data.project.owner === user?._id)

  return (
    <div className="page-container">
      <Navbar />
      <main className="page-main">
        <div className="board-header">
          <button className="btn small" onClick={() => navigate('/projects')}>← Back</button>
          <div className="board-title-wrap">
            <h1 className="projects-title">{data?.project?.name || 'Project Board'}</h1>
            <span className="board-status">{data?.project?.status?.replace('_', ' ')}</span>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <div className="spinner"><span className="loading" /></div>
        ) : data && (
          <div className="board-scroll">
            <div className="board">
{data.lists.map((list) => (
                <div
                  key={list._id}
                  className={`board-column ${dragOverListId === list._id ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, list._id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, list._id)}
                >
                  <div className="board-column-header">
                    <span className="board-column-title">{list.name}</span>
                    {canManage && <button className="board-delete" onClick={() => removeList(list._id)}>×</button>}
                  </div>

                  <div className="board-column-tasks">
                    {data.tasks.filter((t) => (t.taskList?._id || t.taskList) === list._id).map((task) => (
                      <div
                        key={task._id}
                        className={`board-task ${dragTaskId === task._id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(task._id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="board-task-top">
                          <span className="board-priority" style={{ background: PRIORITY_COLOR[task.priority] || '#6366f1' }}>
                            {PRIORITY_LABEL[task.priority]}
                          </span>
                          <span className="board-status">{STATUS_LABEL[task.status]}</span>
                        </div>
                        <p className="board-task-title">{task.title}</p>
                        {task.labels?.length > 0 && (
                          <div className="board-task-labels">
                            {task.labels.map((l) => (
                              <span key={l._id} className="label-chip" style={{ borderColor: l.color, color: l.color }}>
                                {l.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {task.assignedTo?.name && <p className="board-task-assignee">👤 {task.assignedTo.name}</p>}
                        {task.dueDate && <p className="board-task-due">🗓 {new Date(task.dueDate).toLocaleDateString()}</p>}
                      </div>
                    ))}
                  </div>

                  <form onSubmit={(e) => addTask(list._id, e)} className="board-add-task">
                    <input
                      value={taskDrafts[list._id] || ''}
                      onChange={(e) => setTaskDrafts({ ...taskDrafts, [list._id]: e.target.value })}
                      placeholder="+ Add a task"
                    />
                  </form>
                </div>
              ))}

              {showNewList ? (
                <form onSubmit={addList} className="board-column board-add-list">
                  <input
                    autoFocus
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="List name"
                  />
                  <div className="board-add-list-actions">
                    <button className="btn small" type="submit">Add</button>
                    <button className="btn small danger" type="button" onClick={() => setShowNewList(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button className="board-add-list-btn" onClick={() => setShowNewList(true)}>+ Add List</button>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          labels={data?.labels || []}
          onClose={() => setSelectedTask(null)}
          onUpdated={loadProject}
          onDeleted={() => removeTask(selectedTask._id)}
        />
      )}
    </div>
  )
}
