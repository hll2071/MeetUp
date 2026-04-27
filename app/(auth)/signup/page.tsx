'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      setError(error.message === 'User already registered' ? '이미 가입된 이메일이에요.' : '회원가입 중 오류가 발생했어요.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📅</div>
          <h1 className="text-2xl font-bold text-gray-900">Meetup</h1>
          <p className="text-gray-500 text-sm mt-1">친구들과 약속을 쉽게 잡아보세요</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-5">회원가입</h2>
          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">이름</label>
              <input
                type="text"
                className="input"
                placeholder="홍길동"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">이메일</label>
              <input
                type="email"
                className="input"
                placeholder="hello@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">비밀번호 (6자 이상)</label>
              <input
                type="password"
                className="input"
                placeholder="비밀번호 입력"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? '가입 중...' : '시작하기'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-gray-900 font-medium underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
