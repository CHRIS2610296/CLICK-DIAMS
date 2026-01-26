import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Zap, Phone, X, Check, Loader2, FileText, Menu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// REMOVED: storage imports since we aren't using images anymore
import { db } from '../firebaseConfig'; 
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

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
  const [view, setView] = useState('home'); 
  const [formData, setFormData] = useState({ playerID: '', playerName: '', phone: '', paymentMethod: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  
  // REMOVED: proofType and proofImage state
  const [refNumber, setRefNumber] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [isValidatingID, setIsValidatingID] = useState(false);
  const [idVerified, setIdVerified] = useState(false);

  // --- PRICING DATA ---
  const packages = [
    { id: 1, total: 110, base: 100, bonus: 10, price: 4630 },
    { id: 2, total: 231, base: 210, bonus: 21, price: 9250 },
    { id: 3, total: 341, base: 310, bonus: 31, price: 13860 },
    { id: 4, total: 462, base: 420, bonus: 42, price: 18480 },
    { id: 5, total: 583, base: 530, bonus: 53, price: 23030 },
    { id: 6, total: 693, base: 630, bonus: 63, price: 27830 },
    { id: 7, total: 803, base: 730, bonus: 73, price: 32530 },
    { id: 8, total: 924, base: 840, bonus: 84, price: 37030 },
    { id: 9, total: 1188, base: 1080, bonus: 108, price: 46530 },
    { id: 10, total: 1419, base: 1290, bonus: 129, price: 55500 },
    { id: 11, total: 1650, base: 1500, bonus: 150, price: 65030 },
    { id: 12, total: 2420, base: 2200, bonus: 220, price: 93530, tag: "POPULAR" },
    { id: 13, total: 3003, base: 2730, bonus: 273, price: 115000 },
    { id: 14, total: 4191, base: 3810, bonus: 381, price: 159000 },
    { id: 15, total: 5423, base: 4930, bonus: 493, price: 205500 },
    { id: 16, total: 6028, base: 5480, bonus: 548, price: 228000 },
    { id: 17, total: 10142, base: 9220, bonus: 922, price: 382400, tag: "BEST VALUE" },
  ];

  // Load Cart & Pending Order (Fixes the Mobile Refresh issue)
  useEffect(() => { 
    const saved = localStorage.getItem('ff_cart'); 
    if (saved) setCart(JSON.parse(saved)); 
    
    // Check if user was in the middle of a payment
    const savedOrder = localStorage.getItem('ff_pending_order');
    if (savedOrder) {
      setLastOrder(JSON.parse(savedOrder));
      setView('payment');
    }
  }, []);

  useEffect(() => { localStorage.setItem('ff_cart', JSON.stringify(cart)); }, [cart]);
  
  const addToCart = (pkg) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === pkg.id);
      return existing ? prev.map(item => item.id === pkg.id ? { ...item, quantity: item.quantity + 1 } : item) : [...prev, { ...pkg, quantity: 1 }];
    });
    setToast({ message: `${pkg.total} Diamonds added!`, type: "success" });
    setTimeout(() => setToast(null), 2000);
  };
  
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const totals = { 
    diamonds: cart.reduce((sum, item) => sum + (item.total * item.quantity), 0), 
    price: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) 
  };

  const verifyID = () => {
    if (formData.playerID.length < 5) return setToast({ message: "Invalid ID", type: "error" });
    setIsValidatingID(true);
    setTimeout(() => { setIsValidatingID(false); setIdVerified(true); }, 1000);
  };

  const handleCheckout = async () => {
    if (!formData.playerID || !formData.phone || !formData.paymentMethod) return setToast({ message: "Fill all fields", type: "error" });
    setIsProcessing(true);
    try {
      const orderData = {
        ...formData, items: cart, totalDiamonds: totals.diamonds, totalPrice: totals.price, status: 'awaiting_proof', createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      const fullOrder = { id: docRef.id, ...orderData };
      setLastOrder(fullOrder);
      // SAVE ORDER TO MEMORY (Solves the "phone refresh" bug)
      localStorage.setItem('ff_pending_order', JSON.stringify(fullOrder));
      
      setCart([]); setIsCartOpen(false); setView('payment');
    } catch (error) { setToast({ message: "Network Error", type: "error" }); } finally { setIsProcessing(false); }
  };

  const handleSubmitProof = async () => {
    if (!refNumber) return setToast({message: "Enter Reference", type: 'error'});

    setIsUploading(true);
    try {
      // We only update the reference number now (No images)
      await updateDoc(doc(db, "orders", lastOrder.id), { 
        proofType: 'ref', 
        proofValue: refNumber, 
        status: 'pending_review' 
      });
      
      // Clear memory so they can make a new order next time
      localStorage.removeItem('ff_pending_order');
      
      setView('finish');
    } catch (error) { setToast({ message: "Update failed", type: "error" }); } finally { setIsUploading(false); }
  };

  // --- VIEWS ---

  if (view === 'payment' && lastOrder) {
    const payNumber = lastOrder.paymentMethod === 'mvola' ? '038 82 977 37' : '032 77 546 97';
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden">
          <div className="bg-blue-900 p-6 text-white text-center">
            <h2 className="text-2xl font-bold">Payment Required</h2>
            <p className="opacity-80 text-sm">Order #{lastOrder.id.slice(0,6)}</p>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wide">VOLA ALEFA</p>
              <p className="text-3xl font-black text-gray-900">{lastOrder.totalPrice.toLocaleString()} Ar</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                 <p className="text-sm text-gray-600"> {lastOrder.paymentMethod === 'mvola' ? 'MVola' : 'Orange Money'}:</p>
                 <p className="text-2xl font-black text-orange-600 tracking-wider mt-1">{payNumber}</p>
                 <p className="text-xs text-gray-400 mt-1"><strong> <u> Anarana: FANILONIAINA CHRISTIAN </u></strong></p>
              </div>
            </div>
            <div className="mt-4 text-sm font-semibold text-red-600">
              ⚠️ <span className="uppercase">Zava-dehibe:</span>{" "}
              tandremo diso ilay numéro fa tsy miantoka ny fahadisoanao izahay,
              mankasitraka tompoko.
            </div>
            <div className="mb-6">
               <label className="text-sm font-bold text-gray-700 mb-2 block">Transaction Reference</label>
               <p className="text-xs text-gray-500 mb-2">Apetrao eo ambany ny Reference de trans. (oh: ref: 230515...)</p>
               <div className="relative">
                 <FileText className="absolute left-3 top-3 text-gray-400" size={20}/>
                 <input 
                   type="text" 
                   placeholder="Enter Reference Number" 
                   className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono tracking-widest bg-gray-50"
                   value={refNumber}
                   onChange={(e) => setRefNumber(e.target.value)}
                 />
               </div>
            </div>

            <button onClick={handleSubmitProof} disabled={isUploading} className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2">
              {isUploading ? <Loader2 className="animate-spin" /> : "Verify Payment"}
            </button>
            
            <button onClick={() => {
                // If they want to cancel, clear the saved order
                localStorage.removeItem('ff_pending_order');
                setView('home');
              }} className="w-full text-gray-400 text-sm mt-4 hover:text-gray-600">
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'finish') return (
    <div className="min-h-screen bg-green-500 flex items-center justify-center p-4">
      <motion.div initial={{scale:0.5}} animate={{scale:1}} className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full">
        <Check size={60} className="text-green-500 mx-auto mb-4 bg-green-100 rounded-full p-3"/>
        <h2 className="text-2xl font-black text-gray-900">Payment Sent!</h2>
        <p className="text-gray-500 mb-6 mt-2">We are verifying your transaction ID. Diamonds will be sent shortly.</p>
        <button onClick={()=>{setView('home');setCart([])}} className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-bold">Back to Shop</button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* HEADER WITH LOGO */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <img src="/clickdiams.jpg" alt="Click Diams" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-black italic tracking-tighter leading-none">CLICK <span className="text-blue-600">DIAMS</span></h1>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest">OFFICIAL RESELLER</p>
            </div>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <ShoppingCart size={22} className="text-gray-700" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">{cart.length}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative bg-gray-900 h-[280px] sm:h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://wallpapers.com/images/hd/garena-free-fire-4k-gaming-poster-c12140882e364654.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-lg">
             <div className="inline-block bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded mb-3">SECURE TOP-UP</div>
             <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-2">LEVEL UP <br/>YOUR GAME</h2>
             <p className="text-gray-300 text-sm sm:text-base mb-6">The fastest way to get Diamonds in Madagascar. MVola & Orange Money accepted.</p>
          </div>
        </div>
      </div>

      {/* PACKAGES GRID */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {packages.map(pkg => (
            <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group">
              {pkg.tag && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">{pkg.tag}</div>}
              
              <div className="p-4 text-center">
                <div className="mb-2">
                   <h3 className="text-2xl sm:text-3xl font-black text-gray-800 flex items-center justify-center gap-1">
                     {pkg.total} <Zap size={20} className="text-blue-500 fill-blue-500"/>
                   </h3>
                   <div className="text-[10px] text-gray-400 font-bold bg-gray-50 inline-block px-2 py-0.5 rounded-full mt-1">
                     {pkg.base} + <span className="text-green-600">{pkg.bonus} Bonus</span>
                   </div>
                </div>
                <div className="w-full h-px bg-gray-100 my-3"></div>
                <p className="text-lg sm:text-xl font-black text-blue-900">{pkg.price.toLocaleString()} Ar</p>
                <button onClick={() => addToCart(pkg)} className="w-full mt-3 bg-gray-900 text-white py-2 rounded-lg text-sm font-bold group-hover:bg-blue-600 transition-colors">Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <img src="/clickdiams.jpg" alt="Logo" className="w-16 h-16 object-cover rounded-xl mx-auto mb-4 border shadow-sm" />
          <p className="font-black italic text-xl text-gray-800">CLICK DIAMS</p>
          <p className="text-gray-500 text-sm mt-2">Secure & Fast Free Fire Top-up</p>
          
          <div className="flex justify-center gap-6 mt-6">
            <a href="https://wa.me/261388297737" className="flex items-center gap-2 text-gray-600 font-bold hover:text-green-600">
               <Phone size={18} /> 038 82 977 37
            </a>
            <a href="https://wa.me/261327754697" className="flex items-center gap-2 text-gray-600 font-bold hover:text-orange-600">
               <Phone size={18} /> 032 77 546 97
            </a>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 text-xs text-gray-400">
            <p>© 2026 Click Diams. All rights reserved.</p>
            <a href="/login" className="mt-2 inline-block hover:text-gray-600">Admin Access</a>
          </div>
        </div>
      </footer>

      {/* FLOATING CART BUTTON (Mobile) */}
      <AnimatePresence>
        {!isCartOpen && cart.length > 0 && (
          <motion.button initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} onClick={()=>setIsCartOpen(true)} className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-40 md:hidden">
            <ShoppingCart size={24} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white">{cart.length}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={()=>setIsCartOpen(false)}></div>
            <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring', damping:25}} className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[60] shadow-2xl flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-lg">Your Cart ({cart.length})</h2>
                <button onClick={()=>setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white border p-3 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 text-blue-600 font-bold w-10 h-10 rounded-lg flex items-center justify-center text-xs">{item.total}</div>
                      <div>
                        <div className="font-bold text-sm">{item.total} Diamonds</div>
                        <div className="text-xs text-gray-400">{item.price.toLocaleString()} Ar x {item.quantity}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString()}</span>
                      <button onClick={()=>removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><X size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div className="p-5 border-t bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.05)] space-y-4">
                  <div className="flex justify-between font-black text-xl text-gray-900"><span>Total</span><span>{totals.price.toLocaleString()} Ar</span></div>
                  <div className="space-y-3">
                      <div className="relative">
                        <input placeholder="Player ID *" className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${idVerified?'bg-green-50 border-green-200':''}`} value={formData.playerID} onChange={e=>{setFormData({...formData,playerID:e.target.value});setIdVerified(false)}} />
                        <button onClick={verifyID} className="absolute right-2 top-2 text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">{isValidatingID?<Loader2 className="animate-spin" size={14}/>:idVerified?<Check size={14} className="text-green-600"/>:"CHECK"}</button>
                      </div>
                      
                      <input type="text" placeholder="Username (Optional)" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.playerName} onChange={e=>setFormData({...formData,playerName:e.target.value})} />
                      
                      <input type="tel" placeholder="Phone Number *" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} />
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={()=>setFormData({...formData,paymentMethod:'mvola'})} className={`p-3 rounded-xl border-2 font-bold text-sm ${formData.paymentMethod==='mvola'?'border-green-500 bg-green-50 text-green-800':'border-gray-200 text-gray-400'}`}>MVola</button>
                        <button onClick={()=>setFormData({...formData,paymentMethod:'orange'})} className={`p-3 rounded-xl border-2 font-bold text-sm ${formData.paymentMethod==='orange'?'border-orange-500 bg-orange-50 text-orange-800':'border-gray-200 text-gray-400'}`}>Orange</button>
                      </div>
                  </div>
                  <button onClick={handleCheckout} disabled={isProcessing} className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-800">{isProcessing?<Loader2 className="animate-spin"/>:"Confirm Order"}</button>
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