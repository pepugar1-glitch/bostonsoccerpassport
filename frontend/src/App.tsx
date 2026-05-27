import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout';
import Toaster from './components/Toaster';
import { track, distinctId } from './lib/analytics';
import { storage } from './lib/storage';
import { useAppStore } from './lib/store';
import { RTL_LANGS, type LangCode } from './i18n';
import HomeScreen from './screens/Home';
import MapScreen from './screens/Map';
import ScheduleScreen from './screens/Schedule';
import RewardsScreen from './screens/Rewards';
import ShareScreen from './screens/Share';
import ProfileScreen from './screens/Profile';
import QuizHub from './screens/Quiz';
import ArchetypeQuiz from './screens/QuizArchetype';
import TriviaQuiz from './screens/QuizTrivia';
import AdminScreen from './screens/Admin';
import QRPosters from './screens/QRPosters';
import LoginScreen from './screens/Login';

const transition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
};

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      key="page"
      initial={transition.initial}
      animate={transition.animate}
      exit={transition.exit}
      transition={transition.transition}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useAppStore();
  const { i18n } = useTranslation();

  // Sync <html lang> + dir with current language (RTL for Arabic).
  useEffect(() => {
    const lang = i18n.language as LangCode;
    const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang || 'en';
    document.documentElement.dir = dir;
  }, [i18n.language]);

  // Track app open + QR landing on first mount and on each route change
  useEffect(() => {
    const id = distinctId();
    const params = new URLSearchParams(window.location.search);
    const venue = params.get('venue');
    const utm = {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
      utm_term: params.get('utm_term') || undefined,
    };
    if (venue || utm.utm_source) {
      track('qr_landing', { distinctId: id, venue, ...utm });
    } else {
      track('app_open', { distinctId: id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // First-visit welcome: redirect to /login on first session (unless already signed in
  // or already dismissed as guest). Preserves the originally requested path + UTMs.
  useEffect(() => {
    if (location.pathname === '/login') return;
    if (state.auth) return;
    if (storage.getWelcomeSeen()) return;
    navigate('/login', {
      replace: true,
      state: { from: location.pathname + location.search },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    track('route_view', { path: location.pathname });
  }, [location.pathname]);

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><HomeScreen /></Page>} />
          <Route path="/map" element={<Page><MapScreen /></Page>} />
          <Route path="/schedule" element={<Page><ScheduleScreen /></Page>} />
          <Route path="/rewards" element={<Page><RewardsScreen /></Page>} />
          <Route path="/share" element={<Page><ShareScreen /></Page>} />
          <Route path="/profile" element={<Page><ProfileScreen /></Page>} />
          <Route path="/quiz" element={<Page><QuizHub /></Page>} />
          <Route path="/quiz/archetype" element={<Page><ArchetypeQuiz /></Page>} />
          <Route path="/quiz/trivia" element={<Page><TriviaQuiz /></Page>} />
          <Route path="/admin" element={<Page><AdminScreen /></Page>} />
          <Route path="/qrcodes" element={<Page><QRPosters /></Page>} />
          <Route path="/login" element={<Page><LoginScreen /></Page>} />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </Layout>
  );
}
