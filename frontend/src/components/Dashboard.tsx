import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { N5_LESSONS } from '../data/n5';
import { getUserStats, getAllUserProgress, type KanjiProgress } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

const ANIME_CHARACTERS = [
  { src: '/anime/ninja.png', name: 'Ninja Sensei', role: 'Learning Guide' },
  { src: '/anime/warrior.png', name: 'Kanji Warrior', role: 'Test Champion' },
  { src: '/anime/maiden.png', name: 'Study Maiden', role: 'Review Helper' },
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalLearned: 0,
    totalTested: 0,
    overallAccuracy: 0,
    reviewDueCount: 0,
    weakKanjiCount: 0,
  });
  const [progress, setProgress] = useState<Record<string, KanjiProgress>>({});
  const [loading, setLoading] = useState(true);

  const totalKanji = useMemo(() => N5_LESSONS.flatMap(l => l.kanji).length, []);

  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      try {
        const [s, p] = await Promise.all([
          getUserStats(currentUser.uid), 
          getAllUserProgress(currentUser.uid)
        ]);
        setStats(s);
        setProgress(p);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser]);

  const progressPercent = totalKanji > 0 ? Math.round((stats.totalLearned / totalKanji) * 100) : 0;

  // Find next lesson to learn
  const nextLesson = useMemo(() => {
    for (const lesson of N5_LESSONS) {
      const allLearned = lesson.kanji.every(k => progress[k.char]?.learned);
      if (!allLearned) return lesson;
    }
    return N5_LESSONS[0];
  }, [progress]);

  // Find next lesson to test
  const nextTestLesson = useMemo(() => {
    for (const lesson of N5_LESSONS) {
      const hasLearned = lesson.kanji.some(k => progress[k.char]?.learned);
      const allTested = lesson.kanji.every(k => progress[k.char]?.tested);
      if (hasLearned && !allTested) return lesson;
    }
    return N5_LESSONS[0];
  }, [progress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="enso-spinner"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-3xl font-bold font-jp mb-2 bg-gradient-to-r from-crimson-light to-gold bg-clip-text text-transparent">
            JLPT N5 漢字の道
          </h2>
          <p className="text-gray-400 mb-4">
            {stats.totalLearned} / {totalKanji} Kanji Mastered — Your journey to kanji mastery!
          </p>
          <div className="w-full max-w-md">
            <div className="flex justify-between text-sm mb-2 font-semibold">
              <span className="text-crimson-light">{progressPercent}%</span>
              <span className="text-gray-500">125 漢字</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
              <div className="progress-fill h-3 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
        <motion.img
          src="/anime/pirate.png"
          alt="KanjiHub Mascot"
          className="w-36 h-36 object-contain anime-char"
          whileHover={{ scale: 1.08, rotate: 3 }}
          loading="lazy"
        />
      </div>

      {/* Three Session Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Learning Card */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          className="glass-card p-6 text-center relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-crimson/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <motion.img
              src={ANIME_CHARACTERS[0].src}
              alt={ANIME_CHARACTERS[0].name}
              className="w-28 h-28 object-contain mx-auto mb-4 anime-char"
              loading="lazy"
            />
            <span className="text-xs uppercase tracking-[0.2em] text-crimson-light font-bold">学習</span>
            <h3 className="text-xl font-bold mt-1 mb-2 text-gray-100">Learning Session</h3>
            <p className="text-gray-400 text-sm mb-5">
              Study new kanji with readings, meanings & example sentences.
            </p>
            <p className="text-xs text-gray-500 mb-4">Next: {nextLesson.title}</p>
            <Link
              to={`/learn/${nextLesson.id}`}
              className="btn-primary inline-block w-full text-center text-sm"
            >
              Start Learning →
            </Link>
          </div>
        </motion.div>

        {/* Test Card */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          className="glass-card p-6 text-center relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <motion.img
              src={ANIME_CHARACTERS[1].src}
              alt={ANIME_CHARACTERS[1].name}
              className="w-28 h-28 object-contain mx-auto mb-4 anime-char"
              loading="lazy"
            />
            <span className="text-xs uppercase tracking-[0.2em] text-gold font-bold">試験</span>
            <h3 className="text-xl font-bold mt-1 mb-2 text-gray-100">Test Session</h3>
            <p className="text-gray-400 text-sm mb-5">
              Challenge yourself! Sounds play for right & wrong answers.
            </p>
            <p className="text-xs text-gray-500 mb-4">Next: {nextTestLesson.title}</p>
            <Link
              to={`/test/${nextTestLesson.id}`}
              className="btn-gold inline-block w-full text-center text-sm"
            >
              Take Test →
            </Link>
          </div>
        </motion.div>

        {/* Review Card */}
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          className="glass-card p-6 text-center relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-bamboo/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <motion.img
              src={ANIME_CHARACTERS[2].src}
              alt={ANIME_CHARACTERS[2].name}
              className="w-28 h-28 object-contain mx-auto mb-4 anime-char"
              loading="lazy"
            />
            <span className="text-xs uppercase tracking-[0.2em] text-bamboo-light font-bold">復習</span>
            <h3 className="text-xl font-bold mt-1 mb-2 text-gray-100">Review Session</h3>
            <p className="text-gray-400 text-sm mb-5">
              Revisit completed kanji with spaced repetition.
            </p>
            <p className="text-xs text-gray-500 mb-4">{stats.reviewDueCount} kanji due for review</p>
            <Link
              to="/review"
              className="btn-secondary inline-block w-full text-center text-sm"
            >
              Review Now →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-lg mb-4 font-jp text-gray-200">📊 Your Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="text-3xl font-bold text-crimson-light">{stats.totalLearned}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Learned</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="text-3xl font-bold text-gold">{stats.totalTested}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Tested</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="text-3xl font-bold text-bamboo-light">{stats.overallAccuracy}%</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Accuracy</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="text-3xl font-bold text-sakura">{stats.reviewDueCount}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Due Review</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="text-3xl font-bold text-crimson-light">{stats.weakKanjiCount}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Weak Kanji</div>
          </div>
        </div>
      </div>

      {/* All Lessons Grid */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-lg mb-4 font-jp text-gray-200">📚 All Lessons</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {N5_LESSONS.map((lesson) => {
            const learnedCount = lesson.kanji.filter(k => progress[k.char]?.learned).length;
            const testedCount = lesson.kanji.filter(k => progress[k.char]?.tested).length;
            const lessonPercent = Math.round((learnedCount / lesson.kanji.length) * 100);

            return (
              <div key={lesson.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/8 transition-all">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Lesson {lesson.id}</div>
                <div className="text-sm font-semibold text-gray-200 mb-2">{lesson.title}</div>
                <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                  <div className="progress-fill h-1.5 rounded-full" style={{ width: `${lessonPercent}%` }}></div>
                </div>
                <div className="flex gap-2 text-[10px] text-gray-500">
                  <span>📖 {learnedCount}/{lesson.kanji.length}</span>
                  <span>✅ {testedCount}/{lesson.kanji.length}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link to={`/learn/${lesson.id}`} className="text-[10px] text-crimson-light hover:underline">Learn</Link>
                  <Link to={`/test/${lesson.id}`} className="text-[10px] text-gold hover:underline">Test</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
