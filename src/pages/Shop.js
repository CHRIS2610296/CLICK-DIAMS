import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Zap, Phone, X, Check, Loader2, ChevronLeft, AlertCircle, 
  Facebook, MessageCircle, Copy, Moon, Sun, ShieldCheck, Lock, 
  Plus, Minus, TrendingUp, Trophy, Gamepad2, LayoutGrid, ChevronDown, ChevronUp, Star, CheckCircle2, Tag, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig'; 
import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';

// --- IMPORT YOUR GAMES HERE ---
import { FreeFire } from '../games/FreeFire';
import { Pubg } from '../games/Pubg';
import { MobileLegends } from '../games/MobileLegends';
import { BloodStrike } from '../games/BloodStrike';
import { Genshin } from '../games/Genshin';
import { ArenaBreakout } from '../games/ArenaBreakout';

const GAMES = {
  ff: FreeFire,
  pubg: Pubg,
  mlbb: MobileLegends,
  bs: BloodStrike,
  genshin: Genshin,
  ab: ArenaBreakout
};

// --- SALES TICKER COMPONENT ---
const SalesTicker = ({ isDarkMode }) => {
  const [recentSales, setRecentSales] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
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

const Footer = ({ isDarkMode }) => (
  <footer className={`border-t py-10 mt-auto transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-6">
        <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>NEED HELP?</h3>
        <p className="text-gray-400 text-sm">Contact us directly for support.</p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
        <a href="https://facebook.com/garena000456" target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all duration-300 group ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white'}`}>
          <Facebook className="group-hover:scale-110 transition-transform" size={24} />
          <span>CLICK DIAMS</span>
        </a>
        <a href="https://wa.me/261388297737" target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all duration-300 group ${isDarkMode ? 'bg-slate-800 text-green-400 hover:bg-green-600 hover:text-white' : 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white'}`}>
          <MessageCircle className="group-hover:scale-110 transition-transform" size={24} />
          <span>038 82 977 37</span>
        </a>
      </div>
      <div className={`text-center mt-8 pt-8 border-t border-dashed ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
        <p className="text-xs text-gray-400 font-medium">© 2026 Click Diams. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const Toast = ({ message, type }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }} 
    animate={{ opacity: 1, y: 0, scale: 1 }} 
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className={`fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[70] font-bold backdrop-blur-md ${
      type === 'error' ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'
    }`}
  >
    {type === 'error' ? <X size={18} /> : <Check size={18} />}
    <span>{message}</span>
  </motion.div>
);

export default function Shop() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState('games'); 
  const [selectedGameKey, setSelectedGameKey] = useState('ff'); 
  const [loadingGame, setLoadingGame] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- CATEGORY STATE ---
  const [activeCategory, setActiveCategory] = useState('Standard');

  const [showAllGames, setShowAllGames] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [storeStatus, setStoreStatus] = useState(false); 

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [formData, setFormData] = useState({ playerID: '', zoneID: '', playerName: '', phone: '', paymentMethod: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [refNumber, setRefNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [idVerified, setIdVerified] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "storeStatus"), (doc) => {
      if (doc.exists()) setStoreStatus(doc.data().online);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "freefireRoom"), (doc) => {
      if (doc.exists() && doc.data().isActive) {
        setRoomDetails(doc.data());
      } else {
        setRoomDetails(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => { 
    const saved = localStorage.getItem('ff_cart'); 
    if (saved) setCart(JSON.parse(saved)); 
    
    const savedOrder = localStorage.getItem('ff_pending_order');
    if (savedOrder) {
      setLastOrder(JSON.parse(savedOrder));
      setView('payment');
    }
  }, []);

  useEffect(() => { localStorage.setItem('ff_cart', JSON.stringify(cart)); }, [cart]);
  
  // --- PREPARE GAME LISTS ---
  const allGamesList = Object.entries(GAMES).map(([key, game]) => ({ ...game, id: key }));
  const featuredKeys = ['ff', 'pubg', 'mlbb', 'bs'];
  const featuredGames = featuredKeys.map(key => allGamesList.find(g => g.id === key)).filter(Boolean);
  const allGamesSorted = [...allGamesList].sort((a, b) => a.name.localeCompare(b.name));
  const visibleGames = showAllGames ? allGamesSorted : featuredGames;

  const handleGameSelect = (key) => {
    setLoadingGame(true);
    setTimeout(() => {
      setSelectedGameKey(key);
      const game = GAMES[key];
      // Reset category to default if game has categories
      if (game.categories) setActiveCategory(game.categories[0]);
      
      setFormData(prev => ({ ...prev, playerID: '', zoneID: '' })); 
      setIdVerified(false);
      setView('shop');
      setLoadingGame(false);
      window.scrollTo(0, 0);
    }, 600); 
  };

  const activeGame = GAMES[selectedGameKey]; 

  const addToCart = (pkg) => {
    setIsCartAnimating(true);
    setTimeout(() => setIsCartAnimating(false), 600);

    setCart(prev => {
      const existing = prev.find(item => item.id === pkg.id);
      if (existing) {
        return prev.map(item => item.id === pkg.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prev, { ...pkg, quantity: 1, game: activeGame.name, currency: activeGame.currency }];
      }
    });
    setToast({ message: "Added to cart!", type: "success" });
    setTimeout(() => setToast(null), 2000);
  };

  const updateQuantity = (itemId, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };
  
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  
  const totals = { 
    price: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) 
  };

  const handlePreCheckout = () => {
    if (!formData.playerID || !formData.phone || !formData.paymentMethod) return setToast({ message: "Fill all fields", type: "error" });
    if (activeGame.needZone && !formData.zoneID) return setToast({ message: "Zone ID is required", type: "error" });

    const phoneRegex = /^(032|033|034|038|037)[0-9]{7}$/;
    const cleanPhone = formData.phone.replace(/\s/g, ''); 
    
    if (!phoneRegex.test(cleanPhone)) {
      return setToast({ message: "Invalid MG Phone Number (03x...)", type: "error" });
    }

    setShowConfirmModal(true);
  };

  const confirmOrder = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);
    try {
      const orderData = {
        ...formData, 
        items: cart, 
        totalPrice: totals.price, 
        game: activeGame.name, 
        fullPlayerID: activeGame.needZone ? `${formData.playerID} (${formData.zoneID})` : formData.playerID,
        status: 'awaiting_proof', 
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      const fullOrder = { id: docRef.id, ...orderData };
      setLastOrder(fullOrder);
      localStorage.setItem('ff_pending_order', JSON.stringify(fullOrder));
      
      setCart([]); setIsCartOpen(false); 
      setView('payment'); // Go to Payment View
    } catch (error) { setToast({ message: "Network Error", type: "error" }); } finally { setIsProcessing(false); }
  };

  const handleSubmitProof = async () => {
    if (!refNumber) return setToast({message: "Enter Reference", type: 'error'});
    setIsUploading(true);
    try {
      await updateDoc(doc(db, "orders", lastOrder.id), { 
        proofType: 'ref', proofValue: refNumber, status: 'pending_review', createdAt: serverTimestamp()
      });
      localStorage.removeItem('ff_pending_order');
      setView('finish'); // Go to Finish View
    } catch (error) { setToast({ message: "Update failed", type: "error" }); } finally { setIsUploading(false); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setToast({ message: "Copied!", type: "success" });
    setTimeout(() => setToast(null), 2000);
  };

  const theme = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    text: isDarkMode ? 'text-white' : 'text-slate-800',
    nav: isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-gray-100',
    card: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100',
    input: isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-slate-900',
    subText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    iconBtn: isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  };

  // ------------------------------------------------------------------
  // VIEW: GAMES LIST (HOME)
  // ------------------------------------------------------------------
  if (view === 'games') {
    return (
       <div className={`min-h-screen font-sans pb-20 flex flex-col transition-colors duration-300 ${theme.bg}`}>
         <nav className={`backdrop-blur-md sticky top-0 z-40 border-b shadow-sm p-4 ${theme.nav}`}>
           <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-3">
               <img src="/clickdiams.jpg" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm" />
               <div>
                 <h1 className={`text-xl font-black italic ${theme.text}`}>CLICK <span className="text-blue-600">DIAMS</span></h1>
                 <div className="flex items-center gap-1.5 mt-0.5">
                   <div className={`w-2 h-2 rounded-full ${storeStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                   <p className={`text-[10px] font-bold tracking-widest ${storeStatus ? 'text-green-500' : 'text-red-400'}`}>
                     {storeStatus ? "ADMIN ONLINE" : "OFFLINE"}
                   </p>
                 </div>
               </div>
             </div>
             
             <div className="flex items-center gap-3">
                {roomDetails && (
                  <button 
                    onClick={() => setShowRoomModal(true)}
                    className="relative flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg hover:scale-105 transition-transform overflow-visible group"
                  >
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <Trophy size={14} className="text-yellow-300 animate-pulse" /> 
                    <span className="tracking-wider">EVENT</span>
                  </button>
                )}

                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-all ${theme.iconBtn}`}>
                  {isDarkMode ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} />}
                </button>
                <button onClick={() => setIsCartOpen(true)} className={`relative p-2 rounded-full transition-all group ${theme.iconBtn}`}>
                    {cart.length > 0 && <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></span>}
                    <ShoppingCart size={22} className="relative z-10" />
                    {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white z-20">{cart.length}</span>}
                </button>
             </div>
           </div>
         </nav>
         
         <div className="max-w-7xl mx-auto px-4 py-10 flex-1 w-full">
            <h2 className={`text-3xl font-black mb-2 ${theme.text}`}>{showAllGames ? "All Games" : "Popular Games"}</h2>
            <p className={`${theme.subText} mb-8`}>{showAllGames ? "Browse our full catalog." : "Top up your favorite games instantly."}</p>
            
            <SalesTicker isDarkMode={isDarkMode} />

            {loadingGame ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* --- DISPLAY LOGIC: GRID vs LIST --- */}
                {showAllGames ? (
                  // --- MARKETPLACE LIST VIEW ---
                  <div className="flex flex-col gap-4">
                    {visibleGames.map((game, index) => {
                      const randomDiscount = 5 + (index % 5);
                      const basePrice = game.packages[0].price;
                      const oldPrice = basePrice * 1.1; 
                      return (
                        <motion.div 
                          key={game.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -2 }}
                          onClick={() => handleGameSelect(game.id)}
                          className={`flex flex-row overflow-hidden rounded-xl border shadow-sm cursor-pointer hover:shadow-lg transition-all ${
                            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 bg-gray-200">
                            <img src={game.bg} alt={game.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-tr-lg flex items-center gap-1">
                              <Tag size={10} /> PROMO
                            </div>
                          </div>
                          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                            <div>
                              <h3 className={`font-bold text-lg sm:text-xl leading-tight line-clamp-1 ${theme.text}`}>{game.name}</h3>
                              <div className="flex items-center gap-1 mt-1 text-xs text-blue-500 font-medium">
                                <CheckCircle2 size={12} />
                                <span>Click Diams Official</span>
                                <div className="w-1 h-1 bg-gray-300 rounded-full mx-1"></div>
                                <span className="text-gray-400">Instant Delivery</span>
                              </div>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`text-lg sm:text-2xl font-black ${theme.text}`}>
                                    {basePrice.toLocaleString()} <span className="text-xs font-normal">Ar</span>
                                  </span>
                                  <span className="text-xs bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded">-{randomDiscount}%</span>
                                </div>
                                <div className="text-xs text-gray-400 line-through">{oldPrice.toFixed(0).toLocaleString()} Ar</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  // --- DEFAULT GRID VIEW ---
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {visibleGames.map((game) => (
                      <motion.div 
                        key={game.id}
                        layout
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleGameSelect(game.id)}
                        className={`cursor-pointer rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all group ${theme.card}`}
                      >
                        <div className="h-32 bg-gray-200 relative overflow-hidden">
                          <img src={game.bg} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                        </div>
                        <div className="p-4 text-center">
                          <h3 className={`font-bold ${theme.text}`}>{game.name}</h3>
                          <p className={`text-xs mt-1 ${theme.subText}`}>Top Up {game.currency}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* MORE GAMES BUTTON */}
                <div className="flex justify-center">
                  <button 
                    onClick={() => setShowAllGames(!showAllGames)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                      isDarkMode 
                        ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' 
                        : 'bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    <LayoutGrid size={18} />
                    {showAllGames ? "Show Less" : "More Games"}
                    {showAllGames ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>
            )}
         </div>
         <Footer isDarkMode={isDarkMode} />

         {/* ROOM MODAL */}
         <AnimatePresence>
            {showRoomModal && roomDetails && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                  initial={{scale:0.9, opacity:0}} 
                  animate={{scale:1, opacity:1}} 
                  exit={{scale:0.9, opacity:0}}
                  className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 text-center text-white relative shadow-2xl"
                >
                  <button 
                    onClick={() => setShowRoomModal(false)} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>

                  <div className="bg-gradient-to-r from-orange-500 to-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                    <Gamepad2 size={32} className="text-white" />
                  </div>

                  <h2 className="text-2xl font-black mb-1 text-white">FREE FIRE ROOM</h2>
                  <p className="text-slate-400 text-sm mb-6">Custom Room is Active! Join now.</p>

                  <div className="space-y-4">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Room ID</p>
                      <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
                        <span className="text-2xl font-mono font-bold tracking-wider text-orange-400 pl-2">{roomDetails.roomId}</span>
                        <button onClick={() => copyToClipboard(roomDetails.roomId)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"><Copy size={18}/></button>
                      </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Password</p>
                      <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg">
                        <span className="text-2xl font-mono font-bold tracking-wider text-white pl-2">{roomDetails.roomPass}</span>
                        <button onClick={() => copyToClipboard(roomDetails.roomPass)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"><Copy size={18}/></button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowRoomModal(false)}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl mt-6 hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            )}
         </AnimatePresence>
       </div>
    );
  }

  // ------------------------------------------------------------------
  // VIEW: PAYMENT (Avec bouton USSD et Notification de sécurité)
  // ------------------------------------------------------------------
  if (view === 'payment' && lastOrder) {
    const PAYMENT_DETAILS = {
      mvola: {
        number: "038 74 226 37",
        cleanNumber: "0387422637",
        name: "JEAN CHARLES",
        color: "text-green-600",
        bg: "bg-green-600/10",
        border: "border-green-600/20",
        btnBg: "bg-green-600 hover:bg-green-700"
      },
      orange: {
        number: "037 33 073 23",
        cleanNumber: "0373307323",
        name: "FANILONIAINA CHRISTIAN",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        btnBg: "bg-orange-500 hover:bg-orange-600"
      },
      airtel: {
        number: "033 24 322 07",
        cleanNumber: "0332432207",
        name: "FANILONIAINA CHRISTIAN",
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        btnBg: "bg-red-500 hover:bg-red-600"
      }
    };

    const method = lastOrder?.paymentMethod || 'mvola';
    const details = PAYMENT_DETAILS[method] || PAYMENT_DETAILS.mvola;
    const amount = lastOrder?.totalPrice || 0;

    let ussdLink = "#";
    if (method === 'mvola') {
      ussdLink = `tel:*111*1*2*${details.cleanNumber}*${amount}*2*0*%23`;
    } else if (method === 'orange') {
      ussdLink = `tel:%23144*1*1*${details.cleanNumber}*${details.cleanNumber}*${amount}*2%23`;
    } else if (method === 'airtel') {
      ussdLink = `tel:*436*2*1*${details.cleanNumber}%23`;
    }

    // --- NEW: DYNAMIC PLACEHOLDER LOGIC ---
    let refPlaceholder = "Transaction Reference";
    if (method === 'mvola') refPlaceholder = "Ex : Ref: 5443017XX";
    else if (method === 'airtel') refPlaceholder = "Ex : ID: 260202.1712.E09XXX";
    else if (method === 'orange') refPlaceholder = "Ex : Trans ID: PP260203.1824.C73893";

    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${theme.bg}`}>
        <div className={`w-full max-w-md p-6 rounded-2xl border shadow-xl ${theme.card}`}>
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-black ${theme.text}`}>Paiement Requis</h2>
            <p className={theme.subText}>Finalisez votre paiement pour recevoir vos diamants.</p>
          </div>

          <div className={`${details.bg} p-4 rounded-xl mb-6 border ${details.border}`}>
             <div className="flex justify-between text-sm mb-2">
                <span className={theme.subText}>Montant à payer :</span>
                <span className={`font-black text-xl ${theme.text}`}>{amount.toLocaleString()} Ar</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className={theme.subText}>Via :</span>
                <span className={`font-black uppercase ${details.color}`}>{method}</span>
             </div>
          </div>

          <div className="space-y-5">
             <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${theme.subText}`}>1. Envoyer l'argent :</label>
                
                <a 
                  href={ussdLink}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 mb-3 transition-transform active:scale-95 ${details.btnBg}`}
                >
                  <Zap size={20} className="fill-white" />
                  <span>Envoyer Maintenant (USSD)</span>
                </a>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3 mb-4">
                  <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    <strong>Important :</strong> Vérifiez bien que le nom affiché est <strong className="uppercase">{details.name}</strong> avant de valider le transfert.
                  </p>
                </div>

                <div className="text-center mb-4">
                  <span className={`text-xs bg-gray-100 px-2 py-1 rounded text-gray-500`}>ou manuellement vers le :</span>
                </div>

                <div className={`flex justify-between items-center p-3 rounded-xl border mb-2 relative overflow-hidden ${theme.input}`}>
                   <span className="font-mono font-bold text-xl tracking-wider">{details.number}</span>
                   <button onClick={() => copyToClipboard(details.number)} className={`p-2 rounded-lg hover:bg-gray-200/20 ${details.color}`}>
                     <Copy size={18} />
                   </button>
                </div>

                <div className={`flex items-center gap-2 text-xs font-bold px-2 ${theme.subText}`}>
                   <div className={`w-2 h-2 rounded-full ${details.color.replace('text', 'bg')}`}></div>
                   Nom : <span className={theme.text}>{details.name}</span>
                </div>
             </div>

             <div className={`w-full h-px ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}></div>

             <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${theme.subText}`}>2. Entrez le numéro de référence :</label>
                <input 
                  type="text" 
                  placeholder={refPlaceholder}
                  className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg ${theme.input}`}
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                />
             </div>

             <button 
               onClick={handleSubmitProof} 
               disabled={isUploading}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
             >
               {isUploading ? <Loader2 className="animate-spin"/> : <>Confirmer le Paiement <CheckCircle2 size={18}/></>}
             </button>
             
             <button 
               onClick={() => setView('games')} 
               className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2 font-medium"
             >
               Annuler la commande
             </button>
          </div>
        </div>
        <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>
      </div>
    );
  }

  if (view === 'finish') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-center transition-colors duration-300 ${theme.bg}`}>
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30"
        >
           <Check size={48} className="text-white" />
        </motion.div>
        <h2 className={`text-3xl font-black mb-2 ${theme.text}`}>Order Received!</h2>
        <p className={`max-w-xs mx-auto mb-8 ${theme.subText}`}>
           We are reviewing your payment. Your {lastOrder?.game} items will be sent shortly.
        </p>
        <button 
           onClick={() => { setView('games'); setCart([]); setLastOrder(null); setRefNumber(''); }}
           className={`px-8 py-3 rounded-full font-bold transition-all shadow-lg ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
        >
           Back to Home
        </button>
      </div>
    );
  }
  
  // ------------------------------------------------------------------
  // VIEW: SHOP (ITEMS LIST) - Default Fallback
  // ------------------------------------------------------------------
  
  // Filter packages based on category logic
  const visiblePackages = activeGame.categories 
    ? activeGame.packages.filter(p => p.category === activeCategory)
    : activeGame.packages;

  return (
    <div className={`min-h-screen font-sans pb-20 flex flex-col transition-colors duration-300 ${theme.bg}`}>
      <nav className={`backdrop-blur-md sticky top-0 z-40 border-b shadow-sm p-4 ${theme.nav}`}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('games')} className={`p-1 rounded-lg mr-1 transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ChevronLeft size={24} />
            </button>
            <div className={`w-10 h-10 rounded-lg overflow-hidden border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <img src="/clickdiams.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className={`text-lg font-black italic leading-none ${theme.text}`}>CLICK <span className="text-blue-600">DIAMS</span></h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <div className={`w-2 h-2 rounded-full ${storeStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <p className={`text-[10px] font-bold tracking-widest ${storeStatus ? 'text-green-500' : 'text-red-400'}`}>
                   {storeStatus ? "ADMIN ONLINE" : "OFFLINE"}
                 </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-all ${theme.iconBtn}`}>
               {isDarkMode ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} />}
             </button>
             <button onClick={() => setIsCartOpen(true)} className={`relative p-2 rounded-full transition-all group ${theme.iconBtn}`}>
                {cart.length > 0 && <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></span>}
                <ShoppingCart size={22} className="relative z-10" />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white z-20">{cart.length}</span>}
             </button>
          </div>
        </div>
      </nav>

      <div className="relative bg-gray-900 h-[220px] sm:h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={activeGame.bg} alt={activeGame.name} className="w-full h-full object-cover opacity-50" />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${isDarkMode ? 'from-slate-950' : 'from-slate-50'}`}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
          <div>
             <div className="inline-block bg-white text-black text-[10px] font-bold px-2 py-1 rounded mb-2 uppercase tracking-wider">
               Official {activeGame.name} Top Up
             </div>
             <h2 className="text-4xl font-black text-white leading-tight mb-1">{activeGame.name}</h2>
             <p className="text-gray-300 text-sm">Instant delivery. Only Via UID No login required.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-10 flex-1 w-full">
        {activeGame.categories && (
          <div className="flex justify-center gap-3 mb-6">
            {activeGame.categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all shadow-md ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white scale-105' 
                    : `${isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-white text-gray-600'} hover:bg-gray-100`
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {visiblePackages.map(pkg => (
            <div key={pkg.id} className={`rounded-xl shadow-sm border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all relative group ${theme.card}`}>
              {pkg.tag && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">{pkg.tag}</div>}
              
              <div className="p-4 text-center">
                <div className="mb-2">
                   <h3 className={`text-xl font-black flex items-center justify-center gap-1 text-center leading-tight ${theme.text}`}>
                     {pkg.name ? (
                        <span>{pkg.name}</span>
                     ) : (
                        <>{pkg.total} <span className={`text-sm font-normal ${theme.subText}`}>{activeGame.currency}</span></>
                     )}
                   </h3>
                   {pkg.bonus > 0 && pkg.total > 0 && (
                     <div className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded-full mt-1 ${isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-50 text-gray-400'}`}>
                       {pkg.base} + <span className="text-green-600">{pkg.bonus} Bonus</span>
                     </div>
                   )}
                </div>
                <div className={`w-full h-px my-3 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}></div>
                <p className="text-lg font-black text-blue-600">{pkg.price.toLocaleString()} Ar</p>
                <button onClick={() => addToCart(pkg)} className={`w-full mt-3 py-2 rounded-lg text-sm font-bold transition-colors ${isDarkMode ? 'bg-slate-800 text-white hover:bg-blue-600' : 'bg-gray-900 text-white hover:bg-blue-600'}`}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer isDarkMode={isDarkMode} />

      {/* CART DRAWER */}
      <AnimatePresence>
        {!isCartOpen && cart.length > 0 && (
          <motion.button initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} onClick={()=>setIsCartOpen(true)} className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-40 md:hidden overflow-visible">
            <span className="absolute inset-0 rounded-full bg-white opacity-50 animate-ping"></span>
            <ShoppingCart size={24} className="relative z-10"/>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white z-20">{cart.length}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={()=>setIsCartOpen(false)}></div>
            <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring', damping:25}} className={`fixed top-0 right-0 h-full w-full max-w-md shadow-2xl flex flex-col z-[60] ${theme.bg}`}>
              <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                <h2 className={`font-bold text-lg ${theme.text}`}>Your Cart</h2>
                <button onClick={()=>setIsCartOpen(false)} className={`p-2 rounded-full ${theme.iconBtn}`}><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className={`flex justify-between items-center border p-3 rounded-xl shadow-sm ${theme.card}`}>
                    <div className="flex items-center gap-3">
                      <div className={`text-[10px] font-bold px-1 rounded mr-1 ${isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>{item.game || activeGame.name}</div>
                      <div>
                        <div className={`font-bold text-sm ${theme.text}`}>
                          {item.name ? item.name : `${item.total} ${item.currency || activeGame.currency}`} 
                        </div>
                        <div className={`text-xs ${theme.subText}`}>{item.price.toLocaleString()} Ar</div>
                      </div>
                    </div>
                    {/* QUANTITY CONTROLS */}
                    <div className="flex flex-col items-end gap-1">
                      <span className={`font-bold ${theme.text}`}>{(item.price * item.quantity).toLocaleString()}</span>
                      <div className={`flex items-center gap-2 rounded-lg p-1 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                        <button onClick={() => updateQuantity(item.id, -1)} className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-white shadow-sm'}`}><Minus size={12}/></button>
                        <span className={`text-xs font-bold w-4 text-center ${theme.text}`}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-white shadow-sm'}`}><Plus size={12}/></button>
                      </div>
                    </div>
                    <button onClick={()=>removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 ml-2"><X size={18}/></button>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div className={`p-5 border-t shadow-[0_-5px_20px_rgba(0,0,0,0.2)] space-y-4 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-gray-100 bg-white'}`}>
                  <div className={`flex justify-between font-black text-xl ${theme.text}`}><span>Total</span><span>{totals.price.toLocaleString()} Ar</span></div>
                  <div className="space-y-3">
                      <div className="flex gap-2">
                         <div className="relative flex-1">
                            <input 
                              placeholder={`${activeGame.labelID} *`} 
                              className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${theme.input} ${idVerified ? 'border-green-500' : ''}`} 
                              value={formData.playerID} 
                              onChange={e=>{setFormData({...formData,playerID:e.target.value});setIdVerified(false)}} 
                            />
                         </div>
                         {activeGame.needZone && (
                           <div className="w-1/3">
                              <input 
                                placeholder="Zone ID" 
                                className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`} 
                                value={formData.zoneID} 
                                onChange={e=>setFormData({...formData,zoneID:e.target.value})} 
                              />
                           </div>
                         )}
                      </div>
                      
                      <input 
                        type="text" 
                        placeholder={idVerified ? "Name Verified" : "Username"} 
                        className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${theme.input} ${idVerified ? 'border-green-500 text-green-600 font-bold bg-green-50/10' : ''}`} 
                        value={formData.playerName} 
                        readOnly={idVerified} 
                        onChange={e=>setFormData({...formData,playerName:e.target.value})} 
                      />
                      
                      <input type="tel" placeholder="Phone Number (03x...)" className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`} value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} />
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={()=>setFormData({...formData,paymentMethod:'mvola'})} className={`p-2 rounded-xl border-2 font-bold text-xs ${formData.paymentMethod==='mvola'?'border-green-500 bg-green-500/10 text-green-500':'border-gray-200 text-gray-400'}`}>MVola</button>
                        <button onClick={()=>setFormData({...formData,paymentMethod:'orange'})} className={`p-2 rounded-xl border-2 font-bold text-xs ${formData.paymentMethod==='orange'?'border-orange-500 bg-orange-500/10 text-orange-500':'border-gray-200 text-gray-400'}`}>Orange</button>
                        <button onClick={()=>setFormData({...formData,paymentMethod:'airtel'})} className={`p-2 rounded-xl border-2 font-bold text-xs ${formData.paymentMethod==='airtel'?'border-red-500 bg-red-500/10 text-red-500':'border-gray-200 text-gray-400'}`}>Airtel</button>
                      </div>
                  </div>
                  <button onClick={handlePreCheckout} disabled={isProcessing} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700">{isProcessing?<Loader2 className="animate-spin"/>:"Confirm Order"}</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
              <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><ShieldCheck size={20}/> Confirm Order</h3>
                <button onClick={() => setShowConfirmModal(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div className={`p-3 rounded-lg border text-sm space-y-1 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between"><span>Player ID:</span> <span className="font-mono font-bold">{formData.playerID}</span></div>
                  {activeGame.needZone && <div className="flex justify-between"><span>Zone ID:</span> <span className="font-mono font-bold">{formData.zoneID}</span></div>}
                  {formData.playerName && <div className="flex justify-between"><span>Username:</span> <span className="font-bold text-blue-500">{formData.playerName}</span></div>}
                  <div className="flex justify-between border-t border-dashed pt-1 mt-1"><span>Phone:</span> <span className="font-bold">{formData.phone}</span></div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs uppercase text-gray-500 tracking-widest mb-1">Total To Pay</div>
                  <div className="text-3xl font-black">{totals.price.toLocaleString()} Ar</div>
                </div>

                <div className={`text-[10px] p-2 rounded flex gap-2 items-start ${isDarkMode ? 'bg-yellow-900/30 text-yellow-500' : 'bg-yellow-50 text-yellow-700'}`}>
                  <Lock size={14} className="shrink-0 mt-0.5" />
                  <span>NB: Verifiena tsara ny numero anao sy ny UID sy ny Pseudo</span>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmModal(false)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'}`}>Hanova</button>
                  <button onClick={confirmOrder} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-500/20">Eny, Hanohy</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}