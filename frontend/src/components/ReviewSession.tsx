import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { N5_LESSONS } from '../data/n5';
import QuizEngine from './QuizEngine';

export default function ReviewSession() {
  const navigate = useNavigate();
  
  // Flatten all kanji
  const allKanji = useMemo(() => N5_LESSONS.flatMap(l => l.kanji), []);
  
  // Simulate fetching 10 random kanji due for daily review
  const reviewKanji = useMemo(() => {
    const shuffled = [...allKanji].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [allKanji]);

  return (
    <div className="pt-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Daily Review</h2>
        <p className="text-slate-500 mt-2">Let's review these 10 Kanji to keep your streak alive!</p>
      </div>
      <QuizEngine 
        kanjiList={reviewKanji} 
        allKanji={allKanji} 
        onComplete={() => navigate('/')} 
      />
    </div>
  );
}
