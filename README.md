# 📅 Meetup — 친구들 약속 잡기 서비스

Next.js 14 + Supabase + Vercel 풀스택 앱

## 기술 스택
- **프론트엔드**: Next.js 14 (App Router), Tailwind CSS
- **백엔드**: Next.js API Routes (서버리스)
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth (이메일+비밀번호)
- **배포**: Vercel (프론트) + Supabase (DB/Auth)

## 기능
- 이메일/비밀번호 회원가입 & 로그인
- 달력에서 가능한 날짜 다중 선택 & 등록
- 친구들과 일정 겹치는 날 자동 계산
- 약속 만들기 (날짜, 시간, 장소, 활동, 비용, 메모)
- 약속 확정/삭제
- 실시간으로 모든 멤버의 가능 날짜 확인

## 프로젝트 구조
```
meetup-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── dashboard/page.tsx   ← 일정 등록 + 겹치는 날 확인
│   │   └── plans/page.tsx       ← 약속 목록
│   ├── api/
│   │   ├── availability/route.ts
│   │   └── plans/route.ts
│   └── layout.tsx
├── components/
│   ├── Calendar.tsx
│   ├── PlanCard.tsx
│   └── Navbar.tsx
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── supabase/
│   └── schema.sql
└── types/index.ts
```
