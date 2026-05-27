# Boston Soccer Passport — PRD

## Overview
A mobile-first Progressive Web App (PWA) consulting prototype for the New England Revolution (Kraft Sports + Entertainment). Built as a Hult MGT-6080 capstone deliverable. The app converts FIFA-World-Cup-driven Boston soccer excitement (June–July 2026, 7 matches at Gillette) into long-term Revolution supporters via a free, QR-installable web app.

NOT affiliated with FIFA, MLS, or the Revolution.

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS (custom navy/red palette)
- React Router v6
- localStorage persistence (no backend)
- Lucide-react icons, framer-motion, recharts, date-fns, html-to-image, canvas-confetti
- Leaflet + OpenStreetMap (no API key) for Quick Map
- iframe embed for Pro Map (bostonmapworldcup.netlify.app)
- vite-plugin-pwa for service worker + manifest

## Screens & Routes
- `/` Home — hero, 5 quick-access cards, upcoming Revs matches, quiz CTAs
- `/map` Map — Quick Map (Leaflet) + Pro Map (iframe), 12 seeded venues, filter chips, venue bottom sheet
- `/schedule` Schedule — Date strip, Morning/Afternoon/Evening buckets, reminders, status, my-schedule list
- `/rewards` Rewards — Balance + progress, earn rules, 7-reward catalog with claim+confetti, activity feed
- `/share` Share — 3 photo card templates, image upload, palette, sticker tray, download / IG / X share
- `/profile` Profile — Form, archetype display, points/stats, badges, referral code
- `/quiz` Quiz hub
- `/quiz/archetype` 7-Q archetype quiz (6 outcomes) → +30 pts
- `/quiz/trivia` 10-Q Boston & Revs trivia → +30 pts
- `/admin` Passcode-gated analytics dashboard (recharts)

## Points Engine
- Check-in venue: +25
- Add to schedule: +10
- Refer friend: +50
- Complete a quiz: +30
- Share a photo card: +20
- Visit partner watch party: +40
- Attend a Revs match: +200
- Welcome bonus (first visit): +25

## Admin
- Passcode: `revs2026` (env: `VITE_ADMIN_PASSCODE`)
- 24-hour localStorage unlock TTL
- Mock data tagged with `// TODO(integration: analytics)`

## Brand Safety
- Footer disclaimer on every non-map screen
- No FIFA marks, trophy imagery, or "official" language
- Generic terms: "soccer summer," "fan festival," "watch party," "host-city festival"

## Files of Note
- `src/lib/store.tsx` — single source of truth with lazy-init useReducer + per-key localStorage persistence
- `src/lib/storage.ts` — typed wrappers around localStorage keys (bsp.*)
- `src/data/venues.ts`, `src/data/content.ts`, `src/data/analytics.ts` — seed data
- `src/screens/*` — one file per route
- `vite.config.ts` — `@` path alias, PWA manifest, HMR over WSS for Emergent preview
