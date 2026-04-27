-- Supabase SQL Editor에 이 파일 전체를 붙여넣고 실행하세요

-- 프로필 테이블 (auth.users 확장)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 가능한 날짜 테이블
CREATE TABLE availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 약속 테이블
CREATE TABLE plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time TIME,
  place TEXT NOT NULL,
  activity TEXT,
  cost INTEGER DEFAULT 0,
  memo TEXT,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- profiles: 본인만 수정, 모두 조회 가능
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- availability: 본인만 수정, 모두 조회 가능
CREATE POLICY "avail_select" ON availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "avail_insert" ON availability FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "avail_delete" ON availability FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- plans: 모두 조회, 로그인한 사람만 생성, 만든 사람만 수정/삭제
CREATE POLICY "plans_select" ON plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "plans_insert" ON plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "plans_update" ON plans FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "plans_delete" ON plans FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 회원가입 시 자동으로 profiles 생성하는 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
