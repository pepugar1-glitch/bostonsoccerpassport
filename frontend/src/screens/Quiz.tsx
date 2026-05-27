import { Link } from 'react-router-dom';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ARCHETYPE_LABELS } from '@/data/content';
import { format, parseISO } from 'date-fns';

export default function QuizHub() {
  const { state } = useAppStore();
  return (
    <div className="space-y-6 pb-2" data-testid="quiz-hub">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Quizzes</div>
        <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">Find your soccer story</h1>
        <p className="mt-1 text-sm text-ink-300">
          Two quick games. Earn points either way. The archetype shapes your recommendations.
        </p>
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
            <h2 className="mt-3 text-xl font-display font-bold tracking-tight">What kind of soccer fan are you?</h2>
            <p className="mt-1 text-sm text-ink-300">7 questions · 6 archetypes · personalized next step.</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-ink-400">
                {state.archetypeResult
                  ? `Your result: ${ARCHETYPE_LABELS[state.archetypeResult.archetype]} · ${format(parseISO(state.archetypeResult.at), 'MMM d')}`
                  : '+30 points on completion'}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                {state.archetypeResult ? 'Retake' : 'Start'} <ArrowRight size={14} />
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
            <h2 className="mt-3 text-xl font-display font-bold tracking-tight">Boston & Revs trivia</h2>
            <p className="mt-1 text-sm text-ink-300">10 questions · MLS basics, supporter culture, Revs history.</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-ink-400">
                {state.triviaResult
                  ? `Last score: ${state.triviaResult.score}/${state.triviaResult.total}`
                  : '+30 points on completion'}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                {state.triviaResult ? 'Play again' : 'Start'} <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
