import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import SakuraParticles from './components/SakuraParticles';
import { seedAllN5Kanji } from './services/firestoreService';

// Lazy-loaded routes for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const LearningSession = lazy(() => import('./components/LearningSession'));
const TestSession = lazy(() => import('./components/TestSession'));
const ReviewSession = lazy(() => import('./components/ReviewSession'));

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="enso-spinner"></div>
      <p className="text-gray-400 font-medium text-sm tracking-widest uppercase">読み込み中...</p>
    </div>
  );
}

function NavBar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-ink/80 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-3xl">⛩️</span>
          <div>
            <h1 className="text-xl font-bold font-jp bg-gradient-to-r from-crimson-light to-gold bg-clip-text text-transparent">
              漢字ハブ
            </h1>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-semibold">KanjiHub</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive('/') 
                ? 'bg-crimson/20 text-crimson-light' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            ホーム
          </Link>
          <Link
            to="/review"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive('/review') 
                ? 'bg-gold/20 text-gold' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            復習
          </Link>
        </nav>
      </div>
    </header>
  );
}

function App() {
  // Seed kanji to Firestore on first load
  useEffect(() => {
    seedAllN5Kanji().catch(console.error);
  }, []);

  return (
    <Router>
      <div className="min-h-screen relative">
        <SakuraParticles />
        <div className="relative z-10">
          <NavBar />
          <main className="max-w-6xl mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/learn/:lessonId" element={<LearningSession />} />
                <Route path="/test/:lessonId" element={<TestSession />} />
                <Route path="/review" element={<ReviewSession />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
