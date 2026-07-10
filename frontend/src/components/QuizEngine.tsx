import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuestions, type QuizQuestion } from '../utils/quizGenerator';
import { useSound } from '../hooks/useSound';
import { submitTestResult } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

interface QuizEngineProps {
  kanjiList: any[];
  allKanji: any[];
  onComplete: () => void;
  isTestMode: boolean;
}

const CORRECT_REACTIONS = [
  'すごい！Amazing!', 'よくできた！Well done!', 'パーフェクト！Perfect!',
  '素晴らしい！Wonderful!', 'いいね！Nice!', '天才！Genius!',
];

const WRONG_REACTIONS = [
  'もう一度！Try again!', 'ドンマイ！No worries!', 'がんばれ！Keep going!',
  '大丈夫！It\'s okay!', '次は正解！You\'ll get it!',
];

export default function QuizEngine({ kanjiList, allKanji, onComplete, isTestMode }: QuizEngineProps) {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [reaction, setReaction] = useState('');
  const [animClass, setAnimClass] = useState('');
  const { playCorrect, playWrong, playComplete } = useSound();

  useEffect(() => {
    setQuestions(generateQuestions(kanjiList, allKanji));
  }, [kanjiList, allKanji]);

  const current = questions[currentIndex];
  const isFinished = currentIndex >= questions.length;

  // Find which kanji this question is about (for Firestore)
  const currentKanjiChar = useMemo(() => {
    if (!current) return '';
    // Try to extract the kanji character from the question
    const kanjiMatch = kanjiList.find(k => 
      current.answer === k.char || 
      current.answer === k.meaning ||
      current.question.includes(k.char) ||
      current.question.includes(k.meaning)
    );
    return kanjiMatch?.char || '';
  }, [current, kanjiList]);

  const handleSubmit = useCallback(async () => {
    if (!selected || !current) return;
    setIsSubmitted(true);

    const isCorrect = selected === current.answer;

    if (isCorrect) {
      setScore(s => s + 1);
      setReaction(CORRECT_REACTIONS[Math.floor(Math.random() * CORRECT_REACTIONS.length)]);
      setAnimClass('animate-correct');
      playCorrect();
    } else {
      setReaction(WRONG_REACTIONS[Math.floor(Math.random() * WRONG_REACTIONS.length)]);
      setAnimClass('animate-wrong');
      playWrong();
    }

    // Save to Firestore if test mode
    if (isTestMode && currentKanjiChar && currentUser) {
      try {
        await submitTestResult(currentKanjiChar, isCorrect, currentUser.uid);
      } catch (err) {
        console.error('Failed to submit test result:', err);
      }
    }

    setTimeout(() => setAnimClass(''), 600);
  }, [selected, current, playCorrect, playWrong, isTestMode, currentKanjiChar, currentUser]);

  const handleNext = useCallback(() => {
    setSelected(null);
    setIsSubmitted(false);
    setReaction('');
    setCurrentIndex(prev => prev + 1);
  }, []);

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="enso-spinner"></div>
      </div>
    );
  }

  if (isFinished) {
    const scorePercent = Math.round((score / questions.length) * 100);
    const isGreat = scorePercent >= 80;

    // Play completion sound
    playComplete();

    return (
      <div className="max-w-xl mx-auto text-center mt-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`glass-card p-12 ${isGreat ? 'glow-gold' : 'glow-crimson'}`}
        >
          <motion.img
            src={isGreat ? '/anime/sorcerer.png' : '/anime/ninja.png'}
            alt="Result character"
            className="w-32 h-32 object-contain mx-auto mb-6 anime-char"
            loading="lazy"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          />

          <div className="text-5xl mb-4">{isGreat ? '🎉' : '💪'}</div>
          <h2 className="text-3xl font-bold font-jp mb-3 text-gray-100">
            {isTestMode ? '試験完了！' : 'Quiz Complete!'}
          </h2>

          <div className="flex justify-center items-baseline gap-2 mb-4">
            <span className={`text-5xl font-bold ${isGreat ? 'text-gold' : 'text-crimson-light'}`}>
              {score}
            </span>
            <span className="text-xl text-gray-400">/ {questions.length}</span>
          </div>

          <p className="text-lg text-gray-300 mb-2">
            {scorePercent}% Accuracy
          </p>
          <p className="text-gray-400 text-sm mb-8">
            {isGreat
              ? 'Outstanding performance! You are a true Kanji warrior! 🏆'
              : 'Keep practicing! Every attempt makes you stronger! 🔥'}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="btn-primary text-lg px-10"
          >
            {isTestMode ? 'Back to Dashboard' : 'Continue Learning'}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-semibold text-gray-400 mb-2">
          <span>Question {currentIndex + 1} / {questions.length}</span>
          <span className="text-gold">Score: {score}</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2">
          <div
            className="progress-fill h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`glass-card overflow-hidden p-8 sm:p-10 ${animClass}`}
        >
          {/* Question type badge */}
          <div className="mb-6 text-center">
            {current.type === 'sentence_fill' && (
              <span className="inline-block px-3 py-1 bg-sakura/20 text-sakura rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                Fill in the Blank
              </span>
            )}
            {(current.type === 'meaning_to_kanji' || current.type === 'reading_to_kanji') && (
              <span className="inline-block px-3 py-1 bg-crimson/20 text-crimson-light rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                Identify Kanji
              </span>
            )}
            {current.type === 'kanji_to_meaning' && (
              <span className="inline-block px-3 py-1 bg-bamboo/20 text-bamboo-light rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                Meaning
              </span>
            )}

            <h2 className="text-2xl font-bold text-gray-100 font-jp leading-tight">
              {current.question}
            </h2>
            {current.context && (
              <p className="mt-2 text-gray-400 text-sm">"{current.context}"</p>
            )}
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3">
            {current.options.map((opt, i) => {
              const isSelected = selected === opt;
              const isCorrect = opt === current.answer;

              let btnClass = 'py-5 px-4 rounded-xl border-2 text-xl font-medium transition-all font-jp ';

              if (!isSubmitted) {
                btnClass += isSelected
                  ? 'border-crimson bg-crimson/10 text-crimson-light'
                  : 'border-white/10 bg-white/3 hover:border-crimson/40 hover:bg-white/5 text-gray-300';
              } else {
                if (isCorrect) {
                  btnClass += 'border-bamboo-light bg-bamboo/20 text-bamboo-light';
                } else if (isSelected && !isCorrect) {
                  btnClass += 'border-crimson-light bg-crimson/20 text-crimson-light';
                } else {
                  btnClass += 'border-white/5 bg-white/2 text-gray-600 opacity-50';
                }
              }

              return (
                <motion.button
                  key={i}
                  whileHover={!isSubmitted ? { scale: 1.03 } : {}}
                  whileTap={!isSubmitted ? { scale: 0.97 } : {}}
                  disabled={isSubmitted}
                  onClick={() => setSelected(opt)}
                  className={btnClass}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>

          {/* Reaction message */}
          <AnimatePresence>
            {reaction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 text-center text-lg font-bold font-jp ${
                  selected === current.answer ? 'text-bamboo-light' : 'text-crimson-light'
                }`}
              >
                {reaction}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit / Next button */}
          <div className="mt-8 flex justify-center">
            {!isSubmitted ? (
              <motion.button
                whileHover={selected ? { scale: 1.03 } : {}}
                whileTap={selected ? { scale: 0.97 } : {}}
                onClick={handleSubmit}
                disabled={!selected}
                className={`py-4 px-10 rounded-xl font-bold text-lg w-full max-w-sm transition-all ${
                  selected
                    ? 'btn-primary'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                Check Answer
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="btn-gold py-4 px-10 rounded-xl font-bold text-lg w-full max-w-sm"
              >
                {currentIndex === questions.length - 1 ? 'See Results →' : 'Next Question →'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
