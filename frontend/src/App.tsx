import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard.tsx';
import LearningSession from './components/LearningSession.tsx';
import ReviewSession from './components/ReviewSession.tsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600 tracking-tight">KanjiHub</h1>
            <div className="flex gap-4">
              <span className="font-semibold text-slate-600">Streak: 🔥 18 Days</span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learn/:lessonId" element={<LearningSession />} />
            <Route path="/review" element={<ReviewSession />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
