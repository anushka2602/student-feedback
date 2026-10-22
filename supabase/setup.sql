-- Run once in the Supabase SQL editor AFTER deploying this version of the app.
--
-- 1) Lock the tables down. The app now talks to Supabase only from server-side API routes
--    using the service-role key (which bypasses RLS), so the public anon key no longer needs
--    any access. Before this, anyone with the anon key could read every user's password.
alter table public.users                  enable row level security;
alter table public.academic_feedback      enable row level security;
alter table public.non_academic_feedback  enable row level security;
-- (No policies = anon/authenticated roles get no access. That is what we want.)

-- 2) Optional but recommended: make "one submission per student per item" a database rule too.
--    If this fails with a duplicate-key error, you have older duplicate rows. Remove those first.
create unique index if not exists academic_one_per_student
  on public.academic_feedback (student_id, teacher_name, factor);
create unique index if not exists non_academic_one_per_student
  on public.non_academic_feedback (student_id, category);

-- 3) Optional: faster dashboards.
create index if not exists academic_teacher_idx on public.academic_feedback (teacher_name);
create index if not exists academic_submitted_idx on public.academic_feedback (submitted_at desc);
create index if not exists non_academic_submitted_idx on public.non_academic_feedback (submitted_at desc);
