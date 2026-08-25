import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { LayoutDashboard, Users, ShoppingBag, Activity, FileCheck2, UtensilsCrossed, Megaphone } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GeminiMascot from '../components/GeminiMascot';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [onboardingRequests, setOnboardingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [announcement, setAnnouncement] = useState({ audience: 'customers', subject: '', description: '' });
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [invite, setInvite] = useState({ email: '', role: 'restaurant_owner' });
  const [expandedRequest, setExpandedRequest] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (activeTab === 'overview') {
          const { data } = await axios.get('/api/admin/analytics', { withCredentials: true });
          setAnalytics(data);
        } else if (activeTab === 'orders') {
          const { data } = await axios.get('/api/admin/orders', { withCredentials: true });
          setOrders(data);
        } else if (activeTab === 'users') {
          const { data } = await axios.get('/api/auth/users', { withCredentials: true });
          setUsers(data);
        } else if (activeTab === 'menu') {
          const { data } = await axios.get('/api/foods');
          setFoods(data);
        } else if (activeTab === 'governance') {
          const { data } = await axios.get('/api/admin/onboarding', { withCredentials: true });
          setOnboardingRequests(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, user, navigate]);

  const updateOnboardingStatus = async (id, status) => {
    try {
      setIsLoading(true);
      await axios.put(`/api/admin/onboarding/${id}`, { status }, { withCredentials: true });
      const { data } = await axios.get('/api/admin/onboarding', { withCredentials: true });
      setOnboardingRequests(data);
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFoodHandler = async (id) => {
    if (window.confirm('Are you sure you want to flag/remove this item?')) {
      try {
        setIsLoading(true);
        await axios.delete(`/api/foods/${id}`, { withCredentials: true });
        const { data } = await axios.get('/api/foods');
        setFoods(data);
      } catch (error) {
        alert('Failed to delete food item');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (announcement.audience === 'specific' && selectedUserIds.length === 0) {
      alert('Please select at least one user.');
      return;
    }
    try {
      setIsLoading(true);
      const payload = { ...announcement, userIds: selectedUserIds };
      const res = await axios.post('/api/admin/announcements', payload, { withCredentials: true });
      alert(res.data.message);
      setAnnouncement({ audience: 'customers', subject: '', description: '' });
      setSelectedUserIds([]);
    } catch (error) {
      alert('Failed to send announcement');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm("Are you sure you want to change this user's role?")) return;
    try {
      setIsLoading(true);
      await axios.put(`/api/auth/users/${userId}/role`, { role: newRole }, { withCredentials: true });
      alert('User role updated successfully');
      const { data } = await axios.get('/api/auth/users', { withCredentials: true });
      setUsers(data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setIsLoading(true);
        await axios.delete(`/api/auth/users/${id}`, { withCredentials: true });
        const { data } = await axios.get('/api/auth/users', { withCredentials: true });
        setUsers(data);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!invite.email) return alert('Please provide an email');
    try {
      setIsLoading(true);
      const { data } = await axios.post('/api/admin/invite', invite, { withCredentials: true });
      alert(`Success! Shared Login: ${data.credentials.loginLink}\nEmail: ${data.credentials.email}\nPassword: ${data.credentials.password}`);
      setInvite({ email: '', role: 'restaurant_owner' });
      // Refresh users list
      const res = await axios.get('/api/auth/users', { withCredentials: true });
      setUsers(res.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to invite user');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f172a]">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-surface-dark shadow-xl border-r border-gray-100 dark:border-gray-800 flex flex-col fixed h-full z-10">
        <div className="p-6">
          <h2 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <Activity className="w-6 h-6" /> Admin
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'overview' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Admin Dashboard
          </button>
          <button
            onClick={() => setActiveTab('governance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'governance' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <FileCheck2 className="w-5 h-5" /> Governance
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <ShoppingBag className="w-5 h-5" /> Order Oversight
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'menu' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <UtensilsCrossed className="w-5 h-5" /> Menu Moderation
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Users className="w-5 h-5" /> Users
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'announcements' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Megaphone className="w-5 h-5" /> Announcements
          </button>
        </nav>
        <div className="p-4 mb-20 flex justify-center border-t border-gray-100 dark:border-gray-800">
          <GeminiMascot isProcessing={isLoading} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 p-8">

        {/* Overview Tab (Hero Section) */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">Admin Dashboard</h1>
                <p className="text-lg md:text-xl text-white/80 font-medium">
                  Welcome to the FeastFlow Command Center. Monitor platform activity, manage governance, and oversee the entire food ordering ecosystem in real-time.
                </p>
              </div>
              {/* Decorative background elements */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -right-12 w-72 h-72 bg-black/10 rounded-full blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
                <div className="text-gray-500 mb-2 font-medium">Total GMV</div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">${analytics.totalGMV.toFixed(2)}</div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
                <div className="text-gray-500 mb-2 font-medium">Total Orders</div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">{analytics.totalOrders}</div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
                <div className="text-gray-500 mb-2 font-medium">Active Restaurants</div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">{analytics.activeRestaurants}</div>
              </div>
              <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft hover:shadow-lg transition-shadow border border-red-100 dark:border-red-900/30">
                <div className="text-gray-500 mb-2 font-medium">Pending Approvals</div>
                <div className="text-4xl font-bold text-red-500">{analytics.pendingOnboarding}</div>
              </div>
            </div>
          </div>
        )}

        {/* Governance Tab */}
        {activeTab === 'governance' && (
          <div>
            <h1 className="text-3xl font-display font-bold mb-8">Restaurant Onboarding & Governance</h1>
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Restaurant Name</th>
                    <th className="p-4 font-semibold">AI Score</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {onboardingRequests.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-gray-500">No pending manual reviews</td></tr>
                  ) : (
                    onboardingRequests.map((req) => (
                      <Fragment key={req._id}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="p-4 text-sm font-medium">{req.userId?.name}</td>
                          <td className="p-4 text-sm font-bold">{req.restaurantDetails?.name}</td>
                          <td className="p-4 text-sm">
                            <span className={`px-2 py-1 rounded font-bold ${req.geminiConfidenceScore >= 80 ? 'bg-green-100 text-green-700' : req.geminiConfidenceScore > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                              {req.geminiConfidenceScore !== undefined && req.geminiConfidenceScore !== null ? `${req.geminiConfidenceScore}%` : 'N/A'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => setExpandedRequest(expandedRequest === req._id ? null : req._id)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm mr-2 hover:bg-blue-200 transition-colors">
                              {expandedRequest === req._id ? 'Hide Details' : 'View Details'}
                            </button>
                            <button onClick={() => updateOnboardingStatus(req._id, 'approved')} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm mr-2 hover:bg-green-600 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => updateOnboardingStatus(req._id, 'rejected')} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors">
                              Reject
                            </button>
                          </td>
                        </tr>
                        {expandedRequest === req._id && (
                          <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                            <td colSpan="4" className="p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                  <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b pb-2">Restaurant Credentials</h3>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2"><span className="text-gray-500">Cuisine:</span> <span className="font-semibold">{req.restaurantDetails?.cuisine || 'N/A'}</span></div>
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2"><span className="text-gray-500">Address:</span> <span className="font-semibold">{req.restaurantDetails?.address || 'N/A'}</span></div>
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2"><span className="text-gray-500">FSSAI No:</span> <span className="font-semibold text-blue-600">{req.restaurantDetails?.fssaiNumber || 'N/A'}</span></div>
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2"><span className="text-gray-500">GST No:</span> <span className="font-semibold text-blue-600">{req.restaurantDetails?.gstNumber || 'N/A'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Bank Details:</span> <span className="font-semibold">{req.restaurantDetails?.bankDetails || 'N/A'}</span></div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b pb-2">Uploaded Documents & AI Verdict</h3>
                                  {req.documents && req.documents.length > 0 ? (
                                    <div className="space-y-4">
                                      {req.documents.map((doc, idx) => (
                                        <div key={idx} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
                                          <div className="flex justify-between items-center">
                                            <span className="font-bold uppercase text-sm">{doc.docType.replace('_', ' ')}</span>
                                            <span className={`px-2 py-1 text-xs font-bold rounded ${doc.aiVerdict === 'pass' ? 'bg-green-100 text-green-700' : doc.aiVerdict === 'fail' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                              AI: {doc.aiVerdict.toUpperCase()} ({doc.confidence || 0}%)
                                            </span>
                                          </div>
                                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate">
                                            {doc.fileUrl}
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500">No documents attached.</div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h1 className="text-3xl font-display font-bold mb-8">Global Order Oversight</h1>
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Restaurant</th>
                    <th className="p-4 font-semibold">Total</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 text-sm font-medium">{order._id.substring(0, 8)}</td>
                      <td className="p-4 text-sm">{order.user?.name}</td>
                      <td className="p-4 text-sm font-bold">{order.restaurant?.name || 'Unknown'}</td>
                      <td className="p-4 text-sm font-bold">${order.totalPrice.toFixed(2)}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Menu Tab (Moderation) */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-display font-bold">Global Menu Moderation</h1>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="p-4 font-semibold">Image</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {foods.map((food) => (
                    <tr key={food._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4"><img src={food.image} alt={food.name} className="w-12 h-12 rounded-lg object-cover" /></td>
                      <td className="p-4 text-sm font-semibold">{food.name}</td>
                      <td className="p-4 text-sm">${food.price.toFixed(2)}</td>
                      <td className="p-4 text-sm">{food.category?.name || food.category}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => deleteFoodHandler(food._id)} className="text-red-500 hover:underline font-semibold">Flag & Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-display font-bold">Manage Users</h1>
            
            {/* Invite User Section */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft">
              <h2 className="text-xl font-semibold mb-4">Invite New User</h2>
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={invite.email}
                      onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select 
                      value={invite.role}
                      onChange={(e) => setInvite({ ...invite, role: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="restaurant_owner">Restaurant Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                    {isLoading ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {Array.isArray(users) && users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 text-sm font-medium">{u._id ? u._id.substring(0, 8) : 'N/A'}</td>
                      <td className="p-4 text-sm">{u.name}</td>
                      <td className="p-4 text-sm"><a href={`mailto:${u.email}`} className="text-primary">{u.email}</a></td>
                      <td className="p-4 text-sm">
                        {u.role === 'admin' ? (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">admin</span>
                        ) : (
                          <select 
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={isLoading}
                            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-bold uppercase focus:ring-2 focus:ring-primary outline-none"
                          >
                            <option value="customer">Customer</option>
                            <option value="restaurant_owner">Restaurant Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:underline font-semibold text-sm">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-display font-bold mb-8">📢 Broadcast Announcement</h1>
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft p-8">
              <form onSubmit={handleSendAnnouncement} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Audience</label>
                  <select
                    value={announcement.audience}
                    onChange={(e) => {
                      setAnnouncement({...announcement, audience: e.target.value});
                      setSelectedUserIds([]);
                      // Load users list if specific is selected
                      if (e.target.value === 'specific' && users.length === 0) {
                        axios.get('/api/auth/users', { withCredentials: true }).then(r => setUsers(r.data)).catch(() => {});
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">All Users</option>
                    <option value="customers">Customers Only</option>
                    <option value="owners">Restaurant Owners Only</option>
                    <option value="specific">Specific Users (Select Below)</option>
                  </select>
                </div>

                {/* Specific User Selector */}
                {announcement.audience === 'specific' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Select Recipients ({selectedUserIds.length} selected)
                    </label>
                    <div className="max-h-52 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
                      {Array.isArray(users) && users.map(u => (
                        <label key={u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u._id)}
                            onChange={() => toggleUserSelection(u._id)}
                            className="w-4 h-4 accent-primary"
                          />
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{u.name}</p>
                            <p className="text-xs text-gray-400 truncate">{u.email} · <span className="capitalize">{u.role}</span></p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={announcement.subject}
                    onChange={(e) => setAnnouncement({...announcement, subject: e.target.value})}
                    placeholder="e.g., Platform Maintenance Update"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea
                    required
                    rows="5"
                    value={announcement.description}
                    onChange={(e) => setAnnouncement({...announcement, description: e.target.value})}
                    placeholder="Write your announcement message here..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 text-lg"
                >
                  {isLoading ? 'Sending...' : '📤 Send Announcement'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
