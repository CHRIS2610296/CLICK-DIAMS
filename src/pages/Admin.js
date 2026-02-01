import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, LogOut, Check, X, Loader2, Phone, FileText, Image as ImageIcon, Trash2, Copy, Filter, Square, CheckSquare,
  ChevronDown, ChevronUp, Calendar, BarChart3, TrendingUp, ShoppingBag, AlertCircle, CheckCircle, Clock, XCircle,
  Download, Upload, Settings, Bell, Search, MoreVertical, Eye, EyeOff, Edit, DollarSign, Users, Package, CreditCard
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch, setDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- FILTER STATES ---
  const [filterGame, setFilterGame] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // --- UI STATES ---
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [showRevenue, setShowRevenue] = useState(false); // <--- NEW: Defaults to HIDDEN

  // --- CHART TIME RANGE STATE ---
  const [chartRange, setChartRange] = useState('week');

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

  // 1. Real-time Data Listener
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

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
  }, [orders.length]);

  // 2. Store Status Listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "storeStatus"), (doc) => {
      if (doc.exists()) setIsOnline(doc.data().online);
    });
    return () => unsub();
  }, []);

  // --- CHART DATA LOGIC ---
  const getChartData = () => {
    const data = [];
    const now = new Date();

    if (chartRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        data.push({ name: key, rawDate: d.toDateString(), sales: 0 });
      }
    } else if (chartRange === 'month') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        data.push({ name: key, rawDate: d.toDateString(), sales: 0 });
      }
    } else if (chartRange === 'year') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
        data.push({ name: key, monthId: d.getMonth(), yearId: d.getFullYear(), sales: 0 });
      }
    }

    orders.forEach(order => {
      if (order.status === 'completed' && order.createdAt) {
        const d = new Date(order.createdAt.seconds * 1000);
        if (chartRange === 'year') {
          const entry = data.find(item => item.monthId === d.getMonth() && item.yearId === d.getFullYear());
          if (entry) entry.sales += order.totalPrice;
        } else {
          const entry = data.find(item => item.rawDate === d.toDateString());
          if (entry) entry.sales += order.totalPrice;
        }
      }
    });

    return data;
  };

  const chartData = getChartData();
  const periodRevenue = chartData.reduce((acc, curr) => acc + curr.sales, 0);

  // --- LOGIC FUNCTIONS ---
  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    try { await setDoc(doc(db, "config", "storeStatus"), { online: newStatus }); }
    catch (error) { alert("Error: " + error.message); }
  };

  // Search and filter logic
  const filteredOrders = orders.filter(order => {
    const matchesGame = filterGame === 'All' || (order.game && order.game === filterGame);
    const matchesPayment = filterPayment === 'All' || (order.paymentMethod && order.paymentMethod === filterPayment);
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      order.playerID?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.playerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone?.includes(searchQuery);

    return matchesGame && matchesPayment && matchesStatus && matchesSearch;
  });

  const toggleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(orderId => orderId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const bulkDelete = async () => {
    if (!window.confirm(`⚠️ Are you sure you want to DELETE ${selectedOrders.length} orders?`)) return;
    try {
      const batch = writeBatch(db);
      selectedOrders.forEach(id => {
        const docRef = doc(db, "orders", id);
        batch.delete(docRef);
      });
      await batch.commit();
      setSelectedOrders([]);
      alert("Orders deleted successfully.");
    } catch (error) {
      alert("Error deleting orders: " + error.message);
    }
  };

  // --- DYNAMIC ITEM-SPECIFIC SMS FUNCTION ---
  const updateStatus = async (orderId, newStatus, orderPhone, orderItems) => {
    if (!window.confirm(`Mark order as ${newStatus}?`)) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      if (newStatus === 'completed' && orderPhone) {
        const formattedPhone = orderPhone.startsWith('0')
          ? '+261' + orderPhone.slice(1)
          : orderPhone;

        let itemsString = "Items";
        if (orderItems && orderItems.length > 0) {
          itemsString = orderItems.map(item => {
            const itemName = item.name ? item.name : `${item.total} ${item.currency || 'Diamonds'}`;
            return item.quantity > 1 ? `${item.quantity}x ${itemName}` : itemName;
          }).join(' + ');
        }

        const message = `CLICK DIAMS: Your purchase was successful! ${itemsString} have been sent. Thanks for your trust.`;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const separator = isIOS ? '&' : '?';

        window.location.href = `sms:${formattedPhone}${separator}body=${encodeURIComponent(message)}`;
      }
    } catch (error) {
      alert("Error updating order: " + error.message);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("⚠️ Are you sure you want to DELETE this order?")) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
    } catch (error) {
      alert("Error deleting order: " + error.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ID: ${text}`);
  };

  const revenue = orders.filter(o => o.status === 'completed').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending_review' || o.status === 'awaiting_proof').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 relative pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 p-6 bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <LayoutDashboard className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-500 text-sm">Manage orders, view analytics, and track revenue</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-blue-200 shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-semibold text-slate-700">{isOnline ? "Store Online" : "Store Offline"}</span>
            </div>

            <button
              onClick={toggleOnlineStatus}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm border ${isOnline
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 border-emerald-600'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 border-gray-600'
                }`}
            >
              {isOnline ? "Take Offline" : "Go Online"}
            </button>

            <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors border border-red-200 font-semibold shadow-sm">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-blue-100 group hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <AlertCircle className="text-white" size={22} />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded-full">{pendingCount} pending</span>
            </div>
            <div className="text-slate-500 text-sm font-medium">Pending Review</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">{pendingCount}</div>
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50 p-6 rounded-2xl shadow-lg border border-emerald-100 group hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <CheckCircle className="text-white" size={22} />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">{completedCount} orders</span>
            </div>
            <div className="text-slate-500 text-sm font-medium">Completed Orders</div>
            <div className="text-3xl font-bold text-emerald-700 mt-2">{completedCount}</div>
          </div>

          {/* --- MODIFIED: TOTAL REVENUE CARD (With Eye Toggle) --- */}
          <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl shadow-lg border border-purple-100 group hover:shadow-xl transition-shadow relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <DollarSign className="text-white" size={22} />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowRevenue(!showRevenue); }}
                className="text-purple-400 hover:text-purple-600 transition-colors p-1 rounded-md hover:bg-purple-100"
                title={showRevenue ? "Hide Revenue" : "Show Revenue"}
              >
                {showRevenue ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-slate-500 text-sm font-medium">Total Revenue</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">
              {showRevenue ? `${revenue.toLocaleString()} Ar` : '•••••••'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl shadow-lg border border-slate-100 group hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl">
                <ShoppingBag className="text-white" size={22} />
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-full">All orders</span>
            </div>
            <div className="text-slate-500 text-sm font-medium">Total Orders</div>
            <div className="text-3xl font-bold text-slate-800 mt-2">{orders.length}</div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden transition-all duration-300">
          <div
            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition-colors"
            onClick={(e) => { if (e.target.tagName !== 'BUTTON') setShowChart(!showChart) }}
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <TrendingUp className="text-white" size={22} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-800">Revenue Analytics</h2>
                <p className="text-sm text-slate-500">
                  Period Total: <span className="font-bold text-emerald-600">
                    {showRevenue ? `${periodRevenue.toLocaleString()} Ar` : '•••••••'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setChartRange(range)}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${chartRange === range
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
                      }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button className="text-slate-400 hover:text-blue-600">
                {showChart ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>

          {showChart && (
            <div className="px-6 pb-6 pt-6 h-72 w-full animate-in fade-in slide-in-from-top-4 duration-300">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} minTickGap={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                  {showRevenue && (
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value.toLocaleString()} Ar`, 'Sales']}
                      labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
                    />
                  )}
                  <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  <Line type="monotone" dataKey="sales" stroke="#1D4ED8" strokeWidth={2} dot={{ fill: '#1D4ED8', strokeWidth: 2, r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Enhanced Filter Bar with Search */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <Filter size={20} className="text-blue-600" />
              <span>Filters</span>
            </div>

            <div className="flex-1 flex flex-wrap gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-blue-300 rounded-xl bg-blue-50 font-semibold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="All">All Status</option>
                <option value="pending_review">Pending Review</option>
                <option value="awaiting_proof">Waiting Proof</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filterGame}
                onChange={(e) => setFilterGame(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="px-4 py-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="All">All Payments</option>
                <option value="mvola">Mvola</option>
                <option value="orange">Orange Money</option>
                <option value="airtel">Airtel Money</option>
              </select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by ID, name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg">
              {filteredOrders.length} orders
            </div>
          </div>
        </div>

        {/* Enhanced Orders Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-lg border border-slate-200">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
            <p className="text-slate-500 font-medium">Loading orders...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Order Management</h3>
                <div className="text-sm text-slate-500">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 w-12">
                      <button
                        onClick={toggleSelectAll}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                        title="Select all"
                      >
                        {selectedOrders.length === filteredOrders.length && filteredOrders.length > 0
                          ? <CheckSquare size={20} className="text-blue-600" />
                          : <Square size={20} />}
                      </button>
                    </th>
                    <th className="p-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Date</th>
                    <th className="p-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Player Info</th>
                    <th className="p-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Order Details</th>
                    <th className="p-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Proof</th>
                    <th className="p-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Status</th>
                    <th className="p-4 font-semibold text-slate-700 text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const isSelected = selectedOrders.includes(order.id);
                    const statusIcon = {
                      'completed': <CheckCircle size={14} className="text-emerald-500" />,
                      'rejected': <XCircle size={14} className="text-red-500" />,
                      'pending_review': <AlertCircle size={14} className="text-orange-500" />,
                      'awaiting_proof': <Clock size={14} className="text-blue-500" />
                    }[order.status];

                    return (
                      <tr
                        key={order.id}
                        className={`transition-all duration-150 ${isSelected ? 'bg-gradient-to-r from-blue-50 to-blue-100/30' : 'hover:bg-slate-50'} ${order.status === 'pending_review' && !isSelected ? 'bg-orange-50/60' : ''}`}
                      >
                        <td className="p-4">
                          <button
                            onClick={() => toggleSelectOrder(order.id)}
                            className={`p-1.5 rounded-lg transition-all ${isSelected
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                              }`}
                          >
                            {isSelected ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-slate-700">
                              {order.createdAt?.seconds
                                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                                : 'Today'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {order.createdAt?.seconds
                                ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                                : 'Now'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              {order.game && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${order.game === 'Free Fire' ? 'bg-blue-100 text-blue-700' :
                                    order.game === 'PUBG Mobile' ? 'bg-amber-100 text-amber-700' :
                                      order.game === 'Mobile Legends' ? 'bg-purple-100 text-purple-700' :
                                        'bg-red-100 text-red-700'
                                  }`}>
                                  {order.game}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <div
                                onClick={() => copyToClipboard(order.fullPlayerID || order.playerID)}
                                className="flex items-center gap-2 group cursor-pointer"
                                title="Click to copy"
                              >
                                <span className="font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors px-2.5 py-1.5 rounded-lg text-sm shadow-sm border border-slate-200 truncate max-w-[180px]">
                                  {order.fullPlayerID || order.playerID}
                                </span>
                                <Copy size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                              </div>
                              {order.playerName && (
                                <div className="text-sm text-slate-600 font-medium">Name: {order.playerName}</div>
                              )}
                            </div>
                            <a
                              href={`tel:${order.phone}`}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                              <Phone size={14} />
                              <span className="hover:underline">{order.phone}</span>
                            </a>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-2">
                            {order.items && order.items.length > 0 ? (
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                                    <div className="font-semibold text-slate-700">
                                      <span className="text-emerald-600 mr-2">{item.quantity}x</span>
                                      {item.name || `${item.total} ${item.currency || 'Diamonds'}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="font-bold text-emerald-600 text-lg">{order.totalDiamonds || order.total} Diamonds</div>
                            )}
                            <div className="pt-2 border-t border-slate-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">Total:</span>
                                <span className="text-lg font-bold text-slate-800">{order.totalPrice?.toLocaleString()} Ar</span>
                              </div>
                              <div className="mt-2">
                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${order.paymentMethod === 'mvola' ? 'bg-yellow-100 text-yellow-800' :
                                    order.paymentMethod === 'orange' ? 'bg-orange-100 text-orange-800' :
                                      'bg-red-100 text-red-800'
                                  }`}>
                                  <CreditCard size={12} />
                                  {order.paymentMethod}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {order.proofType === 'image' ? (
                            <a
                              href={order.proofValue}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 hover:underline bg-blue-50 px-3 py-2 rounded-xl transition-all hover:shadow-sm group"
                            >
                              <ImageIcon size={16} className="group-hover:scale-110 transition-transform" />
                              View
                            </a>
                          ) : order.proofType === 'ref' ? (
                            <div
                              onClick={() => copyToClipboard(order.proofValue)}
                              className="inline-flex flex-col gap-1 group cursor-pointer max-w-[160px]"
                              title="Click to copy reference"
                            >
                              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                <FileText size={12} /> Reference
                              </div>
                              <div className="bg-slate-100 group-hover:bg-slate-200 transition-colors px-3 py-2 rounded-xl border border-slate-200">
                                <span className="font-mono text-xs text-slate-700 break-all line-clamp-2 leading-relaxed">
                                  {order.proofValue}
                                </span>
                              </div>
                              <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <Copy size={10} /> Copy Ref
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 italic">No proof</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {statusIcon}
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  order.status === 'pending_review' ? 'bg-orange-100 text-orange-700' :
                                    'bg-blue-100 text-blue-700'
                              }`}>
                              {order.status === 'awaiting_proof' ? 'Waiting' : order.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {(order.status === 'pending_review' || order.status === 'pending') && (
                              <>
                                <button
                                  onClick={() => updateStatus(order.id, 'completed', order.phone, order.items)}
                                  className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-sm hover:shadow transition-all"
                                  title="Approve order"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => updateStatus(order.id, 'rejected')}
                                  className="p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-sm hover:shadow transition-all"
                                  title="Reject order"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 rounded-xl shadow-sm hover:shadow transition-all"
                              title="Delete order"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Package className="text-slate-300" size={48} />
                          <div>
                            <p className="text-slate-500 font-medium text-lg">No orders found</p>
                            <p className="text-slate-400 text-sm">Try changing your filters or search query</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Floating Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-white to-slate-50 border border-slate-300 shadow-2xl rounded-2xl px-8 py-4 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in backdrop-blur-sm bg-white/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckSquare className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="font-bold text-slate-800">{selectedOrders.length} orders selected</div>
              <div className="text-xs text-slate-500">Click to perform bulk actions</div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-300"></div>
          <button
            onClick={bulkDelete}
            className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all hover:shadow-sm"
          >
            <Trash2 size={18} />
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedOrders([])}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Clear selection"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}