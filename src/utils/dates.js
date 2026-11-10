export function toDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getWeekStart(date = new Date()) {
    const d = new Date(date)
    const day = d.getDay()
    const daysSinceMonday = day === 0 ? 6 : day - 1
    d.setDate(d.getDate() - daysSinceMonday)
    return toDateString(d)
}

export function formatDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })
}