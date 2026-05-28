import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Gift,
  Ticket,
  UtensilsCrossed,
  Users,
  Star,
  History,
  Trophy,
  ExternalLink,
} from 'lucide-react';
import { REWARDS } from '@/data/content';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import { buildTicketLink } from '@/lib/utm';
import { track } from '@/lib/analytics';

const NEXT_TIERS = [100, 250, 400, 500, 600, 800, 1000];

function categoryIcon(c: string) {
  switch (c) {
    case 'merch':
      return Gift;
    case 'ticket':
      return Ticket;
    case 'food':
      return UtensilsCrossed;
    case 'experience':
      return Star;
    case 'lottery':
      return Sparkles;
    case 'family':
      return Users;
    default:
      return Award;
  }
}

export default function Rewards() {
  const { state, points, claimReward, toast } = useAppStore();
  const { t } = useTranslation();
  const claimed = new Set(state.claimedRewards.map((c) => c.rewardId));

  const nextTier = useMemo(() => NEXT_TIERS.find((t) => t > points) ?? 1000, [points]);
  const prevTier = useMemo(() => [...NEXT_TIERS].reverse().find((t) => t <= points) ?? 0, [points]);
  const progress = Math.min(100, ((points - prevTier) / (nextTier - prevTier || 1)) * 100);

  const handleClaim = (id: string, cost: number, title: string) => {
    const result = claimReward(id, cost, title);
    if (result === 'claimed') {
      track('reward_claim', { rewardId: id, cost });
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 38,
        origin: { y: 0.3 },
        colors: ['#C8102E', '#FFFFFF', '#0A1A3D', '#F59E0B'],
      });
    } else if (result === 'insufficient') {
      toast({
        title: 'Not enough points yet',
        description: `You need ${cost - points} more to claim ${title}.`,
        variant: 'warn',
      });
    }
  };

  const archetype = state.archetypeResult?.archetype;

  return (
    <div className="space-y-6 pb-2" data-testid="rewards-screen">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">{t('rewards.preTitle')}</div>
        <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">{t('rewards.title')}</h1>
        <p className="mt-1 text-sm text-ink-300">{t('rewards.subtitle')}</p>
      </header>

      {/* Balance & progress */}
      <section className="rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 ring-1 ring-white/5 shadow-card overflow-hidden">
        <div className="px-6 lg:px-10 py-6 lg:py-8 flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Current balance</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span data-testid="rewards-balance" className="text-5xl lg:text-6xl font-display font-bold tracking-tight">
                {points.toLocaleString()}
              </span>
              <span className="text-xs text-ink-400">points</span>
            </div>
            <div className="mt-2 text-xs text-ink-300">
              {nextTier - points > 0 ? (
                <>
                  <span className="text-white font-semibold">{nextTier - points}</span> to next tier ({nextTier})
                </>
              ) : (
                <>You&apos;ve hit the top tier · claim away.</>
              )}
            </div>
          </div>
          <div className="hidden sm:grid place-items-center h-14 w-14 rounded-2xl bg-revs-500/20 ring-1 ring-revs-500/30">
            <Trophy size={22} className="text-revs-300" />
          </div>
        </div>
        <div className="px-6 lg:px-10 pb-6">
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-revs-500 to-revs-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </section>

      {/* Earn rules */}
      <section className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 shadow-card">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <Sparkles size={14} className="text-revs-300" />
          <div className="text-sm font-semibold">How to earn</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
          <EarnTile delta="+25" label="Check in at a venue" />
          <EarnTile delta="+10" label="Add to your day" />
          <EarnTile delta="+50" label="Refer a friend" />
          <EarnTile delta="+30" label="Complete a quiz" />
          <EarnTile delta="+20" label="Share a photo card" />
          <EarnTile delta="+40" label="Visit a partner watch party" />
          <EarnTile delta="+200" label="Attend a Revs match" highlight />
          <EarnTile delta="+25" label="First-time welcome bonus" />
        </div>
      </section>

      {/* Reward grid */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-display font-bold tracking-tight">Catalog</h2>
          <div className="text-[11px] text-ink-400">{REWARDS.length} rewards</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REWARDS.map((r) => {
            const Icon = categoryIcon(r.category);
            const isClaimed = claimed.has(r.id);
            const isLocked = points < r.cost && !isClaimed;
            return (
              <div
                key={r.id}
                data-testid={`reward-card-${r.id}`}
                className={cn(
                  'rounded-2xl ring-1 px-5 py-5 shadow-card transition-all',
                  isClaimed
                    ? 'bg-emerald-500/10 ring-emerald-500/30'
                    : isLocked
                    ? 'bg-navy-900/60 ring-white/5'
                    : 'bg-navy-900/60 ring-white/15 hover:ring-revs-500/40'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-xl grid place-items-center ring-1',
                        isClaimed
                          ? 'bg-emerald-500/20 ring-emerald-500/30 text-emerald-200'
                          : 'bg-revs-500/15 ring-revs-500/30 text-revs-300'
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-semibold">{r.title}</div>
                      <div className="text-[11px] text-ink-400 mt-0.5">{r.cost} points</div>
                    </div>
                  </div>
                  {isClaimed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                      <CheckCircle2 size={10} /> Claimed
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xs text-ink-300 leading-relaxed">{r.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  {isClaimed ? (
                    <span className="text-[11px] text-emerald-200">Saved to your profile.</span>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-ink-400">
                      <Lock size={11} /> {r.cost - points} more points
                    </span>
                  ) : (
                    <span className="text-[11px] text-ink-200">Available to claim.</span>
                  )}
                  <button
                    onClick={() => handleClaim(r.id, r.cost, r.title)}
                    disabled={isLocked || isClaimed}
                    data-testid={`reward-claim-${r.id}`}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      isClaimed
                        ? 'bg-white/[0.06] text-ink-300 cursor-default'
                        : isLocked
                        ? 'bg-white/[0.04] text-ink-400 cursor-not-allowed'
                        : 'bg-revs-500 hover:bg-revs-400 active:bg-revs-600 text-white shadow-glow'
                    )}
                  >
                    {isClaimed ? 'Claimed' : isLocked ? 'Locked' : r.cta}
                  </button>
                </div>

                {/* Ticketmaster placeholder CTA · only on rw-400 once claimed */}
                {/* TODO(integration: Ticketmaster) Swap host with real partner URL. */}
                {isClaimed && r.id === 'rw-400' && (
                  <a
                    href={buildTicketLink({ venueId: 'rw-400-claim', archetype })}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      track('revs_ticket_click', { rewardId: 'rw-400', archetype, surface: 'rewards' })
                    }
                    data-testid="rw-400-ticket-cta"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white text-navy-900 hover:bg-ink-50 px-3 py-2 text-xs font-semibold transition-colors"
                  >
                    <Ticket size={13} /> Open my discounted Revs ticket
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Activity feed */}
      <section className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 shadow-card">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <History size={14} className="text-ink-300" />
          <div className="text-sm font-semibold">Activity</div>
        </div>
        {state.activity.length === 0 ? (
          <div className="px-5 py-6 text-sm text-ink-300">No activity yet. Start by checking in at a venue.</div>
        ) : (
          <ul>
            {state.activity.slice(0, 25).map((a) => (
              <li
                key={a.id}
                data-testid={`activity-row-${a.id}`}
                className="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.label}</div>
                  <div className="text-[11px] text-ink-400 mt-0.5">{format(parseISO(a.at), 'MMM d · h:mm a')}</div>
                </div>
                <div
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums',
                    a.delta >= 0
                      ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-200'
                      : 'bg-revs-500/15 ring-1 ring-revs-500/30 text-revs-200'
                  )}
                >
                  {a.delta >= 0 ? `+${a.delta}` : a.delta}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EarnTile({ delta, label, highlight }: { delta: string; label: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl px-3 py-3 ring-1',
        highlight ? 'bg-revs-500/12 ring-revs-500/30' : 'bg-white/[0.04] ring-white/5'
      )}
    >
      <div className={cn('text-base font-display font-bold tracking-tight', highlight ? 'text-revs-200' : 'text-white')}>
        {delta}
      </div>
      <div className="text-[11px] text-ink-300 mt-0.5">{label}</div>
    </div>
  );
}
