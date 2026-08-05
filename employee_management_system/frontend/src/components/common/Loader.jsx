export default function Loader() {
  return (
    <div className="spinner">
      <div className="loading" />
      <span style={{ marginLeft: '0.8rem', color: 'var(--auth-text-muted)' }}>
        Loading…
      </span>
    </div>
  )
}