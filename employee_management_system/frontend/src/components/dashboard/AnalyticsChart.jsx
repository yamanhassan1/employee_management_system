// Lightweight CSS bar chart (no external dependencies — scalable & fast)
export default function AnalyticsChart({ title = '', data = [] }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="analytics-chart">
      {title && <h4 className="chart-title">{title}</h4>}
      {data.length === 0 ? (
        <p className="text-muted">No data available</p>
      ) : (
        <div className="chart-bars">
          {data.map((item, i) => (
            <div className="chart-bar-group" key={`${item.label}-${i}`}>
              <div className="chart-bar-track">
                <div
                  className="chart-bar"
                  style={{ height: `${(item.value / max) * 100}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
              <span className="chart-bar-label">{item.label}</span>
              <span className="chart-bar-value">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
