import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X, MapPin, CalendarCheck2, Trophy, User, Sparkles, type LucideIcon } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useAppStore } from '@/lib/store';
import RevsLogo from './RevsLogo';

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: 'Welcome to your Boston Soccer Passport',
    body: 'A guide to the summer of soccer · fan festival, watch parties, transport to Gillette, and your path into the Revolution.',
  },
  {
    icon: MapPin,
    title: 'Explore the map',
    body: 'Filter by Fan Festival, watch parties, culture hubs, transport, and Revs venues. Toggle subway lines and Gillette routes. Tap any pin to check in.',
  },
  {
    icon: CalendarCheck2,
    title: 'Build your soccer day',
    body: 'Add events from the map to your schedule, get reminders, and mark them as attended. Every event = +10 points.',
  },
  {
    icon: Trophy,
    title: 'Earn points, unlock rewards',
    body: 'Check in, take quizzes, share photo cards. Tiers unlock at 100, 250, 400, 600, 800 and 1000 points · culminating in a Revs match experience.',
  },
  {
    icon: User,
    title: 'Sign in to sync',
    body: 'Optional · but signing in keeps your progress across devices and gives you +25 welcome bonus. Skip to continue as guest anytime.',
  },
];

export default function OnboardingTour() {
  const { state } = useAppStore();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (storage.getTourSeen()) return;
    // Only auto-open after the user has cleared the welcome (so they don't get two overlays).
    if (!storage.getWelcomeSeen() && !state.auth) return;
    // Don't auto-open on /login or /admin or /qrcodes — those have their own UI.
    const path = window.location.pathname;
    if (path === '/login' || path.startsWith('/admin') || path.startsWith('/qrcodes')) return;
    const t = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(t);
  }, [state.auth]);

  const close = () => {
    storage.setTourSeen(true);
    setOpen(false);
    setStep(0);
  };
  const next = () => {
    if (step >= STEPS.length - 1) {
      close();
      return;
    }
    setStep((s) => s + 1);
  };
  const skip = () => close();

  return (
    <AnimatePresence>
      {open && (
        <div
          data-testid="onboarding-tour"
          className="fixed inset-0 z-[1012] flex items-end sm:items-center justify-center px-4 py-6"
        >
          <motion.div
            aria-hidden
            onClick={skip}
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            key="tour-card"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-[28px] bg-gradient-to-br from-navy-800/95 via-navy-900/95 to-navy-950 ring-1 ring-white/10 shadow-card overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 -top-24 h-48 opacity-50 pointer-events-none"
              style={{
                background:
                  'radial-gradient(60% 100% at 50% 100%, rgba(200,16,46,0.45), transparent 70%)',
              }}
            />

            <button
              type="button"
              onClick={skip}
              aria-label="Close tour"
              data-testid="tour-close"
              className="absolute top-3 right-3 rounded-full p-1.5 text-ink-300 hover:bg-white/[0.06] hover:text-white transition-colors z-10"
            >
              <X size={16} />
            </button>

            <div className="relative px-7 pt-9 pb-2 text-center">
              <RevsLogo size={48} className="mx-auto drop-shadow" />
              <StepBody step={STEPS[step]} />
            </div>

            <div className="relative px-7 pt-3 pb-6">
              <div className="flex items-center justify-center gap-1.5 mb-5" aria-hidden>
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i === step ? 'w-6 bg-revs-400' : 'w-3 bg-white/15'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                data-testid="tour-next"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-revs-500 hover:bg-revs-400 text-white px-5 py-3 text-sm font-semibold transition-colors shadow-glow"
              >
                {step === STEPS.length - 1 ? 'Start exploring' : 'Next'}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </button>
              {step < STEPS.length - 1 && (
                <button
                  type="button"
                  onClick={skip}
                  data-testid="tour-skip"
                  className="w-full mt-2 text-[12px] text-ink-400 hover:text-white py-1.5"
                >
                  Skip tour
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StepBody({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <>
      <div className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-revs-500/15 ring-1 ring-revs-500/30">
        <Icon size={18} className="text-revs-300" />
      </div>
      <h2 className="mt-3 text-[20px] font-display font-bold tracking-tight leading-tight">
        {step.title}
      </h2>
      <p className="mt-2 text-[13px] text-ink-300 leading-relaxed">{step.body}</p>
    </>
  );
}
