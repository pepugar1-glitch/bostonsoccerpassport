import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { track } from '@/lib/analytics';
import RevsLogo from './RevsLogo';

export default function SignInPrompt() {
  const { state, closeSignInPrompt } = useAppStore();
  const prompt = state.signInPrompt;
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (!prompt.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSignInPrompt();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [prompt.open, closeSignInPrompt]);

  const goToSignIn = () => {
    track('signin_prompt_accept', { cta: prompt.cta });
    closeSignInPrompt();
    navigate('/login', { state: { from: location.pathname + location.search } });
  };

  const continueAnyway = () => {
    track('signin_prompt_skip', { cta: prompt.cta });
    const onContinue = prompt.onContinue;
    closeSignInPrompt();
    if (onContinue) setTimeout(onContinue, 0);
  };

  return (
    <AnimatePresence>
      {prompt.open && (
        <div
          data-testid="signin-prompt"
          className="fixed inset-0 z-[1015] flex items-center justify-center px-4 py-6"
        >
          <motion.div
            aria-hidden
            onClick={closeSignInPrompt}
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-[26px] bg-gradient-to-br from-navy-800/95 via-navy-900/95 to-navy-950 ring-1 ring-white/10 shadow-card overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 -top-20 h-44 opacity-50 pointer-events-none"
              style={{
                background:
                  'radial-gradient(60% 100% at 50% 100%, rgba(200,16,46,0.4), transparent 70%)',
              }}
            />

            <button
              type="button"
              onClick={closeSignInPrompt}
              data-testid="signin-prompt-close"
              aria-label="Close"
              className="absolute top-3 right-3 rounded-full p-1.5 text-ink-300 hover:bg-white/[0.06] hover:text-white transition-colors z-10"
            >
              <X size={16} />
            </button>

            <div className="relative px-7 pt-8 pb-2 text-center">
              <RevsLogo size={48} className="mx-auto drop-shadow" />
              <h2 className="mt-4 text-lg font-display font-bold tracking-tight leading-tight">
                {prompt.kind ? t(`signInPrompt.${prompt.kind}.title`, prompt.params) : ''}
              </h2>
              <p className="mt-2 text-[13px] text-ink-300 leading-relaxed">
                {prompt.kind ? t(`signInPrompt.${prompt.kind}.description`, prompt.params) : ''}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-revs-500/15 ring-1 ring-revs-500/30 px-3 py-1 text-[11px] font-semibold text-revs-200">
                <Sparkles size={11} /> {t('signInPrompt.bonusBadge')}
              </div>
            </div>

            <div className="relative px-7 pt-5 pb-7 space-y-2.5">
              <button
                type="button"
                onClick={goToSignIn}
                data-testid="signin-prompt-accept"
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-ink-50 text-navy-950 px-5 py-3 text-[14px] font-semibold transition-colors shadow-card"
              >
                <GoogleG /> {t('signInPrompt.accept')}
              </button>
              <button
                type="button"
                onClick={continueAnyway}
                data-testid="signin-prompt-skip"
                className="w-full text-[12px] text-ink-400 hover:text-white py-2 transition-colors"
              >
                {t('signInPrompt.skip')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 18 18" width={16} height={16} aria-hidden>
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 009 18z" fill="#34A853" />
      <path d="M3.97 10.72A5.41 5.41 0 013.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.04l3.01-2.32z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.43 0 9 0A9 9 0 00.96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
