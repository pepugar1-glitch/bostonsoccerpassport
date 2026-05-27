import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, LogIn, ShieldOff, ShieldCheck, LogOut } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { track } from '@/lib/analytics';
import RevsLogo from './RevsLogo';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'pedropujol03@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAuthorized(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export default function AdminGate({
  children,
  surface = 'admin',
  title = 'Admin Dashboard',
  description = 'Restricted to authorized Revolution staff and project leads.',
}: {
  children: React.ReactNode;
  surface?: 'admin' | 'qrcodes';
  title?: string;
  description?: string;
}) {
  const { state, signOut } = useAppStore();
  const location = useLocation();
  const authed = isAuthorized(state.auth?.email);

  useEffect(() => {
    if (authed) track('admin_unlock', { surface, email: state.auth?.email });
  }, [authed, surface, state.auth?.email]);

  if (!state.auth) {
    return (
      <div className="max-w-md mx-auto mt-12 lg:mt-20" data-testid={`${surface}-gate-signin`}>
        <div className="rounded-3xl bg-navy-900/60 ring-1 ring-white/5 shadow-card p-7 text-center">
          <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl bg-revs-500/15 ring-1 ring-revs-500/30">
            <Lock size={22} className="text-revs-300" />
          </div>
          <h1 className="mt-4 text-xl font-display font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-ink-300">
            Sign in with an authorized Google account to continue.
          </p>
          <Link
            to="/login"
            state={{ from: location.pathname }}
            data-testid={`${surface}-gate-signin-cta`}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-revs-500 hover:bg-revs-400 active:bg-revs-600 text-white px-5 py-2.5 text-sm font-semibold shadow-glow transition-colors"
          >
            <LogIn size={14} /> Sign in with Google
          </Link>
          <div className="mt-4 text-[11px] text-ink-400">{description}</div>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto mt-12 lg:mt-20" data-testid={`${surface}-gate-denied`}>
        <div className="rounded-3xl bg-navy-900/60 ring-1 ring-white/5 shadow-card p-7 text-center">
          <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl bg-revs-500/15 ring-1 ring-revs-500/30">
            <ShieldOff size={22} className="text-revs-300" />
          </div>
          <h1 className="mt-4 text-xl font-display font-bold tracking-tight">Access restricted</h1>
          <p className="mt-2 text-sm text-ink-300 leading-relaxed">
            Your Google account <span className="text-white font-semibold">{state.auth.email}</span>{' '}
            is not on the admin allowlist.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={signOut}
              data-testid={`${surface}-gate-signout`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10 px-4 py-2 text-xs font-semibold"
            >
              <LogOut size={12} /> Sign out
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] ring-1 ring-white/10 px-4 py-2 text-xs font-semibold"
            >
              Go to home
            </Link>
          </div>
          <div className="mt-5 pt-4 border-t border-white/5 text-[11px] text-ink-400 leading-relaxed">
            If you should have access, ask the project owner to add your email to the allowlist.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        data-testid={`${surface}-gate-pass`}
        className="mx-auto max-w-6xl mb-4 rounded-2xl bg-emerald-500/[0.06] ring-1 ring-emerald-500/20 px-4 py-2.5 flex items-center gap-3 text-[12px]"
      >
        <RevsLogo size={20} className="shrink-0" />
        <ShieldCheck size={13} className="text-emerald-300 shrink-0" />
        <div className="flex-1 min-w-0 truncate">
          <span className="text-emerald-200 font-semibold">Authorized</span>{' '}
          <span className="text-ink-300">· signed in as {state.auth.email}</span>
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] ring-1 ring-white/10 px-3 py-1 text-[11px] font-semibold"
        >
          <LogOut size={11} /> Sign out
        </button>
      </div>
      {children}
    </>
  );
}
