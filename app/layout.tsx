import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meetup — 친구들 약속 잡기',
  description: '서로 가능한 날을 공유하고 약속을 잡아보세요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
