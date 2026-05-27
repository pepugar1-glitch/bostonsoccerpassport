import { useMemo, useState } from 'react';
import { format, parseISO, isSameDay, addDays } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Sunrise,
  Sun,
  Moon,
  CalendarPlus,
  Bell,
  BellOff,
  ChevronLeft,
  ChevronRight,
  Heart,
  Trash2,
  CheckCircle2,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { EVENTS } from '@/data/content';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import type { SoccerEvent } from '@/types';

const MIN_DATE = new Date(2026, 5, 12);
const MAX_DATE = new Date(2026, 8, 30);

const BUCKET_ICON = { morning: Sunrise, afternoon: Sun, evening: Moon } as const;
const BUCKET_LABEL = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' } as const;

export default function Schedule() {
  const [activeDate, setActiveDate] = useState<Date>(MIN_DATE);
  const { state, addToSchedule, removeFromSchedule, updateScheduleStatus, toggleReminder } = useAppStore();

  const dateOptions = useMemo(() => {
    const out: Date[] = [];
    let d = MIN_DATE;
    while (d <= MAX_DATE) {
      out.push(d);
      d = addDays(d, 1);
    }
    return out;
  }, []);

  const dayEvents = useMemo(
    () => EVENTS.filter((e) => isSameDay(parseISO(e.date), activeDate)),
    [activeDate]
  );

  const buckets: { key: 'morning' | 'afternoon' | 'evening'; events: SoccerEvent[] }[] = [
    { key: 'morning', events: dayEvents.filter((e) => e.timeBucket === 'morning') },
    { key: 'afternoon', events: dayEvents.filter((e) => e.timeBucket === 'afternoon') },
    { key: 'evening', events: dayEvents.filter((e) => e.timeBucket === 'evening') },
  ];

  const inSchedule = (id: string) => state.schedule.some((s) => s.eventId === id);
  const item = (id: string) => state.schedule.find((s) => s.eventId === id);

  const mySchedule = useMemo(
    () =>
      state.schedule
        .map((s) => {
          const ev = EVENTS.find((e) => e.id === s.eventId);
          return ev ? { ...s, ev } : null;
        })
        .filter(Boolean)
        .sort((a, b) =>
          a!.ev.date === b!.ev.date ? a!.ev.time.localeCompare(b!.ev.time) : a!.ev.date.localeCompare(b!.ev.date)
        ),
    [state.schedule]
  );

  return (
    <div className="space-y-6 pb-2" data-testid="schedule-screen">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">My Soccer Day</div>
          <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">Plan your week</h1>
          <p className="mt-1 text-sm text-ink-300">
            Build your day across the host-city festival, watch parties, and Revs matches.
          </p>
        </div>
        <div className="hidden sm:block rounded-2xl bg-white/[0.04] ring-1 ring-white/5 px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">In your schedule</div>
          <div className="text-2xl font-display font-bold mt-0.5">{state.schedule.length}</div>
        </div>
      </header>

      {/* Date strip */}
      <div className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 px-3 py-3 shadow-card">
        <div className="flex items-center justify-between mb-2 px-1">
          <button
            data-testid="schedule-prev-day"
            onClick={() => setActiveDate(addDays(activeDate, -1))}
            disabled={activeDate <= MIN_DATE}
            className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <div className="inline-flex items-center gap-2 text-sm">
            <CalendarDays size={14} className="text-ink-300" />
            <span className="font-semibold tracking-tight">{format(activeDate, 'EEEE · MMM d, yyyy')}</span>
          </div>
          <button
            data-testid="schedule-next-day"
            onClick={() => setActiveDate(addDays(activeDate, 1))}
            disabled={activeDate >= MAX_DATE}
            className="inline-flex items-center gap-1 text-xs text-ink-300 hover:text-white disabled:opacity-30"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <div className="flex gap-2">
            {dateOptions.map((d) => {
              const isActive = isSameDay(d, activeDate);
              const hasEvents = EVENTS.some((e) => isSameDay(parseISO(e.date), d));
              return (
                <button
                  key={d.toISOString()}
                  data-testid={`date-pill-${format(d, 'yyyy-MM-dd')}`}
                  onClick={() => setActiveDate(d)}
                  className={cn(
                    'shrink-0 w-14 rounded-xl px-2 py-2 text-center transition-all',
                    isActive
                      ? 'bg-revs-500 ring-1 ring-revs-400 text-white shadow-glow'
                      : 'bg-white/[0.04] ring-1 ring-white/5 text-ink-200 hover:bg-white/[0.08]'
                  )}
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] opacity-80">{format(d, 'EEE')}</div>
                  <div className="text-lg font-display font-bold leading-none mt-1">{format(d, 'd')}</div>
                  <div className={cn('h-1 mt-1.5 mx-auto rounded-full', hasEvents ? 'w-4 bg-revs-300' : 'w-0')} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline by bucket */}
      <section className="space-y-4">
        {dayEvents.length === 0 && (
          <EmptyState
            title="No events that day"
            description="Pick another date from the strip above, or browse the full lineup below."
          />
        )}
        {dayEvents.length > 0 &&
          buckets.map((b) => {
            const Icon = BUCKET_ICON[b.key];
            return (
              <div key={b.key} className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 shadow-card">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                  <Icon size={15} className="text-ink-300" />
                  <span className="text-xs uppercase tracking-[0.18em] text-ink-400">{BUCKET_LABEL[b.key]}</span>
                </div>
                {b.events.length === 0 ? (
                  <div className="px-5 py-4 text-xs text-ink-400">No events.</div>
                ) : (
                  <ul>
                    {b.events.map((e) => {
                      const added = inSchedule(e.id);
                      const it = item(e.id);
                      return (
                        <li
                          key={e.id}
                          data-testid={`event-row-${e.id}`}
                          className="px-5 py-4 flex items-start gap-4 border-b border-white/5 last:border-0"
                        >
                          <div className="text-xs tabular-nums font-mono text-ink-200 mt-0.5 shrink-0 w-12">{e.time}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold leading-tight">{e.title}</div>
                            <div className="text-[11px] text-ink-300 mt-0.5">{e.venueName}</div>
                            <div className="text-[11px] text-ink-400 mt-1.5 leading-relaxed">{e.description}</div>

                            {added && it && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                <ReminderToggle
                                  active={it.reminders.thirtyMin}
                                  onToggle={() => toggleReminder(e.id, 'thirtyMin')}
                                  testId={`reminder-30min-${e.id}`}
                                  label="30 min"
                                />
                                <ReminderToggle
                                  active={it.reminders.oneHour}
                                  onToggle={() => toggleReminder(e.id, 'oneHour')}
                                  testId={`reminder-1hr-${e.id}`}
                                  label="1 hr"
                                />
                                <ReminderToggle
                                  active={it.reminders.travelTime}
                                  onToggle={() => toggleReminder(e.id, 'travelTime')}
                                  testId={`reminder-travel-${e.id}`}
                                  label="Travel time"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {added ? (
                              <button
                                onClick={() => removeFromSchedule(e.id)}
                                data-testid={`event-remove-${e.id}`}
                                className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-1.5 text-[11px]"
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            ) : (
                              <button
                                onClick={() => addToSchedule(e.id)}
                                data-testid={`event-add-${e.id}`}
                                className="inline-flex items-center gap-1 rounded-full bg-revs-500 hover:bg-revs-400 active:bg-revs-600 text-white px-3 py-1.5 text-[11px] font-semibold"
                              >
                                <CalendarPlus size={12} /> Add (+10)
                              </button>
                            )}
                            {added && (
                              <div className="flex items-center gap-1">
                                <StatusButton
                                  active={it?.status === 'attended'}
                                  onClick={() => updateScheduleStatus(e.id, it?.status === 'attended' ? 'planned' : 'attended')}
                                  icon={CheckCircle2}
                                  label="Attended"
                                  testId={`status-attended-${e.id}`}
                                />
                                <StatusButton
                                  active={it?.status === 'favorite'}
                                  onClick={() => updateScheduleStatus(e.id, it?.status === 'favorite' ? 'planned' : 'favorite')}
                                  icon={Heart}
                                  label="Favorite"
                                  testId={`status-favorite-${e.id}`}
                                />
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
      </section>

      {/* My schedule list */}
      <section className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="text-sm font-semibold">Your full soccer day</div>
          <div className="text-[11px] text-ink-400">{mySchedule.length} item{mySchedule.length === 1 ? '' : 's'}</div>
        </div>
        {mySchedule.length === 0 ? (
          <div className="px-5 py-6 text-sm text-ink-300">
            Nothing saved yet. Tap <span className="text-white font-semibold">Add</span> on any event to start building your day.
          </div>
        ) : (
          <ul>
            {mySchedule.map((s) => (
              <li
                key={s!.eventId}
                data-testid={`my-schedule-row-${s!.eventId}`}
                className="px-5 py-3 flex items-center gap-3 border-b border-white/5 last:border-0"
              >
                <div className="text-[11px] tabular-nums text-ink-200 w-20 shrink-0">
                  {format(parseISO(s!.ev.date), 'MMM d')} · {s!.ev.time}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s!.ev.title}</div>
                  <div className="text-[11px] text-ink-400 truncate">{s!.ev.venueName}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {s!.status === 'attended' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                      <CheckCircle2 size={10} /> Attended
                    </span>
                  )}
                  {s!.status === 'favorite' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-revs-500/15 ring-1 ring-revs-500/30 text-revs-200 px-2 py-0.5 text-[10px] font-semibold">
                      <Heart size={10} /> Favorite
                    </span>
                  )}
                  {(s!.reminders.thirtyMin || s!.reminders.oneHour || s!.reminders.travelTime) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] ring-1 ring-white/10 text-ink-200 px-2 py-0.5 text-[10px]">
                      <Bell size={10} /> on
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-[11px] text-ink-400 inline-flex items-center gap-2">
        <Clock size={12} /> Reminders use your device&apos;s notification permission. If denied, you&apos;ll see in-app badges instead.
        <code className="ml-1 px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px]">{`// TODO(integration: Notifications)`}</code>
      </div>
    </div>
  );
}

function ReminderToggle({
  active,
  onToggle,
  label,
  testId,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  testId: string;
}) {
  return (
    <button
      onClick={onToggle}
      data-testid={testId}
      className={cn(
        'inline-flex items-center gap-1 rounded-full ring-1 px-2.5 py-1 text-[10px] font-medium transition-colors',
        active
          ? 'bg-emerald-500/15 ring-emerald-500/30 text-emerald-200'
          : 'bg-white/[0.04] ring-white/10 text-ink-300 hover:text-white'
      )}
    >
      {active ? <Bell size={10} /> : <BellOff size={10} />} {label}
    </button>
  );
}

function StatusButton({
  active,
  onClick,
  icon: Icon,
  label,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Heart;
  label: string;
  testId: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      data-testid={testId}
      title={label}
      className={cn(
        'h-7 w-7 grid place-items-center rounded-full ring-1 transition-colors',
        active
          ? label === 'Favorite'
            ? 'bg-revs-500/20 ring-revs-500/40 text-revs-200'
            : 'bg-emerald-500/20 ring-emerald-500/40 text-emerald-200'
          : 'bg-white/[0.04] ring-white/10 text-ink-300 hover:text-white'
      )}
    >
      <Icon size={12} />
    </motion.button>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-navy-900/40 ring-1 ring-white/5 px-6 py-8 text-center">
      <CalendarDays size={20} className="mx-auto text-ink-300" />
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <div className="text-xs text-ink-400 mt-1">{description}</div>
    </div>
  );
}
