import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ARCHETYPE_LABELS, ARCHETYPE_DESCRIPTIONS, ARCHETYPE_NEXT_ACTION, REWARDS } from '@/data/content';
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
  const { state, setProfile, points, toast, addPoints } = useAppStore();
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
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Profile</div>
        <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">
          {form.name ? `Hi, ${form.name.split(' ')[0]}` : 'Your soccer summer'}
        </h1>
        <p className="mt-1 text-sm text-ink-300">
          Personalize your passport. Your information helps personalize your soccer experience. You control
          what you share.
        </p>
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
