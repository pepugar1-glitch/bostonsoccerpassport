import type {
  ActivityEntry,
  AuthUser,
  ClaimedReward,
  Profile,
  ScheduleItem,
  VenuePhoto,
} from '@/types';

const KEYS = {
  profile: 'bsp.profile.v1',
  schedule: 'bsp.schedule.v1',
  activity: 'bsp.activity.v1',
  rewards: 'bsp.rewardsClaimed.v1',
  checkIns: 'bsp.checkIns.v1',
  archetypeResult: 'bsp.archetypeResult.v1',
  triviaResult: 'bsp.triviaResult.v1',
  adminUnlock: 'bsp.adminUnlock.v1',
  bootSeed: 'bsp.bootSeed.v1',
  auth: 'bsp.auth.v1',
  signinBonus: 'bsp.signinBonus.v1',
  welcomeSeen: 'bsp.welcomeSeen.v1',
  tourSeen: 'bsp.tourSeen.v1',
  photos: 'bsp.photos.v1',
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export const storage = {
  getProfile: (): Profile | null => read<Profile | null>(KEYS.profile, null),
  setProfile: (p: Profile) => write(KEYS.profile, p),

  getSchedule: (): ScheduleItem[] => read<ScheduleItem[]>(KEYS.schedule, []),
  setSchedule: (s: ScheduleItem[]) => write(KEYS.schedule, s),

  getActivity: (): ActivityEntry[] => read<ActivityEntry[]>(KEYS.activity, []),
  setActivity: (a: ActivityEntry[]) => write(KEYS.activity, a),

  getRewards: (): ClaimedReward[] => read<ClaimedReward[]>(KEYS.rewards, []),
  setRewards: (r: ClaimedReward[]) => write(KEYS.rewards, r),

  getCheckIns: (): Record<string, string> => read<Record<string, string>>(KEYS.checkIns, {}),
  setCheckIns: (c: Record<string, string>) => write(KEYS.checkIns, c),

  getArchetypeResult: () => read<{ archetype: string; at: string } | null>(KEYS.archetypeResult, null),
  setArchetypeResult: (v: { archetype: string; at: string }) => write(KEYS.archetypeResult, v),

  getTriviaResult: () => read<{ score: number; total: number; at: string } | null>(KEYS.triviaResult, null),
  setTriviaResult: (v: { score: number; total: number; at: string }) => write(KEYS.triviaResult, v),

  getAdminUnlock: (): { at: number } | null => read<{ at: number } | null>(KEYS.adminUnlock, null),
  setAdminUnlock: (v: { at: number } | null) =>
    v ? write(KEYS.adminUnlock, v) : window.localStorage.removeItem(KEYS.adminUnlock),

  getBootSeed: (): boolean => read<boolean>(KEYS.bootSeed, false),
  setBootSeed: (v: boolean) => write(KEYS.bootSeed, v),

  getAuth: (): AuthUser | null => read<AuthUser | null>(KEYS.auth, null),
  setAuth: (v: AuthUser | null) =>
    v ? write(KEYS.auth, v) : window.localStorage.removeItem(KEYS.auth),

  getSigninBonus: (): boolean => read<boolean>(KEYS.signinBonus, false),
  setSigninBonus: (v: boolean) => write(KEYS.signinBonus, v),

  getWelcomeSeen: (): boolean => read<boolean>(KEYS.welcomeSeen, false),
  setWelcomeSeen: (v: boolean) => write(KEYS.welcomeSeen, v),

  getTourSeen: (): boolean => read<boolean>(KEYS.tourSeen, false),
  setTourSeen: (v: boolean) => write(KEYS.tourSeen, v),

  getPhotos: (): VenuePhoto[] => read<VenuePhoto[]>(KEYS.photos, []),
  setPhotos: (v: VenuePhoto[]) => write(KEYS.photos, v),
};
