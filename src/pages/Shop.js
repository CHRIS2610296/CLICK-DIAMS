import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Zap, Phone, X, Check, Loader2, ChevronLeft, AlertCircle, 
  Facebook, MessageCircle, Copy, Moon, Sun // <--- Added Moon & Sun Icons
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig'; 
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

// --- IMPORT YOUR GAMES HERE ---
import { FreeFire } from '../games/FreeFire';
import { Pubg } from '../games/Pubg';
import { MobileLegends } from '../games/MobileLegends';
import { BloodStrike } from '../games/BloodStrike';

const GAMES = {
  ff: FreeFire,
  pubg: Pubg,
  mlbb: MobileLegends,
  bs: BloodStrike
};

// --- FOOTER COMPONENT (Dark Mode Aware) ---
const Footer = ({ isDarkMode }) => (
  <footer className={`border-t py-10 mt-auto transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-6">
        <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>NEED HELP?</h3>
        <p className="text-gray-400 text-sm">Contact us directly for support.</p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
        <a href="https://www.facebook.com/profile.php?id=61566866410986" target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all duration-300 group ${isDarkMode ? 'bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white' : 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white'}`}>
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
    className={`fixed bottom-20 md:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[60] font-bold backdrop-blur-md ${
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

  // --- DARK MODE STATE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load preference from localStorage or default to false (Light Mode)
    return localStorage.getItem('theme') === 'dark';
  });

  const [formData, setFormData] = useState({ playerID: '', zoneID: '', playerName: '', phone: '', paymentMethod: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [refNumber, setRefNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isValidatingID, setIsValidatingID] = useState(false);
  const [idVerified, setIdVerified] = useState(false);

  // Save Dark Mode Preference
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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
  
  const handleGameSelect = (key) => {
    setLoadingGame(true);
    setTimeout(() => {
      setSelectedGameKey(key);
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
  
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  
  const totals = { 
    price: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) 
  };

  const verifyID = () => {
    if (formData.playerID.length < 4) return setToast({ message: "Invalid ID", type: "error" });
    if (activeGame.needZone && formData.zoneID.length < 3) return setToast({ message: "Invalid Zone ID", type: "error" });

    setIsValidatingID(true);
    setTimeout(() => { setIsValidatingID(false); setIdVerified(true); }, 1000);
  };

  const handleCheckout = async () => {
    if (!formData.playerID || !formData.phone || !formData.paymentMethod) return setToast({ message: "Fill all fields", type: "error" });
    if (activeGame.needZone && !formData.zoneID) return setToast({ message: "Zone ID is required", type: "error" });

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
      
      setCart([]); setIsCartOpen(false); setView('payment');
    } catch (error) { setToast({ message: "Network Error", type: "error" }); } finally { setIsProcessing(false); }
  };

  const handleSubmitProof = async () => {
    if (!refNumber) return setToast({message: "Enter Reference", type: 'error'});
    setIsUploading(true);
    try {
      await updateDoc(doc(db, "orders", lastOrder.id), { 
        proofType: 'ref', proofValue: refNumber, status: 'pending_review' 
      });
      localStorage.removeItem('ff_pending_order');
      setView('finish');
    } catch (error) { setToast({ message: "Update failed", type: "error" }); } finally { setIsUploading(false); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setToast({ message: "Number Copied!", type: "success" });
    setTimeout(() => setToast(null), 2000);
  };

  // --- DARK MODE CLASSES HELPER ---
  const theme = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-slate-50',
    text: isDarkMode ? 'text-white' : 'text-slate-800',
    nav: isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-gray-100',
    card: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100',
    input: isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-slate-900',
    subText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    iconBtn: isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  };

  // --- VIEWS ---

  if (view === 'games') {
    return (
       <div className={`min-h-screen font-sans pb-20 flex flex-col transition-colors duration-300 ${theme.bg}`}>
         <nav className={`backdrop-blur-md sticky top-0 z-40 border-b shadow-sm p-4 ${theme.nav}`}>
           <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-3">
               <img src="/clickdiams.jpg" alt="Logo" className="w-10 h-10 rounded-lg shadow-sm" />
               <h1 className={`text-xl font-black italic ${theme.text}`}>CLICK <span className="text-blue-600">DIAMS</span></h1>
             </div>
             
             <div className="flex items-center gap-3">
                {/* DARK MODE TOGGLE */}
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-all ${theme.iconBtn}`}>
                  {isDarkMode ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} />}
                </button>

                {/* CART BUTTON */}
                <button onClick={() => setIsCartOpen(true)} className={`relative p-2 rounded-full transition-all group ${theme.iconBtn}`}>
                    {cart.length > 0 && (
                      <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                    )}
                    <ShoppingCart size={22} className="relative z-10" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white z-20">
                        {cart.length}
                      </span>
                    )}
                </button>
             </div>
           </div>
         </nav>
         
         <div className="max-w-7xl mx-auto px-4 py-10 flex-1 w-full">
            <h2 className={`text-3xl font-black mb-2 ${theme.text}`}>Select Game</h2>
            <p className={`${theme.subText} mb-8`}>Choose a game to top-up instantly.</p>
            
            {loadingGame ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(GAMES).map((key) => {
                  const game = GAMES[key];
                  return (
                    <motion.div 
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGameSelect(key)}
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
                  );
                })}
              </div>
            )}
         </div>
         <Footer isDarkMode={isDarkMode} />
       </div>
    );
  }

  // --- PAYMENT VIEW ---
  if (view === 'payment' && lastOrder) {
    const paymentInfo = {
      mvola: { name: "MVola", number: "038 82 977 37", color: "bg-green-50 text-green-700 border-green-200" },
      orange: { name: "Orange Money", number: "037 33 073 23", color: "bg-orange-50 text-orange-700 border-orange-200" },
      airtel: { name: "Airtel Money", number: "033 24 322 07", color: "bg-red-50 text-red-700 border-red-200" }
    };
    const currentPay = paymentInfo[lastOrder.paymentMethod];

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${theme.bg}`}>
        <div className={`rounded-3xl shadow-xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
          <div className="bg-blue-900 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Payment Required</h2>
            <p className="opacity-80 text-sm">Order #{lastOrder.id.slice(0,6)}</p>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <p className={`text-xs uppercase tracking-wide ${theme.subText}`}>VOLA ALEFA</p>
              <p className={`text-3xl font-black ${theme.text}`}>{lastOrder.totalPrice.toLocaleString()} Ar</p>
              
              <div className={`border rounded-xl p-4 mt-4 relative ${isDarkMode ? 'bg-slate-800 border-slate-700' : currentPay.color}`}>
                 <p className="text-xs font-bold uppercase tracking-wider opacity-70">Send via {currentPay.name}</p>
                 <div onClick={() => copyToClipboard(currentPay.number)} className="text-2xl font-black tracking-widest mt-1 cursor-pointer flex items-center justify-center gap-2 hover:opacity-80 transition-opacity" title="Click to copy">
                    {currentPay.number} <Copy size={16}/>
                 </div>
                 <div className="w-full h-px bg-current opacity-20 my-2"></div>
                 <p className="text-xs font-bold">Name: FANILONIAINA CHRISTIAN</p>
              </div>
            </div>

            <div className="mt-4 text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mb-6">
              ⚠️ <span className="uppercase font-bold">Zava-dehibe:</span> Tandremo diso ilay numéro fa tsy miantoka ny fahadisoanao izahay.
            </div>
            <div className="mb-6">
               <label className={`text-sm font-bold mb-2 block ${theme.text}`}>Transaction Reference</label>
               <input type="text" placeholder="Reference (e.g. 230515...)" className={`w-full p-3 border rounded-xl font-mono tracking-widest text-center outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`} value={refNumber} onChange={(e) => setRefNumber(e.target.value)} />
            </div>
            <button onClick={handleSubmitProof} disabled={isUploading} className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-800">
              {isUploading ? <Loader2 className="animate-spin" /> : "Verify Payment"}
            </button>
            <button onClick={() => { localStorage.removeItem('ff_pending_order'); setView('games'); }} className={`w-full text-sm mt-4 hover:opacity-80 ${theme.subText}`}>Cancel Order</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'finish') return (
    <div className="min-h-screen bg-green-500 flex items-center justify-center p-4">
      <motion.div initial={{scale:0.5}} animate={{scale:1}} className={`p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
        <Check size={60} className="text-green-500 mx-auto mb-4 bg-green-100 rounded-full p-3"/>
        <h2 className="text-2xl font-black">Payment Sent!</h2>
        <p className={`mb-6 mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>We are verifying your transaction ID. Diamonds will be sent shortly.</p>
        <button onClick={()=>{setView('games');setCart([])}} className={`w-full py-3 rounded-xl font-bold ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>Back to Games</button>
      </motion.div>
    </div>
  );
  
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
              <p className={`text-[10px] font-bold tracking-widest ${theme.subText}`}>{activeGame.name.toUpperCase()}</p>
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
             <p className="text-gray-300 text-sm">Instant delivery. No login required.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-10 flex-1 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {activeGame.packages.map(pkg => (
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
                        <div className={`text-xs ${theme.subText}`}>{item.price.toLocaleString()} Ar x {item.quantity}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${theme.text}`}>{(item.price * item.quantity).toLocaleString()}</span>
                      <button onClick={()=>removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><X size={18}/></button>
                    </div>
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
                      
                      <button onClick={verifyID} disabled={isValidatingID || idVerified} className={`w-full text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                        {isValidatingID?<Loader2 className="animate-spin" size={14}/>:idVerified?<><Check size={14} className="text-green-500"/> ID Verified</>:"Check ID"}
                      </button>

                      <input type="text" placeholder="Username (Optional)" className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`} value={formData.playerName} onChange={e=>setFormData({...formData,playerName:e.target.value})} />
                      <input type="tel" placeholder="Phone Number *" className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${theme.input}`} value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} />
                      
                      <div className="grid grid-cols-3 gap-2">
                        {/*<button onClick={()=>setFormData({...formData,paymentMethod:'mvola'})} className={`p-2 rounded-xl border-2 font-bold text-xs ${formData.paymentMethod==='mvola'?'border-green-500 bg-green-500/10 text-green-500':'border-gray-200 text-gray-400'}`}>MVola</button>*/}
                        <button onClick={()=>setFormData({...formData,paymentMethod:'orange'})} className={`p-2 rounded-xl border-2 font-bold text-xs ${formData.paymentMethod==='orange'?'border-orange-500 bg-orange-500/10 text-orange-500':'border-gray-200 text-gray-400'}`}>Orange</button>
                        <button onClick={()=>setFormData({...formData,paymentMethod:'airtel'})} className={`p-2 rounded-xl border-2 font-bold text-xs ${formData.paymentMethod==='airtel'?'border-red-500 bg-red-500/10 text-red-500':'border-gray-200 text-gray-400'}`}>Airtel</button>
                      </div>
                  </div>
                  <button onClick={handleCheckout} disabled={isProcessing} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700">{isProcessing?<Loader2 className="animate-spin"/>:"Confirm Order"}</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>
    </div>
  );
}