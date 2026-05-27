import { Link } from 'react-router-dom';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import { format, parseISO } from 'date-fns';

export default function QuizHub() {
  const { state } = useAppStore();
  const { t } = useTranslation();
  return (
    <div className="space-y-6 pb-2" data-testid="quiz-hub">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">{t('quiz.hubTitle')}</div>
        <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">{t('quiz.hubSubtitle')}</h1>
      </header>

      <div className="grid lg:grid-cols-2 gap-4">
        <Link
          to="/quiz/archetype"
          data-testid="quiz-archetype-card"
          className="group relative rounded-3xl bg-navy-900/60 ring-1 ring-white/5 hover:ring-revs-500/40 px-6 py-7 shadow-card overflow-hidden transition-all"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-revs-500/15 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="relative">
            <Sparkles size={20} className="text-revs-300" />
            <h2 className="mt-3 text-xl font-display font-bold tracking-tight">{t('quiz.archetypeCard.title')}</h2>
            <p className="mt-1 text-sm text-ink-300">{t('quiz.archetypeCard.body')}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-ink-400">
                {state.archetypeResult
                  ? `${t('quiz.yourArchetype')}: ${t(`archetype.${state.archetypeResult.archetype}`)} · ${format(parseISO(state.archetypeResult.at), 'MMM d')}`
                  : ''}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                {state.archetypeResult ? t('quiz.retake') : t('quiz.archetypeCard.cta')} <ArrowRight size={14} className="rtl:rotate-180" />
              </span>
            </div>
          </div>
        </Link>

        <Link
          to="/quiz/trivia"
          data-testid="quiz-trivia-card"
          className="group relative rounded-3xl bg-navy-900/60 ring-1 ring-white/5 hover:ring-revs-500/40 px-6 py-7 shadow-card overflow-hidden transition-all"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-amber-400/12 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="relative">
            <Trophy size={20} className="text-amber-300" />
            <h2 className="mt-3 text-xl font-display font-bold tracking-tight">{t('quiz.triviaCard.title')}</h2>
            <p className="mt-1 text-sm text-ink-300">{t('quiz.triviaCard.body')}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-ink-400">
                {state.triviaResult
                  ? t('quiz.correctOf', { correct: state.triviaResult.score, total: state.triviaResult.total })
                  : ''}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                {state.triviaResult ? t('quiz.retake') : t('quiz.triviaCard.cta')} <ArrowRight size={14} className="rtl:rotate-180" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
