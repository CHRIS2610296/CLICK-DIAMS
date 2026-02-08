import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, X, Check, Loader2, ChevronLeft, Moon, Sun, ShieldCheck, Lock, 
  Plus, Minus, Trophy, Gamepad2, LayoutGrid, ChevronDown, ChevronUp, Star, CheckCircle2, Tag, Copy, 
  Zap, AlertTriangle, Facebook, MessageCircle, TrendingUp, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig'; 
import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';

// --- IMPORT YOUR GAMES HERE ---
import { FreeFire } from '../games/FreeFire';
import { Pubg } from '../games/Pubg';
import { MobileLegends } from '../games/MobileLegends';
import { BloodStrike } from '../games/BloodStrike';
import { Genshin } from '../games/Genshin';
import { ArenaBreakout } from '../games/ArenaBreakout';
import Footer from "../components/Footer";

const GAMES = {
  ff: FreeFire,
  pubg: Pubg,
  mlbb: MobileLegends,
  bs: BloodStrike,
  genshin: Genshin,
  ab: ArenaBreakout
};

// --- INTERNAL COMPONENTS ---

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
      const sales = snapshot.docs.map(doc => doc.data()).filter(data => data.playerName).map(data => ({
          name: data.playerName,
          item: data.items && data.items[0] ? (data.items[0].name || `${data.items[0].total} Diamonds`) : 'Diamonds',
        }));
      setRecentSales(sales);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (recentSales.length === 0) return;
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % recentSales.length), 4000);
    return () => clearInterval(interval);
  }, [recentSales]);

  if (recentSales.length === 0) return null;
  const sale = recentSales[currentIndex];

  return (
    <div className="flex justify-center mb-8">
      <AnimatePresence mode='wait'>
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-sm border ${isDarkMode ? 'bg-[#18181b] border-white/10 text-blue-400' : 'bg-white border-gray-200 text-blue-600'}`}
        >
          <TrendingUp size={14} className="text-green-500" />
          <span><span className={isDarkMode ? "text-white" : "text-zinc-800"}>{sale.name}</span> <span className="text-orange-500">{sale.item}</span> purchased!</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};



const PaymentView = ({ lastOrder, isDarkMode, theme, setView, copyToClipboard, setToast }) => {
  const [refNumber, setRefNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  const PAYMENT_DETAILS = {
    mvola: { number: "038 74 226 37", cleanNumber: "0387422637", name: "JEAN CHARLES", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", btnBg: "bg-green-600 hover:bg-green-500" },
    orange: { number: "037 33 073 23", cleanNumber: "0373307323", name: "FANILONIAINA CHRISTIAN", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", btnBg: "bg-orange-500 hover:bg-orange-600" },
    airtel: { number: "033 24 322 07", cleanNumber: "0332432207", name: "FANILONIAINA CHRISTIAN", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", btnBg: "bg-red-500 hover:bg-red-600" }
  };

  const method = lastOrder?.paymentMethod || 'mvola';
  const details = PAYMENT_DETAILS[method] || PAYMENT_DETAILS.mvola;
  const amount = lastOrder?.totalPrice || 0;

  let ussdLink = "#";
  if (method === 'mvola') ussdLink = `tel:*111*1*2*${details.cleanNumber}*${amount}*2*0*%23`;
  else if (method === 'orange') ussdLink = `tel:%23144*1*1*${details.cleanNumber}*${details.cleanNumber}*${amount}*2%23`;
  else if (method === 'airtel') ussdLink = `tel:*436*2*1*${details.cleanNumber}%23`;

  let refPlaceholder = "Transaction Reference";
  if (method === 'mvola') refPlaceholder = "Ex : Ref: 5443017XX";
  else if (method === 'airtel') refPlaceholder = "Ex : ID: 260202.1712.E09XXX";
  else if (method === 'orange') refPlaceholder = "Ex : Trans ID: PP260203.1824.C73893";

  const handleSubmitProof = async () => {
    if (!refNumber) return setToast({ message: "Enter Reference", type: 'error' });
    setIsUploading(true);
    try {
      await updateDoc(doc(db, "orders", lastOrder.id), {
        proofType: 'ref', proofValue: refNumber, status: 'pending_review', createdAt: serverTimestamp()
      });
      localStorage.removeItem('ff_pending_order');
      setView('finish');
    } catch (error) { setToast({ message: "Update failed", type: "error" }); } finally { setIsUploading(false); }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${theme.bg} font-sans tracking-tight antialiased`}>
      <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${theme.card}`}>
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-black ${theme.text}`}>Paiement Requis</h2>
          <p className={theme.subText}>Order #{lastOrder.id.slice(0, 6)}</p>
        </div>
        
        <div className={`${details.bg} p-5 rounded-xl mb-6 border ${details.border}`}>
          <div className="flex justify-between text-sm mb-2">
            <span className={theme.subText}>Montant à payer :</span>
            <span className={`font-black text-xl ${theme.text}`}>{amount.toLocaleString()} Ar</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className={theme.subText}>Via :</span>
            <div className="flex items-center gap-2">
                <span className={`font-black uppercase ${details.color}`}>{method}</span>
                <button onClick={() => setShowNotice(!showNotice)} className={`p-1 rounded-full hover:bg-black/10 transition-colors ${showNotice ? 'bg-black/10' : ''}`}>
                  <HelpCircle size={16} className={details.color} />
                </button>
            </div>
          </div>
          <AnimatePresence>
            {showNotice && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 bg-white/10 p-2 rounded text-[10px] font-bold text-zinc-300 leading-tight border border-white/5">
                Seulement : MVOLA vers MVOLA - AIRTEL vers AIRTEL - ORANGE vers ORANGE
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div>
            <label className={`text-xs font-bold uppercase tracking-widest mb-3 block ${theme.subText}`}>1. Envoyer l'argent :</label>
            <a href={ussdLink} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 mb-3 transition-transform active:scale-95 ${details.btnBg}`}><Zap size={18} className="fill-white" /> <span>Envoyer Maintenant (USSD)</span></a>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-3 mb-4"><AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={16} /><p className="text-xs text-yellow-500/90 leading-relaxed"><strong>Important :</strong> Vérifiez bien que le nom affiché est <strong className="uppercase">{details.name}</strong>.</p></div>
            <div className={`flex justify-between items-center p-3 rounded-xl border mb-2 relative overflow-hidden ${theme.input}`}><span className="font-mono font-bold text-lg tracking-widest">{details.number}</span><button onClick={() => copyToClipboard(details.number)} className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${details.color}`}><Copy size={18} /></button></div>
          </div>
          <div className={`w-full h-px ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}></div>
          <div><label className={`text-xs font-bold uppercase tracking-widest mb-3 block ${theme.subText}`}>2. Référence :</label><input type="text" placeholder={refPlaceholder} className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg transition-all ${theme.input}`} value={refNumber} onChange={(e) => setRefNumber(e.target.value)} /></div>
          <button onClick={handleSubmitProof} disabled={isUploading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/20 transition-all">{isUploading ? <Loader2 className="animate-spin" /> : <>Confirmer le Paiement <CheckCircle2 size={18} /></>}</button>
          <button onClick={() => setView('games')} className="w-full text-center text-sm text-zinc-500 hover:text-zinc-300 mt-2 font-medium transition-colors">Annuler la commande</button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type }) => (
  <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className={`fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[70] font-bold backdrop-blur-md border ${type === 'error' ? 'bg-red-500/90 text-white border-red-400' : 'bg-green-500/90 text-white border-green-400'}`}>
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
  const [activeCategory, setActiveCategory] = useState('Standard');
  const [showAllGames, setShowAllGames] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [storeStatus, setStoreStatus] = useState(false); 
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [formData, setFormData] = useState({ playerID: '', zoneID: '', playerName: '', phone: '', paymentMethod: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [idVerified, setIdVerified] = useState(false);
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);
  const [activeHelp, setActiveHelp] = useState(null);

  useEffect(() => { localStorage.setItem('theme', isDarkMode ? 'dark' : 'light'); }, [isDarkMode]);
  useEffect(() => { return onSnapshot(doc(db, "config", "storeStatus"), (doc) => doc.exists() && setStoreStatus(doc.data().online)); }, []);
  useEffect(() => { return onSnapshot(doc(db, "config", "freefireRoom"), (doc) => setRoomDetails(doc.exists() && doc.data().isActive ? doc.data() : null)); }, []);
  useEffect(() => { 
    const saved = localStorage.getItem('ff_cart'); if (saved) setCart(JSON.parse(saved)); 
    const savedOrder = localStorage.getItem('ff_pending_order');
    if (savedOrder) { setLastOrder(JSON.parse(savedOrder)); setView('payment'); }
  }, []);
  useEffect(() => { localStorage.setItem('ff_cart', JSON.stringify(cart)); }, [cart]);

  // --- DARK MODE THEME CONFIG ---
  const theme = {
    bg: isDarkMode ? 'bg-[#09090b]' : 'bg-slate-50',
    text: isDarkMode ? 'text-white' : 'text-slate-900',
    nav: isDarkMode ? 'bg-[#09090b]/80 border-white/5 backdrop-blur-md' : 'bg-white/80 border-gray-200 backdrop-blur-md',
    card: isDarkMode ? 'bg-[#18181b] border-white/5' : 'bg-white border-gray-200',
    input: isDarkMode ? 'bg-[#27272a] border-white/10 text-white placeholder-zinc-500' : 'bg-white border-gray-200 text-slate-900',
    subText: isDarkMode ? 'text-zinc-400' : 'text-gray-500',
    iconBtn: isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white border border-white/5' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  };

  const allGamesList = Object.entries(GAMES).map(([key, game]) => ({ ...game, id: key }));
  const visibleGames = showAllGames ? [...allGamesList].sort((a, b) => a.name.localeCompare(b.name)) : ['ff', 'pubg', 'mlbb', 'bs'].map(key => allGamesList.find(g => g.id === key)).filter(Boolean);
  const activeGame = GAMES[selectedGameKey]; 
  const visiblePackages = activeGame.categories ? activeGame.packages.filter(p => p.category === activeCategory) : activeGame.packages;
  const totals = { price: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) };

  const toggleHelp = (field) => { setActiveHelp(activeHelp === field ? null : field); };

  const handleGameSelect = (key) => {
    setLoadingGame(true);
    setTimeout(() => {
      setSelectedGameKey(key);
      const game = GAMES[key];
      if (game.categories) setActiveCategory(game.categories[0]);
      setFormData(prev => ({ ...prev, playerID: '', zoneID: '' })); 
      setIdVerified(false);
      setView('shop');
      setLoadingGame(false);
      window.scrollTo(0, 0);
    }, 600); 
  };

  const addToCart = (pkg) => {
    setIsCartAnimating(true); setTimeout(() => setIsCartAnimating(false), 600);
    setCart(prev => {
      const existing = prev.find(item => item.id === pkg.id);
      return existing ? prev.map(item => item.id === pkg.id ? { ...item, quantity: item.quantity + 1 } : item) 
                      : [...prev, { ...pkg, quantity: 1, game: activeGame.name, currency: activeGame.currency }];
    });
    setToast({ message: "Added to cart!", type: "success" }); setTimeout(() => setToast(null), 2000);
  };

  const updateQuantity = (itemId, change) => setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item));
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text.replace(/\s/g, '')); setToast({ message: "Copied!", type: "success" }); setTimeout(() => setToast(null), 2000); };

  const handlePreCheckout = () => {
    if (cart.length === 0) return setToast({ message: "Cart is empty", type: "error" });
    if (!formData.playerID || !formData.phone || !formData.paymentMethod) return setToast({ message: "Fill all fields", type: "error" });
    if (activeGame.needZone && !formData.zoneID) return setToast({ message: "Zone ID is required", type: "error" });
    if (!/^(032|033|034|038|037)[0-9]{7}$/.test(formData.phone.replace(/\s/g, ''))) return setToast({ message: "Invalid MG Phone", type: "error" });
    setShowConfirmModal(true);
  };

  const confirmOrder = async () => {
    if (cart.length === 0) return;
    setShowConfirmModal(false); setIsProcessing(true);
    try {
      const orderData = { ...formData, items: cart, totalPrice: totals.price, game: activeGame.name, fullPlayerID: activeGame.needZone ? `${formData.playerID} (${formData.zoneID})` : formData.playerID, status: 'awaiting_proof', createdAt: serverTimestamp() };
      const docRef = await addDoc(collection(db, "orders"), orderData);
      const fullOrder = { id: docRef.id, ...orderData };
      setLastOrder(fullOrder); localStorage.setItem('ff_pending_order', JSON.stringify(fullOrder));
      setCart([]); setIsCartOpen(false); setView('payment');
    } catch (error) { setToast({ message: "Network Error", type: "error" }); } finally { setIsProcessing(false); }
  };

  if (view === 'payment') return <PaymentView lastOrder={lastOrder} isDarkMode={isDarkMode} theme={theme} setView={setView} copyToClipboard={copyToClipboard} setToast={setToast} />;
  
  if (view === 'finish') return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 text-center transition-colors duration-300 ${theme.bg} font-sans tracking-tight antialiased`}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20"><Check size={48} className="text-white" /></motion.div>
      <h2 className={`text-3xl font-black mb-2 ${theme.text}`}>Order Received!</h2>
      <p className={`max-w-xs mx-auto mb-8 ${theme.subText}`}>We are reviewing your payment. Your {lastOrder?.game} items will be sent shortly.</p>
      <button onClick={() => { setView('games'); setCart([]); setLastOrder(null); }} className={`px-8 py-3 rounded-full font-bold transition-all shadow-lg ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>Back to Home</button>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans tracking-tight antialiased pb-20 flex flex-col transition-colors duration-300 ${theme.bg}`}>
      <nav className={`backdrop-blur-md sticky top-0 z-40 border-b shadow-sm p-4 ${theme.nav}`}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {view === 'shop' && <button onClick={() => setView('games')} className={`p-1.5 rounded-lg mr-1 transition-colors ${isDarkMode ? 'hover:bg-white/10 text-zinc-300' : 'hover:bg-gray-100 text-gray-600'}`}><ChevronLeft size={20} /></button>}
            <img src="/clickdiams.jpg" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm" />
            <div>
              <h1 className={`text-lg font-black italic leading-none ${theme.text}`}>CLICK <span className="text-blue-500">DIAMS</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className={`w-2 h-2 rounded-full ${storeStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <p className={`text-[10px] font-bold tracking-widest ${storeStatus ? 'text-green-500' : 'text-red-400'}`}>{storeStatus ? "ADMIN ONLINE" : "OFFLINE"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {view === 'games' && roomDetails && <button onClick={() => setShowRoomModal(true)} className="relative flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg hover:scale-105 transition-transform overflow-visible group"><Trophy size={14} className="text-yellow-300 animate-pulse" /><span className="tracking-wider">EVENT</span></button>}
             <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-all ${theme.iconBtn}`}>{isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}</button>
             <button onClick={() => setIsCartOpen(true)} className={`relative p-2 rounded-full transition-all group ${theme.iconBtn}`}>
                {cart.length > 0 && <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></span>}
                <motion.div animate={cart.length > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}} transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }} className="relative z-10"><ShoppingCart size={20} /></motion.div>
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#09090b] z-20">{cart.length}</span>}
             </button>
          </div>
        </div>
      </nav>

      {view === 'games' ? (
        <div className="max-w-7xl mx-auto px-4 py-10 flex-1 w-full">
          <h2 className={`text-3xl font-black mb-2 ${theme.text}`}>{showAllGames ? "All Games" : "Popular Games"}</h2>
          <p className={`${theme.subText} mb-8 text-sm`}>Top up your favorite games instantly.</p>
          <SalesTicker isDarkMode={isDarkMode} />
          {loadingGame ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={48} /></div> : (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleGames.map((game) => (
                  <motion.div key={game.id} layout whileHover={{ scale: 1.02 }} onClick={() => handleGameSelect(game.id)} className={`cursor-pointer rounded-2xl shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-black/50 transition-all border ${theme.card}`}>
                    <div className="h-32 bg-[#000] relative overflow-hidden">
                      <img src={game.bg} alt={game.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className={`font-black text-lg ${theme.text}`}>{game.name}</h3>
                      <p className={`text-[10px] uppercase tracking-wider font-bold ${theme.subText}`}>Top Up {game.currency}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex justify-center mt-4">
                <button onClick={() => setShowAllGames(!showAllGames)} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-sm ${isDarkMode ? 'bg-[#27272a] text-white hover:bg-[#3f3f46] border border-white/5' : 'bg-white border-gray-200 text-slate-700 hover:bg-gray-50'}`}>
                  <LayoutGrid size={16} /><span>{showAllGames ? "Show Less" : "More Games"}</span>{showAllGames ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="relative bg-black h-[220px] overflow-hidden border-b border-white/5">
            <img src={activeGame.bg} alt={activeGame.name} className="w-full h-full object-cover opacity-40 absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
                <div>
                    <div className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2"><CheckCircle2 size={12} /> Official Top Up</div>
                    <h2 className="text-4xl font-black text-white">{activeGame.name}</h2>
                    <p className="text-zinc-400 text-sm mt-1">Instant delivery. Only Via UID.</p>
                </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20 pb-10 flex-1 w-full">
            {activeGame.categories && <div className="flex justify-center gap-2 mb-8">{activeGame.categories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${activeCategory === cat ? 'bg-blue-600 text-white ring-2 ring-blue-500/50' : `${isDarkMode ? 'bg-[#18181b] text-zinc-400 border border-white/5 hover:bg-[#27272a]' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}`}>{cat}</button>)}</div>}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {visiblePackages.map(pkg => (
                <div key={pkg.id} className={`rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all relative group border ${theme.card}`}>
                  {pkg.tag && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm">{pkg.tag}</div>}
                  <div className="p-5 text-center">
                    <h3 className={`text-xl font-black leading-tight ${theme.text}`}>{pkg.name || <>{pkg.total} <span className="text-sm font-normal text-zinc-500">{activeGame.currency}</span></>}</h3>
                    {pkg.bonus > 0 && <div className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 mb-3 inline-block px-2 py-0.5 rounded ${isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}> {pkg.base} + {pkg.bonus} Bonus</div>}
                    <div className={`w-full h-px my-3 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}></div>
                    <p className="text-lg font-black text-blue-500">{pkg.price.toLocaleString()} Ar</p>
                    <button onClick={() => addToCart(pkg)} className={`w-full mt-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Footer isDarkMode={isDarkMode} />

      <AnimatePresence>
        {!isCartOpen && cart.length > 0 && <motion.button initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} onClick={()=>setIsCartOpen(true)} className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-40 md:hidden"><ShoppingCart size={24} /><span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center border-2 border-[#09090b]">{cart.length}</span></motion.button>}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={()=>setIsCartOpen(false)}></div>
            <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} className={`fixed top-0 right-0 h-full w-full max-w-md shadow-2xl flex flex-col z-[60] ${theme.bg} border-l border-white/5`}>
              <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}><h2 className={`font-black text-xl ${theme.text}`}>Your Cart</h2><button onClick={()=>setIsCartOpen(false)} className={`p-2 rounded-full ${theme.iconBtn}`}><X size={20}/></button></div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">Your cart is empty</p>
                    <button onClick={() => setIsCartOpen(false)} className="mt-4 text-blue-500 text-xs font-bold hover:underline">Start Shopping</button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className={`flex justify-between items-center border p-4 rounded-xl shadow-sm ${theme.card}`}>
                      <div><div className={`font-bold text-sm ${theme.text}`}>{item.name || item.total}</div><div className={`text-xs ${theme.subText}`}>{item.price.toLocaleString()} Ar</div></div>
                      <div className="flex items-center gap-3"><button onClick={() => updateQuantity(item.id, -1)} className={`p-1 rounded hover:bg-white/10`}><Minus size={14} /></button><span className={`text-sm font-bold ${theme.text}`}>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} className={`p-1 rounded hover:bg-white/10`}><Plus size={14} /></button><button onClick={()=>removeFromCart(item.id)} className="text-red-500/50 hover:text-red-500 ml-2 transition-colors"><X size={18}/></button></div>
                    </div>
                  ))
                )}
              </div>
              
              {cart.length > 0 && (
                <div className={`p-6 border-t shadow-[0_-10px_40px_rgba(0,0,0,0.3)] space-y-5 ${isDarkMode ? 'border-white/5 bg-[#09090b]' : 'border-gray-100 bg-white'}`}>
                    <div className={`flex justify-between font-black text-xl ${theme.text}`}><span>Total</span><span>{totals.price.toLocaleString()} Ar</span></div>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <input placeholder={`${activeGame.labelID} *`} className={`w-full p-3.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${theme.input} ${idVerified ? 'border-green-500/50' : ''} pr-10 text-sm`} value={formData.playerID} onChange={e=>{setFormData({...formData,playerID:e.target.value});setIdVerified(false)}} />
                            <button onClick={() => toggleHelp('uid')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-blue-400"><HelpCircle size={16} /></button>
                          </div>
                          {activeGame.needZone && (
                            <div className="w-1/3 relative">
                              <input placeholder="Zone ID" className={`w-full p-3.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${theme.input} pr-8 text-sm`} value={formData.zoneID} onChange={e=>setFormData({...formData,zoneID:e.target.value})} />
                              <button onClick={() => toggleHelp('zone')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-blue-400"><HelpCircle size={14} /></button>
                            </div>
                          )}
                        </div>
                        <AnimatePresence>
                          {activeHelp === 'uid' && <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] p-2.5 rounded-lg">ℹ️ Trouvez votre identifiant dans votre profil de jeu.</motion.div>}
                          {activeHelp === 'zone' && <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] p-2.5 rounded-lg">ℹ️ L'ID de zone est requis pour ce jeu.</motion.div>}
                        </AnimatePresence>

                        <div className="relative">
                          <input type="text" placeholder={idVerified ? "Name Verified" : "Username"} className={`w-full p-3.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${theme.input} ${idVerified ? 'border-green-500/50 text-green-400' : ''} pr-10 text-sm`} value={formData.playerName} readOnly={idVerified} onChange={e=>setFormData({...formData,playerName:e.target.value})} />
                          <button onClick={() => toggleHelp('username')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-blue-400"><HelpCircle size={16} /></button>
                        </div>
                        <AnimatePresence>{activeHelp === 'username' && <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] p-2.5 rounded-lg">ℹ️ Entrez votre pseudo dans le jeu(Izay ahafantarana anao dia efa mety).</motion.div>}</AnimatePresence>

                        <div className="relative">
                          <input type="tel" placeholder="Phone Number (03x...)" className={`w-full p-3.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${theme.input} pr-10 text-sm`} value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} />
                          <button onClick={() => toggleHelp('phone')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-blue-400"><HelpCircle size={16} /></button>
                        </div>
                        <AnimatePresence>{activeHelp === 'phone' && <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] p-2.5 rounded-lg">ℹ️ Votre Numéro ou contact (03X...).</motion.div>}</AnimatePresence>
                        
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.subText}`}>Payment Method</span>
                          <button onClick={() => toggleHelp('payment')} className={`p-1 rounded-full hover:bg-white/5 transition-colors ${activeHelp === 'payment' ? 'bg-white/10' : ''}`}><HelpCircle size={14} className="text-zinc-500" /></button>
                        </div>
                        <AnimatePresence>{activeHelp === 'payment' && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-yellow-500/10 border border-yellow-500/20 p-2.5 rounded-lg text-[10px] font-bold text-yellow-500 leading-tight">🚨 Seulement : MVOLA vers MVOLA - AIRTEL vers AIRTEL - ORANGE vers ORANGE</motion.div>}</AnimatePresence>

                        <div className="grid grid-cols-3 gap-2">
                          {['mvola', 'orange', 'airtel'].map(m => {
                            const isSelected = formData.paymentMethod === m;
                            let activeClass = isDarkMode ? 'border-zinc-700 text-zinc-500 hover:bg-white/5' : 'border-gray-200 text-gray-400 hover:bg-gray-50';
                            if (isSelected) {
                               if (m === 'mvola') activeClass = 'border-green-500 bg-green-500/10 text-green-500';
                               if (m === 'orange') activeClass = 'border-orange-500 bg-orange-500/10 text-orange-500';
                               if (m === 'airtel') activeClass = 'border-red-500 bg-red-500/10 text-red-500';
                            }
                            return (<button key={m} onClick={()=>setFormData({...formData,paymentMethod:m})} className={`p-3 rounded-xl border-2 font-bold text-[10px] uppercase tracking-wider transition-all ${activeClass}`}>{m}</button>);
                          })}
                        </div>
                    </div>
                    <button onClick={handlePreCheckout} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed">{isProcessing ? <Loader2 className="animate-spin mx-auto"/> : "Confirm Order"}</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-[#18181b] border-white/10' : 'bg-white border-gray-100'}`}>
              <div className="bg-blue-600 p-4 text-white flex justify-between items-center"><h3 className="font-bold flex items-center gap-2"><ShieldCheck size={20}/> Confirm Order</h3><button onClick={() => setShowConfirmModal(false)}><X size={20}/></button></div>
              <div className="p-6 space-y-4">
                <div className={`p-4 rounded-xl border text-sm space-y-2 ${isDarkMode ? 'bg-[#09090b] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between"><span className={theme.subText}>Player ID</span> <span className={`font-mono font-bold ${theme.text}`}>{formData.playerID}</span></div>
                  {activeGame.needZone && <div className="flex justify-between"><span className={theme.subText}>Zone ID</span> <span className={`font-mono font-bold ${theme.text}`}>{formData.zoneID}</span></div>}
                  {formData.playerName && <div className="flex justify-between"><span className={theme.subText}>Username</span> <span className="font-bold text-blue-500">{formData.playerName}</span></div>}
                  <div className={`flex justify-between border-t border-dashed pt-2 mt-2 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}><span className={theme.subText}>Phone</span> <span className={`font-bold ${theme.text}`}>{formData.phone}</span></div>
                </div>
                <div className="text-center py-2">
                  <div className="text-[10px] uppercase text-zinc-500 tracking-widest mb-1 font-bold">Total To Pay</div>
                  <div className={`text-4xl font-black ${theme.text}`}>{totals.price.toLocaleString()} <span className="text-sm font-normal text-zinc-500">Ar</span></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowConfirmModal(false)} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-colors ${isDarkMode ? 'bg-[#27272a] text-zinc-300 hover:bg-[#3f3f46]' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>Cancel</button>
                  <button onClick={confirmOrder} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 transition-all">Confirm</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRoomModal && roomDetails && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} className="bg-[#18181b] border border-white/10 w-full max-w-sm rounded-3xl p-6 text-center text-white relative shadow-2xl">
              <button onClick={() => setShowRoomModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24} /></button>
              <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20 rotate-3"><Gamepad2 size={28} className="text-white" /></div>
              <h2 className="text-2xl font-black mb-1">FREE FIRE ROOM</h2>
              <div className="space-y-4 mt-6">
                <div className="bg-[#09090b] p-4 rounded-xl border border-white/5 group hover:border-orange-500/30 transition-colors">
                  <p className="text-[10px] uppercase font-bold mb-1 text-zinc-500 tracking-widest">Room ID</p>
                  <div className="flex justify-between items-center"><span className="text-2xl font-mono font-bold text-orange-500 tracking-wider">{roomDetails.roomId}</span><button onClick={() => copyToClipboard(roomDetails.roomId)} className="text-zinc-600 hover:text-white"><Copy size={18}/></button></div>
                </div>
                <div className="bg-[#09090b] p-4 rounded-xl border border-white/5 group hover:border-white/20 transition-colors">
                  <p className="text-[10px] uppercase font-bold mb-1 text-zinc-500 tracking-widest">Password</p>
                  <div className="flex justify-between items-center"><span className="text-2xl font-mono font-bold text-white tracking-wider">{roomDetails.roomPass}</span><button onClick={() => copyToClipboard(roomDetails.roomPass)} className="text-zinc-600 hover:text-white"><Copy size={18}/></button></div>
                </div>
              </div>
              <button onClick={() => setShowRoomModal(false)} className="w-full bg-white text-black font-bold py-3.5 rounded-xl mt-8 hover:bg-zinc-200 transition-colors">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>
    </div>
  );
}