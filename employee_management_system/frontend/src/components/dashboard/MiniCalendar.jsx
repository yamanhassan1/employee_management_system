import { useMemo, useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MiniCalendar({ events = [], title = 'Calendar' }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const { year, month, daysInMonth, firstDay, monthLabel } = useMemo(() => {
    const y = currentMonth.getFullYear()
    const m = currentMonth.getMonth()
    return {
      year: y,
      month: m,
      daysInMonth: new Date(y, m + 1, 0).getDate(),
      firstDay: new Date(y, m, 1).getDay(),
      monthLabel: currentMonth.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    }
  }, [currentMonth])

  const eventsByDay = useMemo(() => {
    const map = {}
    events.forEach((ev) => {
      const d = new Date(ev.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!map[day]) map[day] = []
        map[day].push(ev)
      }
    })
    return map
  }, [events, year, month])

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const goPrev = () => setCurrentMonth(new Date(year, month - 1, 1))
  const goNext = () => setCurrentMonth(new Date(year, month + 1, 1))

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>{title}</h3>
        <div className="calendar-nav">
          <button type="button" className="btn small secondary" onClick={goPrev}>‹</button>
          <span className="calendar-month">{monthLabel}</span>
          <button type="button" className="btn small secondary" onClick={goNext}>›</button>
        </div>
      </div>

      <div className="calendar-grid">
        {DAYS.map((d) => (
          <div key={d} className="calendar-day-head">{d}</div>
        ))}
        {cells.map((day, idx) => {
          const dayEvents = day ? eventsByDay[day] || [] : []
          const today = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
          return (
            <div key={idx} className={`calendar-cell ${day ? '' : 'empty'} ${today ? 'today' : ''}`}>
              {day && (
                <>
                  <span className="calendar-day-num">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="calendar-dots">
                      {dayEvents.slice(0, 3).map((ev, i) => (
                        <span key={i} className={`event-dot type-${ev.type}`} title={ev.title} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
