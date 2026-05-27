import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Map as MapIcon,
  CalendarDays,
  Trophy,
  Share2,
  User,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/store';
import Footer from './Footer';

const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/map', label: 'Map', icon: MapIcon },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/rewards', label: 'Rewards', icon: Trophy },
  { to: '/share', label: 'Share', icon: Share2 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { points } = useAppStore();
  const location = useLocation();
  const isMap = location.pathname === '/map';

  return (
    <div className="flex min-h-screen text-ink-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/5 bg-navy-950/60 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 px-6 pt-7 pb-6">
          <Crest />
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Boston</div>
            <div className="text-base font-display font-bold tracking-tight">Soccer Passport</div>
          </div>
        </Link>

        <div className="px-4 pb-2">
          <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Your Points</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold tracking-tight" data-testid="sidebar-points">
                {points.toLocaleString()}
              </span>
              <span className="text-xs text-ink-400">passport</span>
            </div>
          </div>
        </div>

        <nav className="px-3 pt-2 flex-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              data-testid={`sidebar-nav-${label.toLowerCase()}`}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 my-0.5 text-sm transition-colors',
                  isActive
                    ? 'bg-white/[0.06] text-white ring-1 ring-white/5'
                    : 'text-ink-300 hover:bg-white/[0.03] hover:text-white'
                )
              }
            >
              <Icon size={18} className="shrink-0 opacity-90" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-6 space-y-1">
          <NavLink
            to="/admin"
            data-testid="sidebar-nav-admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors border border-white/5',
                isActive ? 'bg-revs-500/15 text-white' : 'text-ink-300 hover:bg-white/[0.04] hover:text-white'
              )
            }
          >
            <ShieldCheck size={18} />
            <span className="font-medium">Admin Dashboard</span>
          </NavLink>
          <NavLink
            to="/qrcodes"
            data-testid="sidebar-nav-qrcodes"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors border border-white/5',
                isActive ? 'bg-revs-500/15 text-white' : 'text-ink-300 hover:bg-white/[0.04] hover:text-white'
              )
            }
          >
            <QrCode size={18} />
            <span className="font-medium">QR Poster Studio</span>
          </NavLink>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-40 bg-navy-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="flex items-center gap-2.5" data-testid="topbar-logo">
              <Crest small />
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Boston</div>
                <div className="text-sm font-display font-bold tracking-tight">Soccer Passport</div>
              </div>
            </Link>
            <div className="flex items-center gap-2 rounded-full bg-white/[0.06] ring-1 ring-white/5 px-3 py-1.5">
              <Trophy size={14} className="text-revs-400" />
              <span className="text-sm font-semibold" data-testid="topbar-points">{points.toLocaleString()}</span>
              <span className="text-[11px] text-ink-400">pts</span>
            </div>
          </div>
        </header>

        <main className={cn('flex-1 min-w-0', isMap ? '' : 'px-4 lg:px-10 py-6 lg:py-10')}>
          <div className={cn('mx-auto w-full', isMap ? '' : 'max-w-6xl')}>
            {children}
          </div>
        </main>

        {!isMap && <Footer />}

        {/* Mobile bottom nav */}
        <nav className="lg:hidden sticky bottom-0 z-40 bg-navy-950/85 backdrop-blur-xl border-t border-white/5 pb-[max(env(safe-area-inset-bottom),0.25rem)]">
          <div className="grid grid-cols-6">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                data-testid={`bottom-nav-${label.toLowerCase()}`}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium',
                    isActive ? 'text-white' : 'text-ink-400'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        'h-7 w-12 flex items-center justify-center rounded-full transition-colors',
                        isActive && 'bg-revs-500/15 ring-1 ring-revs-500/30'
                      )}
                    >
                      <Icon size={18} className={isActive ? 'text-revs-300' : ''} />
                    </div>
                    <span className="tracking-tight">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function Crest({ small }: { small?: boolean }) {
  const size = small ? 28 : 38;
  return (
    <div
      className="grid place-items-center rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 ring-1 ring-white/10 shadow-card"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.66} height={size * 0.66} aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke="#F7F8FA" strokeWidth="1.5" />
        <path d="M12 4l1.6 3.4L12 10l-1.6-2.6L12 4z" fill="#C8102E" />
        <path d="M12 20l-1.6-3.4L12 14l1.6 2.6L12 20z" fill="#C8102E" />
        <path d="M4 12l3.4-1.6L10 12l-2.6 1.6L4 12z" fill="#F7F8FA" />
        <path d="M20 12l-3.4 1.6L14 12l2.6-1.6L20 12z" fill="#F7F8FA" />
      </svg>
    </div>
  );
}
