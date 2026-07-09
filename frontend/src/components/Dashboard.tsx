import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">N5 Progress</h2>
          <p className="text-slate-500 text-sm">45 / 60 Kanji Learned</p>
        </div>
        <div className="w-1/2">
          <div className="flex justify-between text-sm mb-1 font-medium">
            <span className="text-blue-600">75%</span>
            <span className="text-slate-400">100%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 relative overflow-hidden group cursor-pointer text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Daily Review</h3>
            <p className="text-slate-500 mb-6">You have 12 Kanji to review today. Keep your streak alive!</p>
            <Link to="/review" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-200 transition-all">
              Start Review
            </Link>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 relative overflow-hidden group cursor-pointer text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Learn New</h3>
            <p className="text-slate-500 mb-6">Continue your journey. Next up: Lesson 1.</p>
            <Link to="/learn/1" className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-emerald-200 transition-all">
              Start Lesson
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg mb-4">Your Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-3xl font-bold text-slate-700">94%</div>
            <div className="text-sm text-slate-500 mt-1">Accuracy</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-3xl font-bold text-slate-700">18</div>
            <div className="text-sm text-slate-500 mt-1">Day Streak</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-3xl font-bold text-slate-700">5</div>
            <div className="text-sm text-slate-500 mt-1">Weak Kanji</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
