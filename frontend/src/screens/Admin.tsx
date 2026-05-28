import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ShieldCheck,
  Activity,
  Users,
  MapPin,
  CalendarPlus,
  CheckCircle2,
  Share2,
  HelpCircle,
  Gift,
  Ticket,
  QrCode,
  ChevronRight,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { VENUES } from '@/data/venues';
import { EVENTS } from '@/data/content';
import { Link } from 'react-router-dom';
import { TOP_STATS, FUNNEL, SEGMENT, HOTSPOTS, POPULAR_REWARDS, DAILY_USERS, HEATMAP_POINTS, COHORT_RETENTION } from '@/data/analytics';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import { cn } from '@/lib/cn';
import AdminGate from '@/components/AdminGate';

const PIE_COLORS = ['#C8102E', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981'];

const STAT_ICON: Record<string, typeof Activity> = {
  'qr-scans': QrCode,
  'active-users': Users,
  'map-interactions': MapPin,
  'events-added': CalendarPlus,
  'check-ins': CheckCircle2,
  'social-shares': Share2,
  'quiz-completions': HelpCircle,
  'reward-claims': Gift,
  'revs-ticket-clicks': Ticket,
};

export default function AdminScreen() {
  return (
    <AdminGate surface="admin" title="Admin Dashboard">
      <Dashboard />
    </AdminGate>
  );
}

type TimeRange = '24h' | '7d' | '30d' | 'all';

const RANGE_LABEL: Record<TimeRange, string> = {
  '24h': '24h',
  '7d': '7d',
  '30d': '30d',
  all: 'All',
};

// Mock multipliers — different time windows would show different totals on a real backend.
// For the prototype we scale top-stats and funnel values per window.
const RANGE_MULT: Record<TimeRange, number> = { '24h': 0.04, '7d': 0.22, '30d': 1, all: 1.4 };

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Dashboard() {
  const { t } = useTranslation();
  const { toast, addToSchedule, checkInVenue, setArchetype, claimReward, addPoints } = useAppStore();
  const [range, setRange] = useState<TimeRange>('30d');
  const mult = RANGE_MULT[range];

  const seedDemo = () => {
    // Populate a realistic-looking session for live demos. Idempotent on most actions
    // (the store guards against duplicates), so re-clicking is safe.
    const venuesToCheckIn = ['city-hall-plaza', 'cisco-brewers', 'high-street-place', 'mcgreevys'];
    venuesToCheckIn.forEach((id) => {
      const v = VENUES.find((x) => x.id === id);
      if (v) checkInVenue(v.id, v.name);
    });
    const eventsToAdd = ['evt-jun13-festival', 'evt-jun22-faialense', 'evt-jul09-watch'];
    eventsToAdd.forEach((id) => {
      if (EVENTS.find((e) => e.id === id)) addToSchedule(id);
    });
    setArchetype('global-matchday-fan');
    setTimeout(() => {
      claimReward('rw-100', 100, 'Revs Digital Fan Badge');
    }, 50);
    setTimeout(() => {
      addPoints('referral', 50, 'Referred a friend', 'demo-seed');
    }, 100);
    toast({ title: 'Demo seeded', description: 'Profile, schedule, check-ins and a claimed reward filled in.', variant: 'reward' });
  };

  const funnelWithRate = useMemo(() => {
    const out: { step: string; value: number; rate: number }[] = [];
    const scaled = FUNNEL.map((s) => ({ ...s, value: Math.round(s.value * mult) }));
    scaled.forEach((s, i) => {
      out.push({ ...s, rate: i === 0 ? 100 : Math.round((s.value / scaled[0].value) * 100) });
    });
    return out;
  }, [mult]);

  const scaledStats = useMemo(
    () => TOP_STATS.map((s) => ({ ...s, value: Math.round(s.value * mult) })),
    [mult]
  );

  const exportFunnelCsv = () => {
    downloadCsv(`bsp-funnel-${range}.csv`, [
      ['step', 'value', 'rate_pct'],
      ...funnelWithRate.map((s) => [s.step, s.value, s.rate]),
    ]);
    toast({ title: 'Funnel CSV downloaded', variant: 'info' });
  };

  const exportSegmentsCsv = () => {
    downloadCsv('bsp-segments.csv', [
      ['segment', 'value'],
      ...SEGMENT.map((s) => [s.name, s.value]),
    ]);
    toast({ title: 'Segments CSV downloaded', variant: 'info' });
  };

  const resetDemo = () => {
    if (!confirm('Reset all local app state? This wipes points, schedule, profile, sign-in and check-ins on this device. Use before a demo to start clean.')) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('bsp.'))
      .forEach((k) => localStorage.removeItem(k));
    toast({ title: 'Demo state reset · reloading', variant: 'info' });
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="space-y-6 pb-2" data-testid="admin-dashboard">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400 inline-flex items-center gap-2">
          <ShieldCheck size={12} className="text-revs-300" /> {t('admin.preTitle')}
        </div>
        <h1 className="mt-1 text-2xl lg:text-3xl font-display font-bold tracking-tight">{t('admin.title')}</h1>
        <p className="mt-1 text-sm text-ink-300">{t('admin.subtitle')}</p>
      </header>

      {/* Action tiles */}
      <section className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/qrcodes"
          data-testid="admin-link-qrcodes"
          className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-revs-500/15 to-navy-900 ring-1 ring-revs-500/30 hover:ring-revs-500/60 px-5 py-4 shadow-card transition-all"
        >
          <div className="grid place-items-center h-11 w-11 rounded-xl bg-white/10 ring-1 ring-white/15">
            <QrCode size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">QR Poster Studio</div>
            <div className="text-[11px] text-ink-300 mt-0.5">
              Generate per-venue printable A4 posters with UTM-tagged QR codes.
            </div>
          </div>
          <ChevronRight size={16} className="text-ink-300 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <div className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 px-5 py-4 shadow-card">
          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Conversion tracking</div>
          <div className="mt-1 text-sm font-semibold text-white">Every scan, tagged. Every step, attributed.</div>
          <div className="mt-2 text-[11px] text-ink-300 leading-relaxed">
            Each QR scan carries 5 UTM tags into Mixpanel · PostHog · Power BI:
          </div>
          <ul className="mt-2 space-y-1 text-[11px]">
            <li className="flex gap-2">
              <span className="font-mono text-revs-400 shrink-0 w-16">source</span>
              <span className="text-ink-100">where the click came from</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-revs-400 shrink-0 w-16">medium</span>
              <span className="text-ink-100">qr · email · social · paid</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-revs-400 shrink-0 w-16">campaign</span>
              <span className="text-ink-100">wc2026 · post-wc · regular-season</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-revs-400 shrink-0 w-16">content</span>
              <span className="text-ink-100">which booth / venue (Park Street, Maverick…)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-revs-400 shrink-0 w-16">term</span>
              <span className="text-ink-100">user archetype (Local, Visitor, Family…)</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Demo controls (time range + export + reset) */}
      <section className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 px-4 py-3 shadow-card flex items-center gap-3 flex-wrap">
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Window</div>
        <div className="inline-flex rounded-full bg-white/[0.04] ring-1 ring-white/10 p-1 text-xs">
          {(['24h', '7d', '30d', 'all'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              data-testid={`admin-range-${r}`}
              className={cn(
                'px-3 py-1 rounded-full transition-colors',
                range === r ? 'bg-white text-navy-900 font-semibold' : 'text-ink-200 hover:text-white'
              )}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={exportFunnelCsv}
            data-testid="admin-export-funnel"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-1.5 text-xs"
          >
            <Download size={12} /> Funnel CSV
          </button>
          <button
            onClick={exportSegmentsCsv}
            data-testid="admin-export-segments"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-1.5 text-xs"
          >
            <Download size={12} /> Segments CSV
          </button>
          <button
            onClick={seedDemo}
            data-testid="admin-seed-demo"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 ring-1 ring-emerald-500/30 text-emerald-200 px-3 py-1.5 text-xs"
            title="Fill this device with realistic check-ins, schedule, archetype and a claimed reward for demos"
          >
            <Sparkles size={12} /> Seed demo
          </button>
          <button
            onClick={resetDemo}
            data-testid="admin-reset-demo"
            className="inline-flex items-center gap-1.5 rounded-full bg-revs-500/15 hover:bg-revs-500/25 ring-1 ring-revs-500/30 text-revs-200 px-3 py-1.5 text-xs"
            title="Wipe this device's local state to start a clean demo"
          >
            <RotateCcw size={12} /> Reset demo
          </button>
        </div>
      </section>

      {/* Top stats */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {scaledStats.map((s) => {
          const Icon = STAT_ICON[s.id] || Activity;
          return (
            <div
              key={s.id}
              data-testid={`admin-stat-${s.id}`}
              className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 px-4 py-4 shadow-card"
            >
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink-400">
                <Icon size={12} /> {s.label}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-2xl font-display font-bold tracking-tight tabular-nums">
                  {s.value.toLocaleString()}
                </span>
                <span
                  className={cn(
                    'text-[11px] font-semibold',
                    s.delta.startsWith('+') ? 'text-emerald-300' : 'text-revs-300'
                  )}
                >
                  {s.delta}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Funnel + Segment */}
      <section className="grid lg:grid-cols-2 gap-4">
        <Card title="Activation funnel" subtitle="QR Scan → Revs Offer Clicked">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnelWithRate} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
              <CartesianGrid stroke="#FFFFFF11" vertical={false} />
              <XAxis dataKey="step" stroke="#8A92A6" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#8A92A6" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#0F2042',
                  border: '1px solid #FFFFFF22',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#FFFFFF',
                }}
                itemStyle={{ color: '#FFFFFF' }}
                labelStyle={{ color: '#DCDFE7', marginBottom: 4 }}
                cursor={{ fill: '#FFFFFF08' }}

              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#C8102E" />
            </BarChart>
          </ResponsiveContainer>
          <ul className="mt-3 grid grid-cols-5 gap-2 text-center">
            {funnelWithRate.map((s) => (
              <li
                key={s.step}
                className="rounded-xl bg-white/[0.04] ring-1 ring-white/5 px-2 py-2 text-[10px] text-ink-300"
              >
                <div className="text-white font-semibold text-xs">{s.rate}%</div>
                <div className="truncate">{s.step}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="User segments" subtitle="Self-reported + inferred archetypes">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={SEGMENT}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >
                {SEGMENT.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#0A1A3D" strokeWidth={2} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 11, color: '#DCDFE7' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#0F2042',
                  border: '1px solid #FFFFFF22',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#FFFFFF',
                }}
                itemStyle={{ color: '#FFFFFF' }}
                labelStyle={{ color: '#DCDFE7', marginBottom: 4 }}
                cursor={{ fill: '#FFFFFF08' }}

              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* DAU */}
      <Card title="Daily active users" subtitle="Jun 12 – Aug 31, 2026">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={DAILY_USERS} margin={{ left: -10, right: 12, top: 12, bottom: 0 }}>
            <CartesianGrid stroke="#FFFFFF11" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#8A92A6"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(DAILY_USERS.length / 8)}
            />
            <YAxis stroke="#8A92A6" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: '#0F2042',
                border: '1px solid #FFFFFF22',
                borderRadius: 12,
                fontSize: 12,
                color: '#FFFFFF',
              }}
              itemStyle={{ color: '#FFFFFF' }}
              labelStyle={{ color: '#DCDFE7', marginBottom: 4 }}
              cursor={{ fill: '#FFFFFF08' }}

            />
            <Line type="monotone" dataKey="users" stroke="#C8102E" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Hotspots + Rewards */}
      <section className="grid lg:grid-cols-2 gap-4">
        <Card title="Map hotspots" subtitle="Visits, check-ins, conversion">
          <div className="overflow-hidden rounded-xl ring-1 ring-white/5">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.18em] text-ink-400 bg-white/[0.03]">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Location</th>
                  <th className="text-right px-3 py-2 font-semibold">Visits</th>
                  <th className="text-right px-3 py-2 font-semibold">Check-ins</th>
                  <th className="text-right px-3 py-2 font-semibold">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {HOTSPOTS.map((h) => (
                  <tr key={h.location} className="border-t border-white/5">
                    <td className="px-3 py-2.5 text-ink-100">{h.location}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{h.visits.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{h.checkIns.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-emerald-300">{h.conversion.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Most popular rewards" subtitle="Claims to date">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={POPULAR_REWARDS} layout="vertical" margin={{ left: 30, right: 12 }}>
              <CartesianGrid stroke="#FFFFFF11" horizontal={false} />
              <XAxis type="number" stroke="#8A92A6" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="reward"
                stroke="#8A92A6"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  background: '#0F2042',
                  border: '1px solid #FFFFFF22',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#FFFFFF',
                }}
                itemStyle={{ color: '#FFFFFF' }}
                labelStyle={{ color: '#DCDFE7', marginBottom: 4 }}
                cursor={{ fill: '#FFFFFF08' }}

              />
              <Bar dataKey="claims" radius={[0, 8, 8, 0]} fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Heatmap + Cohort retention */}
      <section className="grid lg:grid-cols-2 gap-4">
        <Card title="Check-in heatmap" subtitle="Density by venue · larger circle = more check-ins">
          <div className="h-[260px] rounded-xl overflow-hidden ring-1 ring-white/10">
            <MapContainer
              center={[42.35, -71.07]}
              zoom={11}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
              attributionControl={false}
            >
              <TileLayer
                attribution=""
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
              />
              {HEATMAP_POINTS.map((p) => (
                <CircleMarker
                  key={p.label}
                  center={[p.lat, p.lng]}
                  radius={6 + p.weight * 22}
                  pathOptions={{
                    color: '#C8102E',
                    weight: 1,
                    fillColor: '#C8102E',
                    fillOpacity: 0.18 + p.weight * 0.4,
                  }}
                >
                  <LeafletTooltip direction="top" opacity={0.95}>
                    {p.label} · {Math.round(p.weight * 100)}%
                  </LeafletTooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </Card>
        <Card title="Cohort retention" subtitle="By week of first QR scan · D1 / D7 / D30 active">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-ink-400 text-[10px] uppercase tracking-[0.18em]">
                  <th className="text-left font-medium py-2 pr-2">Cohort</th>
                  <th className="text-right font-medium py-2 px-2">Users</th>
                  <th className="text-right font-medium py-2 px-2">D1</th>
                  <th className="text-right font-medium py-2 px-2">D7</th>
                  <th className="text-right font-medium py-2 pl-2">D30</th>
                </tr>
              </thead>
              <tbody>
                {COHORT_RETENTION.map((c) => (
                  <tr key={c.cohort} className="border-t border-white/5">
                    <td className="py-2 pr-2 text-ink-100 font-medium">{c.cohort}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-ink-200">{c.users.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right tabular-nums">
                      <RetentionCell pct={c.d1} />
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">
                      <RetentionCell pct={c.d7} />
                    </td>
                    <td className="py-2 pl-2 text-right tabular-nums">
                      <RetentionCell pct={c.d30} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/5 px-4 py-3 text-[11px] text-ink-400">
        Mock data · wire to Mixpanel / PostHog / Firebase Analytics.
        <code className="ml-1 px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px]">{`// TODO(integration: analytics)`}</code>
      </div>
    </div>
  );
}

function RetentionCell({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-ink-500">·</span>;
  const intensity = Math.min(1, pct / 80);
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 font-semibold"
      style={{
        backgroundColor: `rgba(16, 185, 129, ${0.12 + intensity * 0.45})`,
        color: '#A7F3D0',
      }}
    >
      {pct}%
    </span>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-navy-900/55 ring-1 ring-white/5 shadow-card p-5">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <div className="text-[11px] text-ink-400">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}
