import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getUserStats } from '../services/firestoreService';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLearned: 0,
    totalTested: 0,
    overallAccuracy: 0,
    reviewDueCount: 0,
    weakKanjiCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const loadStats = async () => {
      try {
        const s = await getUserStats(currentUser.uid);
        setStats(s);
      } catch (err) {
        console.error('Failed to load stats for profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="bg-gradient-to-r from-crimson-dark to-ink p-10 flex flex-col md:flex-row items-center gap-8 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] opacity-20"></div>
          
          <div className="relative z-10 shrink-0">
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-gold shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-gold bg-ink flex items-center justify-center text-4xl shadow-xl">
                👤
              </div>
            )}
          </div>
          
          <div className="relative z-10 text-center md:text-left flex-1">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-1 block">
              Student
            </span>
            <h2 className="text-3xl font-bold text-gray-100 mb-2">{currentUser.displayName || 'Kanji Student'}</h2>
            <p className="text-gray-300 text-sm">{currentUser.email}</p>
          </div>
          
          <div className="relative z-10">
             <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-6 py-2 rounded-xl border border-white/20 text-sm font-semibold hover:bg-white/10 transition-colors text-gray-300"
            >
              Sign Out
            </motion.button>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-bold font-jp mb-6 text-gray-200 border-b border-white/10 pb-4">
            Learning Status
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="enso-spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Total Learned</div>
                <div className="text-4xl font-bold text-crimson-light">{stats.totalLearned}</div>
                <div className="text-sm text-gray-400 mt-2">/ 125 Kanji</div>
              </div>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Accuracy</div>
                <div className="text-4xl font-bold text-bamboo-light">{stats.overallAccuracy}%</div>
                <div className="text-sm text-gray-400 mt-2">Overall Test Score</div>
              </div>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Needs Review</div>
                <div className="text-4xl font-bold text-gold">{stats.reviewDueCount}</div>
                <div className="text-sm text-gray-400 mt-2">Kanji pending review</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
