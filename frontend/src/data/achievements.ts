import {
  Flag,
  MapPin,
  CalendarCheck2,
  Trophy,
  Sparkles,
  Globe2,
  Share2,
  Crown,
  Camera,
  type LucideIcon,
} from 'lucide-react';

export interface Achievement {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  // unlockedBy receives a snapshot of the relevant counters and returns true when earned.
  unlockedBy: (ctx: {
    checkIns: number;
    scheduleCount: number;
    points: number;
    archetypeDone: boolean;
    triviaDone: boolean;
    rewardsClaimed: number;
    signedIn: boolean;
    photosUploaded: number;
  }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-check-in',
    icon: Flag,
    title: 'First check-in',
    body: 'Checked in at your first Boston soccer venue.',
    unlockedBy: (c) => c.checkIns >= 1,
  },
  {
    id: 'city-explorer',
    icon: MapPin,
    title: 'City explorer',
    body: 'Checked in at 3 different venues across the city.',
    unlockedBy: (c) => c.checkIns >= 3,
  },
  {
    id: 'day-planner',
    icon: CalendarCheck2,
    title: 'Day planner',
    body: 'Added at least 3 events to your soccer day.',
    unlockedBy: (c) => c.scheduleCount >= 3,
  },
  {
    id: 'archetype-found',
    icon: Sparkles,
    title: 'Soccer self-aware',
    body: 'Completed the archetype quiz · you know what kind of fan you are.',
    unlockedBy: (c) => c.archetypeDone,
  },
  {
    id: 'quiz-master',
    icon: Trophy,
    title: 'Quiz master',
    body: 'Completed both the archetype and the Boston & Revs trivia.',
    unlockedBy: (c) => c.archetypeDone && c.triviaDone,
  },
  {
    id: 'signed-in',
    icon: Globe2,
    title: 'Synced across devices',
    body: 'Signed in with Google so your progress travels with you.',
    unlockedBy: (c) => c.signedIn,
  },
  {
    id: 'rewards-claimer',
    icon: Share2,
    title: 'Reward unlocked',
    body: 'Claimed your first reward from the catalog.',
    unlockedBy: (c) => c.rewardsClaimed >= 1,
  },
  {
    id: 'documentalist',
    icon: Camera,
    title: 'Documentarian',
    body: 'Uploaded 3 photos from Boston soccer venues.',
    unlockedBy: (c) => c.photosUploaded >= 3,
  },
  {
    id: 'supporter-track',
    icon: Crown,
    title: 'Supporter section candidate',
    body: 'Reached 500 points · eligible for supporter welcome experience.',
    unlockedBy: (c) => c.points >= 500,
  },
];
