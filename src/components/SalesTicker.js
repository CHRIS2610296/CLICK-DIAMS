import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const SalesTicker = ({ isDarkMode }) => {
  const [recentSales, setRecentSales] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Note: If you get an index error in the console, click the link it provides to create the index.
    const q = query(
      collection(db, "orders"), 
      where("status", "==", "completed"), 
      orderBy("createdAt", "desc"), 
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sales = snapshot.docs
        .map(doc => doc.data())
        .filter(data => data.playerName)
        .map(data => ({
          name: data.playerName,
          item: data.items && data.items[0] ? (data.items[0].name || `${data.items[0].total} Diamonds`) : 'Diamonds',
        }));
      setRecentSales(sales);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (recentSales.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentSales.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [recentSales]);

  if (recentSales.length === 0) return null;

  const sale = recentSales[currentIndex];

  return (
    <div className="flex justify-center mb-6">
      <AnimatePresence mode='wait'>
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-sm border ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-700 text-blue-400' 
              : 'bg-white border-blue-100 text-blue-600'
          }`}
        >
          <TrendingUp size={14} className="text-green-500" />
          <span>
            <span className={isDarkMode ? "text-white" : "text-slate-800"}>{sale.name}</span> <span className="text-orange-500">{sale.item}</span> successfully purchased!✅
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SalesTicker;