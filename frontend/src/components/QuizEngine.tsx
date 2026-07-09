import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuestions, type QuizQuestion } from '../utils/quizGenerator';

interface QuizEngineProps {
  kanjiList: any[];
  allKanji: any[];
  onComplete: () => void;
}

export default function QuizEngine({ kanjiList, allKanji, onComplete }: QuizEngineProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Generate questions on mount based on the kanjiList
    setQuestions(generateQuestions(kanjiList, allKanji));
  }, [kanjiList, allKanji]);

  if (questions.length === 0) return <div className="text-center p-8">Loading Quiz...</div>;

  const current = questions[currentIndex];
  const isFinished = currentIndex >= questions.length;

  const handleSubmit = () => {
    if (!selected) return;
    setIsSubmitted(true);
    if (selected === current.answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setIsSubmitted(false);
    setCurrentIndex(prev => prev + 1);
  };

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto text-center mt-10">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold mb-4">Mini-Quiz Complete!</h2>
          <p className="text-xl text-slate-500 mb-8">You scored {score} out of {questions.length}</p>
          
          <button 
            onClick={onComplete}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-transform active:scale-95 text-lg"
          >
            Continue Learning
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between text-sm font-semibold text-slate-400 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
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
          className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-8 sm:p-12"
        >
          <div className="mb-8 text-center">
            {current.type === 'sentence_fill' && (
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Fill in the Blank</span>
            )}
            {(current.type === 'meaning_to_kanji' || current.type === 'reading_to_kanji') && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Identify Kanji</span>
            )}
            {current.type === 'kanji_to_meaning' && (
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">Meaning</span>
            )}
            
            <h2 className="text-3xl font-bold text-slate-800 leading-tight">
              {current.question}
            </h2>
            {current.context && (
              <p className="mt-3 text-slate-500 font-medium">"{current.context}"</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {current.options.map((opt, i) => {
              const isSelected = selected === opt;
              const isCorrect = opt === current.answer;
              
              let btnClass = "py-6 px-4 rounded-2xl border-2 text-2xl font-medium transition-all ";
              
              if (!isSubmitted) {
                btnClass += isSelected 
                  ? "border-blue-500 bg-blue-50 text-blue-700" 
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 text-slate-700";
              } else {
                if (isCorrect) {
                  btnClass += "border-emerald-500 bg-emerald-50 text-emerald-700";
                } else if (isSelected && !isCorrect) {
                  btnClass += "border-rose-500 bg-rose-50 text-rose-700";
                } else {
                  btnClass += "border-slate-200 bg-slate-50 text-slate-400 opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  disabled={isSubmitted}
                  onClick={() => setSelected(opt)}
                  className={btnClass}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            {!isSubmitted ? (
              <button 
                onClick={handleSubmit}
                disabled={!selected}
                className={`py-4 px-12 rounded-2xl font-bold text-lg w-full max-w-sm transition-all shadow-lg active:scale-95 ${
                  selected 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Check Answer
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-12 rounded-2xl shadow-lg transition-transform active:scale-95 text-lg w-full max-w-sm"
              >
                {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
