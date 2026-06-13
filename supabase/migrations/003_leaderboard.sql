-- Leaderboard materialized view (refresh every 5 min via pg_cron)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.leaderboard_weekly AS
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.level,
    COALESCE(SUM(a.xp_earned), 0) AS weekly_xp,
    COUNT(a.id) FILTER (WHERE a.is_correct) AS correct_count,
    COALESCE(s.current_streak, 0) AS current_streak
  FROM public.profiles p
  LEFT JOIN public.user_attempts a
    ON a.user_id = p.id
    AND a.attempted_at >= DATE_TRUNC('week', NOW())
  LEFT JOIN public.streaks s ON s.user_id = p.id
  GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.level, s.current_streak
  ORDER BY weekly_xp DESC;

CREATE UNIQUE INDEX IF NOT EXISTS leaderboard_weekly_id_idx ON public.leaderboard_weekly(id);

-- Schedule refresh (requires pg_cron extension in Supabase)
-- SELECT cron.schedule('refresh-leaderboard', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY public.leaderboard_weekly');
