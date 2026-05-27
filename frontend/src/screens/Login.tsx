import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Lock, ArrowLeft, type LucideIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import RevsLogo from '@/components/RevsLogo';
import type { AuthUser } from '@/types';

interface GoogleJwt {
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

  const clientConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const redirectTo = (location.state as { from?: string } | null)?.from || '/';

  const handleGoogle = (response: CredentialResponse) => {
    setError(null);
    if (!response.credential) {
      setError('Google did not return a credential. Please try again.');
      return;
    }
    try {
      const decoded = jwtDecode<GoogleJwt>(response.credential);
      const user: AuthUser = {
        provider: 'google',
        sub: decoded.sub,
        email: decoded.email,
        emailVerified: decoded.email_verified,
        name: decoded.name,
        givenName: decoded.given_name,
        familyName: decoded.family_name,
        picture: decoded.picture,
        signedInAt: new Date().toISOString(),
      };
      signIn(user);
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setError('Could not decode the Google response.');
    }
  };

  if (state.auth) {
    return (
      <div className="min-h-[60vh] grid place-items-center" data-testid="login-already">
        <div className="max-w-md w-full rounded-3xl bg-navy-900/60 ring-1 ring-white/5 shadow-card p-8 text-center">
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
    <div className="min-h-[70vh] grid place-items-center" data-testid="login-screen">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full rounded-3xl bg-navy-900/70 ring-1 ring-white/5 shadow-card overflow-hidden"
      >
        <div
          aria-hidden
          className="h-1.5 w-full bg-gradient-to-r from-revs-500 via-revs-400 to-revs-600"
        />
        <div className="px-8 py-9">
          <div className="flex items-center gap-3 mb-5">
            <RevsLogo size={52} className="shrink-0 drop-shadow" />
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">Boston Soccer Passport</div>
              <h1 className="text-xl font-display font-bold tracking-tight mt-0.5">Sign in to keep your passport</h1>
            </div>
          </div>

          <p className="text-sm text-ink-200 leading-relaxed">
            Save your points, events, archetype and rewards across devices.
            <br />
            <span className="text-ink-400">Free · takes 5 seconds · earn +25 bonus points.</span>
          </p>

          <div className="mt-7 space-y-3">
            {clientConfigured ? (
              <div data-testid="google-login-button" className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogle}
                  onError={() => setError('Google sign-in failed. Try again.')}
                  size="large"
                  shape="pill"
                  theme="filled_black"
                  text="continue_with"
                  width={320}
                />
              </div>
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
              className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-white/[0.04] ring-1 ring-white/10 text-ink-400 px-5 py-3 text-sm font-semibold cursor-not-allowed"
            >
              <AppleIcon /> Continue with Apple
              <span className="text-[10px] uppercase tracking-wider ml-1 text-ink-400/80">soon</span>
            </button>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2 text-[11px] text-ink-300">
            <Perk icon={Sparkles} label="Sync points" />
            <Perk icon={ShieldCheck} label="Private" />
            <Perk icon={Lock} label="No spam" />
          </div>

          <p className="mt-6 text-[11px] text-ink-400 leading-relaxed">
            By continuing you agree to use the prototype responsibly. Boston Soccer Passport stores only the
            name, email and avatar returned by your provider and never sells your data. Not affiliated with
            FIFA, MLS or the New England Revolution.
          </p>

          <div className="mt-6 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-white"
            >
              <ArrowLeft size={12} /> Skip for now
            </Link>
            <span className="text-[11px] text-ink-500">v1 · prototype</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Perk({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] ring-1 ring-white/5 px-2.5 py-2 flex items-center gap-2">
      <Icon size={13} className="text-revs-300" />
      <span>{label}</span>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" width={16} height={16} aria-hidden fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50.1-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM248.4 89.7c20.3-24 33.4-58 26.4-93.7-31.5 1.3-69.6 21-91.4 49.8-21 24.5-37.1 65.7-26.6 92.6 36.6 1.1 76.5-21.7 91.6-48.7z" />
    </svg>
  );
}
