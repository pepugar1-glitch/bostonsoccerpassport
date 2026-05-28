import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Ticket, CalendarPlus, Trophy } from 'lucide-react';
import { UPCOMING_MATCHES } from '@/data/content';
import { buildTicketLink } from '@/lib/utm';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';

interface Parts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function diffParts(target: Date, now: Date): Parts {
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(totalMs / 86_400_000);
  const hours = Math.floor((totalMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1000);
  return { days, hours, minutes, seconds, totalMs };
}

interface Props {
  archetype?: string;
}

export default function MatchCountdown({ archetype }: Props) {
  const [now, setNow] = useState(() => new Date());
  const { t } = useTranslation();

  const nextMatch = useMemo(() => {
    const today = new Date();
    return UPCOMING_MATCHES
      .filter((m) => m.homeAway === 'home')
      .map((m) => ({ m, when: parseISO(`${m.date}T19:30:00`) }))
      .filter((x) => x.when.getTime() > today.getTime())
      .sort((a, b) => a.when.getTime() - b.when.getTime())[0];
  }, []);

  useEffect(() => {
    if (!nextMatch) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [nextMatch]);

  if (!nextMatch) return null;

  const parts = diffParts(nextMatch.when, now);
  const isImminent = parts.totalMs > 0 && parts.totalMs < 24 * 3_600_000;
  const ticketUrl = buildTicketLink(
    { venueId: nextMatch.m.id, archetype },
    nextMatch.m.ticketUrl
  );

  return (
    <section
      data-testid="match-countdown"
      className={cn(
        'relative overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-card',
        'bg-gradient-to-br from-revs-700/40 via-navy-900 to-navy-950'
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 pointer-events-none"
        style={{
          background:
            'radial-gradient(700px 320px at 100% 100%, rgba(200,16,46,0.35), transparent 65%), radial-gradient(500px 240px at -10% -10%, rgba(31,55,102,0.7), transparent 60%)',
        }}
      />
      <div className="relative px-6 lg:px-8 py-6 lg:py-7">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'grid place-items-center h-10 w-10 rounded-xl ring-1',
                isImminent
                  ? 'bg-revs-500/30 ring-revs-400/60 text-white animate-pulse-soft'
                  : 'bg-revs-500/15 ring-revs-500/30 text-revs-200'
              )}
            >
              <Trophy size={18} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-300">
                {t('countdown.nextHome')}
              </div>
              <div className="text-lg lg:text-xl font-display font-bold tracking-tight mt-0.5">
                {t('home.revsSection.vs', { opponent: nextMatch.m.opponent })}
              </div>
              <div className="text-[11px] text-ink-300 mt-0.5">
                {format(nextMatch.when, 'EEE · MMM d, yyyy · h:mm a')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={ticketUrl}
              target="_blank"
              rel="noreferrer"
              data-testid="countdown-tickets"
              onClick={() =>
                track('revs_ticket_click', {
                  matchId: nextMatch.m.id,
                  archetype,
                  surface: 'countdown',
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-revs-500 hover:bg-revs-400 active:bg-revs-600 text-white px-4 py-2 text-xs font-semibold transition-colors shadow-glow"
            >
              <Ticket size={13} /> {t('home.revsSection.tickets')}
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=42.0909,-71.2643`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-2 text-[11px]"
            >
              <CalendarPlus size={11} /> {t('countdown.directions')}
            </a>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 lg:gap-3 max-w-xl">
          <TimeBlock label={t('countdown.days')} value={parts.days} />
          <TimeBlock label={t('countdown.hours')} value={parts.hours} />
          <TimeBlock label={t('countdown.minutes')} value={parts.minutes} />
          <TimeBlock label={t('countdown.seconds')} value={parts.seconds} live />
        </div>
      </div>
    </section>
  );
}

function TimeBlock({ label, value, live }: { label: string; value: number; live?: boolean }) {
  const padded = value.toString().padStart(2, '0');
  return (
    <div
      className={cn(
        'rounded-2xl ring-1 px-2 py-3 lg:py-4 text-center backdrop-blur',
        live
          ? 'bg-revs-500/15 ring-revs-500/30'
          : 'bg-white/[0.05] ring-white/10'
      )}
    >
      <div className="text-2xl lg:text-3xl font-display font-bold tabular-nums tracking-tight leading-none">
        {padded}
      </div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-ink-300 mt-1.5">{label}</div>
    </div>
  );
}
