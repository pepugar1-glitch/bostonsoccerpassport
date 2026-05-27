import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
import { buildTicketLink } from '@/lib/utm';
import { track } from '@/lib/analytics';
import RevsLogo from '@/components/RevsLogo';
import { LogIn } from 'lucide-react';

const QUICK_CARDS = [
  { to: '/map?filter=fan-festival', key: 'fanFestival', icon: Tent, accent: 'from-revs-500/20 to-transparent' },
  { to: '/map?filter=watch-party', key: 'watchParties', icon: Tv2, accent: 'from-amber-400/20 to-transparent' },
  { to: '/map?filter=culture-hub', key: 'cultureHubs', icon: Landmark, accent: 'from-violet-400/20 to-transparent' },
  { to: '/map?filter=amateur-league', key: 'amateur', icon: Users, accent: 'from-sky-400/20 to-transparent' },
  { to: '/rewards', key: 'rewards', icon: Trophy, accent: 'from-emerald-400/20 to-transparent' },
] as const;

export default function Home() {
  const { state, points } = useAppStore();
  const profile = state.profile;
  const archetype = state.archetypeResult?.archetype;
  const { t } = useTranslation();

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
            {t('home.preTitle')}
          </div>
          <h1 className="mt-4 text-4xl lg:text-6xl font-display font-bold tracking-tight leading-[1.05]">
            {t('home.title')}
          </h1>
          <p className="mt-4 max-w-xl text-base lg:text-lg text-ink-200 leading-relaxed">
            {t('home.subtitle')}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/map"
              data-testid="hero-cta-explore-map"
              className="inline-flex items-center gap-2 rounded-full bg-revs-500 hover:bg-revs-400 active:bg-revs-600 text-white px-5 py-3 text-sm font-semibold shadow-glow transition-colors"
            >
              <MapPin size={16} /> {t('home.ctaExplore')}
            </Link>
            <Link
              to="/schedule"
              data-testid="hero-cta-build-day"
              className="inline-flex items-center gap-2 rounded-full bg-white/8 hover:bg-white/12 ring-1 ring-white/10 px-5 py-3 text-sm font-semibold transition-colors"
            >
              <CalendarCheck2 size={16} /> {t('home.ctaBuildDay')}
            </Link>
          </div>

          {/* Status strip */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl">
            <Stat label={t('home.statPoints')} value={points.toLocaleString()} />
            <Stat label={t('home.statDays')} value={state.schedule.length.toString()} />
            <Stat label={t('home.statCheckIns')} value={Object.keys(state.checkIns).length.toString()} />
            <Stat
              label={t('home.statArchetype')}
              value={archetype ? t(`archetype.${archetype}`).split(' ')[0] : t('home.statTakeQuiz')}
              link={archetype ? '/profile' : '/quiz'}
            />
          </div>
        </div>
      </section>

      {/* Welcome line */}
      {profile?.name && (
        <div className="text-sm text-ink-300">
          {t('home.welcomeBack', { name: profile.name })}
        </div>
      )}

      {/* Sign-in nudge (only when not authed) */}
      {!state.auth && (
        <Link
          to="/login"
          data-testid="home-signin-banner"
          className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-revs-500/15 to-navy-800/40 ring-1 ring-revs-500/30 hover:ring-revs-500/60 px-4 py-3 transition-colors"
        >
          <div className="h-9 w-9 rounded-xl bg-revs-500/25 ring-1 ring-revs-500/40 grid place-items-center shrink-0">
            <LogIn size={16} className="text-revs-200" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{t('home.signinBanner.title')}</div>
            <div className="text-[11px] text-ink-300 mt-0.5">{t('home.signinBanner.body')}</div>
          </div>
          <ArrowRight
            size={14}
            className="text-ink-300 group-hover:text-white group-hover:translate-x-0.5 transition-transform shrink-0 rtl:rotate-180"
          />
        </Link>
      )}

      {/* Quick cards */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-display font-bold tracking-tight">{t('home.planWeek')}</h2>
          <Link to="/map" className="text-xs text-ink-300 hover:text-white inline-flex items-center gap-1">
            {t('home.openMap')} <ArrowRight size={12} className="rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_CARDS.map(({ to, key, icon: Icon, accent }, idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * idx, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={to}
                data-testid={`quick-card-${key}`}
                className="group relative block rounded-2xl bg-navy-800/60 ring-1 ring-white/5 hover:ring-white/15 px-4 py-4 transition-all hover:-translate-y-0.5 shadow-card overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60 group-hover:opacity-90 transition-opacity`} aria-hidden />
                <div className="relative">
                  <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/10 grid place-items-center mb-3">
                    <Icon size={18} />
                  </div>
                  <div className="text-sm font-semibold leading-tight">{t(`home.cards.${key}`)}</div>
                  <div className="text-[11px] text-ink-300 mt-1 leading-tight">{t(`home.cards.${key}Sub`)}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Continue with the Revs */}
      <section className="rounded-3xl bg-navy-900/55 ring-1 ring-white/5 shadow-card overflow-hidden">
        <div className="px-6 lg:px-10 py-6 lg:py-7 flex items-center justify-between gap-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <RevsLogo size={52} className="shrink-0 drop-shadow" />
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">{t('home.revsSection.preTitle')}</div>
              <h3 className="text-lg lg:text-xl font-display font-bold tracking-tight mt-1">
                {t('home.revsSection.title')}
              </h3>
            </div>
          </div>
          <Link
            to="/rewards"
            className="hidden sm:inline-flex items-center gap-1 rounded-full ring-1 ring-white/10 bg-white/[0.05] hover:bg-white/[0.08] px-3 py-1.5 text-xs"
          >
            {t('home.revsSection.seeRewards')} <ArrowRight size={12} className="rtl:rotate-180" />
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
                  <div className="text-sm font-semibold">{t('home.revsSection.vs', { opponent: m.opponent })}</div>
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
                    <Ticket size={11} /> {t('home.revsSection.tickets')}
                  </a>
                  <Link
                    to="/schedule"
                    className="text-[11px] text-center rounded-full ring-1 ring-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1 transition-colors"
                  >
                    {t('home.revsSection.plan')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <p className="px-6 lg:px-10 pb-6 text-xs text-ink-400 leading-relaxed">
          {t('home.revsSection.tagline')}
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
          <div className="text-base font-display font-bold tracking-tight">{t('home.quiz.archetypeTitle')}</div>
          <div className="text-xs text-ink-300 mt-1">{t('home.quiz.archetypeBody')}</div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-white">
            {t('home.quiz.archetypeCta')} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </div>
        </Link>
        <Link
          to="/quiz/trivia"
          data-testid="home-cta-trivia-quiz"
          className="group relative rounded-3xl bg-gradient-to-br from-revs-700/40 to-navy-900 ring-1 ring-white/5 hover:ring-white/15 px-6 py-6 transition-all shadow-card overflow-hidden"
        >
          <Trophy size={18} className="text-revs-300 mb-3" />
          <div className="text-base font-display font-bold tracking-tight">{t('home.quiz.triviaTitle')}</div>
          <div className="text-xs text-ink-300 mt-1">{t('home.quiz.triviaBody')}</div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-white">
            {t('home.quiz.triviaCta')} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
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
