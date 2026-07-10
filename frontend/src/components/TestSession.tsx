import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { N5_LESSONS } from '../data/n5';
import QuizEngine from './QuizEngine';

export default function TestSession() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = N5_LESSONS.find(l => l.id === Number(lessonId)) || N5_LESSONS[0];

  const allKanji = useMemo(() => N5_LESSONS.flatMap(l => l.kanji), []);

  return (
    <div className="pt-4">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">試験モード</span>
          <h2 className="text-3xl font-bold font-jp text-gray-200 mt-1 mb-2">
            {lesson.title}
          </h2>
          <p className="text-gray-400 text-sm">
            Test all {lesson.kanji.length} kanji in this lesson. Listen for the sounds! 🔊
          </p>
        </motion.div>

        <motion.img
          src="/anime/warrior.png"
          alt="Test Champion"
          className="w-32 h-32 object-contain mx-auto mt-4 anime-char"
          loading="lazy"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
      </div>

      <QuizEngine
        kanjiList={lesson.kanji}
        allKanji={allKanji}
        onComplete={() => navigate('/')}
        isTestMode={true}
      />

      <div className="mt-6 text-center">
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
