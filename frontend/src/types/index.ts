export type VenueCategory =
  | 'fan-festival'
  | 'watch-party'
  | 'transport'
  | 'culture-hub'
  | 'amateur-league'
  | 'family'
  | 'revs-rewards';

export interface Venue {
  id: string;
  name: string;
  category: VenueCategory;
  lat: number;
  lng: number;
  distance: string;
  description: string;
  hours: string;
  tags: string[];
  neighborhood: string;
}

export interface SoccerEvent {
  id: string;
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:mm 24h
  title: string;
  venueId: string;
  venueName: string;
  timeBucket: 'morning' | 'afternoon' | 'evening';
  category: VenueCategory;
  description: string;
}

export type ScheduleStatus = 'planned' | 'attended' | 'favorite';

export interface ScheduleItem {
  eventId: string;
  addedAt: string;
  status: ScheduleStatus;
  reminders: {
    thirtyMin: boolean;
    oneHour: boolean;
    travelTime: boolean;
  };
}

export interface Reward {
  id: string;
  cost: number;
  title: string;
  description: string;
  category: 'badge' | 'merch' | 'ticket' | 'food' | 'experience' | 'lottery' | 'family';
  cta: string;
}

export interface ClaimedReward {
  rewardId: string;
  claimedAt: string;
}

export type ActivityType =
  | 'check-in'
  | 'schedule-add'
  | 'referral'
  | 'quiz-complete'
  | 'share-photo'
  | 'watch-party'
  | 'revs-match'
  | 'reward-claim'
  | 'first-visit';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  delta: number;
  label: string;
  meta?: string;
  at: string;
}

export type FanArchetype =
  | 'local-loyalist'
  | 'global-matchday-fan'
  | 'family-soccer-explorer'
  | 'player-fan'
  | 'supporter-section-candidate'
  | 'new-to-soccer';

export interface Profile {
  name: string;
  archetype?: FanArchetype;
  favoriteCountry: string;
  favoriteTeam: string;
  visitor: 'local' | 'visitor';
  zip: string;
  referralCode: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    weight: Partial<Record<FanArchetype, number>>;
  }[];
}

export interface TriviaQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Match {
  id: string;
  date: string;
  opponent: string;
  homeAway: 'home' | 'away';
  competition: string;
  note: string;
}
