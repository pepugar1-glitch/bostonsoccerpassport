import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User as UserIcon,
  Globe2,
  MapPin,
  Trophy,
  ShieldCheck,
  Award,
  Copy,
  CheckCircle2,
  Sparkles,
  Heart,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ARCHETYPE_LABELS, ARCHETYPE_DESCRIPTIONS, ARCHETYPE_NEXT_ACTION, REWARDS } from '@/data/content';
import { ACHIEVEMENTS } from '@/data/achievements';
import type { Profile } from '@/types';
import { cn } from '@/lib/cn';

const EMPTY: Profile = {
  name: '',
  favoriteCountry: '',
  favoriteTeam: '',
  visitor: 'local',
  zip: '',
  referralCode: '',
  createdAt: '',
};

function randomCode() {
  const letters = 'BSTNRVS';
  const nums = Math.floor(1000 + Math.random() * 9000);
  let out = '';
  for (let i = 0; i < 3; i++) out += letters[Math.floor(Math.random() * letters.length)];
  return `${out}-${nums}`;
}

export default function ProfileScreen() {
  const { state, setProfile, points, toast, addPoints, signOut } = useAppStore();
  const auth = state.auth;
  const { t } = useTranslation();
  const [form, setForm] = useState<Profile>(EMPTY);
  const [copied, setCopied] = useState(false);
  const archetype = state.archetypeResult?.archetype;
  const claimedSet = new Set(state.claimedRewards.map((r) => r.rewardId));
  const claimedRewards = REWARDS.filter((r) => claimedSet.has(r.id));
  const attendedCount = state.schedule.filter((s) => s.status === 'attended').length;

  useEffect(() => {
    if (state.profile) setForm(state.profile);
    else
      setForm((prev) => ({
        ...prev,
        referralCode: prev.referralCode || randomCode(),
        createdAt: new Date().toISOString(),
      }));
  }, [state.profile]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: 'Add a name to save your profile.', variant: 'warn' });
      return;
    }
    setProfile({
      ...form,
      createdAt: form.createdAt || new Date().toISOString(),
      referralCode: form.referralCode || randomCode(),
    });
  };

  const handleRefer = async () => {
    const link = `${window.location.origin}/?ref=${form.referralCode || randomCode()}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    addPoints('referral', 50, 'Referral link copied (mock)', form.referralCode);
    toast({ title: 'Referral link copied', points: 50 });
  };

  return (
    <div className="space-y-6 pb-2" data-testid="profile-screen">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">{t('profile.preTitle')}</div>
        <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">
          {form.name ? t('profile.hi', { name: form.name.split(' ')[0] }) : t('profile.title')}
        </h1>
        <p className="mt-1 text-sm text-ink-300">{t('profile.intro')}</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_22rem] gap-5">
        {/* Form */}
        <form
          onSubmit={onSave}
          data-testid="profile-form"
          className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 shadow-card p-5 space-y-4"
        >
          <Field label="Name" icon={UserIcon}>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              data-testid="profile-name"
              placeholder="Your name"
              className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 focus:ring-revs-400 outline-none px-3 py-2.5 text-sm"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Favorite country" icon={Globe2}>
              <input
                value={form.favoriteCountry}
                onChange={(e) => setForm({ ...form, favoriteCountry: e.target.value })}
                data-testid="profile-country"
                placeholder="e.g. Brazil"
                className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 focus:ring-revs-400 outline-none px-3 py-2.5 text-sm"
              />
            </Field>
            <Field label="Favorite team" icon={Heart}>
              <input
                value={form.favoriteTeam}
                onChange={(e) => setForm({ ...form, favoriteTeam: e.target.value })}
                data-testid="profile-team"
                placeholder="e.g. New England Revolution"
                className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 focus:ring-revs-400 outline-none px-3 py-2.5 text-sm"
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Are you local or visiting?">
              <div className="flex gap-2">
                {(['local', 'visitor'] as const).map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setForm({ ...form, visitor: opt })}
                    data-testid={`profile-visitor-${opt}`}
                    className={cn(
                      'flex-1 rounded-xl px-3 py-2.5 text-sm ring-1 transition-colors capitalize',
                      form.visitor === opt
                        ? 'bg-revs-500/15 ring-revs-500/40 text-white'
                        : 'bg-white/[0.04] ring-white/10 text-ink-200'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="ZIP / neighborhood" icon={MapPin}>
              <input
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                data-testid="profile-zip"
                placeholder="02118 or Back Bay"
                className="w-full rounded-xl bg-white/[0.04] ring-1 ring-white/10 focus:ring-revs-400 outline-none px-3 py-2.5 text-sm"
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              data-testid="profile-save"
              className="inline-flex items-center gap-2 rounded-xl bg-revs-500 hover:bg-revs-400 active:bg-revs-600 text-white px-4 py-2.5 text-sm font-semibold shadow-glow"
            >
              <CheckCircle2 size={15} /> Save profile
            </button>
            {!archetype && (
              <Link
                to="/quiz/archetype"
                className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10 px-4 py-2.5 text-sm"
              >
                <Sparkles size={15} /> Take the archetype quiz (+30)
              </Link>
            )}
          </div>
        </form>

        {/* Side panel */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 ring-1 ring-white/5 p-5 shadow-card">
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Your archetype</div>
            {archetype ? (
              <>
                <div className="mt-2 text-lg font-display font-bold tracking-tight" data-testid="profile-archetype">
                  {ARCHETYPE_LABELS[archetype]}
                </div>
                <p className="mt-1.5 text-xs text-ink-300 leading-relaxed">{ARCHETYPE_DESCRIPTIONS[archetype]}</p>
                <Link
                  to={ARCHETYPE_NEXT_ACTION[archetype].to}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-white"
                >
                  {ARCHETYPE_NEXT_ACTION[archetype].label} →
                </Link>
              </>
            ) : (
              <div className="mt-2 text-xs text-ink-300">Take the quiz to get a personalized recommendation.</div>
            )}
          </div>

          <div className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 p-5 shadow-card">
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Points" value={points.toLocaleString()} icon={Trophy} />
              <Stat label="Attended" value={attendedCount.toString()} icon={CheckCircle2} />
              <Stat
                label="Check-ins"
                value={Object.keys(state.checkIns).length.toString()}
                icon={ShieldCheck}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 p-5 shadow-card">
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Referral code</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="text-lg font-mono font-bold tracking-tight" data-testid="profile-referral-code">
                {form.referralCode || '—'}
              </div>
              <button
                onClick={handleRefer}
                data-testid="profile-referral-copy"
                className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-1.5 text-xs"
              >
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Refer (+50)'}
              </button>
            </div>
          </div>

          <div
            data-testid="profile-connected-accounts"
            className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 p-5 shadow-card"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Connected account</div>
            {auth ? (
              <div className="mt-3 flex items-center gap-3">
                {auth.picture ? (
                  <img
                    src={auth.picture}
                    alt=""
                    className="h-10 w-10 rounded-full ring-1 ring-white/10 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-revs-500/20 ring-1 ring-revs-500/30 grid place-items-center text-sm font-semibold">
                    {(auth.givenName || auth.name).slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{auth.name}</div>
                  <div className="text-[11px] text-ink-400 truncate flex items-center gap-1.5">
                    <GoogleG /> {auth.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={signOut}
                  data-testid="profile-signout"
                  className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-white/10 px-3 py-1.5 text-xs"
                >
                  <LogOut size={12} /> Sign out
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-xs text-ink-300 leading-relaxed">
                  Sign in to keep your points, schedule and badges across devices. +25 welcome bonus.
                </p>
                <Link
                  to="/login"
                  data-testid="profile-signin-cta"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-revs-500 hover:bg-revs-400 text-white px-4 py-2 text-xs font-semibold"
                >
                  <LogIn size={12} /> Sign in with Google
                </Link>
              </div>
            )}
          </div>

          <div
            data-testid="profile-achievements"
            className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 p-5 shadow-card"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Achievements</div>
            {(() => {
              const ctx = {
                checkIns: Object.keys(state.checkIns).length,
                scheduleCount: state.schedule.length,
                points,
                archetypeDone: Boolean(state.archetypeResult),
                triviaDone: Boolean(state.triviaResult),
                rewardsClaimed: state.claimedRewards.length,
                signedIn: Boolean(state.auth),
              };
              const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlockedBy(ctx)).length;
              return (
                <>
                  <div className="mt-1 text-[11px] text-ink-300">
                    {unlockedCount} / {ACHIEVEMENTS.length} unlocked
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {ACHIEVEMENTS.map((a) => {
                      const unlocked = a.unlockedBy(ctx);
                      const Icon = a.icon;
                      return (
                        <div
                          key={a.id}
                          data-testid={`achievement-${a.id}`}
                          title={a.body}
                          className={cn(
                            'rounded-xl ring-1 px-2.5 py-2 flex items-start gap-2 transition-colors',
                            unlocked
                              ? 'bg-emerald-500/10 ring-emerald-500/30 text-emerald-100'
                              : 'bg-white/[0.03] ring-white/5 text-ink-400'
                          )}
                        >
                          <div
                            className={cn(
                              'grid place-items-center h-7 w-7 rounded-lg shrink-0',
                              unlocked
                                ? 'bg-emerald-500/20 ring-1 ring-emerald-500/30'
                                : 'bg-white/[0.04] ring-1 ring-white/10'
                            )}
                          >
                            <Icon size={13} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold leading-tight">{a.title}</div>
                            <div className="text-[10px] leading-tight mt-0.5 opacity-80 line-clamp-2">
                              {a.body}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>

          <div className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 p-5 shadow-card">
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Badges & saved rewards</div>
            {claimedRewards.length === 0 ? (
              <div className="mt-2 text-xs text-ink-300">No rewards claimed yet. Earn points and claim from the Rewards tab.</div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {claimedRewards.map((r) => (
                  <span
                    key={r.id}
                    data-testid={`profile-badge-${r.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-200 px-2.5 py-1 text-[11px] font-semibold"
                  >
                    <Award size={11} /> {r.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof UserIcon;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400 inline-flex items-center gap-1.5">
        {Icon && <Icon size={11} />} {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Trophy }) {
  return (
    <div>
      <Icon size={14} className="mx-auto text-ink-300" />
      <div className="mt-1 text-lg font-display font-bold tracking-tight">{value}</div>
      <div className="text-[10px] text-ink-400">{label}</div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 18 18" width={11} height={11} aria-hidden>
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 009 18z" fill="#34A853" />
      <path d="M3.97 10.72A5.41 5.41 0 013.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.04l3.01-2.32z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.43 0 9 0A9 9 0 00.96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
