import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RotateCcw, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import { TRIVIA_QUIZ } from '@/data/content';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/cn';

export default function QuizTrivia() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { completeTrivia } = useAppStore();

  const q = TRIVIA_QUIZ[idx];
  const progress = ((idx + (done ? 1 : 0)) / TRIVIA_QUIZ.length) * 100;

  const choose = (i: number) => {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx < TRIVIA_QUIZ.length - 1) {
      setIdx(idx + 1);
      setPicked(null);
      setRevealed(false);
    } else {
      setDone(true);
      completeTrivia(picked === q.correctIndex ? score : score, TRIVIA_QUIZ.length);
    }
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto" data-testid="quiz-trivia">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Trivia</div>
        <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">Boston & Revs trivia</h1>
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
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink-400">
              <span>
                Question {idx + 1} of {TRIVIA_QUIZ.length}
              </span>
              <span>Score · {score}</span>
            </div>
            <h2 className="mt-2 text-xl font-display font-bold tracking-tight leading-snug">{q.prompt}</h2>
            <div className="mt-5 grid gap-2">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctIndex;
                const isPicked = picked === i;
                return (
                  <button
                    key={opt}
                    onClick={() => choose(i)}
                    data-testid={`trivia-${q.id}-${i}`}
                    disabled={revealed}
                    className={cn(
                      'text-left rounded-xl px-4 py-3 ring-1 transition-colors text-sm flex items-center justify-between gap-3',
                      !revealed && 'bg-white/[0.04] ring-white/10 hover:bg-white/[0.08]',
                      revealed && isCorrect && 'bg-emerald-500/15 ring-emerald-500/40 text-emerald-100',
                      revealed && !isCorrect && isPicked && 'bg-revs-500/15 ring-revs-500/40 text-revs-100',
                      revealed && !isCorrect && !isPicked && 'bg-white/[0.04] ring-white/10 opacity-60'
                    )}
                  >
                    <span>{opt}</span>
                    {revealed && isCorrect && <CheckCircle2 size={16} className="text-emerald-300" />}
                    {revealed && !isCorrect && isPicked && <XCircle size={16} className="text-revs-300" />}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className="mt-4 rounded-xl bg-white/[0.04] ring-1 ring-white/5 px-4 py-3 text-xs text-ink-200">
                {q.explanation}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={next}
                disabled={!revealed}
                data-testid="trivia-next"
                className="inline-flex items-center gap-1.5 rounded-full bg-revs-500 hover:bg-revs-400 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-semibold"
              >
                {idx === TRIVIA_QUIZ.length - 1 ? 'See result' : 'Next'} <ChevronRight size={14} />
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
            data-testid="trivia-result"
          >
            <Trophy size={20} className="text-revs-300" />
            <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-ink-400">Final score</div>
            <h2 className="mt-1 text-4xl font-display font-bold tracking-tight">
              {score} / {TRIVIA_QUIZ.length}
            </h2>
            <p className="mt-3 text-sm text-ink-200 max-w-prose">
              {score >= 8
                ? 'Boston soccer scholar. The Midnight Riders will adopt you.'
                : score >= 5
                ? 'Solid foundation. A few more matchdays and you are golden.'
                : 'Welcome to the game. The Fan Festival is the perfect starting line.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={restart}
                data-testid="trivia-restart"
                className="inline-flex items-center gap-2 rounded-full bg-revs-500 hover:bg-revs-400 text-white px-4 py-2.5 text-sm font-semibold"
              >
                <RotateCcw size={14} /> Play again
              </button>
              <Link
                to="/rewards"
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-4 py-2.5 text-sm"
              >
                See rewards <ChevronRight size={14} />
              </Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
