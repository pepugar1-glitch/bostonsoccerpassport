// Mock analytics data — wire to Mixpanel/PostHog/Firebase Analytics
// TODO(integration: analytics) Replace with real event pipeline.

import { format, eachDayOfInterval } from 'date-fns';

export const TOP_STATS = [
  { id: 'qr-scans', label: 'QR Scans', value: 8423, delta: '+18%' },
  { id: 'active-users', label: 'Active Users', value: 4197, delta: '+22%' },
  { id: 'map-interactions', label: 'Map Interactions', value: 22841, delta: '+31%' },
  { id: 'events-added', label: 'Events Added', value: 3104, delta: '+14%' },
  { id: 'check-ins', label: 'Check-ins', value: 1968, delta: '+27%' },
  { id: 'social-shares', label: 'Social Shares', value: 1442, delta: '+19%' },
  { id: 'quiz-completions', label: 'Quiz Completions', value: 2614, delta: '+9%' },
  { id: 'reward-claims', label: 'Reward Claims', value: 612, delta: '+33%' },
  { id: 'revs-ticket-clicks', label: 'Revs Ticket Clicks', value: 488, delta: '+41%' },
];

export const FUNNEL = [
  { step: 'QR Scan', value: 8423 },
  { step: 'App Activation', value: 5102 },
  { step: 'Profile Created', value: 3086 },
  { step: 'Reward Claimed', value: 1862 },
  { step: 'Revs Offer Clicked', value: 1118 },
];

export const SEGMENT = [
  { name: 'Local casual fans', value: 38 },
  { name: 'Visitors', value: 27 },
  { name: 'Families', value: 15 },
  { name: 'Soccer players', value: 12 },
  { name: 'Supporter candidates', value: 8 },
];

export const HOTSPOTS = [
  { location: 'City Hall Plaza', visits: 4218, checkIns: 891, conversion: 21.1 },
  { location: 'High Street Place', visits: 2107, checkIns: 514, conversion: 24.4 },
  { location: 'Cisco Brewers Seaport', visits: 1684, checkIns: 386, conversion: 22.9 },
  { location: 'Allston / Brighton Hub', visits: 1311, checkIns: 282, conversion: 21.5 },
  { location: 'Faialense Sport Club', visits: 944, checkIns: 218, conversion: 23.1 },
  { location: 'Patriot Place', visits: 738, checkIns: 152, conversion: 20.6 },
  { location: 'East Boston / LoPresti', visits: 691, checkIns: 119, conversion: 17.2 },
];

export const POPULAR_REWARDS = [
  { reward: 'Digital Fan Badge', claims: 264 },
  { reward: 'Merch Discount', claims: 152 },
  { reward: 'Match Ticket Discount', claims: 87 },
  { reward: 'F&B Credit', claims: 63 },
  { reward: 'Supporter Welcome', claims: 31 },
  { reward: 'Meet-and-Greet Lottery', claims: 15 },
];

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seedRandom(42);

export const DAILY_USERS = eachDayOfInterval({
  start: new Date(2026, 5, 12),
  end: new Date(2026, 7, 31),
}).map((d, i) => {
  const base = 600 + Math.floor(rand() * 320);
  const wave = Math.round(Math.sin(i / 5) * 220);
  const matchSurge = [1, 4, 10, 14, 17, 27, 47, 51, 72].includes(i) ? 850 + Math.floor(rand() * 400) : 0;
  return {
    date: format(d, 'MMM d'),
    users: Math.max(180, base + wave + matchSurge),
  };
});
