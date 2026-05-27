import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Tent,
  Tv2,
  Landmark,
  Users,
  Trophy,
  Sparkles,
  MapPin,
  CalendarCheck2,
  Ticket,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAppStore } from '@/lib/store';
import { UPCOMING_MATCHES } from '@/data/content';
import { ARCHETYPE_LABELS } from '@/data/content';
import { buildTicketLink } from '@/lib/utm';
import { track } from '@/lib/analytics';

const QUICK_CARDS = [
  {
    to: '/map?filter=fan-festival',
    label: 'Fan Festival',
    sub: 'City Hall Plaza · Jun 12–27',
    icon: Tent,
    accent: 'from-revs-500/20 to-transparent',
  },
  {
    to: '/map?filter=watch-party',
    label: 'Watch Parties',
    sub: '12 venues across the city',
    icon: Tv2,
    accent: 'from-amber-400/20 to-transparent',
  },
  {
    to: '/map?filter=culture-hub',
    label: 'Soccer Culture Hubs',
    sub: 'East Boston · Cambridge · Allston',
    icon: Landmark,
    accent: 'from-violet-400/20 to-transparent',
  },
  {
    to: '/map?filter=amateur-league',
    label: 'Amateur Leagues',
    sub: 'Volo · NEOTHSL · pickup',
    icon: Users,
    accent: 'from-sky-400/20 to-transparent',
  },
  {
    to: '/rewards',
    label: 'Revs Rewards',
    sub: 'Earn points · unlock perks',
    icon: Trophy,
    accent: 'from-emerald-400/20 to-transparent',
  },
];

export default function Home() {
  const { state, points } = useAppStore();
  const profile = state.profile;
  const archetype = state.archetypeResult?.archetype;

  return (
    <div className="space-y-8 pb-2" data-testid="home-screen">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-navy-900/60 ring-1 ring-white/5 shadow-card">
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(900px 380px at -10% -10%, rgba(200,16,46,0.28), transparent 60%), radial-gradient(800px 360px at 110% 0%, rgba(31,55,102,0.85), transparent 55%)',
          }}
        />
        <div className="relative px-6 lg:px-12 py-10 lg:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-ink-200">
            <span className="w-1.5 h-1.5 rounded-full bg-revs-400 animate-pulse-soft" />
            Summer 2026 · New England
          </div>
          <h1 className="mt-4 text-4xl lg:text-6xl font-display font-bold tracking-tight leading-[1.05]">
            Your Boston
            <br className="hidden sm:block" /> Soccer Passport
          </h1>
          <p className="mt-4 max-w-xl text-base lg:text-lg text-ink-200 leading-relaxed">
            Discover where to watch, play, celebrate, and continue your soccer journey in New England.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/map"
              data-testid="hero-cta-explore-map"
              className="inline-flex items-center gap-2 rounded-full bg-revs-500 hover:bg-revs-400 active:bg-revs-600 text-white px-5 py-3 text-sm font-semibold shadow-glow transition-colors"
            >
              <MapPin size={16} /> Explore Map
            </Link>
            <Link
              to="/schedule"
              data-testid="hero-cta-build-day"
              className="inline-flex items-center gap-2 rounded-full bg-white/8 hover:bg-white/12 ring-1 ring-white/10 px-5 py-3 text-sm font-semibold transition-colors"
            >
              <CalendarCheck2 size={16} /> Build My Soccer Day
            </Link>
          </div>

          {/* Status strip */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl">
            <Stat label="Your Points" value={points.toLocaleString()} />
            <Stat label="Days In Schedule" value={state.schedule.length.toString()} />
            <Stat
              label="Check-ins"
              value={Object.keys(state.checkIns).length.toString()}
            />
            <Stat
              label="Archetype"
              value={archetype ? ARCHETYPE_LABELS[archetype].split(' ')[0] : 'Take quiz'}
              link={archetype ? '/profile' : '/quiz'}
            />
          </div>
        </div>
      </section>

      {/* Welcome line */}
      {profile?.name && (
        <div className="text-sm text-ink-300">
          Welcome back, <span className="text-white font-semibold">{profile.name}</span> · keep building your day.
        </div>
      )}

      {/* Quick cards */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-display font-bold tracking-tight">Plan your week</h2>
          <Link to="/map" className="text-xs text-ink-300 hover:text-white inline-flex items-center gap-1">
            Open map <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_CARDS.map(({ to, label, sub, icon: Icon, accent }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={to}
                data-testid={`quick-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className="group relative block rounded-2xl bg-navy-800/60 ring-1 ring-white/5 hover:ring-white/15 px-4 py-4 transition-all hover:-translate-y-0.5 shadow-card overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60 group-hover:opacity-90 transition-opacity`} aria-hidden />
                <div className="relative">
                  <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/10 grid place-items-center mb-3">
                    <Icon size={18} />
                  </div>
                  <div className="text-sm font-semibold leading-tight">{label}</div>
                  <div className="text-[11px] text-ink-300 mt-1 leading-tight">{sub}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Continue with the Revs */}
      <section className="rounded-3xl bg-navy-900/55 ring-1 ring-white/5 shadow-card overflow-hidden">
        <div className="px-6 lg:px-10 py-6 lg:py-7 flex items-center justify-between gap-4 border-b border-white/5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">After the summer</div>
            <h3 className="text-lg lg:text-xl font-display font-bold tracking-tight mt-1">
              Continue the summer with the Revs
            </h3>
          </div>
          <Link
            to="/rewards"
            className="hidden sm:inline-flex items-center gap-1 rounded-full ring-1 ring-white/10 bg-white/[0.05] hover:bg-white/[0.08] px-3 py-1.5 text-xs"
          >
            See rewards <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3 p-4 lg:p-6">
          {UPCOMING_MATCHES.map((m) => {
            const ticketLink = buildTicketLink({ venueId: m.id, archetype });
            return (
              <div
                key={m.id}
                data-testid={`upcoming-match-${m.id}`}
                className="rounded-2xl bg-navy-800/60 ring-1 ring-white/5 px-4 py-4 flex items-center gap-4"
              >
                <div className="grid place-items-center h-12 w-12 rounded-xl bg-revs-500/15 ring-1 ring-revs-500/30">
                  <Trophy size={20} className="text-revs-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Revolution vs {m.opponent}</div>
                  <div className="text-[11px] text-ink-300 mt-0.5">
                    {format(parseISO(m.date), 'EEE · MMM d, yyyy')} · {m.competition}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={ticketLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => track('revs_ticket_click', { matchId: m.id, archetype, surface: 'home' })}
                    data-testid={`upcoming-match-tickets-${m.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-revs-500 hover:bg-revs-400 text-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
                  >
                    <Ticket size={11} /> Tickets
                  </a>
                  <Link
                    to="/schedule"
                    className="text-[11px] text-center rounded-full ring-1 ring-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1 transition-colors"
                  >
                    Plan
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <p className="px-6 lg:px-10 pb-6 text-xs text-ink-400 leading-relaxed">
          The Revolution play through October. Take what you love about the summer of soccer and bring it
          home to Gillette — no hard sell.
        </p>
      </section>

      {/* Quiz prompt */}
      <section className="grid lg:grid-cols-2 gap-4">
        <Link
          to="/quiz/archetype"
          data-testid="home-cta-archetype-quiz"
          className="group relative rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 ring-1 ring-white/5 hover:ring-white/15 px-6 py-6 transition-all shadow-card overflow-hidden"
        >
          <Sparkles size={18} className="text-revs-300 mb-3" />
          <div className="text-base font-display font-bold tracking-tight">What kind of soccer fan are you?</div>
          <div className="text-xs text-ink-300 mt-1">7 questions · personalized recommendation · +30 points</div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-white">
            Take the quiz <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
        <Link
          to="/quiz/trivia"
          data-testid="home-cta-trivia-quiz"
          className="group relative rounded-3xl bg-gradient-to-br from-revs-700/40 to-navy-900 ring-1 ring-white/5 hover:ring-white/15 px-6 py-6 transition-all shadow-card overflow-hidden"
        >
          <Trophy size={18} className="text-revs-300 mb-3" />
          <div className="text-base font-display font-bold tracking-tight">Boston & Revs trivia</div>
          <div className="text-xs text-ink-300 mt-1">10 questions · soccer culture + MLS basics · +30 points</div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-white">
            Test yourself <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value, link }: { label: string; value: string; link?: string }) {
  const inner = (
    <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/5 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">{label}</div>
      <div className="text-lg font-display font-bold tracking-tight mt-1">{value}</div>
    </div>
  );
  return link ? (
    <Link to={link} className="block hover:ring-white/15 transition">
      {inner}
    </Link>
  ) : (
    inner
  );
}
