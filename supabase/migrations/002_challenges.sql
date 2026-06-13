-- Drop policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Challenges are public" ON public.challenges;
DROP POLICY IF EXISTS "Users see own attempts" ON public.user_attempts;
DROP POLICY IF EXISTS "Users insert own attempts" ON public.user_attempts;
DROP POLICY IF EXISTS "Users see own streak" ON public.streaks;
DROP POLICY IF EXISTS "Users upsert own streak" ON public.streaks;

-- Challenges
CREATE TABLE IF NOT EXISTS public.challenges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track        TEXT NOT NULL CHECK (track IN ('sql','python','excel','biz')),
  difficulty   TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  title        TEXT NOT NULL,
  question     TEXT NOT NULL,
  code_snippet TEXT,
  options      JSONB NOT NULL,
  explanation  TEXT,
  tags         TEXT[],
  published_at DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- User attempts
CREATE TABLE IF NOT EXISTS public.user_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id    UUID NOT NULL REFERENCES public.challenges(id),
  selected_option INTEGER NOT NULL,
  is_correct      BOOLEAN NOT NULL,
  time_taken_ms   INTEGER,
  xp_earned       INTEGER DEFAULT 0,
  attempted_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Streaks
CREATE TABLE IF NOT EXISTS public.streaks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak   INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak   INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  last_active_date DATE,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.user_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_challenge ON public.user_attempts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenges_track ON public.challenges(track);
CREATE INDEX IF NOT EXISTS idx_challenges_published ON public.challenges(published_at);

-- RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are public" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Users see own attempts" ON public.user_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attempts" ON public.user_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own streak" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own streak" ON public.streaks FOR ALL USING (auth.uid() = user_id);
