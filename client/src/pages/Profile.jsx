import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Package, Heart, LogOut, Save, CheckCircle } from 'lucide-react';
import { logout, updateUser } from '../features/auth/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    if (user.addresses && user.addresses.length > 0) {
      setAddress(user.addresses[0].street || '');
    }
  }, [navigate, user]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'wishlist') fetchWishlist();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders/myorders', { withCredentials: true });
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get('/api/auth/wishlist', { withCredentials: true });
      setWishlist(data);
    } catch (error) {
      console.error(error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { name, email, phone, address };
      if (password) payload.password = password;

      const { data } = await axios.put('/api/auth/profile', payload, { withCredentials: true });
      
      // Update Redux store + localStorage so the UI reflects the new name/email immediately
      dispatch(updateUser({ name: data.name, email: data.email, phone: data.phone }));
      
      setPassword(''); // clear password field after save
      toast.success('✅ Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft p-6 sticky top-24">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-display font-bold text-2xl shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white">{user?.name}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full capitalize">
                  {user?.role || 'customer'}
                </span>
              </div>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                <User className="w-5 h-5" /> Account Details
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                <Package className="w-5 h-5" /> Order History
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'wishlist' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                <Heart className="w-5 h-5" /> Wishlist
              </button>
              <button 
                onClick={logoutHandler}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-4 border border-red-200 dark:border-red-900/30"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft p-8 min-h-[500px]">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Update Profile</h2>
                <p className="text-gray-500 text-sm mb-6 border-b pb-4">Manage your account information</p>
                <form onSubmit={submitHandler} className="max-w-lg space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Email Address</label>
                      <input
                        type="email"
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input
                      type="tel"
                      className="input-field"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Delivery Address</label>
                    <textarea
                      className="input-field h-24 resize-none"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your default delivery address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                      New Password <span className="font-normal text-gray-400">(leave blank to keep current)</span>
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 border-b pb-4">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/menu')} className="btn-primary mt-4">Browse Menu</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-primary transition-colors">
                        <div>
                          <p className="font-bold">Order #{order._id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-400 mt-1">{order.orderItems?.length} item(s)</p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.orderStatus}
                          </span>
                          <span className="font-bold text-lg">${order.totalPrice.toFixed(2)}</span>
                          <button onClick={() => navigate(`/order/${order._id}`)} className="text-primary font-semibold hover:underline text-sm">
                            Track →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 border-b pb-4">My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">Your wishlist is empty.</p>
                    <button onClick={() => navigate('/menu')} className="btn-primary mt-4">Explore Menu</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map(item => (
                      <div key={item._id} className="flex gap-4 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-primary transition-colors">
                        <img
                          src={item.image || 'https://placehold.co/80x80/f97316/white?text=Food'}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover"
                          onError={(e) => { e.target.src = 'https://placehold.co/80x80/f97316/white?text=Food'; }}
                        />
                        <div>
                          <h3 className="font-bold hover:text-primary cursor-pointer" onClick={() => navigate('/menu')}>{item.name}</h3>
                          <p className="text-primary font-semibold mt-1">${item.price}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.category?.name || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
