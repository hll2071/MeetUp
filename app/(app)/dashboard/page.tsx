'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import Calendar from '@/components/Calendar'
import { formatDate } from '@/lib/utils'
import type { AvailabilityByDate } from '@/types'

export default function DashboardPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string>('')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [availability, setAvailability] = useState<AvailabilityByDate[]>([])
  const [myDates, setMyDates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchAvailability = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/availability')
    const json = await res.json()
    setAvailability(json.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
      }
    })
    fetchAvailability()
  }, [fetchAvailability])

  useEffect(() => {
    if (!userId) return
    const my = availability
      .filter(a => a.users.some(u => u.id === userId))
      .map(a => a.date)
    setMyDates(my)
    setSelectedDays(my)
  }, [availability, userId])

  function toggleDay(date: string) {
    setSelectedDays(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    )
    setSaved(false)
  }

  async function saveAvailability() {
    setSaving(true)
    // 추가할 날짜
    const toAdd = selectedDays.filter(d => !myDates.includes(d))
    // 삭제할 날짜
    const toRemove = myDates.filter(d => !selectedDays.includes(d))

    if (toAdd.length > 0) {
      await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates: toAdd }),
      })
    }
    for (const date of toRemove) {
      await fetch('/api/availability', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
    }
    await fetchAvailability()
    setSaved(true)
    setSaving(false)
  }

  const overlaps = availability.filter(a => a.users.length >= 2)

  return (
    <div className="space-y-6">
      {/* 내 일정 등록 */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-1">내가 되는 날 선택</h2>
        <p className="text-sm text-gray-400 mb-4">달력에서 가능한 날짜를 선택하세요. 친구들도 볼 수 있어요.</p>
        <Calendar
          selectedDays={selectedDays}
          onToggleDay={toggleDay}
          availabilityByDate={availability}
          myUserId={userId}
        />

        {selectedDays.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {[...selectedDays].sort().map(d => (
              <span
                key={d}
                onClick={() => toggleDay(d)}
                className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                {formatDate(d)} ✕
              </span>
            ))}
          </div>
        )}

        <button
          onClick={saveAvailability}
          disabled={saving}
          className="btn-primary w-full mt-4"
        >
          {saving ? '저장 중...' : saved ? '✓ 저장됨' : '일정 저장하기'}
        </button>
      </div>

      {/* 친구들 가능 날짜 */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">
          친구들이 가능한 날
          {overlaps.length > 0 && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-normal">
              겹치는 날 {overlaps.length}개
            </span>
          )}
        </h2>

        {loading ? (
          <div className="text-center text-gray-400 text-sm py-8">불러오는 중...</div>
        ) : availability.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8 bg-white rounded-2xl border border-gray-100">
            아직 등록된 일정이 없어요
          </div>
        ) : (
          <div className="space-y-2">
            {[...availability].sort((a, b) => a.date.localeCompare(b.date)).map(a => (
              <div
                key={a.date}
                className={`card flex items-center justify-between py-3.5 ${
                  a.users.length >= 2 ? 'border-green-200 bg-green-50/40' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {a.users.map((u, i) => (
                      <div
                        key={u.id}
                        title={u.name}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
                        style={{ background: ['#EEEDFE','#E1F5EE','#FAECE7','#E6F1FB','#FBEAF0'][i % 5], color: ['#3C3489','#085041','#712B13','#0C447C','#72243E'][i % 5] }}
                      >
                        {u.name[0]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(a.date)}</p>
                    <p className="text-xs text-gray-400">{a.users.map(u => u.name).join(', ')}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  a.users.length >= 2 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {a.users.length}명
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
