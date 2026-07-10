import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { N5_LESSONS } from '../data/n5';
import QuizEngine from './QuizEngine';
import { markKanjiLearned } from '../services/firestoreService';

export default function LearningSession() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = N5_LESSONS.find(l => l.id === Number(lessonId)) || N5_LESSONS[0];

  const allKanji = useMemo(() => N5_LESSONS.flatMap(l => l.kanji), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');
  const [flipped, setFlipped] = useState(false);

  const current = lesson.kanji[currentIndex];

  const CHUNK_SIZE = 5;
  const isEndOfChunk = (currentIndex + 1) % CHUNK_SIZE === 0;
  const isEndOfLesson = currentIndex === lesson.kanji.length - 1;
  const shouldQuiz = isEndOfChunk || isEndOfLesson;

  const handleNext = useCallback(async () => {
    // Mark this kanji as learned in Firebase
    try {
      await markKanjiLearned(current.char);
    } catch (err) {
      console.error('Failed to mark kanji learned:', err);
    }

    setFlipped(false);

    if (shouldQuiz) {
      setMode('quiz');
    } else if (currentIndex < lesson.kanji.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [current.char, shouldQuiz, currentIndex, lesson.kanji.length]);

  const handleQuizComplete = useCallback(() => {
    if (isEndOfLesson) {
      navigate('/');
    } else {
      setMode('learn');
      setCurrentIndex(prev => prev + 1);
    }
  }, [isEndOfLesson, navigate]);

  if (mode === 'quiz') {
    const chunkStart = Math.max(0, currentIndex - (currentIndex % CHUNK_SIZE));
    const recentKanji = lesson.kanji.slice(chunkStart, currentIndex + 1);

    return (
      <div className="pt-4">
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-[0.3em] text-crimson-light font-bold">Mini Quiz</span>
          <h2 className="text-2xl font-bold font-jp text-gray-200 mt-1">Test what you just learned!</h2>
        </div>
        <QuizEngine
          kanjiList={recentKanji}
          allKanji={allKanji}
          onComplete={handleQuizComplete}
          isTestMode={false}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-crimson-light font-bold">学習モード</span>
          <h2 className="text-lg font-bold text-gray-200 font-jp">{lesson.title}</h2>
        </div>
        <div className="text-sm font-semibold text-gray-400">
          {currentIndex + 1} / {lesson.kanji.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/5 rounded-full h-2 mb-8">
        <div
          className="progress-fill h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / lesson.kanji.length) * 100}%` }}
        ></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="glass-card overflow-hidden glow-crimson"
        >
          {/* Kanji display */}
          <div className="p-12 text-center relative bg-gradient-to-br from-crimson/10 to-ink-light/50">
            <motion.span
              className="text-8xl kanji-display cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFlipped(!flipped)}
            >
              {current.char}
            </motion.span>

            <motion.img
              src="/anime/slayer.png"
              alt="Study companion"
              className="absolute bottom-2 right-4 w-20 h-20 object-contain anime-char opacity-60"
              loading="lazy"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Meaning</h3>
              <p className="text-2xl font-bold text-gold">{current.meaning}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">On Reading</h3>
                <p className="font-medium text-gray-200 font-jp text-lg">{current.on}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Kun Reading</h3>
                <p className="font-medium text-gray-200 font-jp text-lg">{current.kun || '—'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Example Sentences</h3>
              <div className="space-y-3">
                {current.sentences.map((sentence, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/8 transition-all"
                  >
                    <p className="text-lg font-medium text-gray-200 font-jp mb-1">{sentence.jp}</p>
                    <p className="text-sm text-gray-400">{sentence.en}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className={`w-full max-w-sm text-lg font-bold py-4 rounded-2xl transition-all ${
            shouldQuiz ? 'btn-gold' : 'btn-primary'
          }`}
        >
          {shouldQuiz ? '📝 Take Mini-Quiz' : 'Next Kanji →'}
        </motion.button>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
