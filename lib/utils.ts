export const KR_DAYS = ['일', '월', '화', '수', '목', '금', '토']

export function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${KR_DAYS[d.getDay()]})`
}

export function formatTime(timeStr: string | null) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? '오후' : '오전'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${ampm} ${displayHour}:${m}`
}

export function formatCost(cost: number) {
  return cost.toLocaleString('ko-KR') + '원'
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay()
}

export function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
