import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import RevsLogo from '@/components/RevsLogo';
import type { AuthUser } from '@/types';

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export default function Login() {
  const { signIn, state } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clientConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const redirectTo = (location.state as { from?: string } | null)?.from || '/';

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) throw new Error(`userinfo ${res.status}`);
        const info: GoogleUserInfo = await res.json();
        const user: AuthUser = {
          provider: 'google',
          sub: info.sub,
          email: info.email,
          emailVerified: info.email_verified,
          name: info.name,
          givenName: info.given_name,
          familyName: info.family_name,
          picture: info.picture,
          signedInAt: new Date().toISOString(),
        };
        signIn(user);
        navigate(redirectTo, { replace: true });
      } catch (e) {
        setError('Could not fetch your Google profile. Please try again.');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in failed. Try again.');
      setLoading(false);
    },
  });

  if (state.auth) {
    return (
      <div className="min-h-[60vh] grid place-items-center" data-testid="login-already">
        <div className="max-w-sm w-full rounded-3xl bg-navy-900/60 ring-1 ring-white/5 shadow-card p-8 text-center">
          <RevsLogo size={48} className="mx-auto mb-3" />
          <h1 className="text-xl font-display font-bold">You are signed in</h1>
          <p className="text-sm text-ink-300 mt-1">Signed in as {state.auth.email}.</p>
          <Link
            to="/profile"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-revs-500 hover:bg-revs-400 text-white px-5 py-2.5 text-sm font-semibold"
          >
            Go to your profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] grid place-items-center" data-testid="login-screen">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-sm w-full"
      >
        <div className="relative rounded-[28px] bg-gradient-to-br from-navy-800/90 via-navy-900/90 to-navy-950/95 ring-1 ring-white/10 shadow-card overflow-hidden backdrop-blur-xl">
          <div
            aria-hidden
            className="absolute inset-x-0 -top-24 h-48 opacity-60 pointer-events-none"
            style={{
              background:
                'radial-gradient(60% 100% at 50% 100%, rgba(200,16,46,0.45), transparent 70%)',
            }}
          />

          {/* Header */}
          <div className="relative px-8 pt-9 pb-6 text-center">
            <RevsLogo size={64} className="mx-auto drop-shadow-lg" />
            <h1 className="mt-5 text-[22px] font-display font-bold tracking-tight leading-tight">
              Sign in to keep
              <br /> your passport
            </h1>
            <p className="mt-2 text-[13px] text-ink-300 leading-relaxed">
              Save your points, schedule and rewards across devices.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-revs-500/15 ring-1 ring-revs-500/30 px-3 py-1 text-[11px] font-semibold text-revs-200">
              +25 welcome bonus
            </div>
          </div>

          {/* Auth section */}
          <div className="relative px-8 pb-7 space-y-3">
            {clientConfigured ? (
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  googleLogin();
                }}
                disabled={loading}
                data-testid="google-login-button"
                className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-white hover:bg-ink-50 active:bg-ink-100 text-navy-950 px-5 py-3 text-[14px] font-semibold transition-colors shadow-card disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Connecting to Google…
                  </>
                ) : (
                  <>
                    <GoogleG />
                    Continue with Google
                  </>
                )}
              </button>
            ) : (
              <div
                data-testid="google-login-not-configured"
                className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-xs leading-relaxed text-amber-200"
              >
                Google sign-in is not configured for this environment. Set{' '}
                <code className="text-amber-100">VITE_GOOGLE_CLIENT_ID</code> and reload.
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] px-4 py-2.5 text-xs text-red-200">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled
              title="Apple Sign-In requires a paid Apple Developer account. Coming soon."
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-white/[0.04] ring-1 ring-white/10 text-ink-400 px-5 py-3 text-[14px] font-semibold cursor-not-allowed"
            >
              <AppleIcon />
              Continue with Apple
              <span className="ml-1 rounded-full bg-white/[0.06] ring-1 ring-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-ink-300">
                Soon
              </span>
            </button>
          </div>

          {/* Trust strip */}
          <div className="relative px-8 py-4 border-t border-white/5 bg-black/30">
            <div className="flex items-start gap-2 text-[11px] text-ink-400 leading-relaxed">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-revs-300" />
              <p>
                We only store the name, email and avatar your provider returns. We never sell your data.
                Not affiliated with FIFA, MLS or the New England Revolution.
              </p>
            </div>
          </div>
        </div>

        {/* Skip */}
        <div className="mt-5 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} /> Skip for now and explore
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} aria-hidden>
      <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 009 18z" fill="#34A853" />
      <path d="M3.97 10.72A5.41 5.41 0 013.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.04l3.01-2.32z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.43 0 9 0A9 9 0 00.96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" width={14} height={14} aria-hidden fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50.1-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM248.4 89.7c20.3-24 33.4-58 26.4-93.7-31.5 1.3-69.6 21-91.4 49.8-21 24.5-37.1 65.7-26.6 92.6 36.6 1.1 76.5-21.7 91.6-48.7z" />
    </svg>
  );
}
