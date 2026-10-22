# Student Feedback

Students rate their teachers, timetable and campus life. Teachers see their own scores and comments. Admins see everything, can filter and search, and can export CSV.

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Supabase · Resend

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Then run `supabase/setup.sql` once in the Supabase SQL editor (locks the tables to server-side access and adds duplicate protection).

Environment variables are described in `.env.example`.

## How it works

- **Sign-in** happens on the server (`/api/auth/*`). It sets a signed, httpOnly session cookie. The browser never talks to Supabase directly and never sees a password.
- **Passwords** are stored as bcrypt hashes. Existing plaintext passwords keep working and are upgraded to bcrypt automatically the first time each person signs in.
- **Forgot password** emails a new temporary password (the stored one can't be read back). The response is the same whether or not the email exists.
- **Students** rate teachers (8 factors each) and the timetable, and campus categories, on a 1–10 tap scale. Answers autosave on the device per account, then are sent in one go. The server rejects duplicate submissions.
- **Teachers** get their average, distribution, per-factor scores and anonymous comments (`/api/teacher/summary`).
- **Admins** get an overview (per teacher / category averages), filterable and searchable response lists with paging, and CSV export. Queries page past Supabase's 1,000-row default, so totals are accurate.

## Anonymity

`lib/config.ts` has `ANONYMOUS_MODE`.

- `false` (default, same as before): the student's name is stored with each submission and visible to admins. Teachers never see names. The UI says exactly that.
- `true`: submissions are stored as "Anonymous" and admins never see names. The student id is still kept so duplicates can be blocked.

## Project layout

```
app/                 pages (student /feedback, /teacher, /admin, auth pages) and /api routes
components/          UI kit (ui.tsx, Icon), RatingInput, TopBar, dialogs, providers
lib/                 shared constants, types, drafts, api helpers
lib/server/          server only: Supabase client, sessions, passwords, rate limiting
supabase/setup.sql   one-time database hardening
```

To change the teacher list, factors or campus categories, edit `lib/constants.ts`.

## Notes

- Rate limiting is in memory per server instance. It slows brute force on serverless hosts but isn't shared across instances.
- Fonts (Bricolage Grotesque, Figtree) are loaded with `next/font`, so the first production build needs internet access.
