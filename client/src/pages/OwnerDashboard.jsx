import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { LayoutDashboard, UtensilsCrossed, Settings, Store, Sparkles, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFood, setCurrentFood] = useState(null);
  const [marketingPrompt, setMarketingPrompt] = useState('');
  const [marketingResult, setMarketingResult] = useState('');
  const [isMarketingLoading, setIsMarketingLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user || (user.role !== 'restaurant_owner' && user.role !== 'admin')) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        if (activeTab === 'pipeline') {
          const { data } = await axios.get('/api/owner/orders', { withCredentials: true });
          setOrders(data);
          const analyticsData = await axios.get('/api/owner/analytics', { withCredentials: true });
          setAnalytics(analyticsData.data);
        } else if (activeTab === 'menu') {
          const { data } = await axios.get('/api/owner/menu', { withCredentials: true });
          setMenu(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [activeTab, user, navigate]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/owner/orders/${orderId}/status`, { status }, { withCredentials: true });
      const { data } = await axios.get('/api/owner/orders', { withCredentials: true });
      setOrders(data);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const submitFoodHandler = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/owner/menu/${currentFood._id}`, currentFood, { withCredentials: true });
      } else {
        await axios.post('/api/owner/menu', currentFood, { withCredentials: true });
      }
      setIsEditing(false);
      setCurrentFood(null);
      const { data } = await axios.get('/api/owner/menu', { withCredentials: true });
      setMenu(data);
    } catch (error) {
      alert('Failed to save food item');
    }
  };

  const toggleStock = async (food) => {
    try {
      const newStock = food.countInStock > 0 ? 0 : 100;
      await axios.put(`/api/owner/menu/${food._id}`, { countInStock: newStock }, { withCredentials: true });
      const { data } = await axios.get('/api/owner/menu', { withCredentials: true });
      setMenu(data);
    } catch (error) {
      alert('Failed to toggle stock');
    }
  };

  const handleDescriptionUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      const { data } = await axios.post('/api/owner/extract-description', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setCurrentFood({...currentFood, description: data.text});
    } catch (error) {
      alert('Failed to extract description from file');
    }
  };

  const handleMarketingSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsMarketingLoading(true);
      const { data } = await axios.post('/api/owner/marketing-ai', { prompt: marketingPrompt }, { withCredentials: true });
      setMarketingResult(data.result);
    } catch (error) {
      alert('Failed to generate marketing content');
    } finally {
      setIsMarketingLoading(false);
    }
  };

  if (!user || (user.role !== 'restaurant_owner' && user.role !== 'admin')) return null;

  // Kanban Board Columns
  const incomingOrders = orders.filter(o => o.orderStatus === 'Placed' || o.orderStatus === 'Confirmed');
  const preparingOrders = orders.filter(o => o.orderStatus === 'Preparing');
  const readyOrders = orders.filter(o => o.orderStatus === 'Out for Delivery'); // Reusing this as "Ready/Out"

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f172a]">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-surface-dark shadow-xl border-r border-gray-100 dark:border-gray-800 flex flex-col fixed h-full z-10">
        <div className="p-6">
          <h2 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
            <Store className="w-6 h-6" /> Owner Portal
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'pipeline' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Live Pipeline
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'menu' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <UtensilsCrossed className="w-5 h-5" /> Smart Menu
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'marketing' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Sparkles className="w-5 h-5 text-amber-500" /> AI Marketing
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 p-8">
        
        {/* Pipeline & Analytics Tab */}
        {activeTab === 'pipeline' && (
          <div>
            <div className="flex justify-between items-end mb-8">
              <h1 className="text-3xl font-display font-bold">Live Order Management Hub</h1>
              {analytics && (
                <div className="flex gap-6">
                  <div className="bg-white dark:bg-surface-dark px-6 py-3 rounded-xl shadow-soft flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Daily Revenue</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">${analytics.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-surface-dark px-6 py-3 rounded-xl shadow-soft flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                      <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Active Orders</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{analytics.activeOrders}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Incoming Column */}
              <div className="bg-gray-100/50 dark:bg-gray-800/20 p-4 rounded-2xl flex flex-col">
                <h2 className="font-bold text-lg mb-4 flex items-center justify-between">
                  Incoming <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">{incomingOrders.length}</span>
                </h2>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {incomingOrders.map(order => (
                    <div key={order._id} className="bg-white dark:bg-surface-dark p-5 rounded-xl shadow-sm border-l-4 border-red-500 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-gray-500">#{order._id.substring(0, 6)}</span>
                        <span className="text-sm font-medium">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="space-y-1 mb-4">
                        {order.orderItems.map(item => (
                          <div key={item._id} className="flex justify-between text-sm">
                            <span><span className="font-bold text-primary">{item.qty}x</span> {item.name}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => updateOrderStatus(order._id, 'Preparing')}
                        className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-bold transition-colors text-sm"
                      >
                        Accept & Prepare
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparing Column */}
              <div className="bg-gray-100/50 dark:bg-gray-800/20 p-4 rounded-2xl flex flex-col">
                <h2 className="font-bold text-lg mb-4 flex items-center justify-between">
                  Preparing <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">{preparingOrders.length}</span>
                </h2>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {preparingOrders.map(order => (
                    <div key={order._id} className="bg-white dark:bg-surface-dark p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-gray-500">#{order._id.substring(0, 6)}</span>
                      </div>
                      <div className="space-y-1 mb-4">
                        {order.orderItems.map(item => (
                          <div key={item._id} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300" />
                            <span><span className="font-bold text-primary">{item.qty}x</span> {item.name}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => updateOrderStatus(order._id, 'Out for Delivery')}
                        className="w-full py-2 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg font-bold transition-colors text-sm"
                      >
                        Mark Ready for Pickup
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Out for Delivery Column */}
              <div className="bg-gray-100/50 dark:bg-gray-800/20 p-4 rounded-2xl flex flex-col">
                <h2 className="font-bold text-lg mb-4 flex items-center justify-between">
                  Out / Ready <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{readyOrders.length}</span>
                </h2>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {readyOrders.map(order => (
                    <div key={order._id} className="bg-white dark:bg-surface-dark p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-bold text-gray-500">#{order._id.substring(0, 6)}</span>
                        <span className="text-sm text-gray-400">{order.user?.name}</span>
                      </div>
                      <button 
                        onClick={() => updateOrderStatus(order._id, 'Delivered')}
                        className="w-full py-2 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white rounded-lg font-bold transition-colors text-sm"
                      >
                        Complete Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Smart Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold">Smart Menu Architect</h1>
                <p className="text-gray-500 mt-1">Manage your offerings and inventory in real-time.</p>
              </div>
              <button 
                onClick={() => {
                  setCurrentFood({ name: '', price: 0, description: '', image: '', category: '', countInStock: 100, dietaryPreference: 'None' });
                  setIsEditing(false);
                }} 
                className="btn-primary py-2 px-6 shadow-md"
              >
                + Add Dish
              </button>
            </div>

            {currentFood && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 w-full max-w-2xl shadow-2xl">
                  <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Dish' : 'Add New Dish'}</h2>
                  <form onSubmit={submitFoodHandler} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                        <input type="text" className="input-field w-full" value={currentFood.name} onChange={e => setCurrentFood({...currentFood, name: e.target.value})} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price ($)</label>
                        <input type="number" step="0.01" className="input-field w-full" value={currentFood.price} onChange={e => setCurrentFood({...currentFood, price: e.target.value})} required />
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                          <label className="text-xs text-primary font-bold cursor-pointer hover:underline">
                            Upload PDF/TXT
                            <input type="file" accept=".txt,.pdf" className="hidden" onChange={handleDescriptionUpload} />
                          </label>
                        </div>
                        <textarea className="input-field w-full" rows="3" value={currentFood.description} onChange={e => setCurrentFood({...currentFood, description: e.target.value})} required></textarea>
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dish Image URL</label>
                          <label className="text-xs text-primary font-bold cursor-pointer hover:underline">
                            Upload Image Instead
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setCurrentFood({...currentFood, image: reader.result});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                            />
                          </label>
                        </div>
                        <input type="text" className="input-field w-full" value={currentFood.image} onChange={e => setCurrentFood({...currentFood, image: e.target.value})} placeholder="Or paste image URL here" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Dietary Preference</label>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-sm font-medium ${currentFood.dietaryPreference !== 'Vegetarian' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Non-Veg</span>
                          <button 
                            type="button"
                            onClick={() => setCurrentFood({...currentFood, dietaryPreference: currentFood.dietaryPreference === 'Vegetarian' ? 'None' : 'Vegetarian'})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${currentFood.dietaryPreference === 'Vegetarian' ? 'bg-green-500' : 'bg-red-500'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentFood.dietaryPreference === 'Vegetarian' ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                          <span className={`text-sm font-medium ${currentFood.dietaryPreference === 'Vegetarian' ? 'text-green-600 font-bold' : 'text-gray-500'}`}>Vegetarian</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category ID</label>
                        <input type="text" className="input-field w-full" value={currentFood.category} onChange={e => setCurrentFood({...currentFood, category: e.target.value})} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Initial Stock</label>
                        <input type="number" className="input-field w-full" value={currentFood.countInStock} onChange={e => setCurrentFood({...currentFood, countInStock: e.target.value})} required />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                      <button type="button" onClick={() => setCurrentFood(null)} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold transition-colors">Cancel</button>
                      <button type="submit" className="btn-primary py-2 px-8">Save Dish</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menu.map((food) => (
                <div key={food._id} className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft overflow-hidden flex flex-col group hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden relative">
                    <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {food.countInStock <= 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white font-bold tracking-widest uppercase text-xl">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold font-display">{food.name}</h3>
                      <span className="text-lg font-bold text-primary">${food.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">{food.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleStock(food)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${food.countInStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${food.countInStock > 0 ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {food.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <button 
                        onClick={() => { setCurrentFood(food); setIsEditing(true); }} 
                        className="text-sm font-bold text-gray-600 hover:text-primary transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketing Tab */}
        {activeTab === 'marketing' && (
          <div className="max-w-4xl mx-auto h-full pb-10">
            <div className="flex items-center gap-4 mb-8">
              <Sparkles className="w-10 h-10 text-amber-500" />
              <div>
                <h2 className="text-3xl font-display font-bold">AI Marketing Assistant</h2>
                <p className="text-gray-500">Generate appetizing descriptions, social media posts, and marketing strategies based on your menu.</p>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft p-6 mb-8">
              <form onSubmit={handleMarketingSubmit}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">What do you want to generate?</label>
                <textarea
                  rows="4"
                  value={marketingPrompt}
                  onChange={(e) => setMarketingPrompt(e.target.value)}
                  placeholder="e.g., Write a catchy Instagram post for my new Spicy Chicken Burger..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-4"
                  required
                ></textarea>
                <button
                  type="submit"
                  disabled={isMarketingLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {isMarketingLoading ? 'Generating...' : 'Generate with AI'}
                </button>
              </form>
            </div>

            {marketingResult && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6">
                <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Result
                </h3>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                  {marketingResult}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default OwnerDashboard;
