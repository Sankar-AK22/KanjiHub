import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import SakuraParticles from './components/SakuraParticles';
import { seedAllN5Kanji } from './services/firestoreService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Lazy-loaded routes for code splitting
const Dashboard = lazy(() => import('./components/Dashboard'));
const LearningSession = lazy(() => import('./components/LearningSession'));
const TestSession = lazy(() => import('./components/TestSession'));
const ReviewSession = lazy(() => import('./components/ReviewSession'));
const Login = lazy(() => import('./components/Login'));
const Profile = lazy(() => import('./components/Profile'));

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="enso-spinner"></div>
      <p className="text-gray-400 font-medium text-sm tracking-widest uppercase">読み込み中...</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function NavBar() {
  const location = useLocation();
  const { currentUser } = useAuth();
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
          {currentUser ? (
            <>
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/') 
                    ? 'bg-crimson/20 text-crimson-light' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                to="/review"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/review') 
                    ? 'bg-gold/20 text-gold' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                Review
              </Link>
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive('/profile') 
                    ? 'bg-bamboo/20 text-bamboo-light' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                Profile
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-crimson/20 text-crimson-light`}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function AppContent() {
  const { currentUser } = useAuth();
  
  // Seed kanji to Firestore on first load after auth
  useEffect(() => {
    if (currentUser) {
      seedAllN5Kanji().catch(console.error);
    }
  }, [currentUser]);

  return (
    <Router>
      <div className="min-h-screen relative">
        <SakuraParticles />
        <div className="relative z-10">
          <NavBar />
          <main className="max-w-6xl mx-auto px-4 py-8">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/learn/:lessonId" element={<ProtectedRoute><LearningSession /></ProtectedRoute>} />
                <Route path="/test/:lessonId" element={<ProtectedRoute><TestSession /></ProtectedRoute>} />
                <Route path="/review" element={<ProtectedRoute><ReviewSession /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
