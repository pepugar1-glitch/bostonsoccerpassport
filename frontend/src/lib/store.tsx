import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { storage } from './storage';
import { track } from './analytics';
import type {
  ActivityEntry,
  ActivityType,
  AuthUser,
  ClaimedReward,
  FanArchetype,
  Profile,
  ScheduleItem,
  ScheduleStatus,
  VenuePhoto,
} from '@/types';

export const PHOTO_BONUS_POINTS = 50;

interface ToastMsg {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'info' | 'reward' | 'warn';
  points?: number;
}

export type SignInPromptKind = 'checkIn' | 'schedule' | 'reward';

interface SignInPromptState {
  open: boolean;
  kind: SignInPromptKind | null;
  params: Record<string, string>;
  cta: string;
  onContinue?: () => void;
}

interface PhotoPromptState {
  open: boolean;
  venueId: string;
  venueName: string;
}

interface State {
  profile: Profile | null;
  schedule: ScheduleItem[];
  activity: ActivityEntry[];
  claimedRewards: ClaimedReward[];
  checkIns: Record<string, string>;
  archetypeResult: { archetype: FanArchetype; at: string } | null;
  triviaResult: { score: number; total: number; at: string } | null;
  auth: AuthUser | null;
  toasts: ToastMsg[];
  signInPrompt: SignInPromptState;
  photos: VenuePhoto[];
  photoPrompt: PhotoPromptState;
}

type Action =
  | { type: 'HYDRATE'; payload: Partial<State> }
  | { type: 'SET_PROFILE'; profile: Profile }
  | { type: 'ADD_ACTIVITY'; entry: ActivityEntry }
  | { type: 'ADD_SCHEDULE'; item: ScheduleItem }
  | { type: 'REMOVE_SCHEDULE'; eventId: string }
  | { type: 'UPDATE_SCHEDULE_STATUS'; eventId: string; status: ScheduleStatus }
  | { type: 'TOGGLE_REMINDER'; eventId: string; key: keyof ScheduleItem['reminders'] }
  | { type: 'CHECK_IN'; venueId: string }
  | { type: 'CLAIM_REWARD'; rewardId: string }
  | { type: 'SET_ARCHETYPE'; archetype: FanArchetype }
  | { type: 'SET_TRIVIA'; score: number; total: number }
  | { type: 'SET_AUTH'; user: AuthUser | null }
  | { type: 'OPEN_SIGNIN_PROMPT'; prompt: { kind: SignInPromptKind; params: Record<string, string>; cta: string; onContinue?: () => void } }
  | { type: 'CLOSE_SIGNIN_PROMPT' }
  | { type: 'OPEN_PHOTO_PROMPT'; venueId: string; venueName: string }
  | { type: 'CLOSE_PHOTO_PROMPT' }
  | { type: 'ADD_PHOTO'; photo: VenuePhoto }
  | { type: 'REMOVE_PHOTO'; id: string }
  | { type: 'PUSH_TOAST'; toast: ToastMsg }
  | { type: 'DISMISS_TOAST'; id: string };

const CLOSED_PROMPT: SignInPromptState = { open: false, kind: null, params: {}, cta: '' };
const CLOSED_PHOTO_PROMPT: PhotoPromptState = { open: false, venueId: '', venueName: '' };

const initial: State = {
  profile: null,
  schedule: [],
  activity: [],
  claimedRewards: [],
  checkIns: {},
  archetypeResult: null,
  triviaResult: null,
  auth: null,
  toasts: [],
  signInPrompt: CLOSED_PROMPT,
  photos: [],
  photoPrompt: CLOSED_PHOTO_PROMPT,
};

function initState(): State {
  if (typeof window === 'undefined') return initial;
  let activity = storage.getActivity();
  // Seed welcome bonus on first ever visit
  if (!storage.getBootSeed()) {
    const seedActivity: ActivityEntry = {
      id: Math.random().toString(36).slice(2, 10),
      type: 'first-visit',
      delta: 25,
      label: 'Welcome to Boston Soccer Passport',
      meta: 'First visit bonus',
      at: new Date().toISOString(),
    };
    activity = [seedActivity, ...activity];
    storage.setActivity(activity);
    storage.setBootSeed(true);
  }
  return {
    profile: storage.getProfile(),
    schedule: storage.getSchedule(),
    activity,
    claimedRewards: storage.getRewards(),
    checkIns: storage.getCheckIns(),
    archetypeResult: storage.getArchetypeResult() as State['archetypeResult'],
    triviaResult: storage.getTriviaResult(),
    auth: storage.getAuth(),
    toasts: [],
    signInPrompt: CLOSED_PROMPT,
    photos: storage.getPhotos(),
    photoPrompt: CLOSED_PHOTO_PROMPT,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.profile };
    case 'ADD_ACTIVITY':
      return { ...state, activity: [action.entry, ...state.activity].slice(0, 200) };
    case 'ADD_SCHEDULE':
      if (state.schedule.some((s) => s.eventId === action.item.eventId)) return state;
      return { ...state, schedule: [...state.schedule, action.item] };
    case 'REMOVE_SCHEDULE':
      return { ...state, schedule: state.schedule.filter((s) => s.eventId !== action.eventId) };
    case 'UPDATE_SCHEDULE_STATUS':
      return {
        ...state,
        schedule: state.schedule.map((s) =>
          s.eventId === action.eventId ? { ...s, status: action.status } : s
        ),
      };
    case 'TOGGLE_REMINDER':
      return {
        ...state,
        schedule: state.schedule.map((s) =>
          s.eventId === action.eventId
            ? { ...s, reminders: { ...s.reminders, [action.key]: !s.reminders[action.key] } }
            : s
        ),
      };
    case 'CHECK_IN':
      return { ...state, checkIns: { ...state.checkIns, [action.venueId]: new Date().toISOString() } };
    case 'CLAIM_REWARD':
      if (state.claimedRewards.some((r) => r.rewardId === action.rewardId)) return state;
      return {
        ...state,
        claimedRewards: [
          ...state.claimedRewards,
          { rewardId: action.rewardId, claimedAt: new Date().toISOString() },
        ],
      };
    case 'SET_ARCHETYPE':
      return { ...state, archetypeResult: { archetype: action.archetype, at: new Date().toISOString() } };
    case 'SET_TRIVIA':
      return { ...state, triviaResult: { score: action.score, total: action.total, at: new Date().toISOString() } };
    case 'SET_AUTH':
      return { ...state, auth: action.user };
    case 'OPEN_SIGNIN_PROMPT':
      return { ...state, signInPrompt: { ...action.prompt, open: true } };
    case 'CLOSE_SIGNIN_PROMPT':
      return { ...state, signInPrompt: CLOSED_PROMPT };
    case 'OPEN_PHOTO_PROMPT':
      return {
        ...state,
        photoPrompt: { open: true, venueId: action.venueId, venueName: action.venueName },
      };
    case 'CLOSE_PHOTO_PROMPT':
      return { ...state, photoPrompt: CLOSED_PHOTO_PROMPT };
    case 'ADD_PHOTO':
      return { ...state, photos: [action.photo, ...state.photos].slice(0, 60) };
    case 'REMOVE_PHOTO':
      return { ...state, photos: state.photos.filter((p) => p.id !== action.id) };
    case 'PUSH_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

interface AppStoreContextValue {
  state: State;
  points: number;
  addPoints: (type: ActivityType, delta: number, label: string, meta?: string) => void;
  addToSchedule: (eventId: string) => boolean;
  removeFromSchedule: (eventId: string) => void;
  updateScheduleStatus: (eventId: string, status: ScheduleStatus) => void;
  toggleReminder: (eventId: string, key: keyof ScheduleItem['reminders']) => Promise<void>;
  checkInVenue: (venueId: string, venueName: string) => boolean;
  claimReward: (rewardId: string, cost: number, title: string) => 'claimed' | 'insufficient' | 'already' | 'auth-required';
  setProfile: (p: Profile) => void;
  setArchetype: (a: FanArchetype) => void;
  completeTrivia: (score: number, total: number) => void;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  requireAuth: (opts: { kind: SignInPromptKind; params?: Record<string, string>; cta: string; action: () => void }) => void;
  closeSignInPrompt: () => void;
  openPhotoPrompt: (venueId: string, venueName: string) => void;
  closePhotoPrompt: () => void;
  addPhoto: (input: { venueId: string; venueName: string; dataUrl: string; caption?: string }) => void;
  removePhoto: (id: string) => void;
  toast: (t: Omit<ToastMsg, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  // persist on change
  useEffect(() => storage.setSchedule(state.schedule), [state.schedule]);
  useEffect(() => storage.setActivity(state.activity), [state.activity]);
  useEffect(() => storage.setRewards(state.claimedRewards), [state.claimedRewards]);
  useEffect(() => storage.setCheckIns(state.checkIns), [state.checkIns]);
  useEffect(() => {
    if (state.profile) storage.setProfile(state.profile);
  }, [state.profile]);
  useEffect(() => {
    if (state.archetypeResult) storage.setArchetypeResult(state.archetypeResult);
  }, [state.archetypeResult]);
  useEffect(() => {
    if (state.triviaResult) storage.setTriviaResult(state.triviaResult);
  }, [state.triviaResult]);
  useEffect(() => {
    storage.setAuth(state.auth);
  }, [state.auth]);
  useEffect(() => storage.setPhotos(state.photos), [state.photos]);

  const points = useMemo(
    () =>
      state.activity.reduce((sum, a) => sum + a.delta, 0) -
      state.claimedRewards.reduce((sum, r) => {
        // Cost is captured in the matching reward-claim activity entry as a negative delta — already counted.
        return sum + 0;
      }, 0),
    [state.activity, state.claimedRewards]
  );

  const toast = useCallback((t: Omit<ToastMsg, 'id'>) => {
    const full: ToastMsg = { id: uid(), variant: 'success', ...t };
    dispatch({ type: 'PUSH_TOAST', toast: full });
    setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id: full.id }), 3800);
  }, []);

  const dismissToast = useCallback((id: string) => dispatch({ type: 'DISMISS_TOAST', id }), []);

  const addPoints = useCallback(
    (type: ActivityType, delta: number, label: string, meta?: string) => {
      const entry: ActivityEntry = {
        id: uid(),
        type,
        delta,
        label,
        meta,
        at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_ACTIVITY', entry });
      track('points_change', { type, delta, meta });
    },
    []
  );

  const addToSchedule = useCallback(
    (eventId: string) => {
      if (state.schedule.some((s) => s.eventId === eventId)) {
        toast({ title: 'Already in your day', description: 'This is already on your soccer day.', variant: 'info' });
        return false;
      }
      const doIt = () => {
        const item: ScheduleItem = {
          eventId,
          addedAt: new Date().toISOString(),
          status: 'planned',
          reminders: { thirtyMin: false, oneHour: false, travelTime: false },
        };
        dispatch({ type: 'ADD_SCHEDULE', item });
        addPoints('schedule-add', 10, 'Added to soccer day', eventId);
        toast({ title: 'Added to your soccer day', points: 10 });
      };
      if (!state.auth) {
        dispatch({
          type: 'OPEN_SIGNIN_PROMPT',
          prompt: {
            kind: 'schedule',
            params: {},
            cta: 'add-schedule',
            onContinue: doIt,
          },
        });
        track('signin_prompt_shown', { cta: 'add-schedule' });
        return true;
      }
      doIt();
      return true;
    },
    [state.schedule, state.auth, addPoints, toast]
  );

  const removeFromSchedule = useCallback(
    (eventId: string) => {
      dispatch({ type: 'REMOVE_SCHEDULE', eventId });
      toast({ title: 'Removed from your day', variant: 'info' });
    },
    [toast]
  );

  const updateScheduleStatus = useCallback(
    (eventId: string, status: ScheduleStatus) => {
      dispatch({ type: 'UPDATE_SCHEDULE_STATUS', eventId, status });
    },
    []
  );

  const toggleReminder = useCallback(
    async (eventId: string, key: keyof ScheduleItem['reminders']) => {
      const item = state.schedule.find((s) => s.eventId === eventId);
      const turningOn = item ? !item.reminders[key] : true;
      dispatch({ type: 'TOGGLE_REMINDER', eventId, key });

      if (turningOn) {
        // TODO(integration: Notifications) Wire to FCM or Web Push for real reminders.
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            try {
              await Notification.requestPermission();
            } catch {
              /* fallback to in-app */
            }
          }
        }
        toast({ title: 'Reminder set', description: 'You will see an in-app badge — push optional.', variant: 'info' });
      }
    },
    [state.schedule, toast]
  );

  const checkInVenue = useCallback(
    (venueId: string, venueName: string) => {
      if (state.checkIns[venueId]) {
        toast({ title: 'Already checked in', description: `You have checked in at ${venueName}.`, variant: 'info' });
        return false;
      }
      const doIt = () => {
        dispatch({ type: 'CHECK_IN', venueId });
        addPoints('check-in', 25, `Checked in at ${venueName}`, venueId);
        toast({ title: `Checked in at ${venueName}`, points: 25 });
        dispatch({ type: 'OPEN_PHOTO_PROMPT', venueId, venueName });
      };
      if (!state.auth) {
        dispatch({
          type: 'OPEN_SIGNIN_PROMPT',
          prompt: {
            kind: 'checkIn',
            params: { venue: venueName },
            cta: 'check-in',
            onContinue: doIt,
          },
        });
        track('signin_prompt_shown', { cta: 'check-in' });
        return true;
      }
      doIt();
      return true;
    },
    [state.checkIns, state.auth, addPoints, toast]
  );

  const claimReward = useCallback(
    (rewardId: string, cost: number, title: string): 'claimed' | 'insufficient' | 'already' | 'auth-required' => {
      if (state.claimedRewards.some((r) => r.rewardId === rewardId)) return 'already';
      if (points < cost) return 'insufficient';
      if (!state.auth) {
        dispatch({
          type: 'OPEN_SIGNIN_PROMPT',
          prompt: {
            kind: 'reward',
            params: { title },
            cta: 'claim-reward',
            onContinue: () => {
              dispatch({ type: 'CLAIM_REWARD', rewardId });
              addPoints('reward-claim', -cost, `Claimed: ${title}`, rewardId);
              toast({ title: `Claimed: ${title}`, description: `-${cost} points · saved locally`, variant: 'reward' });
            },
          },
        });
        track('signin_prompt_shown', { cta: 'claim-reward' });
        return 'auth-required';
      }
      dispatch({ type: 'CLAIM_REWARD', rewardId });
      addPoints('reward-claim', -cost, `Claimed: ${title}`, rewardId);
      toast({ title: `Claimed: ${title}`, description: `-${cost} points · saved to your profile`, variant: 'reward' });
      return 'claimed';
    },
    [state.claimedRewards, points, state.auth, addPoints, toast]
  );

  const setProfile = useCallback(
    (p: Profile) => {
      dispatch({ type: 'SET_PROFILE', profile: p });
      toast({ title: 'Profile saved', variant: 'info' });
    },
    [toast]
  );

  const setArchetype = useCallback(
    (a: FanArchetype) => {
      dispatch({ type: 'SET_ARCHETYPE', archetype: a });
      addPoints('quiz-complete', 30, 'Completed archetype quiz', a);
    },
    [addPoints]
  );

  const completeTrivia = useCallback(
    (score: number, total: number) => {
      dispatch({ type: 'SET_TRIVIA', score, total });
      addPoints('quiz-complete', 30, `Completed Boston & Revs trivia · ${score}/${total}`);
      toast({ title: `Trivia complete · ${score}/${total}`, points: 30 });
    },
    [addPoints, toast]
  );

  const signIn = useCallback(
    (user: AuthUser) => {
      dispatch({ type: 'SET_AUTH', user });
      track('auth_signin', { provider: user.provider, sub: user.sub });

      // Auto-create a Profile if the user doesn't have one yet (uses Google name/picture).
      if (!state.profile) {
        const referralCode = `REVS-${user.sub.slice(-6).toUpperCase()}`;
        const newProfile: Profile = {
          name: user.name || user.givenName || 'New fan',
          favoriteCountry: '',
          favoriteTeam: '',
          visitor: 'local',
          zip: '',
          referralCode,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'SET_PROFILE', profile: newProfile });
      }

      // One-time +25 welcome bonus.
      if (!storage.getSigninBonus()) {
        storage.setSigninBonus(true);
        const entry: ActivityEntry = {
          id: uid(),
          type: 'signin-bonus',
          delta: 25,
          label: `Signed in with ${user.provider === 'google' ? 'Google' : 'Apple'}`,
          meta: user.email,
          at: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_ACTIVITY', entry });
        toast({ title: `Welcome, ${user.givenName || user.name.split(' ')[0]}`, description: '+25 bonus points', variant: 'reward', points: 25 });
      } else {
        toast({ title: `Welcome back, ${user.givenName || user.name.split(' ')[0]}`, variant: 'info' });
      }
    },
    [state.profile, toast]
  );

  const signOut = useCallback(() => {
    dispatch({ type: 'SET_AUTH', user: null });
    track('auth_signout', {});
    toast({ title: 'Signed out', variant: 'info' });
  }, [toast]);

  const requireAuth = useCallback(
    (opts: { kind: SignInPromptKind; params?: Record<string, string>; cta: string; action: () => void }) => {
      if (state.auth) {
        opts.action();
        return;
      }
      track('signin_prompt_shown', { cta: opts.cta });
      dispatch({
        type: 'OPEN_SIGNIN_PROMPT',
        prompt: {
          kind: opts.kind,
          params: opts.params || {},
          cta: opts.cta,
          onContinue: opts.action,
        },
      });
    },
    [state.auth]
  );

  const closeSignInPrompt = useCallback(() => {
    dispatch({ type: 'CLOSE_SIGNIN_PROMPT' });
  }, []);

  const openPhotoPrompt = useCallback((venueId: string, venueName: string) => {
    dispatch({ type: 'OPEN_PHOTO_PROMPT', venueId, venueName });
  }, []);

  const closePhotoPrompt = useCallback(() => {
    dispatch({ type: 'CLOSE_PHOTO_PROMPT' });
  }, []);

  const addPhoto = useCallback(
    (input: { venueId: string; venueName: string; dataUrl: string; caption?: string }) => {
      const photo: VenuePhoto = {
        id: uid(),
        venueId: input.venueId,
        venueName: input.venueName,
        dataUrl: input.dataUrl,
        caption: input.caption,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_PHOTO', photo });
      addPoints('photo-upload', PHOTO_BONUS_POINTS, `Photo at ${input.venueName}`, input.venueId);
      track('photo_uploaded', { venueId: input.venueId });
      toast({ title: `Photo saved · ${input.venueName}`, points: PHOTO_BONUS_POINTS, variant: 'reward' });
    },
    [addPoints, toast]
  );

  const removePhoto = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_PHOTO', id });
      toast({ title: 'Photo removed', variant: 'info' });
    },
    [toast]
  );

  const value: AppStoreContextValue = {
    state,
    points,
    addPoints,
    addToSchedule,
    removeFromSchedule,
    updateScheduleStatus,
    toggleReminder,
    checkInVenue,
    claimReward,
    setProfile,
    setArchetype,
    completeTrivia,
    signIn,
    signOut,
    requireAuth,
    closeSignInPrompt,
    openPhotoPrompt,
    closePhotoPrompt,
    addPhoto,
    removePhoto,
    toast,
    dismissToast,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider');
  return ctx;
}
