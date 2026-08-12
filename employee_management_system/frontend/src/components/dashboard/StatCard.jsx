export default function StatCard({ label, value, icon = '', accent = 'primary' }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  )
}
