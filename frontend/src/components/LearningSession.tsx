import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { N5_LESSONS } from '../data/n5';
import QuizEngine from './QuizEngine';

export default function LearningSession() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = N5_LESSONS.find(l => l.id === Number(lessonId)) || N5_LESSONS[0];
  
  // Create a flat list of all kanji for distractors
  const allKanji = useMemo(() => N5_LESSONS.flatMap(l => l.kanji), []);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn');

  const current = lesson.kanji[currentIndex];
  
  // Chunking logic: Quiz every 5 kanji, or at the end of the lesson
  const CHUNK_SIZE = 5;
  const isEndOfChunk = (currentIndex + 1) % CHUNK_SIZE === 0;
  const isEndOfLesson = currentIndex === lesson.kanji.length - 1;
  const shouldQuiz = isEndOfChunk || isEndOfLesson;

  const handleNext = () => {
    if (shouldQuiz) {
      setMode('quiz');
    } else if (currentIndex < lesson.kanji.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleQuizComplete = () => {
    if (isEndOfLesson) {
      // Lesson is entirely complete! Return to dashboard
      navigate('/');
    } else {
      // Resume learning the next chunk
      setMode('learn');
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (mode === 'quiz') {
    // Determine the recent kanji learned in this chunk
    const chunkStart = Math.max(0, currentIndex - (currentIndex % CHUNK_SIZE));
    const recentKanji = lesson.kanji.slice(chunkStart, currentIndex + 1);
    
    return (
      <div className="pt-8">
        <QuizEngine 
          kanjiList={recentKanji} 
          allKanji={allKanji} 
          onComplete={handleQuizComplete} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex justify-between items-center text-sm font-semibold text-slate-400">
        <span>{lesson.title}</span>
        <span>{currentIndex + 1} / {lesson.kanji.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
        >
          <div className="p-12 text-center border-b border-slate-100 bg-slate-50 relative">
            <span className="text-8xl font-serif text-slate-800 drop-shadow-sm">{current.char}</span>
            <div className="absolute top-4 right-4">
              <button className="text-xs font-semibold bg-white px-3 py-1 rounded-full shadow-sm text-slate-500 border border-slate-200">
                View Stroke Order
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Meaning</h3>
              <p className="text-2xl font-bold text-blue-600">{current.meaning}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">On Reading</h3>
                <p className="font-medium text-slate-700">{current.on}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Kun Reading</h3>
                <p className="font-medium text-slate-700">{current.kun || '-'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Example Sentences</h3>
              <div className="space-y-3">
                {current.sentences.map((sentence, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 transition-all hover:bg-slate-100 cursor-default">
                    <p className="text-lg font-medium text-slate-800 mb-1">{sentence.jp}</p>
                    <p className="text-sm text-slate-500">{sentence.en}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={handleNext}
          className={`font-bold py-4 px-12 rounded-2xl shadow-lg transition-transform active:scale-95 text-lg w-full max-w-sm ${
            shouldQuiz 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
              : 'bg-slate-800 hover:bg-slate-900 text-white'
          }`}
        >
          {shouldQuiz ? 'Take Mini-Quiz' : 'Next Kanji'}
        </button>
      </div>
    </div>
  );
}
