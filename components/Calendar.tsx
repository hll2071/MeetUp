'use client'

import { useState } from 'react'
import { getDaysInMonth, getFirstDayOfMonth, toDateString, KR_DAYS } from '@/lib/utils'
import type { AvailabilityByDate } from '@/types'

interface CalendarProps {
  selectedDays: string[]
  onToggleDay: (date: string) => void
  availabilityByDate?: AvailabilityByDate[]
  myUserId?: string
}

const DOT_COLORS = ['bg-purple-400', 'bg-teal-400', 'bg-orange-400', 'bg-blue-400', 'bg-pink-400']

export default function Calendar({ selectedDays, onToggleDay, availabilityByDate = [], myUserId }: CalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  function changeMonth(d: number) {
    let m = month + d, y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    setMonth(m); setYear(y)
  }

  const firstDay = getFirstDayOfMonth(year, month)
  const daysInMonth = getDaysInMonth(year, month)
  const todayStr = toDateString(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const availMap: Record<string, AvailabilityByDate> = {}
  availabilityByDate.forEach(a => { availMap[a.date] = a })

  // build a stable color index per user
  const allUserIds = Array.from(new Set(availabilityByDate.flatMap(a => a.users.map(u => u.id))))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="btn-secondary px-3 py-1.5 text-xs">◀</button>
        <span className="font-semibold text-gray-900">{year}년 {month}월</span>
        <button onClick={() => changeMonth(1)} className="btn-secondary px-3 py-1.5 text-xs">▶</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {KR_DAYS.map((d, i) => (
          <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = toDateString(year, month, day)
          const isSelected = selectedDays.includes(dateStr)
          const isToday = dateStr === todayStr
          const avail = availMap[dateStr]
          const otherUsers = avail?.users.filter(u => u.id !== myUserId) ?? []
          const overlapCount = avail?.users.length ?? 0
          const isPast = dateStr < todayStr

          return (
            <button
              key={dateStr}
              onClick={() => !isPast && onToggleDay(dateStr)}
              disabled={isPast}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all
                ${isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
                ${isSelected ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                ${isToday && !isSelected ? 'ring-2 ring-gray-900' : ''}
                ${overlapCount >= 2 && !isSelected ? 'bg-green-50 border border-green-200' : ''}
              `}
            >
              <span className={`text-sm font-medium leading-none ${isSelected ? 'text-white' : 'text-gray-900'}`}>{day}</span>
              {otherUsers.length > 0 && !isSelected && (
                <div className="flex gap-0.5 mt-0.5">
                  {otherUsers.slice(0, 3).map(u => {
                    const colorIdx = allUserIds.indexOf(u.id) % DOT_COLORS.length
                    return <div key={u.id} className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[colorIdx]}`} />
                  })}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-300 inline-block" /> 2명 이상 가능</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-600 inline-block" /> 내가 선택</span>
      </div>
    </div>
  )
}
