import { toRelativeString } from '../../utils/dateUtils'

export default function ActivityFeed({ activities = [], title = 'Recent Activity' }) {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      {activities.length === 0 ? (
        <p className="text-muted">No recent activity</p>
      ) : (
        <div className="activity-feed">
          {activities.map((a) => (
            <div key={a._id} className="activity-item">
              <span className="activity-marker" />
              <div className="activity-body">
                <strong>{a.action}</strong>
                {a.details && <p className="text-muted">{a.details}</p>}
<span className="activity-time">
                  {toRelativeString(a.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
