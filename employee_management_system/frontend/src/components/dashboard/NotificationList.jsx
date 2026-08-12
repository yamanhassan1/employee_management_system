export default function NotificationList({ notifications = [], title = 'Notifications', unreadCount = 0 }) {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>{title}</h3>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount} new</span>}
      </div>
      {notifications.length === 0 ? (
        <p className="text-muted">No notifications</p>
      ) : (
        <div className="notification-list">
          {notifications.map((n) => (
            <div key={n._id} className={`notification-item ${n.isRead ? '' : 'unread'}`}>
              <div className="notification-dot" />
              <div className="notification-body">
                <strong>{n.title}</strong>
                {n.message && <p className="text-muted">{n.message}</p>}
                <span className="notification-time">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
