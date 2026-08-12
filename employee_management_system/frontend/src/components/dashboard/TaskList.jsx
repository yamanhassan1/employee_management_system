const STATUS_LABEL = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export default function TaskList({ tasks = [], title = 'Assigned Tasks' }) {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      {tasks.length === 0 ? (
        <p className="text-muted">No tasks assigned</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task._id} className="task-item">
              <div className="task-info">
                <strong>{task.title}</strong>
                {task.description && <p className="text-muted">{task.description}</p>}
                <div className="task-meta">
                  {task.project && <span className="task-tag">{task.project.name}</span>}
                  {task.dueDate && (
                    <span className={`task-tag ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <span className={`status-badge ${task.status}`}>
                {STATUS_LABEL[task.status] || task.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function isOverdue(dateStr) {
  return new Date(dateStr) < new Date()
}
