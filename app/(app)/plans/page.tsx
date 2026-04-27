'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import PlanCard from '@/components/PlanCard'
import type { Plan, AvailabilityByDate } from '@/types'
import { formatDate } from '@/lib/utils'

export default function PlansPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState('')
  const [plans, setPlans] = useState<Plan[]>([])
  const [availability, setAvailability] = useState<AvailabilityByDate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    date: '', time: '18:00', place: '', activity: '', cost: '', memo: ''
  })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [plansRes, availRes] = await Promise.all([
      fetch('/api/plans'),
      fetch('/api/availability'),
    ])
    const [plansJson, availJson] = await Promise.all([plansRes.json(), availRes.json()])
    setPlans(plansJson.data ?? [])
    setAvailability(availJson.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUserId(data.user.id) })
    fetchAll()
  }, [fetchAll])

  const overlaps = availability.filter(a => a.users.length >= 2)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date || !form.place) return
    setSubmitting(true)
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cost: parseInt(form.cost) || 0 }),
    })
    if (res.ok) {
      setForm({ date: '', time: '18:00', place: '', activity: '', cost: '', memo: '' })
      setShowForm(false)
      await fetchAll()
    }
    setSubmitting(false)
  }

  async function handleConfirm(id: string) {
    await fetch(`/api/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmed: true }),
    })
    fetchAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('약속을 삭제할까요?')) return
    await fetch(`/api/plans/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  const confirmed = plans.filter(p => p.confirmed)
  const pending = plans.filter(p => !p.confirmed)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">약속 목록</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm px-4 py-2">
          {showForm ? '닫기' : '+ 약속 만들기'}
        </button>
      </div>

      {/* 약속 만들기 폼 */}
      {showForm && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">새 약속 만들기</h3>

          {overlaps.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">겹치는 날짜로 빠르게 선택</p>
              <div className="flex flex-wrap gap-2">
                {overlaps.map(a => (
                  <button
                    key={a.date}
                    onClick={() => setForm(f => ({ ...f, date: a.date }))}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      form.date === a.date
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    {formatDate(a.date)} ({a.users.length}명)
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">날짜 *</label>
                <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">시간</label>
                <input type="time" className="input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">장소 *</label>
              <input type="text" className="input" placeholder="예: 홍대 파스타 맛집" value={form.place} onChange={e => setForm(f => ({ ...f, place: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">활동</label>
                <input type="text" className="input" placeholder="저녁 식사, 영화 등" value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">예상 비용 (1인, 원)</label>
                <input type="number" className="input" placeholder="30000" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">메모</label>
              <textarea className="input" rows={2} placeholder="추가 안내 사항..." value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? '등록 중...' : '약속 등록하기'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 text-sm py-8">불러오는 중...</div>
      ) : plans.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-10 bg-white rounded-2xl border border-gray-100">
          <p className="text-2xl mb-2">📅</p>
          <p>아직 약속이 없어요</p>
          <p className="text-xs mt-1">위 버튼으로 약속을 만들어보세요!</p>
        </div>
      ) : (
        <>
          {confirmed.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">확정된 약속</h3>
              <div className="space-y-3">
                {confirmed.map(p => (
                  <PlanCard key={p.id} plan={p} canEdit={p.created_by === userId} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">검토 중인 약속</h3>
              <div className="space-y-3">
                {pending.map(p => (
                  <PlanCard key={p.id} plan={p} canEdit={p.created_by === userId} onConfirm={handleConfirm} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
