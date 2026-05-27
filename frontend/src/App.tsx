import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Toaster from './components/Toaster';
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
        </Routes>
      </AnimatePresence>
      <Toaster />
    </Layout>
  );
}
