'use client'

import { formatDate, formatTime, formatCost } from '@/lib/utils'
import type { Plan } from '@/types'

interface PlanCardProps {
  plan: Plan
  canEdit: boolean
  onConfirm?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function PlanCard({ plan, canEdit, onConfirm, onDelete }: PlanCardProps) {
  return (
    <div className={`card ${plan.confirmed ? 'border-green-200 bg-green-50/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{formatDate(plan.date)}</h3>
            {plan.confirmed && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">확정</span>
            )}
          </div>
          {plan.profiles && (
            <p className="text-xs text-gray-400 mt-0.5">{plan.profiles.name} 등록</p>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {!plan.confirmed && onConfirm && (
              <button
                onClick={() => onConfirm(plan.id)}
                className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                확정
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(plan.id)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5"
              >
                삭제
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {plan.time && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-base">🕕</span>
            <span>{formatTime(plan.time)}</span>
          </div>
        )}
        {plan.place && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-base">📍</span>
            <span className="truncate">{plan.place}</span>
          </div>
        )}
        {plan.activity && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-base">🎉</span>
            <span className="truncate">{plan.activity}</span>
          </div>
        )}
        {plan.cost > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-base">💰</span>
            <span>1인 {formatCost(plan.cost)}</span>
          </div>
        )}
      </div>

      {plan.memo && (
        <p className="mt-3 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
          {plan.memo}
        </p>
      )}
    </div>
  )
}
