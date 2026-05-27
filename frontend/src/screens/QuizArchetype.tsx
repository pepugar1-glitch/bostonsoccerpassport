import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, RotateCcw } from 'lucide-react';
import { ARCHETYPE_QUIZ, ARCHETYPE_LABELS, ARCHETYPE_DESCRIPTIONS, ARCHETYPE_NEXT_ACTION } from '@/data/content';
import { useAppStore } from '@/lib/store';
import type { FanArchetype } from '@/types';
import { cn } from '@/lib/cn';

export default function QuizArchetype() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState<FanArchetype | null>(null);
  const { setArchetype } = useAppStore();

  const q = ARCHETYPE_QUIZ[idx];
  const progress = ((idx + (done ? 1 : 0)) / ARCHETYPE_QUIZ.length) * 100;

  const tally = (): FanArchetype => {
    const scores: Partial<Record<FanArchetype, number>> = {};
    ARCHETYPE_QUIZ.forEach((qq) => {
      const optId = answers[qq.id];
      const opt = qq.options.find((o) => o.id === optId);
      if (!opt) return;
      Object.entries(opt.weight).forEach(([k, v]) => {
        const key = k as FanArchetype;
        scores[key] = (scores[key] || 0) + (v || 0);
      });
    });
    const sorted = (Object.entries(scores) as [FanArchetype, number][]).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'new-to-soccer';
  };

  const onSelect = (optId: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: optId }));
  };

  const onNext = () => {
    if (!answers[q.id]) return;
    if (idx < ARCHETYPE_QUIZ.length - 1) setIdx(idx + 1);
    else {
      const result = tally();
      setDone(result);
      setArchetype(result);
    }
  };

  const onPrev = () => idx > 0 && setIdx(idx - 1);

  const restart = () => {
    setAnswers({});
    setIdx(0);
    setDone(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto" data-testid="quiz-archetype">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Archetype Quiz</div>
        <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">
          What kind of soccer fan are you?
        </h1>
      </header>

      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full bg-revs-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.section
            key={q.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            className="rounded-3xl bg-navy-900/55 ring-1 ring-white/5 shadow-card p-6"
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
              Question {idx + 1} of {ARCHETYPE_QUIZ.length}
            </div>
            <h2 className="mt-2 text-xl font-display font-bold tracking-tight leading-snug">{q.prompt}</h2>
            <div className="mt-5 grid gap-2">
              {q.options.map((o) => {
                const selected = answers[q.id] === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => onSelect(o.id)}
                    data-testid={`archetype-${q.id}-${o.id}`}
                    className={cn(
                      'text-left rounded-xl px-4 py-3 ring-1 transition-colors text-sm',
                      selected
                        ? 'bg-revs-500/15 ring-revs-500/40 text-white'
                        : 'bg-white/[0.04] ring-white/10 text-ink-100 hover:bg-white/[0.08]'
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={onPrev}
                disabled={idx === 0}
                data-testid="archetype-prev"
                className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                onClick={onNext}
                disabled={!answers[q.id]}
                data-testid="archetype-next"
                className="inline-flex items-center gap-1.5 rounded-full bg-revs-500 hover:bg-revs-400 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-semibold"
              >
                {idx === ARCHETYPE_QUIZ.length - 1 ? 'See result' : 'Next'} <ChevronRight size={14} />
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 ring-1 ring-revs-500/30 shadow-card p-6"
            data-testid="archetype-result"
          >
            <Sparkles size={20} className="text-revs-300" />
            <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-ink-400">Your archetype</div>
            <h2 className="mt-1 text-3xl font-display font-bold tracking-tight">{ARCHETYPE_LABELS[done]}</h2>
            <p className="mt-3 text-sm text-ink-200 leading-relaxed max-w-prose">
              {ARCHETYPE_DESCRIPTIONS[done]}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to={ARCHETYPE_NEXT_ACTION[done].to}
                data-testid="archetype-next-action"
                className="inline-flex items-center gap-2 rounded-full bg-revs-500 hover:bg-revs-400 text-white px-4 py-2.5 text-sm font-semibold shadow-glow"
              >
                {ARCHETYPE_NEXT_ACTION[done].label} <ChevronRight size={14} />
              </Link>
              <button
                onClick={restart}
                data-testid="archetype-retake"
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-4 py-2.5 text-sm"
              >
                <RotateCcw size={14} /> Retake
              </button>
              <Link to="/quiz/trivia" className="text-xs text-ink-300 hover:text-white">
                Try the Boston & Revs trivia →
              </Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
