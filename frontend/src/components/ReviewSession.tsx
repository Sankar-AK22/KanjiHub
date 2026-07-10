import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { N5_LESSONS } from '../data/n5';
import { getAllUserProgress, type KanjiProgress } from '../services/firestoreService';
import QuizEngine from './QuizEngine';
import { useAuth } from '../contexts/AuthContext';

export default function ReviewSession() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const allKanji = useMemo(() => N5_LESSONS.flatMap(l => l.kanji), []);

  const [progress, setProgress] = useState<Record<string, KanjiProgress>>({});
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'browse' | 'quiz'>('browse');
  const [browseIndex, setBrowseIndex] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    
    const load = async () => {
      try {
        const p = await getAllUserProgress(currentUser.uid);
        setProgress(p);
      } catch (err) {
        console.error('Failed to load progress:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  // Only show kanji that have been learned
  const completedKanji = useMemo(() => {
    return allKanji.filter(k => progress[k.char]?.learned);
  }, [allKanji, progress]);

  const getMasteryLevel = useCallback((char: string): { label: string; color: string; emoji: string } => {
    const p = progress[char];
    if (!p || !p.tested) return { label: 'New', color: 'text-gray-400', emoji: '🆕' };
    if (p.accuracy >= 80) return { label: 'Mastered', color: 'text-bamboo-light', emoji: '⭐' };
    if (p.accuracy >= 50) return { label: 'Learning', color: 'text-gold', emoji: '📖' };
    return { label: 'Weak', color: 'text-crimson-light', emoji: '⚠️' };
  }, [progress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="enso-spinner"></div>
      </div>
    );
  }

  if (completedKanji.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.img
          src="/anime/maiden.png"
          alt="No reviews yet"
          className="w-36 h-36 object-contain mx-auto mb-6 anime-char"
          loading="lazy"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        />
        <h2 className="text-2xl font-bold font-jp text-gray-200 mb-3">No Kanji to Review Yet!</h2>
        <p className="text-gray-400 mb-6">Start learning some kanji first, then come back here to review them.</p>
        <button onClick={() => navigate('/learn/1')} className="btn-primary">
          Start Learning →
        </button>
      </div>
    );
  }

  if (mode === 'quiz') {
    return (
      <div className="pt-4">
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-[0.3em] text-bamboo-light font-bold">復習クイズ</span>
          <h2 className="text-2xl font-bold font-jp text-gray-200 mt-1">Review Quiz</h2>
        </div>
        <QuizEngine
          kanjiList={completedKanji.slice(0, Math.min(10, completedKanji.length))}
          allKanji={allKanji}
          onComplete={() => { setMode('browse'); navigate('/'); }}
          isTestMode={true}
        />
      </div>
    );
  }

  const currentReview = completedKanji[browseIndex];
  const mastery = getMasteryLevel(currentReview.char);
  const kanjiProgress = progress[currentReview.char];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-bamboo-light font-bold">復習モード</span>
          <h2 className="text-lg font-bold text-gray-200 font-jp">Review — {completedKanji.length} Kanji</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode('quiz')}
          className="btn-secondary text-sm py-2 px-5"
        >
          📝 Quiz Me
        </motion.button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {completedKanji.map((k, i) => {
          const m = getMasteryLevel(k.char);
          return (
            <button
              key={k.char}
              onClick={() => setBrowseIndex(i)}
              className={`w-7 h-7 rounded-lg text-xs font-bold font-jp transition-all ${
                i === browseIndex
                  ? 'bg-crimson text-white scale-110'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              title={`${k.char} — ${m.label}`}
            >
              {k.char}
            </button>
          );
        })}
      </div>

      {/* Kanji Review Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={browseIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-card overflow-hidden glow-bamboo"
        >
          <div className="p-10 text-center relative bg-gradient-to-br from-bamboo/10 to-ink-light/50">
            <div className="absolute top-4 right-4">
              <span className={`text-xs font-bold uppercase tracking-wider ${mastery.color}`}>
                {mastery.emoji} {mastery.label}
              </span>
            </div>
            <span className="text-7xl kanji-display">{currentReview.char}</span>

            {kanjiProgress && kanjiProgress.tested && (
              <div className="mt-4 flex justify-center gap-6 text-xs text-gray-400">
                <span>✅ {kanjiProgress.correctCount} correct</span>
                <span>❌ {kanjiProgress.wrongCount} wrong</span>
                <span>🎯 {kanjiProgress.accuracy}% accuracy</span>
              </div>
            )}
          </div>

          <div className="p-8 space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">{currentReview.meaning}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">On</h3>
                <p className="font-medium text-gray-200 font-jp">{currentReview.on}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Kun</h3>
                <p className="font-medium text-gray-200 font-jp">{currentReview.kun || '—'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2">
              {currentReview.sentences.map((s, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-lg">
                  <p className="text-sm font-jp text-gray-200">{s.jp}</p>
                  <p className="text-xs text-gray-400">{s.en}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-6 flex justify-between gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setBrowseIndex(Math.max(0, browseIndex - 1))}
          disabled={browseIndex === 0}
          className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white/5 text-gray-300 hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setBrowseIndex(Math.min(completedKanji.length - 1, browseIndex + 1))}
          disabled={browseIndex === completedKanji.length - 1}
          className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white/5 text-gray-300 hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </motion.button>
      </div>

      <div className="mt-4 text-center">
        <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
