Project: SentinelHealth — Next.js 14 (App Router) monorepo.

Deployed on Vercel. One Supabase project as backend.



TWO URL ZONES:

1\. /admin/\*\* — CHO Clinical Intelligence Dashboard (already built, 

&#x20;  dark navy theme, 5 pages: Dashboard Overview, Symptom Database, 

&#x20;  Live Outbreak Map, SOS Queue, Advisories CMS)

&#x20;  Needs: Supabase data wiring + auth guard (cho\_users table)



2\. /\* (root) — PWA for three stakeholders:

&#x20;  - PHC Worker: email+password → full health reporting app

&#x20;  - Local Resident: phone OTP → alerts + community reporting  

&#x20;  - Anonymous Reporter: ward token + PIN → report only

&#x20;  Needs: PWA manifest + offline SW + Supabase wiring



Supabase tables: wards, diseases, health\_reports, community\_reports,

alerts, hotspots, phc\_workers, residents, anonymous\_reporters, 

cho\_users (schemas already defined).



Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, 

Supabase JS v2, Zustand (state), next-pwa (service worker).



FROZEN: all files under app/admin/\*\* — do not modify visual design.

Only add data fetching and auth, never touch layout/styling.

Show plan before writing any code. One file per prompt.



# Project Structure Setup

CONTEXT: Existing Next.js project has app/admin/ with all 

dashboard pages already built. No backend connected yet.

TASK: Restructure the project so:

&#x20; app/

&#x20; ├── admin/

&#x20; │   ├── layout.tsx          ← CHO auth guard wrapper

&#x20; │   ├── page.tsx            ← Dashboard Overview (exists)

&#x20; │   ├── reports/page.tsx    ← Symptom Database (exists)

&#x20; │   ├── map/page.tsx        ← Live Outbreak Map (exists)

&#x20; │   ├── sos/page.tsx        ← SOS Queue (exists)

&#x20; │   └── advisories/page.tsx ← Advisories CMS (exists)

&#x20; ├── (pwa)/

&#x20; │   ├── layout.tsx          ← PWA shell + offline banner

&#x20; │   ├── page.tsx            ← Role selection screen

&#x20; │   ├── login/page.tsx      ← PHC worker login

&#x20; │   ├── otp/page.tsx        ← Resident phone OTP

&#x20; │   ├── token/page.tsx      ← Anonymous ward token

&#x20; │   ├── home/page.tsx       ← PHC worker home

&#x20; │   ├── resident/page.tsx   ← Resident home

&#x20; │   └── report/page.tsx     ← Unified report form

&#x20; ├── api/

&#x20; │   ├── sync/route.ts       ← Anonymous report Edge route

&#x20; │   └── alerts/route.ts     ← Broadcast endpoint

&#x20; lib/

&#x20; ├── supabase/

&#x20; │   ├── client.ts           ← Browser client

&#x20; │   ├── server.ts           ← Server client (cookies)

&#x20; │   └── mock.ts             ← USE\_MOCK\_DATA fallback

&#x20; └── stores/

&#x20;     └── appStore.ts         ← Zustand global store

OUTPUT: Create the folder skeleton with placeholder 

page.tsx in each new route. Do not touch existing admin pages.

