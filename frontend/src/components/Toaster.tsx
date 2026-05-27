import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, Sparkles, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/cn';

export default function Toaster() {
  const { state, dismissToast } = useAppStore();

  return (
    <div className="toast-stack" aria-live="polite" data-testid="toast-stack">
      <AnimatePresence>
        {state.toasts.map((t) => {
          const Icon =
            t.variant === 'reward'
              ? Sparkles
              : t.variant === 'warn'
              ? AlertTriangle
              : t.variant === 'info'
              ? Info
              : CheckCircle2;
          const accent =
            t.variant === 'reward'
              ? 'border-revs-500/40 bg-revs-500/12'
              : t.variant === 'warn'
              ? 'border-amber-400/40 bg-amber-400/10'
              : t.variant === 'info'
              ? 'border-white/10 bg-navy-800/85'
              : 'border-emerald-400/30 bg-emerald-400/10';
          return (
            <motion.div
              key={t.id}
              data-testid="toast"
              role="status"
              initial={{ y: 24, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => dismissToast(t.id)}
              className={cn(
                'pointer-events-auto rounded-2xl border backdrop-blur-xl shadow-card px-4 py-3 flex items-start gap-3 text-sm',
                accent
              )}
            >
              <div className="mt-0.5 shrink-0">
                <Icon size={18} className={t.variant === 'reward' ? 'text-revs-300' : 'text-white'} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white leading-tight">{t.title}</div>
                {t.description && <div className="text-ink-300 text-xs mt-0.5">{t.description}</div>}
              </div>
              {typeof t.points === 'number' && (
                <div className="rounded-full bg-revs-500/20 ring-1 ring-revs-500/30 px-2.5 py-0.5 text-xs font-semibold text-revs-200">
                  +{t.points}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
