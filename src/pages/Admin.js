import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, LogOut, Check, X, Loader2, Phone, FileText, Image as ImageIcon, Trash2, Copy, Filter 
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; 
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- FILTER STATES ---
  const [filterGame, setFilterGame] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');

  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
  const isFirstLoad = useRef(true);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // Real-time Data Listener
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Play sound if a new pending_review order arrives
      if (!isFirstLoad.current) {
        const newReview = ordersData.filter(o => o.status === 'pending_review').length;
        const oldReview = orders.filter(o => o.status === 'pending_review').length;
        if (newReview > oldReview) {
          audioRef.current.play().catch(e => console.log("Audio blocked by browser"));
        }
      } else {
        isFirstLoad.current = false;
      }
      
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); 

  // --- FILTER LOGIC ---
  const filteredOrders = orders.filter(order => {
    const matchesGame = filterGame === 'All' || (order.game && order.game === filterGame);
    const matchesPayment = filterPayment === 'All' || (order.paymentMethod && order.paymentMethod === filterPayment);
    return matchesGame && matchesPayment;
  });

  // Automatic SMS Redirect
  const updateStatus = async (orderId, newStatus, orderPhone) => {
    if (!window.confirm(`Mark order as ${newStatus}?`)) return;
    
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      if (newStatus === 'completed' && orderPhone) {
        const message = "CLICK DIAMS: Your purchase was successful! Diamonds have been sent. Thanks for your trust.";
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const separator = isIOS ? '&' : '?';
        window.location.href = `sms:${orderPhone}${separator}body=${encodeURIComponent(message)}`;
      }
    } catch (error) {
      alert("Error updating order: " + error.message);
    }
  };

  // Delete Order
  const deleteOrder = async (orderId) => {
    if (!window.confirm("⚠️ Are you sure you want to DELETE this order? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
    } catch (error) {
      alert("Error deleting order: " + error.message);
    }
  };

  // Copy ID
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ID: ${text}`); 
  };

  // Stats
  const revenue = orders.filter(o => o.status === 'completed').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending_review' || o.status === 'awaiting_proof').length;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <LayoutDashboard className="text-blue-600" /> 
            Admin Panel
          </h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-red-100 font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="text-slate-500 font-medium">Pending Review</div>
            <div className="text-4xl font-bold text-slate-800">{pendingCount}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="text-slate-500 font-medium">Total Revenue</div>
            <div className="text-4xl font-bold text-slate-800">{revenue.toLocaleString()} Ar</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-gray-500">
            <div className="text-slate-500 font-medium">Total Orders</div>
            <div className="text-4xl font-bold text-slate-800">{orders.length}</div>
          </div>
        </div>

        {/* --- FILTER BAR --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 text-slate-500 font-bold">
            <Filter size={20} /> Filters:
          </div>
          
          <select 
            value={filterGame} 
            onChange={(e) => setFilterGame(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          >
            <option value="All">All Games</option>
            <option value="Free Fire">Free Fire</option>
            <option value="PUBG Mobile">PUBG Mobile</option>
            <option value="Mobile Legends">Mobile Legends</option>
            <option value="Blood Strike">Blood Strike</option>
          </select>

          <select 
            value={filterPayment} 
            onChange={(e) => setFilterPayment(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          >
            <option value="All">All Payments</option>
            <option value="mvola">Mvola</option>
            <option value="orange">Orange Money</option>
            <option value="airtel">Airtel Money</option>
          </select>

          <div className="ml-auto text-sm text-gray-400">
            Showing {filteredOrders.length} orders
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-slate-600">Date</th>
                    <th className="p-4 font-semibold text-slate-600">Player Info</th>
                    <th className="p-4 font-semibold text-slate-600">Details</th>
                    <th className="p-4 font-semibold text-slate-600">Proof</th>
                    <th className="p-4 font-semibold text-slate-600">Status</th>
                    <th className="p-4 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${order.status === 'pending_review' ? 'bg-orange-50/60' : ''}`}>
                      <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                        {order.createdAt?.seconds 
                          ? new Date(order.createdAt.seconds * 1000).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
                          : 'Just now'}
                      </td>
                      <td className="p-4">
                        {/* GAME BADGE */}
                        {order.game && (
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-1 text-white ${
                            order.game === 'Free Fire' ? 'bg-blue-500' :
                            order.game === 'PUBG Mobile' ? 'bg-amber-500' :
                            order.game === 'Mobile Legends' ? 'bg-purple-500' :
                            'bg-red-500'
                          }`}>
                            {order.game}
                          </div>
                        )}

                        <div 
                          onClick={() => copyToClipboard(order.fullPlayerID || order.playerID)}
                          className="font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2 px-2 py-1 rounded mb-1 shadow-sm border border-slate-200"
                          title="Click to copy ID"
                        >
                          {order.fullPlayerID || order.playerID} <Copy size={12} className="text-slate-400" />
                        </div>

                        {order.playerName && <div className="text-xs text-slate-500">Name: {order.playerName}</div>}
                        <a href={`tel:${order.phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                          <Phone size={12}/> {order.phone}
                        </a>
                      </td>
                      <td className="p-4">
                        {/* --- FIXED: DISPLAY ALL ITEMS IN CART --- */}
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="text-sm font-bold text-slate-700 border-b border-gray-100 pb-1 last:border-0">
                                <span className="text-orange-600 mr-1">{item.quantity}x</span>
                                {item.name ? (
                                  <span>{item.name}</span>
                                ) : (
                                  <span>{item.total} {item.currency || 'Diamonds'}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Fallback for old orders before multi-item support
                          <div className="font-bold text-orange-600">{order.totalDiamonds} Diamonds</div>
                        )}

                        <div className="text-xs text-slate-500 mt-2 pt-1 border-t border-gray-200 font-bold">
                          Total: {order.totalPrice.toLocaleString()} Ar
                        </div>
                        
                        <span className={`text-[10px] font-bold px-1 py-0.5 rounded uppercase mt-1 inline-block ${
                          order.paymentMethod === 'mvola' ? 'bg-yellow-100 text-yellow-800' : 
                          order.paymentMethod === 'orange' ? 'bg-orange-100 text-orange-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4">
                         {order.proofType === 'image' ? (
                            <a href={order.proofValue} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 font-bold hover:underline bg-blue-50 px-2 py-1 rounded w-fit">
                              <ImageIcon size={16} /> View Image
                            </a>
                          ) : order.proofType === 'ref' ? (
                            <div className="flex items-center gap-2 text-slate-700 font-mono bg-slate-100 px-2 py-1 rounded w-fit">
                              <FileText size={16} /> {order.proofValue}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">No Proof</span>
                          )}
                      </td>
                      <td className="p-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          order.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          order.status === 'pending_review' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {order.status === 'awaiting_proof' ? 'Waiting' : order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {(order.status === 'pending_review' || order.status === 'pending') && (
                            <>
                              <button onClick={() => updateStatus(order.id, 'completed', order.phone)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg shadow-sm transition-all" title="Approve & Send SMS">
                                <Check size={18} />
                              </button>
                              <button onClick={() => updateStatus(order.id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm transition-all" title="Reject">
                                <X size={18} />
                              </button>
                            </>
                          )}
                          <button onClick={() => deleteOrder(order.id)} className="bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-500 p-2 rounded-lg shadow-sm transition-all" title="Delete Order">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400">No orders found matching filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}