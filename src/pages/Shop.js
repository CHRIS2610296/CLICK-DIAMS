import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Zap, Shield, Phone, MessageCircle, X, Check, Loader2, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebaseConfig'; // Ensure path is correct
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Toast Component
const Toast = ({ message, type }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
    className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`}
  >
    {type === 'error' ? <X size={20} /> : <Check size={20} />}
    <span className="font-medium">{message}</span>
  </motion.div>
);

export default function Shop() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState('home'); // 'home' | 'success'
  const [formData, setFormData] = useState({ playerID: '', playerName: '', phone: '', paymentMethod: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);

  // Products Data
  const packages = [
    { id: 1, diamonds: 100, price: 5000, bonus: 0 },
    { id: 2, diamonds: 310, price: 15000, bonus: 10 },
    { id: 3, diamonds: 520, price: 25000, bonus: 20, popular: true },
    { id: 4, diamonds: 1060, price: 50000, bonus: 60 },
    { id: 6, diamonds: 2180, price: 100000, bonus: 180 },
    { id: 7, diamonds: 5600, price: 250000, bonus: 600 },
  ];

  // Load/Save Cart
  useEffect(() => {
    const saved = localStorage.getItem('ff_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('ff_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart Logic
  const addToCart = (pkg) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === pkg.id);
      return existing 
        ? prev.map(item => item.id === pkg.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { ...pkg, quantity: 1 }];
    });
    setToast({ message: `Added ${pkg.diamonds} Diamonds`, type: "success" });
    setTimeout(() => setToast(null), 2000);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totals = {
    diamonds: cart.reduce((sum, item) => sum + ((item.diamonds + item.bonus) * item.quantity), 0),
    price: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };

  // Submit Logic
  const handleCheckout = async () => {
    if (!formData.playerID || !formData.phone || !formData.paymentMethod) {
      setToast({ message: "Please fill all required fields", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const orderData = {
        ...formData,
        items: cart,
        totalDiamonds: totals.diamonds,
        totalPrice: totals.price,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      setLastOrder({ id: docRef.id, ...orderData });
      setCart([]);
      setIsCartOpen(false);
      setView('success');
      window.scrollTo(0,0);
    } catch (error) {
      console.error(error);
      setToast({ message: "Connection Failed. Try again.", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- VIEWS ---

  if (view === 'success' && lastOrder) {
    const whatsappMsg = `Hello, I placed order ID: ${lastOrder.id}. I have sent ${lastOrder.totalPrice} Ar via ${lastOrder.paymentMethod}.`;
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
          <div className="bg-green-500 p-8 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Check size={32} />
            </div>
            <h2 className="text-3xl font-bold">Order Received!</h2>
            <p className="opacity-90 mt-2">ID: <span className="font-mono bg-green-600 px-2 py-1 rounded">{lastOrder.id.slice(0, 8)}...</span></p>
          </div>
          
          <div className="p-8">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Player ID</span>
                <span className="font-bold">{lastOrder.playerID}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Amount Due</span>
                <span className="font-bold text-xl text-orange-600">{lastOrder.totalPrice.toLocaleString()} Ar</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-yellow-800 mb-2">⚡ Final Step: Payment</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Send <strong>{lastOrder.totalPrice.toLocaleString()} Ar</strong> to this number via <strong>{lastOrder.paymentMethod === 'mvola' ? 'MVola' : 'Orange Money'}</strong>:
              </p>
              <div className="bg-white border-2 border-dashed border-yellow-300 p-3 rounded text-center font-mono font-bold text-xl text-gray-800">
                {lastOrder.paymentMethod === 'mvola' ? '034 12 345 67' : '032 12 345 67'}
              </div>
            </div>

            <a 
              href={`https://wa.me/261341234567?text=${encodeURIComponent(whatsappMsg)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200"
            >
              <MessageCircle size={20} /> Send Proof on WhatsApp
            </a>
            
            <button 
              onClick={() => { setView('home'); setFormData({playerID:'', playerName:'', phone:'', paymentMethod:''}); }}
              className="w-full text-gray-500 hover:text-gray-800 mt-4 text-sm font-medium"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HOME VIEW
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* Navbar */}
      <nav className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Zap fill="currentColor" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-blue-900 ">CLICK <span className="text-orange-600">DIAMS</span></h1>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ShoppingCart size={24} className="text-gray-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gray-900 text-white py-16 px-4 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 to-purple-600/30"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Instant Diamond Top-Up</h2>
          <p className="text-gray-300 text-lg mb-0 max-w-xl mx-auto">Fast delivery via Player ID. Secure payment with MVola & Orange Money.</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div 
              key={pkg.id} 
              className={`bg-white rounded-2xl p-6 shadow-sm border transition-all hover:-translate-y-1 hover:shadow-xl ${
                pkg.popular ? 'border-orange-400 ring-4 ring-orange-100' : 'border-gray-100'
              }`}
            >
              {pkg.popular && (
                <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
                  BEST SELLER
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-3xl font-black text-gray-800 flex items-center gap-1">
                    {pkg.diamonds} <Zap className="text-orange-500" fill="currentColor" size={20} />
                  </h3>
                  {pkg.bonus > 0 && (
                    <p className="text-green-600 font-bold text-sm mt-1">+{pkg.bonus} Bonus Diamonds</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-end justify-between mt-6">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Price</p>
                  <p className="text-2xl font-bold text-gray-900">{pkg.price.toLocaleString()} Ar</p>
                </div>
                <button 
                  onClick={() => addToCart(pkg)}
                  className="bg-gray-900 hover:bg-orange-600 text-white p-3 rounded-xl transition-colors shadow-lg shadow-gray-200"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><Zap /></div>
            <h3 className="font-bold text-lg">Instant Delivery</h3>
            <p className="text-gray-500 text-sm">Usually takes less than 10 minutes</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><Shield /></div>
            <h3 className="font-bold text-lg">100% Safe</h3>
            <p className="text-gray-500 text-sm">Official top-up via Player ID</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600"><Phone /></div>
            <h3 className="font-bold text-lg">Support 24/7</h3>
            <p className="text-gray-500 text-sm">WhatsApp support always available</p>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold flex items-center gap-2">Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-white border p-4 rounded-xl shadow-sm">
                          <div>
                            <div className="font-bold text-gray-800">{item.diamonds} Diamonds</div>
                            <div className="text-sm text-gray-500">{item.price.toLocaleString()} Ar x {item.quantity}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-orange-600">{(item.price * item.quantity).toLocaleString()} Ar</span>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Checkout Form */}
                    <div className="bg-gray-50 p-5 rounded-xl space-y-4 border border-gray-200">
                      <h3 className="font-bold text-gray-700">Account Details</h3>
                      <input 
                        placeholder="Player ID *" 
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={formData.playerID}
                        onChange={e => setFormData({...formData, playerID: e.target.value})}
                      />
                      <input 
                        placeholder="In-Game Name (Optional)" 
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={formData.playerName}
                        onChange={e => setFormData({...formData, playerName: e.target.value})}
                      />
                      <input 
                        placeholder="Phone Number *" 
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                          onClick={() => setFormData({...formData, paymentMethod: 'mvola'})}
                          className={`p-3 rounded-lg border-2 font-bold text-sm transition-all ${formData.paymentMethod === 'mvola' ? 'border-yellow-500 bg-yellow-50 text-yellow-800' : 'border-gray-200 text-gray-500'}`}
                        >
                          MVola
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, paymentMethod: 'orange'})}
                          className={`p-3 rounded-lg border-2 font-bold text-sm transition-all ${formData.paymentMethod === 'orange' ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-gray-200 text-gray-500'}`}
                        >
                          Orange
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex justify-between mb-4 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">{totals.price.toLocaleString()} Ar</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <>Confirm Order <ChevronRight size={18} /></>}
                  </button>
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